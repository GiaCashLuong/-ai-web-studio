const tx = {
  vi: { tab_login:'Đăng nhập',tab_register:'Đăng ký',google_btn:'Tiếp tục với Google',or_text:'hoặc',email_label:'Email',pass_label:'Mật khẩu',forgot_link:'Quên mật khẩu?',login_btn:'Đăng nhập',name_label:'Họ và tên',reg_pass_label:'Mật khẩu',register_btn:'Tạo tài khoản',err_email:'Vui lòng kiểm tra email để xác nhận tài khoản!',err_login:'Email hoặc mật khẩu không đúng.',err_forgot:'Đã gửi email đặt lại mật khẩu!' },
  en: { tab_login:'Login',tab_register:'Register',google_btn:'Continue with Google',or_text:'or',email_label:'Email',pass_label:'Password',forgot_link:'Forgot password?',login_btn:'Login',name_label:'Full Name',reg_pass_label:'Password',register_btn:'Create Account',err_email:'Please check your email to verify your account!',err_login:'Invalid email or password.',err_forgot:'Password reset email sent!' }
};
const lang = localStorage.getItem('lang')||'vi';

document.addEventListener('DOMContentLoaded', () => {
  Object.keys(tx[lang]).forEach(k => { const el=document.getElementById(k); if(el) el.textContent=tx[lang][k]; });
  renderNav('');
  supabase.auth.getUser().then(({data:{user}}) => { if(user) window.location.href='/dashboard.html'; });

  document.getElementById('tab-login').addEventListener('click', () => switchTab('login'));
  document.getElementById('tab-register').addEventListener('click', () => switchTab('register'));
  document.querySelector('.social-btn').addEventListener('click', signInGoogle);
  document.getElementById('form-login').addEventListener('submit', handleLogin);
  document.getElementById('form-register').addEventListener('submit', handleRegister);
  document.getElementById('forgot_link').addEventListener('click', handleForgot);
});

function switchTab(tab) {
  document.getElementById('form-login').style.display = tab==='login'?'block':'none';
  document.getElementById('form-register').style.display = tab==='register'?'block':'none';
  document.getElementById('tab-login').classList.toggle('active', tab==='login');
  document.getElementById('tab-register').classList.toggle('active', tab==='register');
  showAlert('','');
}

function showAlert(msg, type) {
  const box = document.getElementById('alert-box');
  box.innerHTML = msg ? `<div class="alert alert-${type}">${msg}</div>` : '';
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login_btn');
  btn.textContent = '...'; btn.disabled = true;
  const { error } = await supabase.auth.signInWithPassword({
    email: document.getElementById('login-email').value,
    password: document.getElementById('login-password').value,
  });
  if (error) { showAlert(tx[lang].err_login,'error'); btn.textContent=tx[lang].login_btn; btn.disabled=false; }
  else window.location.href = '/dashboard.html';
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('register_btn');
  btn.textContent = '...'; btn.disabled = true;
  const name = document.getElementById('reg-name').value;
  const { error } = await supabase.auth.signUp({
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-password').value,
    options: { data: { full_name: name } }
  });
  if (error) { showAlert(error.message,'error'); }
  else { showAlert(tx[lang].err_email,'success'); }
  btn.textContent=tx[lang].register_btn; btn.disabled=false;
}

async function signInGoogle() {
  await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.origin+'/dashboard.html' } });
}

async function handleForgot(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  if (!email) { showAlert('Nhập email trước.','error'); return; }
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin+'/auth.html' });
  showAlert(tx[lang].err_forgot,'success');
}
