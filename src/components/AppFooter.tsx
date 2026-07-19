import "./AppFooter.css";

type Destination = "about" | "ai" | "experts" | "forum";

interface AppFooterProps {
  onNavigate?: (destination: Destination) => void;
}

export default function AppFooter({ onNavigate }: AppFooterProps) {
  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, destination: Destination) => {
    event.preventDefault();
    onNavigate?.(destination);
  };

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="app-footer-brand">
          <div className="app-footer-logo"><span>R</span> ReMind</div>
          <p>Nền tảng hỗ trợ sức khỏe tinh thần ẩn danh dành cho Gen Z.</p>
        </div>
        <div className="app-footer-links">
          <h4>Liên kết</h4>
          <a href="#about" onClick={(event) => navigate(event, "about")}>Về chúng tôi</a>
          <a href="#aichat" onClick={(event) => navigate(event, "ai")}>AI Chat</a>
          <a href="#experts" onClick={(event) => navigate(event, "experts")}>Chuyên gia</a>
          <a href="#forum" onClick={(event) => navigate(event, "forum")}>Góc tâm sự</a>
        </div>
        <div className="app-footer-links">
          <h4>Hỗ trợ</h4>
          <a href="#help">Trung tâm trợ giúp</a>
          <a href="#terms">Điều khoản sử dụng</a>
          <a href="#privacy">Chính sách bảo mật</a>
        </div>
      </div>
      <div className="app-footer-bottom">© 2026 ReMind - SDN302 Group 1. All rights reserved.</div>
    </footer>
  );
}
