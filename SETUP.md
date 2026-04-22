# AI Web Studio – Hướng dẫn Setup

## Cấu trúc file
```
├── index.html          → Landing page
├── auth.html           → Đăng nhập / Đăng ký
├── dashboard.html      → Danh sách dự án
├── new-project.html    → Tạo yêu cầu dự án
├── quote.html          → Xem báo giá + ký tên
├── success.html        → Animation chúc mừng
├── contact.html        → Liên hệ
├── css/style.css       → Shared styles
├── js/config.js        → Keys + Supabase client + i18n
├── supabase/
│   ├── schema.sql      → Chạy trong Supabase SQL Editor
│   └── functions/
│       ├── generate-quote/    → Gọi Claude API tạo báo giá
│       ├── create-checkout/   → Tạo Stripe Checkout Session
│       └── stripe-webhook/    → Xác nhận thanh toán từ Stripe
└── vercel.json         → Cấu hình deploy
```

---

## BƯỚC 1: Tạo tài khoản & Project Supabase
1. Vào https://supabase.com → New Project
2. Vào **SQL Editor** → paste toàn bộ nội dung `supabase/schema.sql` → Run
3. Vào **Settings > API** → lấy:
   - `Project URL` → điền vào `SUPABASE_URL` trong `js/config.js`
   - `anon public key` → điền vào `SUPABASE_ANON_KEY`
4. Vào **Authentication > Providers** → bật **Google** (cần Google OAuth Client ID/Secret)

---

## BƯỚC 2: Tạo tài khoản Stripe
1. Vào https://stripe.com → tạo account
2. Vào **Developers > API keys** → lấy Publishable key → điền vào `js/config.js`
3. Lưu Secret key để dùng ở bước deploy Edge Functions

---

## BƯỚC 3: Lấy Claude (Anthropic) API Key
1. Vào https://console.anthropic.com → tạo API key
2. Lưu lại để dùng ở bước deploy Edge Functions

---

## BƯỚC 4: Deploy Supabase Edge Functions
```bash
# Cài Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project (lấy project ref từ Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF

# Set environment variables
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxx
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set SITE_URL=https://your-site.vercel.app

# Deploy functions
supabase functions deploy generate-quote
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

---

## BƯỚC 5: Cấu hình Stripe Webhook
1. Vào Stripe Dashboard > **Developers > Webhooks** → Add endpoint
2. URL: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
3. Events: chọn `checkout.session.completed`
4. Lấy **Signing secret** → set vào `STRIPE_WEBHOOK_SECRET`

---

## BƯỚC 6: Deploy lên Vercel
```bash
# Cài Vercel CLI
npm install -g vercel

# Deploy (chạy trong thư mục dự án)
vercel

# Hoặc kéo thả thư mục vào vercel.com > Import Project
```

Sau khi có Vercel URL, cập nhật `SITE_URL` trong Supabase secrets.

---

## Checklist trước khi go live
- [ ] Điền `SUPABASE_URL` và `SUPABASE_ANON_KEY` trong `js/config.js`
- [ ] Điền `STRIPE_PUBLISHABLE_KEY` trong `js/config.js`
- [ ] Deploy 3 Edge Functions với đúng secrets
- [ ] Stripe Webhook trỏ đúng URL
- [ ] Test flow: Đăng ký → Tạo dự án → Nhận báo giá → Ký tên → Thanh toán → Success
- [ ] Đổi Stripe từ Test mode sang Live mode khi thực sự go live
