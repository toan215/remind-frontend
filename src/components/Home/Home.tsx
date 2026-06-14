import './Home.css';

interface HomeProps {
  onOpenAIChat: () => void;
  onOpenExpertDirectory: () => void;
  onOpenForum: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  userRole: string;
  onOpenAdminPortal: () => void;
}

function Home({ onOpenAIChat, onOpenExpertDirectory, onOpenForum, onOpenLogin, onLogout, userRole, onOpenAdminPortal }: HomeProps) {
  return (
    <div className="home-page">
      {/* ===== 1. HEADER / NAVIGATION ===== */}
      <header className="home-header" id="home-header">
        <div className="home-header-inner">
          <div className="home-logo">
            <div className="home-logo-icon">R</div>
            <span className="home-logo-text">ReMind</span>
          </div>
          <nav className="home-nav" id="home-nav">
            <a href="#about" className="home-nav-link">Về chúng tớ</a>
            <a href="#ai-companion" className="home-nav-link">AI Companion</a>
            <a href="#clinic" className="home-nav-link" onClick={(e) => { e.preventDefault(); onOpenExpertDirectory(); }}>Phòng khám ẩn danh</a>
            <a href="#forum" className="home-nav-link" onClick={(e) => { e.preventDefault(); onOpenForum(); }}>Góc tâm sự</a>
            {userRole === "admin" && (
              <a
                href="#admin"
                className="home-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenAdminPortal();
                }}
                style={{ color: "var(--brand-700)", fontWeight: "600" }}
              >
                Quản trị 🛠️
              </a>
            )}
          </nav>
          
          {userRole === "guest" ? (
            <div className="home-auth-btns">
              <button className="home-login-btn" id="login-btn" onClick={onOpenLogin}>Đăng nhập</button>
              <button className="home-cta-btn" id="join-now-btn" onClick={onOpenLogin}>Đăng ký</button>
            </div>
          ) : (
            <div className="home-auth-btns">
              <span className="home-user-greeting">Xin chào, {userRole === "admin" ? "Quản trị viên" : "bạn"}!</span>
              <button className="home-logout-btn" id="logout-btn" onClick={onLogout}>Đăng xuất</button>
            </div>
          )}
        </div>
      </header>

      {/* ===== 2. HERO SECTION ===== */}
      <section className="home-hero" id="hero-section">
        <div className="home-hero-inner">
          <div className="home-hero-text">
            <div className="home-hero-badge">
              ✨ Nền tảng hỗ trợ tâm lý ẩn danh 24/7 cho Gen Z
            </div>
            <h1 className="home-hero-title">
              Áp lực này, để <span className="home-highlight">ReMind</span> gánh cùng bạn.
            </h1>
            <p className="home-hero-desc">
              Không gian hoàn toàn ẩn danh để bạn giải tỏa gánh nặng tinh thần. Sơ cứu tâm lý miễn phí với Trợ lý AI và kết nối Chuyên gia khi bạn cần can thiệp sâu.
            </p>
            <div className="home-hero-actions">
              <button className="home-btn-primary" id="chat-ai-btn" onClick={onOpenAIChat}>
                Trò chuyện với AI (Miễn phí)
              </button>
              <button className="home-btn-secondary" id="find-expert-btn" onClick={onOpenExpertDirectory}>
                Tìm chuyên gia phù hợp
              </button>
            </div>
          </div>

          {/* Mock Chatbot UI */}
          <div className="home-hero-visual">
            <div className="home-chatbot-card">
              <div className="chatbot-header">
                <div className="chatbot-avatar">🤖</div>
                <div className="chatbot-info">
                  <h4>AI Therapist</h4>
                  <p>Đang hoạt động • Luôn ẩn danh</p>
                </div>
              </div>
              <div className="chatbot-messages">
                <div className="chat-msg bot">
                  Chào bạn, tớ ở đây để lắng nghe. Hôm nay của bạn thế nào? Cứ chia sẻ nhé, không ai biết bạn là ai đâu.
                </div>
                <div className="chat-msg user">
                  Tớ vừa trượt bài kiểm tra, áp lực đồng lứa làm tớ ngột ngạt quá...
                </div>
                <div className="chat-msg bot">
                  Tớ hiểu cảm giác đó. Thất bại một bài kiểm tra không định nghĩa giá trị của bạn. Hãy cùng tớ thực hiện bài tập thở sâu 4-7-8 để bình tĩnh lại nhé?
                </div>
              </div>
              <div className="chatbot-input">
                <input
                  type="text"
                  placeholder="Nhập tâm sự của bạn tại đây..."
                  disabled
                  id="chatbot-input-field"
                />
                <button className="chatbot-send-btn" id="chatbot-send-btn">Gửi</button>
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
              Hệ sinh thái thông minh giúp bạn gạt bỏ hoàn toàn rào cản e ngại khi đi chăm sóc sức khỏe tinh thần.
            </p>
          </div>
          <div className="home-values-grid">
            {/* Card 1 */}
            <div className="home-value-card" id="card-ai">
              <div className="value-icon value-icon-indigo">💬</div>
              <h3>AI Companion 24/7</h3>
              <p>
                Sơ cứu tâm lý tức thời vào bất kể khung giờ nào. Hoàn toàn miễn phí, đưa ra lời khuyên khoa học và bài tập thư giãn.
              </p>
            </div>
            {/* Card 2 */}
            <div className="home-value-card" id="card-privacy">
              <div className="value-icon value-icon-emerald">🔒</div>
              <h3>Ẩn danh tuyệt đối</h3>
              <p>
                Hệ thống bảo mật băm dữ liệu và phân quyền chặt chẽ. Bạn thoải mái chia sẻ ở Diễn đàn với bộ lọc từ khóa văn minh.
              </p>
            </div>
            {/* Card 3 */}
            <div className="home-value-card" id="card-expert">
              <div className="value-icon value-icon-amber">🩺</div>
              <h3>Chuyên gia thấu hiểu</h3>
              <p>
                Đội ngũ bác sĩ thật được kiểm định bằng cấp kỹ càng. Đặc biệt, AI sẽ tóm tắt trước lịch sử cảm xúc giúp giảm thời gian chẩn đoán ban đầu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. FOOTER ===== */}
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
            <a href="#about">Về chúng tớ</a>
            <a href="#ai-companion">AI Companion</a>
            <a href="#clinic">Phòng khám</a>
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
