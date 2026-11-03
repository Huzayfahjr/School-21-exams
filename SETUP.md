# Sozlash qo'llanmasi (Supabase + admin panel)

Sayt Supabase'siz ham ishlaydi (savollar JSON'dan). Foydalanuvchi savol yuborishi va admin panel uchun quyidagilar kerak. Hammasi bepul tarifda.

## 1. Supabase loyihasi
1. https://supabase.com ga kiring → **New project** (nom ixtiyoriy, parolni saqlab qo'ying, region: yaqinroq, masalan Frankfurt).
2. **SQL Editor** → New query → `supabase/schema.sql` ichidagini to'liq joylab **Run**.

## 2. Google / GitHub orqali kirish
**Authentication → Providers**:
- **GitHub**: github.com → Settings → Developer settings → OAuth Apps → New. *Callback URL* — Supabase Providers sahifasida ko'rsatilgan manzil. Client ID/Secret ni Supabase'ga kiriting.
- **Google**: Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web). *Authorized redirect URI* — Supabase ko'rsatgan manzil. Client ID/Secret ni Supabase'ga kiriting.

**Authentication → URL Configuration**:
- Site URL: `https://SIZNING-NOM.github.io/REPO/`
- Redirect URLs: shu manzil va `https://SIZNING-NOM.github.io/REPO/admin.html`

## 3. Saytga ulash
**Project Settings → API**: `Project URL` va `anon public` kalitni `data/tracks.json` ichiga yozing:
```json
"supabase": { "url": "https://xxxx.supabase.co", "anonKey": "eyJ..." }
```
Anon kalit ochiq bo'lishi normal (xavfsizlikni RLS ta'minlaydi). **`service_role` kalitni hech qachon fayllarga yozmang.**

## 4. O'zingizni admin qilish
1. Saytda `admin.html` ga kiring, Google/GitHub bilan login qiling — "Bu akkaunt admin emas" va sizning `user_id` ko'rinadi.
2. Supabase **SQL Editor**'da: `insert into public.admins (user_id) values ('<ko'rsatilgan uuid>');`
3. Sahifani yangilang — navbat ochiladi.

## 5. Telegram xabarnoma (ixtiyoriy)
@BotFather orqali bot yarating, o'zingizga yozing (`/start`), chat_id ni bilib oling. `supabase/telegram-notify.sql` ichidagi tokenni va chat_id ni **faqat** shu SQL ichiga qo'yib Run qiling (tokenni saytga yozmang).

## 6. Tekshirish ro'yxati
- [ ] Saytda login → savol yuborish → "yuborildi"
- [ ] Bir kunda 5 tadan ortiq yuborib bo'lmaydi
- [ ] `admin.html`da savol navbatda ko'rinadi, "Tekshirish" SQL natijasini ko'rsatadi
- [ ] Tasdiqlangach asosiy saytda "O'xshash/Imtihondan" belgisi bilan chiqadi
- [ ] Boshqa akkaunt admin.html ni ocha olmaydi

## Eslatma
- Supabase bepul tarif limitlari o'zgarishi mumkin — supabase.com/pricing ni tekshiring.
- Imtihon savollarini tarqatish School 21 qoidalariga zid bo'lmasligini kampusdan so'rab oling.
- Hech qachon School 21 login/parolini yig'maymiz.
