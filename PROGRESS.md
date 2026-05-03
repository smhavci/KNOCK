# PROGRESS — Yapılanlar Defteri
## "The Door I Didn't Know I Was Leaving"

> Bu dosya her session sonunda güncellenir.
> Ne yaptık, nasıl yaptık, nerede kaldık — hepsini buraya yazarız.
> Bir sonraki session buradan başlar.

---

## Nasıl Kullanılır

1. Session başında: IMPLEMENTATION_PLAN.md'ye bak, nerede olduğumuzu hatırla
2. Session sonunda: Bu dosyaya yapılanları yaz
3. Yarım kalan varsa "Devam Edilecek" bölümüne not bırak
4. IMPLEMENTATION_PLAN.md'deki tamamlanan taskları `[x]` yap

---

## Session Günlüğü

---

### Session 1 — 2026-04-24

**Yapılanlar:**
- Ödev PDF'i okundu ve analiz edildi
- Proje konsepti belirlendi: "The Door I Didn't Know I Was Leaving"
  - Tema: Çocukluğun bitmesi, geçmişe özlem, sorumlulukların insanı büyütmesi
  - Kullanıcı bir anı yazar → Claude şiir üretir → DALL-E görsel üretir
- Tech stack kararlaştırıldı:
  - Backend: Python + FastAPI
  - LLM: Anthropic Claude (claude-sonnet-4-6)
  - Image Gen: OpenAI DALL-E 3
  - Frontend: HTML + CSS + Vanilla JS
- `IMPLEMENTATION_PLAN.md` oluşturuldu (4 phase, MVP tanımı, backlog)
- `PROGRESS.md` oluşturuldu (bu dosya)

**Devam Edilecek:**
- Phase 1.1 tamamlandı ✅
- Phase 1.2 ile devam: FastAPI kurulumu

**Notlar:**
- OpenAI API key'i mevcut
- Anthropic API key'i alınacak (console.anthropic.com)
- MVP önceliği: poem + image çalışsın, estetik Phase 2'de

---

### Session 1 (devamı) — Phase 1.1 Tamamlandı ✅

**Yapılanlar:**
- `backend/` ve `frontend/` klasörleri oluşturuldu
- `backend/requirements.txt` hazırlandı (fastapi, uvicorn, anthropic, openai, python-dotenv, httpx)
- `backend/.env` oluşturuldu (API key placeholder'larıyla)
- `.gitignore` oluşturuldu (`.env` ve `venv/` dahil)
- Python virtual environment kuruldu: `backend/venv/`
- Tüm bağımlılıklar başarıyla yüklendi

**API key durumu:**
- OpenAI: mevcut, `.env`'e yapıştırılacak
- Anthropic: alınacak, talimat verildi

---

---

### Session 2 — 2026-04-24

**Tamamlanan Phase'ler: 1.2, 1.3, 1.4, 1.5**

**Phase 1.2 — FastAPI Kurulumu ✅**
- `backend/main.py` oluşturuldu
- CORS middleware eklendi (frontend'den istek gelebilsin)
- `GET /health` endpoint'i yazıldı ve test edildi → `{"status": "ok"}` döndü
- Uvicorn ile sunucu ayağa kalktı, çalıştı

**Phase 1.3 — Claude (LLM) Entegrasyonu ✅**
- `backend/prompts.py` oluşturuldu
- `POEM_SYSTEM_PROMPT` yazıldı: Dylan'ın 1973 sesini, veda ve çocukluk temalarını taşıyan sistem promptu
- `POST /create-door` endpoint'ine Claude çağrısı eklendi
- Anthropic hesabında kredi yoktu → 5$ kredi yüklendi → sorun çözüldü

**Phase 1.4 — DALL-E 3 (Image Gen) Entegrasyonu ✅**
- `build_image_prompt()` fonksiyonu `prompts.py`'a eklendi
  - 1970s 35mm film estetiği, faded renkler, film grain, sıcak sepia tonları
- `POST /create-door` endpoint'ine DALL-E 3 çağrısı eklendi

**Phase 1.5 — Ana Endpoint ✅**
- `POST /create-door` tek seferde hem şiir hem görsel döndürüyor
- Input: `{ "memory": "string" }`
- Output: `{ "poem": "string", "image_url": "string" }`
- Hata yönetimi eklendi (kısa input, API hataları)

**Uçtan Uca Test Sonucu ✅**
- Test anısı: "Yazın bahçede hortumla su savaşı yapardık..."
- Claude'un ürettiği şiirden bir satır:
  `"We didn't know we were leaving, didn't feel the door swing slow behind us"`
- DALL-E 3 başarıyla görsel üretti (1970s film estetiğinde)
- API 200 OK döndü, tüm pipeline çalışıyor

**Phase 1.6 — Frontend ✅**
- `frontend/index.html`: textarea, Knock butonu, loading state, sonuç ve hata bölümleri
- `frontend/style.css`: karanlık tema, altın tonlar, sepia renk paleti — MVP'de bile temaya uygun
- `frontend/script.js`: API çağrısı, loading yönetimi, hata yönetimi, karakter sayacı
- Tarayıcıda açıldı ve backend ile bağlantı kuruldu

**MVP TAMAMLANDI ✅**
- Kullanıcı anı yazar → Knock'a basar → şiir + görsel üretilir → ekranda görünür
- Tüm Phase 1 görevleri bitti

**Phase 2 — Estetik & Deneyim ✅**
- Film grain overlay eklendi (CSS animasyonlu, hafif SVG noise texture)
- Header'a "1973" eyebrow etiketi eklendi
- Loading animasyonu: 3D dönen kapı (CSS rotateY + perspective)
- Typewriter efekti: şiir harf harf belirir, her satır sonunda 260ms duraklama
- Görsel: sepia filtreli, hover'da renk açılıyor, üstte altın kapı çerçevesi
- Sonuç ekranına rastgele Dylan alıntısı eklendi (7 alıntı havuzu)
- Tüm sayfa fade-in animasyonuyla beliriyor
- Subtitle güncellendi: "Write a childhood memory. Find your door."
- Mobil responsive grid (640px altında tek sütun)

**Phase 3A — Backend Kalıcılık ✅**
- `backend/database.py`: SQLite entegrasyonu, `doors` tablosu (id, memory, poem, image_path, created_at)
- `backend/static/images/` klasörü oluşturuldu
- FastAPI'ye StaticFiles mount eklendi
- `/create-door` güncellendi: DALL-E URL'i indirilip `/static/images/` klasörüne kaydediliyor
- `GET /gallery` endpoint'i eklendi: tüm kapıları yeniden eskiye sıralar

**Phase 3B — Frontend Kolaj Galerisi ✅**
- `frontend/gallery.html`: galeri sayfası
- `frontend/gallery.css`: grid layout, hover overlay, tam kapı modal'ı
- `frontend/gallery.js`: API'den kapıları çeker, kartları render eder, modal açar/kapatır
- Ana sayfaya "See all doors →" footer linki eklendi
- Galeri sayfasına "← knock your door" geri linki var
- Kart hover'da şiirin ilk satırı görünür
- Karta tıklayınca full modal: görsel + anı + şiirin tamamı + tarih
- ESC tuşuyla modal kapanıyor

**Phase 3C — Tarihi Bağlam & LLM Derinliği ✅**

LLM prompt (`prompts.py`) köklü biçimde yeniden yazıldı:
- Pat Garrett & Billy the Kid filmi ve şerifin rozeti bırakması bağlamı sisteme eklendi
- Karşı-kültürün 1973'teki yorgunluğu ve hassasiyeti ses tonuna işlendi
- "Laying down" metaforu şiirin omurgasına yerleştirildi
- Yasaklar listesi genişletildi: soyutlamalar, açıklayıcı duygular, zoraki uyak yasak
- Image prompt: Peckinpah estetiği, available light, "ordinary made sacred by time"

"About" bölümü (`index.html`) üç blokla eklendi:
- "— the song —": Dylan'ın şarkıyı neden yazdığı, şerifin rozeti, "laying down" kavramı
- "— what we do —": kullanıcı ne yapıyor, iki AI ne üretiyor, galeri nedir
- "— our door —": projenin duygusal kaynağı — çocukluğun fark etmeden bitmesi,
  "knocking on heaven's door isn't about what's behind it — it's about who you were when you knocked"

**PHASE 3 TAMAMEN TAMAMLANDI ✅**

**Devam Edilecek:**
- Phase 4: README, Artist's Manifesto, GitHub repo hazırlığı
- Önce: kapsamlı test — tüm flow'u uçtan uca dene

---

### Session 3 — 2026-04-24

**Video Arka Plan ✅**
- Canvas animasyonu kaldırıldı, `<video>` elementi eklendi
- `bg.mp4` (iki çocuk el ele kırda koşuyor) arka plana alındı
- CSS filter: sepia(0.55) contrast(0.82) brightness(0.68) saturate(0.72) hue-rotate(-8deg)
- Amber gradient color wash + vignette overlay eklendi → 1970s Kodachrome hissi

**Metin Okunabilirliği ✅**
- `--text-dim` #5a5040 → #c4b090 olarak güncellendi
- Body'e text-shadow eklendi
- About bölümüne backdrop blur + yarı saydam arkaplan eklendi

**Ambient Ses ✅**
- `dylan.mp3` (Bob Dylan - Knockin' on Heaven's Door) frontend'e eklendi
- `audio.js` oluşturuldu: ilk kullanıcı etkileşiminde başlar, 3sn fade-in
- Default volume: %8 — ambient, rahatsız etmeyecek seviye
- Sağ üstte mute/unmute butonu: altın renkli, yarı saydam, blur efektli

**Devam Edilecek:**
- Phase 4: README, Artist's Manifesto, GitHub repo

<!-- Yeni sessionlar buraya eklenecek -->
