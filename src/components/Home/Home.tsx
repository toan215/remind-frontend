import { useState, useEffect, useRef } from "react";
import "./Home.css";
import { AuthController } from "../../controllers/AuthController";
import NotificationBell from "../Header/NotificationBell";
import gsap from "gsap";

interface HomeProps {
  onOpenAIChat: () => void;
  onOpenExpertDirectory: () => void;
  onOpenCalendar?: () => void;
  onOpenForum: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  userRole: string;
  onOpenAdminPortal: () => void;
  onOpenAbout: () => void;
  onOpenSettings: () => void;
  onOpenChat: () => void;
}

function Home({
  onOpenAIChat,
  onOpenExpertDirectory,
  onOpenCalendar,
  onOpenForum,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  userRole,
  onOpenAdminPortal,
  onOpenAbout,
  onOpenSettings,
  onOpenChat,
}: HomeProps) {
  // Refs for GSAP Hero Animations
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroActionsRef = useRef<HTMLDivElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const msg1Ref = useRef<HTMLDivElement>(null);
  const msg2Ref = useRef<HTMLDivElement>(null);
  const msg3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      gsap.set(
        [
          heroBadgeRef.current,
          heroTitleRef.current,
          heroDescRef.current,
          heroActionsRef.current,
        ],
        { opacity: 0, y: 30 },
      );
      gsap.set(heroVisualRef.current, { opacity: 0, x: 40, rotate: 5 });
      gsap.set([msg1Ref.current, msg2Ref.current, msg3Ref.current], {
        opacity: 0,
        y: 15,
      });

      tl.to(heroBadgeRef.current, { opacity: 1, y: 0, duration: 0.6 })
        .to(heroTitleRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .to(heroDescRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
        .to(
          heroActionsRef.current,
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.5",
        )
        .to(
          heroVisualRef.current,
          { opacity: 1, x: 0, rotate: 2, duration: 1, ease: "back.out(1.2)" },
          "-=0.8",
        );

      tl.to(
        msg1Ref.current,
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "+=0.3",
      )
        .to(
          msg2Ref.current,
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "+=1.0",
        )
        .to(
          msg3Ref.current,
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "+=1.2",
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="home-page">
      {/* ===== 2. HERO SECTION ===== */}
      <section className="home-hero" id="hero-section">
        <div className="home-hero-inner">
          <div className="home-hero-text">
            <div className="home-hero-badge" ref={heroBadgeRef}>
              <i
                className="bx bxs-star"
                style={{ color: "var(--brand-500)" }}
              ></i>{" "}
              Nền tảng hỗ trợ tâm lý ẩn danh 24/7 cho Gen Z
            </div>
            <h1 className="home-hero-title" ref={heroTitleRef}>
              Áp lực này, để <span className="home-highlight">ReMind</span> gánh
              cùng bạn.
            </h1>
            <p className="home-hero-desc" ref={heroDescRef}>
              Không gian hoàn toàn ẩn danh để bạn giải tỏa gánh nặng tinh thần.
              Sơ cứu tâm lý miễn phí với Trợ lý AI và kết nối Chuyên gia khi bạn
              cần can thiệp sâu.
            </p>
            <div className="home-hero-actions" ref={heroActionsRef}>
              <button
                className="home-btn-primary"
                id="chat-ai-btn"
                onClick={onOpenAIChat}
              >
                Trò chuyện với AI (Miễn phí)
              </button>
              <button
                className="home-btn-secondary"
                id="find-expert-btn"
                onClick={onOpenExpertDirectory}
              >
                Tìm chuyên gia phù hợp
              </button>
            </div>
          </div>

          {/* Mock Chatbot UI */}
          <div className="home-hero-visual" ref={heroVisualRef}>
            <div className="home-chatbot-card">
              <div className="chatbot-header">
                <div className="chatbot-avatar">
                  <i className="bx bx-bot"></i>
                </div>
                <div className="chatbot-info">
                  <h4>AI Therapist</h4>
                  <p
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span className="chatbot-status-dot"></span>
                    Đang hoạt động • Luôn ẩn danh
                  </p>
                </div>
              </div>
              <div className="chatbot-messages">
                <div className="chat-msg bot" ref={msg1Ref}>
                  Chào bạn, tôi ở đây để lắng nghe. Hôm nay của bạn thế nào? Cứ
                  chia sẻ nhé, không ai biết bạn là ai đâu.
                </div>
                <div className="chat-msg user" ref={msg2Ref}>
                  Tôi vừa trượt bài kiểm tra, áp lực đồng lứa làm tôi ngột ngạt
                  quá...
                </div>
                <div className="chat-msg bot" ref={msg3Ref}>
                  Tôi hiểu cảm giác đó. Thất bại một bài kiểm tra không định
                  nghĩa giá trị của bạn. Hãy cùng tôi thực hiện bài tập thở sâu
                  4-7-8 để bình tĩnh lại nhé?
                </div>
              </div>
              <div className="chatbot-input">
                <input
                  type="text"
                  placeholder="Nhập tâm sự của bạn tại đây..."
                  disabled
                  id="chatbot-input-field"
                />
                <button className="chatbot-send-btn" id="chatbot-send-btn">
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. VALUE PROPOSITION ===== */}
      <section className="home-values" id="values-section">
        <div className="home-values-inner">
          <div className="home-values-header">
            <h2>An toàn hơn - Tiết kiệm hơn - Thấu hiểu hơn</h2>
            <p>
              Hệ sinh thái thông minh giúp bạn gạt bỏ hoàn toàn rào cản e ngại
              khi đi chăm sóc sức khỏe tinh thần.
            </p>
          </div>
          <div className="home-values-grid">
            {/* Card 1 */}
            <div className="home-value-card" id="card-ai">
              <div className="value-icon value-icon-indigo">
                <i className="bx bx-chat"></i>
              </div>
              <h3>AI Chat 24/7</h3>
              <p>
                Sơ cứu tâm lý tức thời vào bất kể khung giờ nào. Hoàn toàn miễn
                phí, đưa ra lời khuyên khoa học và bài tập thư giãn.
              </p>
            </div>
            {/* Card 2 */}
            <div className="home-value-card" id="card-privacy">
              <div className="value-icon value-icon-emerald">
                <i className="bx bx-lock-alt"></i>
              </div>
              <h3>Ẩn danh tuyệt đối</h3>
              <p>
                Hệ thống bảo mật băm dữ liệu và phân quyền chặt chẽ. Bạn thoải
                mái chia sẻ ở Diễn đàn với bộ lọc từ khóa văn minh.
              </p>
            </div>
            {/* Card 3 */}
            <div className="home-value-card" id="card-expert">
              <div className="value-icon value-icon-amber">
                <i className="bx bx-plus-medical"></i>
              </div>
              <h3>Chuyên gia thấu hiểu</h3>
              <p>
                Đội ngũ bác sĩ thật được kiểm định bằng cấp kỹ càng. Đặc biệt,
                AI sẽ tóm tắt trước lịch sử cảm xúc giúp giảm thời gian chẩn
                đoán ban đầu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. HOW IT WORKS ===== */}
      <section className="home-how-it-works" id="how-it-works">
        <div className="home-hiw-inner">
          <div className="home-hiw-header">
            <h2>Hành trình chữa lành cùng ReMind</h2>
            <p>
              Quy trình 3 bước đơn giản giúp bạn lấy lại sự cân bằng trong cuộc
              sống.
            </p>
          </div>
          <div className="home-hiw-steps">
            <div className="home-hiw-step">
              <div className="step-number">01</div>
              <div className="step-icon">
                <i className="bx bx-bot"></i>
              </div>
              <h3>Sơ cứu cùng AI</h3>
              <p>
                Trò chuyện ẩn danh với AI Therapist để giải tỏa áp lực tức thời
                và nhận các bài tập tâm lý cơ bản.
              </p>
            </div>
            <div className="home-hiw-step">
              <div className="step-number">02</div>
              <div className="step-icon">
                <i className="bx bx-group"></i>
              </div>
              <h3>Chia sẻ cộng đồng</h3>
              <p>
                Tham gia Góc Tâm Sự để đọc những câu chuyện tương tự và nhận lời
                khuyên từ những người đồng cảnh ngộ.
              </p>
            </div>
            <div className="home-hiw-step">
              <div className="step-number">03</div>
              <div className="step-icon">
                <i className="bx bx-calendar-heart"></i>
              </div>
              <h3>Đặt lịch chuyên gia</h3>
              <p>
                Khi cần hỗ trợ chuyên sâu, kết nối nhanh chóng với các chuyên
                gia tâm lý đã được kiểm duyệt của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. EXPERTS PREVIEW ===== */}
      <section className="home-experts-preview" id="experts-preview">
        <div className="home-experts-inner">
          <div className="home-experts-header">
            <h2>Đội ngũ chuyên gia hàng đầu</h2>
            <p>
              Các bác sĩ, thạc sĩ tâm lý học với nhiều năm kinh nghiệm luôn sẵn
              sàng đồng hành cùng bạn.
            </p>
          </div>
          <div className="home-experts-grid">
            <div className="home-expert-card">
              <div className="expert-avatar">
                <i className="bx bx-user-circle"></i>
              </div>
              <div className="expert-info">
                <h4>ThS. BS. Nguyễn Văn A</h4>
                <p className="expert-title">Chuyên gia Tâm lý học Lâm sàng</p>
                <div className="expert-tags">
                  <span>Trầm cảm</span>
                  <span>Rối loạn lo âu</span>
                </div>
              </div>
            </div>
            <div className="home-expert-card">
              <div className="expert-avatar">
                <i className="bx bx-user-circle"></i>
              </div>
              <div className="expert-info">
                <h4>ThS. Trần Thị B</h4>
                <p className="expert-title">Cố vấn Tâm lý Học đường</p>
                <div className="expert-tags">
                  <span>Áp lực đồng lứa</span>
                  <span>Định hướng</span>
                </div>
              </div>
            </div>
            <div className="home-expert-card">
              <div className="expert-avatar">
                <i className="bx bx-user-circle"></i>
              </div>
              <div className="expert-info">
                <h4>BS. Lê Hoàng C</h4>
                <p className="expert-title">Chuyên gia Trị liệu Gia đình</p>
                <div className="expert-tags">
                  <span>Mâu thuẫn</span>
                  <span>Giao tiếp</span>
                </div>
              </div>
            </div>
          </div>
          <div className="home-experts-action">
            <button
              className="home-btn-secondary"
              onClick={onOpenExpertDirectory}
            >
              Xem tất cả chuyên gia <i className="bx bx-right-arrow-alt"></i>
            </button>
          </div>
        </div>
      </section>

      {/* ===== 6. FOOTER ===== */}
      <footer className="home-footer" id="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <div className="home-logo">
              <div className="home-logo-icon">R</div>
              <span className="home-logo-text">ReMind</span>
            </div>
            <p>Nền tảng hỗ trợ sức khỏe tinh thần ẩn danh cho Gen Z.</p>
          </div>
          <div className="home-footer-links">
            <h4>Liên kết</h4>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                onOpenAbout();
              }}
            >
              Về chúng tôi
            </a>
            <a href="#ai-companion">AI Chat</a>
            <a
              href="#clinic"
              onClick={(e) => {
                e.preventDefault();
                onOpenExpertDirectory();
              }}
            >
              Chuyên gia
            </a>
            <a href="#forum">Góc tâm sự</a>
          </div>
          <div className="home-footer-links">
            <h4>Hỗ trợ</h4>
            <a href="#">Trung tâm trợ giúp</a>
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Chính sách bảo mật</a>
          </div>
        </div>
        <div className="home-footer-bottom">
          <p>© 2026 ReMind - SDN302 Group 1. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
