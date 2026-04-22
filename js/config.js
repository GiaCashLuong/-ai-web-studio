// ============================================================
// REPLACE THESE WITH YOUR REAL KEYS BEFORE DEPLOY
// ============================================================
const SUPABASE_URL = 'https://jllirmrpkayiyajwebbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbGlybXJwa2F5aXlhandlYmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDI5NDMsImV4cCI6MjA5MjM3ODk0M30.1_DZoCymoVUwdPrv_cZQPkF4NT9Rcucw7kvONvcCs0A';
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TOrhICJmqcefePCn4fUZblKi0qivAVicSdgjYnrn4PboIUQ0LXE3JtbmEaZlOz1ifpzyojXi8xw9MroZypL3z98005Yr5Xp48';
const CLAUDE_API_KEY = 'sk-ant-YOUR_CLAUDE_KEY'; // used server-side only via Supabase Edge Function

// Supabase client (loaded via CDN in each HTML file)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Language state
let currentLang = localStorage.getItem('lang') || 'vi';

const i18n = {
  vi: {
    nav_home: 'Trang chủ', nav_services: 'Dịch vụ', nav_contact: 'Liên hệ',
    nav_login: 'Đăng nhập', nav_dashboard: 'Dashboard', nav_logout: 'Đăng xuất',
    footer_copy: '© 2025 AI Web Studio. Bảo lưu mọi quyền.',
  },
  en: {
    nav_home: 'Home', nav_services: 'Services', nav_contact: 'Contact',
    nav_login: 'Login', nav_dashboard: 'Dashboard', nav_logout: 'Logout',
    footer_copy: '© 2025 AI Web Studio. All rights reserved.',
  }
};

function t(key) {
  return (i18n[currentLang] && i18n[currentLang][key]) || key;
}

function toggleLang() {
  currentLang = currentLang === 'vi' ? 'en' : 'vi';
  localStorage.setItem('lang', currentLang);
  location.reload();
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function requireAuth() {
  const user = await getUser();
  if (!user) { window.location.href = '/auth.html'; }
  return user;
}

async function renderNav(activePage) {
  const user = await getUser();
  const nav = document.getElementById('nav');
  if (!nav) return;
  nav.innerHTML = `
    <a href="/index.html" class="nav-brand">
      <span class="brand-icon">⚡</span> AI Web Studio
    </a>
    <div class="nav-links">
      <a href="/index.html" ${activePage==='home'?'class="active"':''}>${t('nav_home')}</a>
      <a href="/index.html#services" ${activePage==='services'?'class="active"':''}>${t('nav_services')}</a>
      <a href="/contact.html" ${activePage==='contact'?'class="active"':''}>${t('nav_contact')}</a>
      ${user
        ? `<a href="/dashboard.html" ${activePage==='dashboard'?'class="active"':''}>${t('nav_dashboard')}</a>
           <button class="btn-ghost" onclick="signOut()">${t('nav_logout')}</button>`
        : `<a href="/auth.html" class="btn-primary">${t('nav_login')}</a>`
      }
      <button class="lang-toggle" onclick="toggleLang()">${currentLang==='vi'?'EN':'VI'}</button>
    </div>
    <button class="nav-toggle" onclick="document.getElementById('nav').classList.toggle('open')">☰</button>
  `;
}

async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/index.html';
}
