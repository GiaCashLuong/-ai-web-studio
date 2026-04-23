const tx = {
  vi: { success_title:'Thanh toán <span>thành công!</span>', success_sub:'Cảm ơn bạn! Chúng tôi đã nhận được thanh toán và sẽ bắt đầu dự án của bạn ngay.', btn_dashboard:'Xem Dashboard', btn_new:'Tạo dự án mới', lbl_project:'Dự án', lbl_amount:'Số tiền', lbl_date:'Ngày thanh toán', lbl_status:'Trạng thái', status_paid:'Đã thanh toán ✓' },
  en: { success_title:'Payment <span>Successful!</span>', success_sub:'Thank you! We have received your payment and will start your project right away.', btn_dashboard:'View Dashboard', btn_new:'New Project', lbl_project:'Project', lbl_amount:'Amount', lbl_date:'Payment Date', lbl_status:'Status', status_paid:'Paid ✓' }
};
const lang = localStorage.getItem('lang')||'vi';
const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444'];

function launchConfetti() {
  const container = document.getElementById('confetti');
  for (let i=0;i<120;i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const size = Math.random()*10+6;
    el.style.cssText = `
      left:${Math.random()*100}%;
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>.5?'50%':'2px'};
      animation-duration:${Math.random()*2+1.5}s;
      animation-delay:${Math.random()*.8}s;
      --drift:${(Math.random()-0.5)*200}px;
    `;
    container.appendChild(el);
  }
  setTimeout(() => container.innerHTML='', 5000);
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('success_title').innerHTML = tx[lang].success_title;
  document.getElementById('success_sub').textContent = tx[lang].success_sub;
  document.getElementById('btn_dashboard').textContent = tx[lang].btn_dashboard;
  document.getElementById('btn_new').textContent = tx[lang].btn_new;
  renderNav('');
  launchConfetti();

  const params = new URLSearchParams(location.search);
  const projectId = params.get('project_id');

  if (projectId) {
    await supabase.from('projects').update({ status:'paid', paid_at: new Date().toISOString() }).eq('id', projectId);
    const { data: p } = await supabase.from('projects').select('title,total_price,created_at').eq('id', projectId).single();
    if (p) {
      document.getElementById('receipt').innerHTML = `
        <div class="receipt-row"><span>${tx[lang].lbl_project}</span><span style="font-weight:600">${escHtml(p.title)}</span></div>
        <div class="receipt-row"><span>${tx[lang].lbl_amount}</span><span style="font-weight:700;color:var(--primary)">${formatMoney(p.total_price||0)}</span></div>
        <div class="receipt-row"><span>${tx[lang].lbl_date}</span><span>${new Date().toLocaleDateString(lang==='vi'?'vi-VN':'en-US',{year:'numeric',month:'long',day:'numeric'})}</span></div>
        <div class="receipt-row"><span>${tx[lang].lbl_status}</span><span style="color:var(--success);font-weight:600">${tx[lang].status_paid}</span></div>
      `;
    }
  } else {
    document.getElementById('receipt').style.display = 'none';
  }

  setTimeout(launchConfetti, 1200);
});

function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function formatMoney(v){ return new Intl.NumberFormat(lang==='vi'?'vi-VN':'en-US',{style:'currency',currency:lang==='vi'?'VND':'USD'}).format(v); }
