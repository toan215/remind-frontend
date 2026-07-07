import React, { useState, useRef, useEffect } from "react";
import "./Chat.css";

// --- MOCK DATA ---
const MOCK_USERS = [
  { id: 1, name: "Bs. Trần Lệ", avatar: "👩‍⚕️", online: true, role: "expert", lastMessage: "Chào bạn, hôm nay bạn cảm thấy thế nào?", time: "10:30" },
  { id: 2, name: "Nguyễn Văn A", avatar: "👤", online: false, role: "user", lastMessage: "Cảm ơn bác sĩ nhiều ạ.", time: "Hôm qua" },
  { id: 3, name: "Lê Thị B", avatar: "👩", online: true, role: "user", lastMessage: "Mình đang khá áp lực công việc...", time: "Thứ 2" },
];

const MOCK_MESSAGES: Record<number, any[]> = {
  1: [
    { id: 101, senderId: 1, text: "Chào bạn, tôi là bác sĩ Trần Lệ.", time: "10:00" },
    { id: 102, senderId: "me", text: "Dạ em chào bác sĩ ạ. Mấy hôm nay em hay bị mất ngủ.", time: "10:05" },
    { id: 103, senderId: 1, text: "Bạn bị mất ngủ bao lâu rồi? Có điều gì làm bạn căng thẳng không?", time: "10:10" },
    { id: 104, senderId: "me", text: "Dạ khoảng 1 tuần nay ạ. Công việc dạo này hơi nhiều.", time: "10:15" },
    { id: 105, senderId: 1, text: "Chào bạn, hôm nay bạn cảm thấy thế nào?", time: "10:30" },
  ],
  2: [
    { id: 201, senderId: "me", text: "Bác sĩ ơi cho em hỏi xíu ạ", time: "Hôm qua" },
    { id: 202, senderId: 2, text: "Cảm ơn bác sĩ nhiều ạ.", time: "Hôm qua" },
  ],
  3: [
    { id: 301, senderId: 3, text: "Mình đang khá áp lực công việc...", time: "Thứ 2" },
  ]
};

interface ChatProps {
  onBack: () => void;
}

function Chat({ onBack }: ChatProps) {
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Responsive state for mobile viewing
  const [showListOnMobile, setShowListOnMobile] = useState(true);

  useEffect(() => {
    if (activeUserId) {
      setMessages(MOCK_MESSAGES[activeUserId] || []);
      setShowListOnMobile(false);
    }
  }, [activeUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const activeUser = MOCK_USERS.find(u => u.id === activeUserId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeUserId) return;

    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

    const newMsg = {
      id: Date.now(),
      senderId: "me",
      text: inputValue.trim(),
      time: timeStr,
    };

    setMessages([...messages, newMsg]);
    setInputValue("");
  };

  const handleBackToList = () => {
    setShowListOnMobile(true);
    setActiveUserId(null);
  };

  return (
    <div className="chatbox-container">
      {/* SIDEBAR: CONVERSATION LIST */}
      <div className={`chatbox-sidebar ${!showListOnMobile ? 'hidden-on-mobile' : ''}`}>
        <div className="chatbox-sidebar-header">
          <button className="chatbox-back-btn" onClick={onBack} title="Quay lại Trang Chủ">
            <i className="bx bx-arrow-back"></i>
          </button>
          <h2>Tin nhắn</h2>
          <button className="chatbox-new-btn" title="Tin nhắn mới">
            <i className="bx bx-edit"></i>
          </button>
        </div>
        
        <div className="chatbox-search">
          <div className="chatbox-search-inner">
            <i className="bx bx-search"></i>
            <input type="text" placeholder="Tìm kiếm tin nhắn..." />
          </div>
        </div>

        <div className="chatbox-user-list">
          {MOCK_USERS.map((user) => (
            <div 
              key={user.id} 
              className={`chatbox-user-item ${activeUserId === user.id ? 'active' : ''}`}
              onClick={() => setActiveUserId(user.id)}
            >
              <div className="chatbox-avatar-wrapper">
                <span className="chatbox-avatar">{user.avatar}</span>
                {user.online && <span className="chatbox-online-dot"></span>}
              </div>
              <div className="chatbox-user-info">
                <div className="chatbox-user-name-row">
                  <h4>{user.name}</h4>
                  <span className="chatbox-user-time">{user.time}</span>
                </div>
                <p className="chatbox-user-lastmsg">{user.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className={`chatbox-main ${showListOnMobile ? 'hidden-on-mobile' : ''}`}>
        {activeUser ? (
          <>
            {/* Chat Header */}
            <div className="chatbox-main-header">
              <div className="chatbox-main-header-left">
                <button className="chatbox-mobile-back" onClick={handleBackToList}>
                  <i className="bx bx-arrow-back"></i>
                </button>
                <div className="chatbox-avatar-wrapper">
                  <span className="chatbox-avatar">{activeUser.avatar}</span>
                  {activeUser.online && <span className="chatbox-online-dot"></span>}
                </div>
                <div className="chatbox-main-header-info">
                  <h3>{activeUser.name}</h3>
                  <p>{activeUser.online ? "Đang hoạt động" : "Ngoại tuyến"}</p>
                </div>
              </div>
              <div className="chatbox-main-header-actions">
                <button className="chatbox-action-btn call-btn" title="Gọi thoại">
                  <i className="bx bxs-phone"></i>
                </button>
                <button className="chatbox-action-btn video-btn" title="Gọi video">
                  <i className="bx bxs-video"></i>
                </button>
                <button className="chatbox-action-btn info-btn" title="Thông tin">
                  <i className="bx bx-info-circle"></i>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="chatbox-messages">
              {messages.map((msg) => {
                const isMe = msg.senderId === "me";
                return (
                  <div key={msg.id} className={`chatbox-msg-row ${isMe ? 'msg-me' : 'msg-them'}`}>
                    {!isMe && (
                      <span className="chatbox-msg-avatar">{activeUser.avatar}</span>
                    )}
                    <div className="chatbox-msg-content">
                      <div className={`chatbox-msg-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                        {msg.text}
                      </div>
                      <span className="chatbox-msg-time">{msg.time}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="chatbox-input-area">
              <button className="chatbox-icon-btn" type="button" title="Đính kèm tệp">
                <i className="bx bx-plus-circle"></i>
              </button>
              <button className="chatbox-icon-btn" type="button" title="Gửi ảnh">
                <i className="bx bx-image-alt"></i>
              </button>
              <form className="chatbox-input-form" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Nhập tin nhắn..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button className="chatbox-icon-btn emoji-btn" type="button" title="Biểu tượng cảm xúc">
                  <i className="bx bx-smile"></i>
                </button>
                <button 
                  type="submit" 
                  className={`chatbox-send-btn ${inputValue.trim() ? 'active' : ''}`}
                  disabled={!inputValue.trim()}
                >
                  <i className="bx bxs-send"></i>
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="chatbox-empty-state">
            <div className="chatbox-empty-icon">💬</div>
            <h3>Tin nhắn của bạn</h3>
            <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin hoặc kết nối với chuyên gia.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
