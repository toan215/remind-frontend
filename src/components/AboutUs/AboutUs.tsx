import { useState, useEffect } from "react";
import "./AboutUs.css";

interface AboutUsProps {
  onBack: () => void;
}

function AboutUs({ onBack }: AboutUsProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      {/* ===== HEADER ===== */}
      <header className="about-header">
        <div className="about-header-inner">
          <div className="about-logo" onClick={onBack} style={{ cursor: "pointer" }}>
            <div className="about-logo-icon">R</div>
            <span className="about-logo-text">ReMind</span>
          </div>
          <button className="about-back-btn" onClick={onBack}>
            <i className="bx bx-arrow-back"></i> Quay lại trang chủ
          </button>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-hero-badge">Sứ mệnh của chúng tôi</div>
          <h1 className="about-hero-title">
            Vì một thế hệ Gen Z <span className="highlight">khỏe mạnh về tinh thần</span>
          </h1>
          <p className="about-hero-desc">
            ReMind được sinh ra từ sự thấu hiểu những áp lực vô hình mà thế hệ trẻ đang phải gánh chịu. Chúng tôi khao khát tạo ra một không gian an toàn, ẩn danh và chuyên nghiệp để mọi người có thể tự do chia sẻ và chữa lành.
          </p>
        </div>
      </section>

      {/* ===== STORY SECTION ===== */}
      <section className="about-story">
        <div className="about-story-inner">
          <div className="about-story-text">
            <h2>Câu chuyện của ReMind</h2>
            <p>
              Theo thống kê, ngày càng nhiều bạn trẻ gặp phải các vấn đề về tâm lý do áp lực đồng lứa, công việc, học tập và mạng xã hội. Tuy nhiên, rào cản về chi phí, sợ hãi bị phán xét khiến nhiều người e ngại trong việc tìm kiếm sự trợ giúp.
            </p>
            <p>
              Đó là lý do chúng tôi — nhóm SDN302 Group 1 — quyết định xây dựng ReMind. Chúng tôi kết hợp sức mạnh của công nghệ Trí tuệ Nhân tạo (AI) và mạng lưới chuyên gia tâm lý giàu kinh nghiệm để mang đến giải pháp sơ cứu và chăm sóc tinh thần toàn diện, 24/7 và hoàn toàn bảo mật.
            </p>
          </div>
          <div className="about-story-visual">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" alt="ReMind Team" />
          </div>
        </div>
      </section>

      {/* ===== VALUES SECTION ===== */}
      <section className="about-values">
        <div className="about-values-inner">
          <div className="about-values-header">
            <h2>Giá trị cốt lõi</h2>
            <p>Những nguyên tắc định hướng mọi hoạt động của ReMind</p>
          </div>
          <div className="about-values-grid">
            <div className="about-value-card">
              <div className="value-icon"><i className="bx bx-shield-quarter"></i></div>
              <h3>An toàn & Bảo mật</h3>
              <p>Mọi dữ liệu và cuộc trò chuyện của bạn đều được mã hóa và ẩn danh tuyệt đối. Chúng tôi bảo vệ quyền riêng tư của bạn lên hàng đầu.</p>
            </div>
            <div className="about-value-card">
              <div className="value-icon"><i className="bx bx-heart"></i></div>
              <h3>Thấu cảm</h3>
              <p>Chúng tôi lắng nghe không phán xét, đồng hành cùng bạn qua từng giai đoạn khó khăn với sự tử tế và chuyên nghiệp.</p>
            </div>
            <div className="about-value-card">
              <div className="value-icon"><i className="bx bx-bulb"></i></div>
              <h3>Đổi mới & Tiên phong</h3>
              <p>Ứng dụng công nghệ AI tiên tiến nhằm cung cấp giải pháp sơ cứu tâm lý tức thời, chuẩn xác và dễ tiếp cận nhất.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="about-footer">
        <p>© 2026 ReMind - SDN302 Group 1. Tất cả quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}

export default AboutUs;
