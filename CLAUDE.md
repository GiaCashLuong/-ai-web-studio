# AI Web Studio – Project Documentation

## Overview
Web Agency platform with AI-powered quote generation. Clients describe their project, Claude AI generates a detailed quote, clients sign digitally and pay via Stripe.

## Live URL
`https://ai-web-studio-theta.vercel.app`

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS (multi-page)
- **Auth & DB:** Supabase (PostgreSQL + Row Level Security)
- **AI:** Claude Sonnet 4.6 via Anthropic API (server-side Edge Function)
- **Payments:** Stripe Checkout
- **Deploy:** Vercel (auto-deploy from GitHub)
- **Repo:** `https://github.com/GiaCashLuong/-ai-web-studio`

## File Structure
```
├── index.html          → Landing page (hero, services, testimonials)
├── auth.html           → Login / Register (email + Google OAuth)
├── dashboard.html      → Client dashboard (project list + stats)
├── new-project.html    → New project form → triggers AI quote
├── quote.html          → View quote + canvas signature + Stripe pay
├── success.html        → Confetti animation after payment
├── contact.html        → Contact form (saved to Supabase)
├── css/style.css       → All shared styles (dark theme, components)
├── js/config.js        → Supabase client, i18n, nav, auth helpers
├── assets/
│   ├── audio/          → Local audio files
│   ├── video/          → Local video files
│   └── images/         → Local image files
├── supabase/
│   ├── schema.sql      → DB tables (projects, contact_messages, user_profiles)
│   └── functions/
│       ├── generate-quote/   → Calls Claude API, saves project to DB
│       ├── create-checkout/  → Creates Stripe Checkout Session
│       └── stripe-webhook/   → Marks project as paid on payment success
└── vercel.json         → Vercel deploy config
```

## Key Credentials (server-side only)
- Supabase URL: `https://jllirmrpkayiyajwebbr.supabase.co`
- Edge Function Secrets: `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`
- Google OAuth: configured in Supabase Auth Providers
- Stripe Webhook: `https://jllirmrpkayiyajwebbr.supabase.co/functions/v1/stripe-webhook`

## User Flow
1. Register / Login (email or Google)
2. Dashboard → "New Project"
3. Fill form → AI generates quote (Claude Sonnet)
4. View quote → Sign on canvas
5. Pay via Stripe Checkout (test card: `4242 4242 4242 4242`)
6. Success page with confetti animation

## Database Tables
- `projects` – stores all client projects, quote JSON, signature, payment status
- `contact_messages` – contact form submissions
- `user_profiles` – extended user info (auto-created on signup)

## Languages
Bilingual VI/EN toggle – stored in `localStorage('lang')`. All UI strings in `js/config.js` (i18n object) and inline `tx` objects per page.

## Project Status
All features working as of 2026-04-23:
- ✅ Auth (email + Google OAuth)
- ✅ AI quote generation
- ✅ Digital signature
- ✅ Stripe payment
- ✅ Success animation
- ✅ Bilingual UI
- ✅ Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy)

---

## Development Rules

### Code Style
- Vanilla JS only – no React/Vue/frameworks
- No build step – all files served as static HTML
- Page logic in external `js/page-NAME.js` files (NOT inline `<script>`)
- Event handlers via `addEventListener` only (NO `onclick`, `onsubmit`, `oninput` attributes)
- Shared logic only in `js/config.js`
- No TypeScript in frontend (only in Supabase Edge Functions)

### Security
- Never put `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY` in frontend files
- All sensitive operations go through Supabase Edge Functions
- RLS policies on all DB tables – users can only access their own data
- Stripe webhook signature verification is active

### Supabase Edge Functions
- Located in `supabase/functions/`
- Written in TypeScript (Deno runtime)
- JWT verification is OFF (functions handle auth via request body)
- Secrets accessed via `Deno.env.get()`
- Deploy via Supabase Dashboard Editor or CLI

### Deployment
- Push to GitHub `main` branch → Vercel auto-deploys
- After code changes: commit to GitHub, Vercel redeploys in ~30s
- After Edge Function changes: redeploy via Supabase Dashboard

### Adding New Features
- New page → create `page-name.html`, follow existing pattern
- New DB table → add to `supabase/schema.sql` and run in SQL Editor
- New Edge Function → create in Supabase Dashboard Editor, add to `supabase/functions/`
- Always test auth flow after changes to `js/config.js`

### Stripe
- Currently in **Sandbox/Test mode**
- Test card: `4242 4242 4242 4242`, any future date, any CVC
- Switch to Live mode in Stripe Dashboard when ready to go live
- Update `STRIPE_SECRET_KEY` secret in Supabase after switching

---

## MCP Tools (Claude tự dùng, không cần thao tác tay)

Claude có 5 MCP servers kết nối trực tiếp — mọi thao tác với các dịch vụ này đều tự động, không cần mở dashboard:

| MCP | Làm được gì |
|-----|-------------|
| **GitHub** | Đọc/ghi code, push file, tạo commit lên repo `GiaCashLuong/-ai-web-studio` |
| **Supabase** | Truy vấn DB, chạy SQL, xem logs, quản lý migrations |
| **Vercel** | Xem deployments, build logs, runtime logs, kiểm tra trạng thái deploy |
| **Stripe** | Xem customers, invoices, payments, balance; tạo products/prices/payment links |
| **Playwright** | Điều khiển Brave browser để test UI, chụp screenshot, kiểm tra console |

> Config lưu tại `C:\Users\gsgze\.claude.json`. Vercel và Stripe dùng OAuth — nếu hết session thì gọi `mcp__vercel__authenticate` / `mcp__stripe__authenticate` để đăng nhập lại.

### Quy trình deploy tự động
1. Claude viết/sửa code → push lên GitHub (GitHub MCP)
2. Vercel tự deploy sau ~30s
3. Stop hook tự gọi Observatory API → kiểm tra điểm bảo mật
4. Nếu < 100/100 → fix tiếp, chưa coi là xong

---

## Chiến lược Ảnh & Media

### Phân loại tư liệu

**Lấy từ bên ngoài** (unsplash/pexels/pixabay — dùng URL trực tiếp, không cần xin):
- Ảnh background, hero section, texture, phong cảnh
- Ảnh minh họa chung (công nghệ, teamwork, office...)
- Nhạc nền, sound effects
- Video stock minh họa

**Lấy từ khách hàng** (phải xin — tạm thời dùng placeholder):
- Ảnh sản phẩm/dịch vụ thực tế
- Avatar/ảnh chân dung feedback khách hàng
- Ảnh team, nhân viên, văn phòng
- Logo, brand assets
- Video giới thiệu công ty

### Quy tắc Placeholder
Khi build mà chưa có ảnh từ khách hàng, tạo placeholder bằng CSS thuần:
```html
<div class="placeholder-img" data-label="Ảnh sản phẩm chính – 800×600px">
  Ảnh sản phẩm chính<br>800×600px
</div>
```
```css
.placeholder-img {
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: .85rem;
  padding: 1rem;
  border: 1px dashed #444;
  border-radius: 8px;
  width: 100%;
  aspect-ratio: 4/3;
}
```

### Báo cáo ảnh cần xin
Sau khi build xong, tổng hợp danh sách placeholder còn lại và thông báo cho người dùng:
```
📋 Ảnh cần xin từ khách hàng:
1. [Ảnh sản phẩm chính] – kích thước tối thiểu 800×600px
2. [Avatar khách hàng A] – ảnh vuông, tối thiểu 200×200px
...
```
Sau khi có ảnh → thay thế placeholder bằng `<img src="...">` hoặc background-image.

---

## Design Resources

### 1. Bố cục / Layout (chỉ dùng để tham khảo, không nhúng)
- **refero.design** — layout thực tế từ app/web nổi tiếng
- **landingfolio.com** — landing page đẹp, phân loại theo section
- **screenlane.com** — UI patterns theo từng loại trang

### 2. Hiệu ứng CSS/JS
- **uiverse.io** — hiệu ứng CSS/JS miễn phí, copy code trực tiếp
- **animista.net** — chọn animation → generate CSS sẵn
- **cssfx.netlify.app** — hiệu ứng thuần CSS đơn giản

> **Quy tắc CSP:** Code CSS từ các trang này phải paste vào `css/style.css` (không dùng link CDN). Code JS phải lưu vào `js/page-NAME.js` (không inline). Nếu vi phạm sẽ mất điểm Observatory.

### 3. Hình ảnh & Video miễn phí
- **unsplash.com** — ảnh chất lượng cao
- **pexels.com** — ảnh + video đa dạng
- **pixabay.com** — lựa chọn bổ sung

> **Quy tắc CSP:** `img-src https:` và `media-src https:` đã có — dùng URL `https://` trực tiếp là OK, hoặc tải về `assets/images/` / `assets/video/`.

### 4. Âm thanh miễn phí
- **pixabay.com/music** — nhạc nền, đa dạng thể loại
- **freesound.org** — sound effects

> **Quy tắc CSP:** `media-src https:` đã có trong CSP — dùng URL ngoài trực tiếp hoặc tải về `assets/audio/` đều OK.

---

## Tester – Checklist bắt buộc sau mỗi lần code xong

**QUAN TRỌNG: Phải hoàn thành checklist này trước khi coi task là xong.**

### 1. Functional Test (test tay trên trình duyệt)
- [ ] Trang load được, không có lỗi console (F12 → Console)
- [ ] Auth flow: Đăng ký → Đăng nhập → Đăng xuất hoạt động
- [ ] Google OAuth hoạt động
- [ ] Tạo project → nhận báo giá AI → ký tên → thanh toán Stripe
- [ ] Chuyển ngôn ngữ VI/EN hoạt động đúng
- [ ] Responsive: test trên mobile (DevTools → Toggle device toolbar)

### 2. Security Test – Mozilla Observatory
Vào `https://observatory.mozilla.org` → nhập URL → scan:
- [ ] **CSP**: phải đạt `0` hoặc không bị trừ điểm lớn
- [ ] **X-Frame-Options**: phải có ✓
- [ ] **Referrer-Policy**: phải có ✓
- [ ] **X-Content-Type-Options**: phải có ✓
- [ ] Tổng điểm phải đạt **100/100** — chưa đạt thì chưa xong task

### 3. Security Code Review
Trước khi push bất kỳ file nào, kiểm tra:
- [ ] Không có `onclick=`, `onsubmit=`, `oninput=` trong HTML (dùng `addEventListener`)
- [ ] Không có `<script>` inline trong HTML (chỉ dùng `<script src="...">`)
- [ ] Không có API key, secret trong file frontend
- [ ] `js/supabase.min.js` là file local (không CDN ngoài)
- [ ] `vercel.json` có đủ 4 security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy

### 4. Nếu phát hiện lỗi CSP
| Lỗi | Cách fix |
|-----|----------|
| `unsafe-inline` trong script-src | Chuyển `<script>` inline → file `js/page-NAME.js` riêng |
| `unsafe-inline` trong style-src | Chuyển `<style>` inline → `css/style.css` hoặc dùng hash |
| External script không có SRI | Self-host file vào `js/` folder |
| CDN script mới thêm | Tải về local và để vào `js/` |
