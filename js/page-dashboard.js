const tx = {
  vi: { dash_sub:'Đây là danh sách các dự án của bạn.', new_project_btn:'+ Dự án mới', lbl_total:'Tổng dự án', lbl_pending:'Chờ báo giá', lbl_quoted:'Đã có báo giá', lbl_paid:'Đã thanh toán', footer_copy:'© 2025 AI Web Studio', no_projects:'Bạn chưa có dự án nào.', no_projects_sub:'Tạo yêu cầu đầu tiên để AI lập báo giá tự động!', status_pending:'Chờ báo giá', status_quoted:'Đã báo giá', status_signed:'Đã ký', status_paid:'Đã thanh toán', view_btn:'Xem chi tiết', hi:'Xin chào,' },
  en: { dash_sub:'Here are your projects.', new_project_btn:'+ New Project', lbl_total:'Total Projects', lbl_pending:'Awaiting Quote', lbl_quoted:'Quoted', lbl_paid:'Paid', footer_copy:'© 2025 AI Web Studio', no_projects:'You have no projects yet.', no_projects_sub:'Create your first request and let AI generate a quote automatically!', status_pending:'Pending', status_quoted:'Quoted', status_signed:'Signed', status_paid:'Paid', view_btn:'View Details', hi:'Hello,' }
};
const lang = localStorage.getItem('lang')||'vi';

function statusBadge(status) {
  const map = { pending:'badge-pending', quoted:'badge-quoted', signed:'badge-quoted', paid:'badge-paid' };
  const labels = { pending: tx[lang].status_pending, quoted: tx[lang].status_quoted, signed: tx[lang].status_signed, paid: tx[lang].status_paid };
  return `<span class="badge ${map[status]||'badge-pending'}">${labels[status]||status}</span>`;
}

function formatDate(str) {
  return new Date(str).toLocaleDateString(lang==='vi'?'vi-VN':'en-US', { year:'numeric', month:'short', day:'numeric' });
}

document.addEventListener('DOMContentLoaded', async () => {
  Object.keys(tx[lang]).forEach(k => { const el=document.getElementById(k); if(el) el.textContent=tx[lang][k]; });
  renderNav('dashboard');

  const user = await requireAuth();

  const name = user.user_metadata?.full_name?.split(' ').pop() || user.email.split('@')[0];
  document.getElementById('greeting').innerHTML = `${tx[lang].hi} <span>${name}</span> 👋`;

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    document.getElementById('alert-box').innerHTML = `<div class="alert alert-error">Lỗi tải dữ liệu: ${error.message}</div>`;
    return;
  }

  document.getElementById('count-total').textContent = projects.length;
  document.getElementById('count-pending').textContent = projects.filter(p=>p.status==='pending').length;
  document.getElementById('count-quoted').textContent = projects.filter(p=>p.status==='quoted'||p.status==='signed').length;
  document.getElementById('count-paid').textContent = projects.filter(p=>p.status==='paid').length;

  const container = document.getElementById('projects-container');
  if (!projects.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📋</div>
        <h3>${tx[lang].no_projects}</h3>
        <p class="mt-1">${tx[lang].no_projects_sub}</p>
        <a href="/new-project.html" class="btn-primary mt-3" style="display:inline-block">${tx[lang].new_project_btn}</a>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="grid-2">${projects.map(p => `
    <div class="card project-card" data-id="${p.id}">
      <div class="project-title">${escHtml(p.title)}</div>
      <div class="project-desc">${escHtml(p.description||'')}</div>
      <div class="project-meta">
        ${statusBadge(p.status)}
        <span class="project-date">${formatDate(p.created_at)}</span>
      </div>
      ${p.total_price ? `<div style="font-weight:700;color:var(--primary);margin-top:.75rem">${formatMoney(p.total_price)}</div>` : ''}
    </div>`).join('')}</div>`;

  container.querySelector('.grid-2').addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    if (card) window.location.href = '/quote.html?id=' + card.dataset.id;
  });
});

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function formatMoney(v) { return new Intl.NumberFormat(lang==='vi'?'vi-VN':'en-US',{style:'currency',currency:lang==='vi'?'VND':'USD'}).format(v); }
