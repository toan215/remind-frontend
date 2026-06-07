import { useState, useRef, useEffect } from "react";
import "./AIChat.css";

// Demo conversation data
const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "bot",
    text: "Chào bạn! Tớ là ReMind AI — trợ lý sức khỏe tinh thần của bạn. 💚\n\nTớ ở đây để lắng nghe và hỗ trợ bạn. Mọi cuộc trò chuyện đều hoàn toàn ẩn danh và riêng tư.",
    time: "09:00",
  },
  {
    id: 2,
    sender: "bot",
    text: "Hôm nay bạn cảm thấy thế nào? Cứ chia sẻ thoải mái nhé — không ai biết bạn là ai đâu.",
    time: "09:00",
  },
];

const SUGGESTION_CHIPS = [
  { icon: "bx-sad", text: "Tớ đang buồn" },
  { icon: "bx-confused", text: "Tớ bị áp lực" },
  { icon: "bx-help-circle", text: "Tớ cần lời khuyên" },
  { icon: "bx-wind", text: "Bài tập thở" },
];

// Simulated AI responses
const AI_RESPONSES = [
  {
    trigger: "buồn",
    response:
      "Tớ hiểu cảm giác buồn đó. Cảm xúc này hoàn toàn bình thường và bạn không cần phải giấu nó đi.\n\nBạn có thể chia sẻ thêm điều gì đang làm bạn buồn không? Đôi khi nói ra cũng giúp nhẹ lòng hơn rồi.",
  },
  {
    trigger: "áp lực",
    response:
      "Áp lực có thể rất ngột ngạt, đặc biệt khi bạn cảm thấy mọi thứ đổ dồn cùng một lúc.\n\nHãy thử bài tập đơn giản này nhé: Hít sâu 4 giây → Giữ 7 giây → Thở ra 8 giây. Lặp lại 3 lần.\n\nBạn muốn tớ hướng dẫn chi tiết hơn không?",
    hasExercise: true,
  },
  {
    trigger: "khuyên",
    response:
      "Tớ sẵn lòng hỗ trợ bạn! Để đưa ra lời khuyên phù hợp nhất, bạn có thể cho tớ biết tình huống cụ thể hơn không?\n\nVí dụ: học tập, mối quan hệ, công việc, hoặc bất kỳ điều gì bạn đang trăn trở.",
  },
  {
    trigger: "thở",
    response: "Đây là bài tập thở 4-7-8 giúp bạn thư giãn nhanh chóng:",
    hasExercise: true,
  },
];

const DEFAULT_RESPONSE =
  "Cảm ơn bạn đã chia sẻ. Tớ nghe thấy bạn rồi. 💚\n\nBạn muốn nói thêm về điều này không? Hoặc nếu bạn cảm thấy cần hỗ trợ chuyên sâu hơn, tớ có thể giúp bạn kết nối với chuyên gia tâm lý.";

interface AIChatProps {
  onBack: () => void;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  hasExercise?: boolean;
}

function AIChat({ onBack }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const getAIResponse = (userMsg: string) => {
    const lower = userMsg.toLowerCase();
    for (const resp of AI_RESPONSES) {
      if (lower.includes(resp.trigger)) {
        return resp;
      }
    }
    return { response: DEFAULT_RESPONSE, hasExercise: false };
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    setShowWelcome(false);
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
      time: timeStr,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Simulate AI typing
    setIsTyping(true);
    const aiResp = getAIResponse(text);
    const delay = 1200 + Math.random() * 800;

    setTimeout(() => {
      setIsTyping(false);
      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: aiResp.response,
        time: timeStr,
        hasExercise: aiResp.hasExercise || false,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleChipClick = (chipText: string) => {
    sendMessage(chipText);
  };

  return (
    <div className="aichat-screen" id="aichat-screen">
      {/* ===== HEADER ===== */}
      <header className="aichat-header" id="aichat-header">
        <button
          className="rm-back-btn"
          id="aichat-back-btn"
          onClick={onBack}
          title="Quay lại"
        >
          <i className="bx bx-arrow-back"></i>
        </button>

        <div className="aichat-header-avatar">🤖</div>

        <div className="aichat-header-info">
          <h1 className="aichat-header-name">ReMind AI</h1>
          <p className="aichat-header-status">
            <span className="aichat-status-dot"></span>
            Đang hoạt động • Ẩn danh
          </p>
        </div>

        <div className="aichat-header-actions">
          <button
            className="rm-action-btn"
            id="aichat-new-chat"
            title="Cuộc trò chuyện mới"
          >
            <i className="bx bx-edit"></i>
          </button>
          <button
            className="rm-action-btn"
            id="aichat-more"
            title="Thêm tùy chọn"
          >
            <i className="bx bx-dots-vertical-rounded"></i>
          </button>
        </div>
      </header>

      {/* ===== SAFETY BANNER ===== */}
      {showBanner && (
        <div className="aichat-safety-banner" id="aichat-safety-banner">
          <i className="bx bx-shield-quarter"></i>
          <span>
            Cuộc trò chuyện hoàn toàn ẩn danh. AI không thay thế chuyên gia — nếu cần, hãy liên hệ hotline
            <strong> 1800 599 920</strong>.
          </span>
          <button
            className="aichat-safety-close"
            onClick={() => setShowBanner(false)}
            title="Đóng"
          >
            <i className="bx bx-x"></i>
          </button>
        </div>
      )}

      {/* ===== MESSAGES OR WELCOME ===== */}
      {showWelcome ? (
        <div className="aichat-welcome" id="aichat-welcome">
          <div className="aichat-welcome-icon">🧠</div>
          <h2>Chào mừng đến với ReMind AI</h2>
          <p>
            Trợ lý sức khỏe tinh thần hoạt động 24/7. Mọi cuộc trò chuyện đều ẩn danh và không được lưu trữ vĩnh viễn.
          </p>

          <div className="aichat-welcome-features">
            <div className="aichat-feature-card">
              <span className="aichat-feature-icon">💬</span>
              <div>
                <h4>Trò chuyện an toàn</h4>
                <p>Chia sẻ thoải mái, hoàn toàn ẩn danh</p>
              </div>
            </div>
            <div className="aichat-feature-card">
              <span className="aichat-feature-icon">🧘</span>
              <div>
                <h4>Bài tập thư giãn</h4>
                <p>Hướng dẫn hít thở, mindfulness</p>
              </div>
            </div>
            <div className="aichat-feature-card">
              <span className="aichat-feature-icon">📋</span>
              <div>
                <h4>Đánh giá cảm xúc</h4>
                <p>Hiểu hơn về tâm trạng bản thân</p>
              </div>
            </div>
            <div className="aichat-feature-card">
              <span className="aichat-feature-icon">🩺</span>
              <div>
                <h4>Kết nối chuyên gia</h4>
                <p>Giới thiệu bác sĩ khi cần thiết</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="aichat-messages" id="aichat-messages">
          <div className="aichat-date-sep">
            <span>Hôm nay</span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`aichat-msg-row ${msg.sender}`}
            >
              <div className="aichat-msg-avatar">
                {msg.sender === "bot" ? "🤖" : "👤"}
              </div>
              <div className="aichat-msg-content">
                <div className="aichat-msg-bubble">
                  {msg.text.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.text.split("\n").length - 1 && <br />}
                    </span>
                  ))}

                  {/* Breathing exercise card */}
                  {msg.hasExercise && (
                    <div className="aichat-exercise-card">
                      <div className="aichat-exercise-title">
                        <i className="bx bx-wind"></i>
                        Bài tập thở 4-7-8
                      </div>
                      <ol className="aichat-exercise-steps">
                        <li>
                          <span className="step-num">1</span>
                          Hít vào bằng mũi trong 4 giây
                        </li>
                        <li>
                          <span className="step-num">2</span>
                          Giữ hơi thở trong 7 giây
                        </li>
                        <li>
                          <span className="step-num">3</span>
                          Thở ra bằng miệng trong 8 giây
                        </li>
                      </ol>
                      <button
                        className="rm-btn rm-btn-primary aichat-exercise-btn"
                        id="start-breathing-exercise"
                      >
                        Bắt đầu bài tập
                      </button>
                    </div>
                  )}
                </div>
                <span className="aichat-msg-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="aichat-typing">
              <div className="aichat-msg-avatar">🤖</div>
              <div className="aichat-typing-bubble">
                <span className="aichat-typing-dot"></span>
                <span className="aichat-typing-dot"></span>
                <span className="aichat-typing-dot"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* ===== SUGGESTION CHIPS ===== */}
      {messages.length <= 2 && (
        <div className="aichat-suggestions" id="aichat-suggestions">
          {SUGGESTION_CHIPS.map((chip, i) => (
            <button
              key={i}
              className="aichat-chip"
              onClick={() => handleChipClick(chip.text)}
            >
              <i className={`bx ${chip.icon}`}></i>
              {chip.text}
            </button>
          ))}
        </div>
      )}

      {/* ===== INPUT AREA ===== */}
      <div className="aichat-input-area" id="aichat-input-area">
        <form className="aichat-input-row" onSubmit={handleSubmit}>
          <div className="rm-input-wrapper aichat-input-wrapper">
            <textarea
              ref={textareaRef}
              className="rm-input-field aichat-textarea"
              id="aichat-textarea"
              placeholder="Nhập tâm sự của bạn..."
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              type="button"
              className="rm-action-btn aichat-attach-btn"
              id="aichat-attach"
              title="Đính kèm"
              style={{ width: "32px", height: "32px" }}
            >
              <i className="bx bx-paperclip"></i>
            </button>
          </div>
          <button
            type="submit"
            className="rm-btn rm-btn-primary aichat-send-btn"
            id="aichat-send"
            disabled={!inputValue.trim()}
            title="Gửi tin nhắn"
            style={{ width: "40px", height: "40px", padding: 0 }}
          >
            <i className="bx bx-send"></i>
          </button>
        </form>
        <p className="aichat-disclaimer">
          ReMind AI là công cụ hỗ trợ, không thay thế tư vấn y tế chuyên nghiệp.
        </p>
      </div>
    </div>
  );
}

export default AIChat;
