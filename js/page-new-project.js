const tx = {
  vi: { back_link:'← Quay lại Dashboard', page_title:'Tạo yêu cầu dự án mới', page_sub:'Mô tả ngắn gọn – AI sẽ tự động tạo bản báo giá chi tiết cho bạn.', lbl_title:'Tên dự án / sản phẩm', lbl_type:'Loại website', lbl_desc:'Mô tả chi tiết yêu cầu', lbl_budget:'Ngân sách dự kiến (không bắt buộc)', lbl_deadline:'Thời gian mong muốn hoàn thành', submit_btn:'🤖 Gửi yêu cầu & để AI tạo báo giá', ai_thinking_title:'AI đang phân tích yêu cầu của bạn...', ai_thinking_sub:'Thường mất 10–20 giây. Vui lòng đợi.', b1:'Dưới 5 triệu', b2:'5–15 triệu', b3:'15–30 triệu', b4:'Trên 30 triệu', d1:'Càng sớm càng tốt', d2:'Trong 1 tuần', d3:'Trong 2 tuần', d4:'Trong 1 tháng', d5:'Linh hoạt', err_type:'Vui lòng chọn loại website.', err_api:'Lỗi gọi AI. Vui lòng thử lại.' },
  en: { back_link:'← Back to Dashboard', page_title:'Create New Project Request', page_sub:'Describe briefly – AI will automatically create a detailed quote for you.', lbl_title:'Project / Product Name', lbl_type:'Website Type', lbl_desc:'Detailed Requirements', lbl_budget:'Estimated Budget (optional)', lbl_deadline:'Desired Completion Time', submit_btn:'🤖 Submit & Let AI Quote', ai_thinking_title:'AI is analyzing your request...', ai_thinking_sub:'Usually takes 10–20 seconds. Please wait.', b1:'Under $200', b2:'$200–$600', b3:'$600–$1,200', b4:'Over $1,200', d1:'ASAP', d2:'Within 1 week', d3:'Within 2 weeks', d4:'Within 1 month', d5:'Flexible', err_type:'Please select a website type.', err_api:'AI API error. Please try again.' }
};
const lang = localStorage.getItem('lang')||'vi';

document.addEventListener('DOMContentLoaded', async () => {
  Object.keys(tx[lang]).forEach(k => { const el=document.getElementById(k); if(el) el.textContent=tx[lang][k]; });
  renderNav('');
  await requireAuth();

  document.querySelectorAll('#type-tags .tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#type-tags .tag-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('proj-type').value = btn.dataset.val;
    });
  });
  document.querySelectorAll('#budget-tags .tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#budget-tags .tag-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('proj-budget').value = btn.dataset.val;
    });
  });

  document.getElementById('project-form').addEventListener('submit', submitProject);
  document.getElementById('proj-desc').addEventListener('input', (e) => updateCount(e.target, 2000, 'count-desc'));
});

function updateCount(el, max, countId) {
  document.getElementById(countId).textContent = el.value.length;
}

async function submitProject(e) {
  e.preventDefault();
  const type = document.getElementById('proj-type').value;
  if (!type) { showAlert(tx[lang].err_type,'error'); return; }

  const title = document.getElementById('proj-title').value;
  const desc = document.getElementById('proj-desc').value;
  const budget = document.getElementById('proj-budget').value;
  const deadline = document.getElementById('proj-deadline').value;

  document.getElementById('project-form').style.display = 'none';
  document.getElementById('ai-thinking').style.display = 'block';

  const user = await getUser();

  const { data: fnData, error: fnErr } = await supabase.functions.invoke('generate-quote', {
    body: { title, type, description: desc, budget, deadline, userId: user.id, lang }
  });

  if (fnErr || !fnData?.projectId) {
    document.getElementById('ai-thinking').style.display = 'none';
    document.getElementById('project-form').style.display = 'block';
    showAlert(tx[lang].err_api + (fnErr?.message ? ': '+fnErr.message : ''), 'error');
    return;
  }

  window.location.href = `/quote.html?id=${fnData.projectId}`;
}

function showAlert(msg, type) {
  document.getElementById('alert-box').innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}
