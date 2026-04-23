const tx = {
  vi: { page_title:'Liên hệ với chúng tôi', page_sub:'Bạn có câu hỏi hoặc muốn trao đổi về dự án? Hãy liên hệ ngay!', lbl_email:'Email', lbl_phone:'Điện thoại', lbl_addr:'Địa chỉ', lbl_hours:'Giờ làm việc', hours_val:'Thứ 2 – Thứ 7, 8:00–18:00', social_label:'Hoặc tìm chúng tôi trên mạng xã hội', form_title:'Gửi tin nhắn', lbl_name:'Họ và tên', lbl_c_email:'Email', lbl_subject:'Chủ đề', lbl_message:'Nội dung tin nhắn', send_btn:'Gửi tin nhắn', success_msg:'Tin nhắn đã được gửi! Chúng tôi sẽ phản hồi trong vòng 24 giờ.', footer_copy:'© 2025 AI Web Studio. Bảo lưu mọi quyền.' },
  en: { page_title:'Contact Us', page_sub:"Have a question or want to discuss a project? Get in touch!", lbl_email:'Email', lbl_phone:'Phone', lbl_addr:'Address', lbl_hours:'Working Hours', hours_val:'Mon – Sat, 8:00–18:00', social_label:'Or find us on social media', form_title:'Send a Message', lbl_name:'Full Name', lbl_c_email:'Email', lbl_subject:'Subject', lbl_message:'Message', send_btn:'Send Message', success_msg:"Message sent! We'll reply within 24 hours.", footer_copy:'© 2025 AI Web Studio. All rights reserved.' }
};
const lang = localStorage.getItem('lang')||'vi';

document.addEventListener('DOMContentLoaded', () => {
  Object.keys(tx[lang]).forEach(k => { const el=document.getElementById(k); if(el) el.textContent=tx[lang][k]; });
  renderNav('contact');
  document.getElementById('contact-form').addEventListener('submit', sendMessage);
});

async function sendMessage(e) {
  e.preventDefault();
  const btn = document.getElementById('send_btn');
  btn.textContent = '...'; btn.disabled = true;

  const { error } = await supabase.from('contact_messages').insert({
    name: document.getElementById('c-name').value,
    email: document.getElementById('c-email').value,
    subject: document.getElementById('c-subject').value,
    message: document.getElementById('c-message').value,
    lang,
    created_at: new Date().toISOString()
  });

  if (error) {
    document.getElementById('alert-box').innerHTML = `<div class="alert alert-error">${error.message}</div>`;
  } else {
    document.getElementById('alert-box').innerHTML = `<div class="alert alert-success">${tx[lang].success_msg}</div>`;
    document.getElementById('contact-form').reset();
  }
  btn.textContent = tx[lang].send_btn; btn.disabled = false;
}
