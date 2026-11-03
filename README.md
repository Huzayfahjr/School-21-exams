# Imtihon Tayyorlov

School 21 imtihonlariga norasmiy tayyorgarlik platformasi (hozir: SQL-exam-t). Oddiy statik sayt: server kerak emas.

## 1. GitHub Pages'ga joylash (bepul)
1. github.com'da yangi repository oching (masalan `imtihon-tayyorlov`), Public.
2. Shu papkadagi hamma fayllarni (index.html, css, js, data, robots.txt, sitemap.xml) repositoryga yuklang.
3. Repository → Settings → Pages → Source: "Deploy from a branch", Branch: `main`, folder: `/ (root)` → Save.
4. 1-2 daqiqadan keyin sayt `https://<username>.github.io/imtihon-tayyorlov/` manzilida ochiladi.

## 2. Google qidiruvida chiqishi uchun
1. `index.html` ichidagi `canonical`, `robots.txt` va `sitemap.xml` dagi `YOUR-NAME.github.io/YOUR-REPO` ni o'z manzilingizga almashtiring.
2. search.google.com/search-console ga kiring, "URL prefix" bilan saytingizni qo'shing, egalikni tasdiqlang (HTML-teg usuli: `<meta name="google-site-verification" ...>` ni index.html `<head>` ga qo'ying).
3. Sitemap bo'limida `sitemap.xml` ni yuboring. Birinchi natijalar odatda bir necha kun-hafta ichida chiqadi.
4. Qidiruvda yuqoriroq chiqish uchun saytga havolalar (School 21 chatlari, Telegram guruhlari) qo'yish yordam beradi.

## 3. Savol qo'shish
Savollar `data/sql-exam-t.json` faylida. Har bir savol:
```json
{ "id": "sqlt-e31", "src": "exam", "t": "join", "d": 2, "p": 1,
  "code": "SELECT ...", "tables": [{"n":"Student","c":["id","name"],"r":[[1,"Иван"]]}],
  "q": ["Русский текст", "O'zbekcha matn"],
  "o": [["A ru","A uz"], "B (ikkala tilda bir xil)", "C", "D"], "a": 1,
  "e": ["Объяснение", "Izoh"] }
```
- `src`: `exam` (imtihondan) yoki `similar` (o'xshash/mashq). `p`: 1 amaliy, 0 nazariy. `d`: 1-3 qiyinlik. `a`: to'g'ri variant indeksi (0-3).
- Matn maydonlari: oddiy satr (ikkala tilda bir xil) yoki `["ru","uz"]`.
- `t` mavzu kaliti fayl boshidagi `topics` ro'yxatidan.
- Amaliy savollarning javobini PostgreSQL'da tekshirib qo'shing.

## 4. Yangi yo'nalish (C, Linux)
`data/tracks.json` da trek `status: "soon"` dan `"active"` ga o'tkaziladi, `exams` ichiga imtihon qo'shiladi va `data/<imtihon>.json` yaratiladi. Kod o'zgarmaydi.

## 5. Savol yuborish
Hozir forma tayyor xabar matnini beradi, foydalanuvchi uni sizga yuboradi. Telegram bot tayyor bo'lganda `data/tracks.json` dagi `site.telegram` ga bot nomini yozing, forma botga havola ko'rsatadi.

## Savol yuborish va admin panel
Foydalanuvchilar savol yuborishi, siz `admin.html` orqali tekshirib tasdiqlashingiz uchun Supabase kerak. Qadamlar: [SETUP.md](SETUP.md).
