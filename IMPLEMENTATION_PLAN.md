# KNOCK — Implementation Plan
## "The Door I Didn't Know I Was Leaving"

> Bu dosya projenin ana rehberidir. Her session başında buraya bakarak nerede olduğumuzu hatırlarız.
> Tamamlanan işler PROGRESS.md'ye detaylıca yazılır.

---

## Çalışma Metodolojimiz

- Her session **bu dosyayla başlar**: neredeyiz, ne yapacağız.
- Bir task bitmeden bir sonrakine geçmeyiz.
- Her tamamlanan task → **PROGRESS.md**'ye detaylı not düşülür.
- MVP bitmeden Phase 2'ye geçilmez.
- Session sonunda yarım kalan varsa PROGRESS.md'ye "devam edilecek" notu bırakılır.

---

## Proje Konsepti

Kullanıcı bir çocukluk anısını yazar. Sistem iki şey üretir:

1. **Şiir** — LLM (Claude), o anıyı Dylan-esque, lirik ve melankolik bir dille yeniden yazar
2. **Görsel** — Image Generation (DALL-E 3), o anıyı 1970'lerin film estetiğinde görselleştirir

Sonuç: Kullanıcının **kaybettiği kapının** şiiri ve resmi.

---

## Tech Stack

| Katman | Teknoloji | Neden |
|--------|-----------|-------|
| Backend | Python + FastAPI | Hızlı kurulum, temiz API yapısı, async desteği |
| LLM | Anthropic Claude API (claude-sonnet-4-6) | En iyi creative writing, zaten elimizde |
| Image Gen | OpenAI DALL-E 3 | En erişilebilir, prompt'a sadık, API basit |
| Frontend | HTML + CSS + Vanilla JS | Framework overhead yok, kontrol bizde, basit deploy |
| Env Yönetimi | python-dotenv | API key'leri güvenli saklamak için |

**AI Teknikleri (ödev zorunluluğu):**
- Teknik 1: **LLM (Large Language Model)** — Claude ile şiir üretimi
- Teknik 2: **Text-to-Image Diffusion Model** — DALL-E 3 ile görsel üretimi

---

## Proje Dosya Yapısı

```
ai_project/
├── IMPLEMENTATION_PLAN.md   ← bu dosya
├── PROGRESS.md              ← ne yaptık takibi
├── README.md                ← ödev teslimi için (Phase 4'te)
├── backend/
│   ├── main.py              ← FastAPI uygulaması
│   ├── prompts.py           ← LLM ve image prompt'ları
│   ├── requirements.txt     ← Python bağımlılıkları
│   └── .env                 ← API key'ler (git'e eklenmez)
├── frontend/
│   ├── index.html           ← tek sayfa uygulama
│   ├── style.css            ← 1970s film estetiği
│   └── script.js            ← API çağrıları ve UI mantığı
└── .gitignore
```

---

## Backlog

### PHASE 1 — Foundation (MVP) 🎯
> Hedef: Çalışan, demo edilebilen bir uygulama.

#### 1.1 — Proje Altyapısı
- [ ] Klasör yapısını oluştur (`backend/`, `frontend/`)
- [ ] `requirements.txt` hazırla (`fastapi`, `uvicorn`, `anthropic`, `openai`, `python-dotenv`, `httpx`)
- [ ] `.env` dosyası oluştur (API key placeholder'larıyla)
- [ ] `.gitignore` oluştur (`.env` ve `__pycache__` ekle)
- [ ] Virtual environment kur (`python -m venv venv`)
- [ ] Bağımlılıkları yükle

#### 1.2 — Backend: FastAPI Kurulumu
- [ ] `main.py` içinde temel FastAPI uygulaması oluştur
- [ ] CORS middleware ekle (frontend'den istek gelebilsin)
- [ ] Health check endpoint: `GET /health`
- [ ] Uvicorn ile sunucunun ayağa kalktığını test et

#### 1.3 — Backend: LLM Entegrasyonu (Claude)
- [ ] `prompts.py` dosyası oluştur
- [ ] Sistem promptu yaz: Claude'a Dylan'ın sesini, 1973 dönemini, veda ve çocukluk temalarını ver
- [ ] `POST /generate-poem` endpoint'i yaz
  - Input: `{ "memory": "string" }`
  - Output: `{ "poem": "string" }`
- [ ] Claude API çağrısını test et (Postman veya curl ile)

#### 1.4 — Backend: Image Generation Entegrasyonu (DALL-E 3)
- [ ] `POST /generate-image` endpoint'i yaz
- [ ] Image prompt'u yaz: anıyı + şiiri alıp 1970s film estetiğine çeviren prompt
  - Film grain, faded colors, nostalgic, 35mm filmi hissi
  - Dönemin renk paleti (sarımsı, soluk, sıcak)
- [ ] OpenAI API çağrısını test et
- [ ] Dönen image URL'i frontend'e ilet

#### 1.5 — Backend: Ana Endpoint
- [ ] `POST /create-door` endpoint'i yaz (poem + image'ı tek seferde döner)
  - Input: `{ "memory": "string" }`
  - Output: `{ "poem": "string", "image_url": "string" }`
- [ ] Hata yönetimi ekle (API timeout, geçersiz input vs.)

#### 1.6 — Frontend: Temel Arayüz
- [ ] `index.html` iskelet: input alanı + submit butonu + sonuç alanı
- [ ] `script.js`: form submit → `/create-door` çağrısı → sonucu göster
- [ ] Loading state: istek sürerken kullanıcıya "kapın açılıyor..." gibi bir mesaj
- [ ] Şiir + görsel yan yana ya da alt alta göster
- [ ] MVP arayüzünü tarayıcıda test et (uçtan uca çalışıyor mu?)

---

### PHASE 2 — Estetik & Deneyim ✨
> Hedef: Teknik çalışıyor, şimdi sanatsal kimliği ver.

- [ ] CSS: Karanlık, ağır, melankolik tema (siyah, sepia tonları)
- [ ] 1970s film grain efekti (CSS filter veya overlay)
- [ ] Typewriter animasyonu: şiir harf harf belirir
- [ ] Görsel fade-in animasyonu
- [ ] "Kapı" metaforu: arayüze kapı tasarımı (görsel çerçeve, kapı kolu vs.)
- [ ] Mobil uyumluluk (responsive)
- [ ] Kullanıcı deneyimi iyileştirme: input placeholder'ı ("Bir çocukluk anını yaz...")
- [ ] Hata mesajları kullanıcıya göster

---

### PHASE 3 — Kalıcılık, Kolaj & Tarihi Bağlam 📖
> Hedef: Kolektif galeri + tarihi derinlik. Herkesin kapısı aynı duvarda durur.
> Konsept: Anonim kolaj — başkasının anısını okuyup kendi anını hatırlamak.

#### 3A — Backend: Kalıcılık
- [ ] SQLite entegrasyonu (`doors.db`, tablo: id, memory, poem, image_path, created_at)
- [ ] `backend/static/images/` klasörü oluştur
- [ ] FastAPI'de `/static` klasörünü statik dosya olarak sun (StaticFiles mount)
- [ ] `/create-door` endpoint'ini güncelle: üretilen görseli indir, klasöre kaydet, DB'ye yaz
- [ ] `GET /gallery` endpoint'i yaz: tüm kapıları yeniden eskiye sıralı döndür

#### 3B — Frontend: Kolaj Galerisi
- [ ] `frontend/gallery.html` oluştur
- [ ] Grid layout: her kapı bir kart (görsel + şiirin ilk satırı)
- [ ] Hover'da şiirin tamamı overlay olarak açılır
- [ ] Ana sayfaya "See all doors →" linki ekle
- [ ] Galeri sayfasına "← Knock" geri linki ekle
- [ ] Sayfa yüklenince `/gallery` endpoint'inden kapıları çek, render et

#### 3C — Tarihi Bağlam & LLM Derinliği
- [ ] LLM sistem promptunu geliştir: Pat Garrett filmi tonu, 1973 dönemi imgeleri
- [ ] "About this door" bölümü: şarkının kısa hikayesi (ana sayfada, giriş olarak)
- [ ] Galeri sayfasına şarkının tarihi bağlamını anlatan bir başlık ekle

---

### PHASE 4 — Teslim Hazırlığı 📦
> Hedef: Ödevin tüm teslimat gereksinimlerini karşıla.

- [ ] `README.md` yaz (ödev şablonuna göre):
  - Proje açıklaması ve sanatsal statement
  - Teknik mimari
  - Kurulum talimatları
  - Kullanılan AI teknikleri ve nasıl etkileşiyorlar
  - Bağımlılıklar ve API gereksinimleri
  - Ekran görüntüleri
- [ ] Artist's Manifesto yaz (1.500–3.000 kelime):
  - Neden bu medium?
  - Seni ne yakaladı?
  - AI bu süreçte ne oldu? (araç mı, ortak mı, ayna mı?)
  - Senin kapın: hayatında bu tema sana ne ifade ediyor?
- [ ] GitHub repo oluştur ve her şeyi push'la
- [ ] `.env` dosyasının gitignore'da olduğunu teyit et
- [ ] Demo videosu veya ekran görüntüleri çek
- [ ] Son test: sıfırdan kurulum talimatlarını takip ederek çalışıyor mu?

---

## MVP Tanımı

Şu 3 şey çalışıyorsa MVP tamamdır:

1. Kullanıcı textarea'ya bir anı yazar
2. Butona basar, Claude bir şiir üretir
3. DALL-E bir görsel üretir, ikisi ekranda görünür

Bunun ötesi Phase 2+.

---

## API Key İhtiyaçları

| Servis | Nereden Alınır | Notlar |
|--------|---------------|--------|
| Anthropic (Claude) | console.anthropic.com | Zaten elimizde olabilir |
| OpenAI (DALL-E 3) | platform.openai.com | DALL-E 3 için GPT-4 erişimi gerekmez, ayrı faturalanır |

---

## Önemli Notlar

- API key'ler asla koda yazılmaz, `.env` dosyasında tutulur
- `.env` asla git'e push'lanmaz
- Her session sonunda PROGRESS.md güncellenir
- Bir şey beklenmedik çıkarsa plan güncellenir, panik yapılmaz
