import os
import uuid
import json
import httpx
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import anthropic
from openai import OpenAI

from prompts import POEM_SYSTEM_PROMPT, IMAGE_EXTRACTION_PROMPT, build_image_prompt
from database import init_db, save_door, get_all_doors, create_user, get_user_by_email
from auth import hash_password, verify_password, create_token, require_auth

load_dotenv()
init_db()

STATIC_DIR = Path(__file__).parent / "static" / "images"

app = FastAPI(title="KNOCK API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static")

claude     = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
claude_async = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
oai        = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ── Auth models ───────────────────────────────────────────

class SignupRequest(BaseModel):
    username: str
    email: str
    password: str

class SigninRequest(BaseModel):
    email: str
    password: str


# ── Door models ───────────────────────────────────────────

class MemoryRequest(BaseModel):
    memory: str
    display_name: str | None = None

class PoemRequest(BaseModel):
    poem: str

class DoorResponse(BaseModel):
    poem: str
    image_url: str


# ── Auth endpoints ────────────────────────────────────────

@app.post("/auth/signup")
def signup(req: SignupRequest):
    if len(req.username.strip()) < 2:
        raise HTTPException(status_code=400, detail="Username too short.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    try:
        user_id = create_user(
            username=req.username.strip(),
            email=req.email.strip().lower(),
            password_hash=hash_password(req.password),
        )
    except Exception:
        raise HTTPException(status_code=409, detail="Email or username already taken.")
    return {"token": create_token(user_id, req.username.strip())}


@app.post("/auth/signin")
def signin(req: SigninRequest):
    user = get_user_by_email(req.email.strip().lower())
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"token": create_token(user["id"], user["username"])}


# ── Health ────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


# ── Main endpoints ────────────────────────────────────────

def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload)}\n\n"


@app.post("/create-door")
async def create_door(req: MemoryRequest, user=Depends(require_auth)):
    if not req.memory or len(req.memory.strip()) < 10:
        raise HTTPException(status_code=400, detail="Anı çok kısa, biraz daha yaz.")

    async def generate():
        poem_chunks: list[str] = []

        # 1. Stream poem with prompt caching
        try:
            async with claude_async.messages.stream(
                model="claude-sonnet-4-6",
                max_tokens=512,
                system=[{
                    "type": "text",
                    "text": POEM_SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }],
                messages=[{"role": "user", "content": req.memory}],
                extra_headers={"anthropic-beta": "prompt-caching-2024-07-31"},
            ) as stream:
                async for text in stream.text_stream:
                    poem_chunks.append(text)
                    yield _sse({"type": "poem", "text": text})
        except Exception as e:
            yield _sse({"type": "error", "detail": f"Şiir üretilemedi: {e}"})
            return

        poem = "".join(poem_chunks).strip()

        # 2. Extract visual core with Haiku (fast + cheap)
        try:
            extraction = await claude_async.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=150,
                system=[{
                    "type": "text",
                    "text": IMAGE_EXTRACTION_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }],
                messages=[{
                    "role": "user",
                    "content": f"Memory: {req.memory}\n\nPoem:\n{poem}",
                }],
                extra_headers={"anthropic-beta": "prompt-caching-2024-07-31"},
            )
            visual_core = extraction.content[0].text.strip()
        except Exception:
            visual_core = req.memory[:120]

        # 3. Generate image
        yield _sse({"type": "image_loading"})
        try:
            image_prompt = build_image_prompt(visual_core)
            response = oai.images.generate(
                model="dall-e-3",
                prompt=image_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            temp_url = response.data[0].url
        except Exception as e:
            yield _sse({"type": "error", "detail": f"Görsel üretilemedi: {e}"})
            return

        # 3. Download and save image
        try:
            filename = f"{uuid.uuid4().hex}.png"
            filepath = STATIC_DIR / filename
            async with httpx.AsyncClient(timeout=30) as client:
                img_res = await client.get(temp_url)
                filepath.write_bytes(img_res.content)
            image_url = f"http://127.0.0.1:8000/static/images/{filename}"
        except Exception as e:
            yield _sse({"type": "error", "detail": f"Görsel kaydedilemedi: {e}"})
            return

        # 4. Save to DB
        save_door(
            user_id=user["id"],
            memory=req.memory,
            poem=poem,
            image_path=f"images/{filename}",
            display_name=req.display_name,
        )

        yield _sse({"type": "image", "url": image_url})
        yield _sse({"type": "done"})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/speak")
async def speak(req: PoemRequest):
    if not req.poem or len(req.poem.strip()) < 5:
        raise HTTPException(status_code=400, detail="Poem is too short.")

    eleven_key = os.getenv("ELEVENLABS_API_KEY", "").strip()

    if eleven_key:
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                res = await client.post(
                    "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb",
                    headers={
                        "xi-api-key": eleven_key,
                        "Content-Type": "application/json",
                    },
                    json={
                        "text": req.poem,
                        "model_id": "eleven_multilingual_v2",
                        "voice_settings": {
                            "stability": 0.18,
                            "similarity_boost": 0.80,
                            "style": 0.50,
                            "use_speaker_boost": False,
                        },
                    },
                )
                res.raise_for_status()
                return StreamingResponse(
                    iter([res.content]),
                    media_type="audio/mpeg",
                    headers={"Cache-Control": "no-store"},
                )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"TTS failed: {str(e)}")

    try:
        response = oai.audio.speech.create(
            model="tts-1",
            voice="shimmer",
            input=req.poem,
            speed=0.88,
        )
        return StreamingResponse(
            iter([response.content]),
            media_type="audio/mpeg",
            headers={"Cache-Control": "no-store"},
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"TTS failed: {str(e)}")


@app.get("/gallery")
def gallery():
    doors = get_all_doors()
    for door in doors:
        door["image_url"] = f"http://127.0.0.1:8000/static/{door['image_path']}"
    return doors
