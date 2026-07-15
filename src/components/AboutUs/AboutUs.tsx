import { useEffect } from "react";
import "./AboutUs.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AboutUsProps {
  onBack: () => void;
}

function AboutUs({ onBack }: AboutUsProps) {
  useEffect(() => {
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      // 1. Hero Entrance animations on load
      gsap.fromTo(
        [".about-hero-badge", ".about-hero-title", ".about-hero-desc", ".about-hero-cta"],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );

      // 2. Story section Scroll Reveal
      gsap.fromTo(
        ".about-story-text",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: ".about-story",
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      gsap.fromTo(
        ".about-story-visual",
        { opacity: 0, scale: 0.95, y: 35 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: ".about-story",
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // 3. Values section Scroll Reveal
      gsap.fromTo(
        ".about-values-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: ".about-values",
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      gsap.fromTo(
        ".about-value-card",
        { opacity: 0, y: 40, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          scrollTrigger: {
            trigger: ".about-values-grid",
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // 4. Join section Scroll Reveal
      gsap.fromTo(
        ".about-join-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: ".about-join",
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      gsap.fromTo(
        ".join-card",
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: ".join-grid",
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="about-page">
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
          <div className="about-hero-cta">
            <button className="about-cta-btn" onClick={onBack}>
              <i className="bx bx-left-arrow-alt"></i> Quay lại Trang chủ
            </button>
          </div>
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
              Đó là lý do chúng tôi quyết định xây dựng ReMind. Chúng tôi kết hợp sức mạnh của công nghệ Trí tuệ Nhân tạo (AI) và mạng lưới chuyên gia tâm lý giàu kinh nghiệm để mang đến giải pháp sơ cứu và chăm sóc tinh thần toàn diện, 24/7 và hoàn toàn bảo mật.
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

      {/* ===== JOIN SECTION (NEW) ===== */}
      <section className="about-join">
        <div className="about-join-inner">
          <div className="about-join-header">
            <h2>Đồng hành cùng ReMind</h2>
            <p>Dù bạn cần hỗ trợ hay muốn cống hiến chuyên môn, ReMind luôn chào đón bạn.</p>
          </div>
          <div className="join-grid">
            {/* Student Card */}
            <div className="join-card user-card">
              <div className="join-icon"><i className="bx bx-smile"></i></div>
              <h3>Dành cho Học sinh & Sinh viên</h3>
              <p>Trút bỏ gánh nặng tinh thần hoàn toàn bảo mật. Nhận sự hỗ trợ tức thì từ AI Therapist hoặc trò chuyện sâu hơn cùng các chuyên gia giàu kinh nghiệm.</p>
              <button className="join-btn btn-user" onClick={onBack}>
                Trải nghiệm ngay <i className="bx bx-right-arrow-alt"></i>
              </button>
            </div>
            {/* Expert Card */}
            <div className="join-card expert-card">
              <div className="join-icon"><i className="bx bx-pulse"></i></div>
              <h3>Dành cho Chuyên gia Tâm lý</h3>
              <p>Mở rộng tầm ảnh hưởng của bạn đến cộng đồng Gen Z. Đồng hành cùng ReMind trong việc tư vấn, hỗ trợ chuyên môn thông qua nền tảng thông minh.</p>
              <button className="join-btn btn-expert" onClick={onBack}>
                Đăng ký tham gia <i className="bx bx-right-arrow-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="about-footer">
        <p>© 2026 ReMind. Tất cả quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}

export default AboutUs;
