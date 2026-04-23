const tx = {
  vi: { back_link:'← Quay lại Dashboard', lbl_req:'Yêu cầu của bạn', lbl_features:'Tính năng bao gồm', lbl_timeline:'Timeline', lbl_pricing:'Chi tiết báo giá', lbl_sign:'Ký xác nhận hợp đồng', sign_hint:'Ký tên vào ô bên dưới để xác nhận đồng ý với báo giá này.', btn_clear:'Xoá', btn_confirm_sign:'Xác nhận & Ký', btn_pay:'Thanh toán qua Stripe', pay_note:'Thanh toán an toàn qua Stripe. Thẻ Visa, Mastercard, JCB.', status_pending:'Đang chờ báo giá từ AI...', status_paid:'Dự án đã được thanh toán!', err_sign:'Vui lòng ký tên trước khi xác nhận.', err_load:'Không tìm thấy dự án.', signing:'Đang lưu chữ ký...', paying:'Đang chuyển đến Stripe...' },
  en: { back_link:'← Back to Dashboard', lbl_req:'Your Request', lbl_features:'Features Included', lbl_timeline:'Timeline', lbl_pricing:'Pricing Details', lbl_sign:'Sign to Confirm', sign_hint:'Sign in the box below to confirm you agree with this quote.', btn_clear:'Clear', btn_confirm_sign:'Confirm & Sign', btn_pay:'Pay via Stripe', pay_note:'Secure payment via Stripe. Visa, Mastercard, JCB accepted.', status_pending:'Waiting for AI quote...', status_paid:'Project has been paid!', err_sign:'Please sign before confirming.', err_load:'Project not found.', signing:'Saving signature...', paying:'Redirecting to Stripe...' }
};
const lang = localStorage.getItem('lang')||'vi';

let project = null;
let isDrawing = false;
let canvas, ctx;

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('back_link').textContent = tx[lang].back_link;
  renderNav('');
  const user = await requireAuth();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) { showAlert(tx[lang].err_load,'error'); return; }

  const { data, error } = await supabase.from('projects').select('*').eq('id', id).eq('user_id', user.id).single();
  document.getElementById('spinner').style.display = 'none';

  if (error || !data) { showAlert(tx[lang].err_load,'error'); return; }
  project = data;
  renderQuote(project);
});

function renderQuote(p) {
  const quote = p.quote_data || {};
  const isPaid = p.status === 'paid';
  const isSigned = p.status === 'signed' || isPaid;
  const isPending = p.status === 'pending' || !quote.items;

  const content = document.getElementById('quote-content');
  content.style.display = 'block';

  if (isPending) {
    content.innerHTML = `<div class="card text-center mt-3"><div class="spinner"></div><p>${tx[lang].status_pending}</p></div>`;
    setTimeout(() => location.reload(), 5000);
    return;
  }

  const items = quote.items || [];
  const features = quote.features || [];
  const timeline = quote.timeline || '';
  const totalVnd = p.total_price || 0;

  content.innerHTML = `
    <div class="quote-header mt-3">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.5rem">
        <div>
          <h2>📋 ${escHtml(p.title)}</h2>
          <div class="meta">${new Date(p.created_at).toLocaleDateString(lang==='vi'?'vi-VN':'en-US',{year:'numeric',month:'long',day:'numeric'})} · ${renderStatusText(p.status)}</div>
        </div>
        <div style="font-size:2rem;font-weight:800">${formatMoney(totalVnd)}</div>
      </div>
    </div>

    ${isPaid ? `<div class="alert alert-success">${tx[lang].status_paid}</div>` : ''}

    <div class="card mb-3">
      <div class="section-label">${tx[lang].lbl_req}</div>
      <p style="color:var(--muted);line-height:1.7">${escHtml(p.description||'')}</p>
      ${quote.summary ? `<p class="mt-2" style="line-height:1.7">${escHtml(quote.summary)}</p>` : ''}
    </div>

    ${features.length ? `
    <div class="card mb-3">
      <div class="section-label">${tx[lang].lbl_features}</div>
      ${features.map(f=>`<div class="feature-item"><span class="feature-check">✓</span><span>${escHtml(f)}</span></div>`).join('')}
    </div>` : ''}

    ${timeline ? `
    <div class="card mb-3">
      <div class="section-label">${tx[lang].lbl_timeline}</div>
      <p style="line-height:1.7">${escHtml(timeline)}</p>
    </div>` : ''}

    <div class="card mb-3">
      <div class="section-label">${tx[lang].lbl_pricing}</div>
      ${items.map(item=>`
        <div class="quote-line">
          <span>${escHtml(item.name)}</span>
          <span style="font-weight:600">${formatMoney(item.price)}</span>
        </div>`).join('')}
      <div class="quote-line">
        <span style="font-weight:700">Total</span>
        <span class="quote-total">${formatMoney(totalVnd)}</span>
      </div>
    </div>

    ${!isPaid ? `
    <div class="card mb-3" id="sign-card">
      <div class="section-label">${tx[lang].lbl_sign}</div>
      ${isSigned
        ? `<div class="alert alert-success mt-1">✓ ${lang==='vi'?'Đã ký xác nhận':'Signed & confirmed'}</div>`
        : `<p class="text-muted text-sm mb-2">${tx[lang].sign_hint}</p>
           <div class="sign-area">
             <canvas id="signatureCanvas" width="700" height="160"></canvas>
             <div class="sign-controls">
               <button class="btn-secondary" id="clear-btn" type="button">${tx[lang].btn_clear}</button>
               <button class="btn-primary" id="sign-btn" type="button">${tx[lang].btn_confirm_sign}</button>
             </div>
           </div>`
      }
    </div>

    ${isSigned ? `
    <div class="card" id="pay-card">
      <button class="btn-primary btn-lg" style="width:100%" id="pay-btn">${tx[lang].btn_pay}</button>
      <div class="stripe-logos mt-2">
        <svg height="24" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="0" y="20" font-size="18" fill="#6772e5" font-weight="bold">stripe</text></svg>
      </div>
      <p class="pay-note">${tx[lang].pay_note}</p>
    </div>` : ''}
    ` : ''}
  `;

  document.getElementById('clear-btn')?.addEventListener('click', clearSignature);
  document.getElementById('sign-btn')?.addEventListener('click', confirmSign);
  document.getElementById('pay-btn')?.addEventListener('click', startPayment);

  if (!isSigned && !isPaid) initCanvas();
}

function renderStatusText(s) {
  const m = { pending:'Pending', quoted:'Quoted', signed:'Signed', paid:'Paid' };
  return m[s]||s;
}

function initCanvas() {
  canvas = document.getElementById('signatureCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 700;
  ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  canvas.addEventListener('mousedown', e => { isDrawing=true; ctx.beginPath(); ctx.moveTo(getPos(e).x, getPos(e).y); });
  canvas.addEventListener('mousemove', e => { if(!isDrawing) return; ctx.lineTo(getPos(e).x, getPos(e).y); ctx.stroke(); });
  canvas.addEventListener('mouseup', () => isDrawing=false);
  canvas.addEventListener('mouseleave', () => isDrawing=false);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); isDrawing=true; ctx.beginPath(); const t=e.touches[0]; ctx.moveTo(getPos(t).x, getPos(t).y); }, {passive:false});
  canvas.addEventListener('touchmove', e => { e.preventDefault(); if(!isDrawing) return; const t=e.touches[0]; ctx.lineTo(getPos(t).x, getPos(t).y); ctx.stroke(); }, {passive:false});
  canvas.addEventListener('touchend', () => isDrawing=false);
}

function getPos(e) {
  const r = canvas.getBoundingClientRect();
  return { x:(e.clientX||e.pageX)-r.left, y:(e.clientY||e.pageY)-r.top };
}

function clearSignature() {
  if (ctx) ctx.clearRect(0,0,canvas.width,canvas.height);
}

function isCanvasBlank() {
  const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
  return !data.some(v=>v!==0);
}

async function confirmSign() {
  if (!canvas || isCanvasBlank()) { showAlert(tx[lang].err_sign,'error'); return; }
  const btn = document.getElementById('sign-btn');
  btn.textContent = tx[lang].signing; btn.disabled = true;

  const signatureDataUrl = canvas.toDataURL('image/png');
  const { error } = await supabase.from('projects').update({ status:'signed', signature_data: signatureDataUrl, signed_at: new Date().toISOString() }).eq('id', project.id);

  if (error) { showAlert(error.message,'error'); btn.textContent=tx[lang].btn_confirm_sign; btn.disabled=false; return; }
  project.status = 'signed';
  renderQuote(project);
}

async function startPayment() {
  const btn = document.getElementById('pay-btn');
  btn.textContent = tx[lang].paying; btn.disabled = true;

  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { projectId: project.id, lang }
  });

  if (error || !data?.url) {
    showAlert('Stripe error: '+(error?.message||'Unknown'), 'error');
    btn.textContent = tx[lang].btn_pay; btn.disabled = false;
    return;
  }
  window.location.href = data.url;
}

function showAlert(msg, type) {
  document.getElementById('alert-box').innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function formatMoney(v) { return new Intl.NumberFormat(lang==='vi'?'vi-VN':'en-US',{style:'currency',currency:lang==='vi'?'VND':'USD'}).format(v); }
