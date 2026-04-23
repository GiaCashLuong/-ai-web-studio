const texts = {
  vi: {
    hero_badge: 'Công nghệ AI thế hệ mới', hero_h1: 'Website đẳng cấp,<br/><span>tạo bởi AI</span>',
    hero_p: 'Mô tả dự án của bạn, AI của chúng tôi sẽ lập tức tạo báo giá và bản kế hoạch hoàn chỉnh trong vài phút.',
    hero_cta1: 'Bắt đầu ngay', hero_cta2: 'Xem dịch vụ',
    stat1:'Dự án hoàn thành',stat2:'Nhanh hơn truyền thống',stat3:'Khách hài lòng',stat4:'Thời gian phản hồi',
    svc_title:'Dịch vụ của chúng tôi', svc_sub:'Từ landing page đến hệ thống phức tạp – AI giúp chúng tôi giao sản phẩm nhanh gấp 5 lần.',
    svc1_title:'Landing Page AI',svc1_desc:'Trang giới thiệu sản phẩm/dịch vụ chuyên nghiệp, tối ưu chuyển đổi, giao trong 24–48 giờ.',
    svc2_title:'Website Thương mại điện tử',svc2_desc:'Cửa hàng online tích hợp thanh toán, quản lý kho, báo cáo doanh thu tự động.',
    svc3_title:'Web App có AI',svc3_desc:'Ứng dụng web tích hợp chatbot, phân tích dữ liệu hoặc tự động hóa quy trình kinh doanh.',
    svc4_title:'Dashboard & Admin',svc4_desc:'Bảng điều khiển quản trị nội bộ, báo cáo trực quan, phân quyền người dùng.',
    svc5_title:'Responsive & PWA',svc5_desc:'Website hoạt động mượt mà trên mọi thiết bị, có thể cài đặt như ứng dụng di động.',
    svc6_title:'Bảo trì & Nâng cấp',svc6_desc:'Hỗ trợ kỹ thuật, cập nhật tính năng, tối ưu hiệu suất theo yêu cầu hàng tháng.',
    how_title:'Quy trình làm việc', how_sub:'Chỉ 4 bước đơn giản để có website chuyên nghiệp của riêng bạn.',
    step1:'Mô tả dự án',step1p:'Điền yêu cầu ngắn gọn',step2:'AI tạo báo giá',step2p:'Tự động trong vài giây',
    step3:'Ký & Thanh toán',step3p:'Xác nhận trực tuyến',step4:'Nhận sản phẩm',step4p:'Giao đúng hạn cam kết',
    testi_title:'Khách hàng nói gì', testi_sub:'Những phản hồi thực tế từ khách hàng đã sử dụng dịch vụ.',
    cta_title:'Sẵn sàng bắt đầu?', cta_sub:'Tạo tài khoản miễn phí và nhận báo giá ngay hôm nay.',
    cta_btn:'Tạo tài khoản miễn phí', footer_copy:'© 2025 AI Web Studio. Bảo lưu mọi quyền.',
    footer_contact:'Liên hệ', footer_privacy:'Đăng nhập',
  },
  en: {
    hero_badge: 'Next-generation AI technology', hero_h1: 'Premium websites,<br/><span>built by AI</span>',
    hero_p: 'Describe your project and our AI instantly generates a complete quote and plan in minutes.',
    hero_cta1: 'Get Started', hero_cta2: 'Our Services',
    stat1:'Projects Done',stat2:'Faster Than Traditional',stat3:'Client Satisfaction',stat4:'Response Time',
    svc_title:'Our Services', svc_sub:'From landing pages to complex systems – AI helps us ship 5× faster.',
    svc1_title:'AI Landing Page',svc1_desc:'Professional product/service pages, conversion-optimized, delivered in 24–48 hours.',
    svc2_title:'E-commerce Website',svc2_desc:'Online store with integrated payments, inventory management and automated revenue reporting.',
    svc3_title:'AI-Powered Web App',svc3_desc:'Web applications with chatbot, data analysis, or business process automation.',
    svc4_title:'Dashboard & Admin',svc4_desc:'Internal admin panels, visual reports, and role-based access control.',
    svc5_title:'Responsive & PWA',svc5_desc:'Websites that work flawlessly on every device and can be installed as a mobile app.',
    svc6_title:'Maintenance & Upgrades',svc6_desc:'Technical support, feature updates, and performance optimization on demand.',
    how_title:'How It Works', how_sub:'Just 4 simple steps to get your professional website.',
    step1:'Describe Project',step1p:'Fill in your brief',step2:'AI Generates Quote',step2p:'Automated in seconds',
    step3:'Sign & Pay',step3p:'Confirm online',step4:'Receive Product',step4p:'Delivered on time',
    testi_title:'What Clients Say', testi_sub:'Real feedback from clients who have used our service.',
    cta_title:'Ready to start?', cta_sub:'Create a free account and get your quote today.',
    cta_btn:'Create Free Account', footer_copy:'© 2025 AI Web Studio. All rights reserved.',
    footer_contact:'Contact', footer_privacy:'Login',
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const lang = localStorage.getItem('lang') || 'vi';
  const tx = texts[lang];
  Object.keys(tx).forEach(k => {
    const el = document.getElementById(k);
    if (el) el.innerHTML = tx[k];
  });
  renderNav('home');
});
