import React, { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { BASE_URL, API_ENDPOINTS } from "../../utils/constants";
import { apiHelper } from "../../utils/apiHelper";
import "./Chat.css";

interface ChatProps {
  onBack: () => void;
}

function Chat({ onBack }: ChatProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Responsive state for mobile viewing
  const [showListOnMobile, setShowListOnMobile] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Lấy thông tin user hiện tại và danh sách phòng chat khi mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUserId(u.id || u._id || "");
      } catch (e) {
        console.error("Lỗi khi parse user info từ localStorage:", e);
      }
    }

    const fetchRooms = async () => {
      try {
        const res = await apiHelper.get(API_ENDPOINTS.CHATS.LIST);
        if (res.data && res.data.rooms) {
          setRooms(res.data.rooms);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách phòng chat:", err);
      }
    };

    fetchRooms();
  }, []);

  // 2. Khởi tạo kết nối Socket.io duy nhất cho component
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Connected successfully to server");
    });

    socket.on("chat:message", (msg: any) => {
      // Đẩy tin nhắn vào state messages
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      // Cập nhật tin nhắn cuối cùng (lastMessage) của phòng chat tương ứng ở sidebar
      setRooms((prevRooms) => {
        return prevRooms
          .map((r) => {
            if (r._id === msg.chatRoomId) {
              return {
                ...r,
                lastMessage: {
                  text: msg.text,
                  senderId: msg.senderId,
                  sentAt: msg.createdAt,
                },
                updatedAt: msg.createdAt,
              };
            }
            return r;
          })
          .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      });
    });

    socket.on("chat:error", (err: { code: string; message: string }) => {
      console.error("[Socket] Received error:", err);
      setErrorBanner(err.message);
      // Tự động ẩn banner lỗi sau 5 giây
      setTimeout(() => {
        setErrorBanner(null);
      }, 5000);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // 3. Khi người dùng chọn phòng chat khác: Join room mới và Leave room cũ
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeRoomId) return;

    socket.emit("chat:join", { roomId: activeRoomId });

    // Fetch tin nhắn cũ của phòng chat này
    const fetchMessages = async () => {
      try {
        const res = await apiHelper.get(API_ENDPOINTS.CHATS.MESSAGES(activeRoomId));
        if (res.data && res.data.messages) {
          // Tin nhắn từ backend trả về từ mới đến cũ, ta đảo ngược để hiển thị từ cũ đến mới
          const sorted = [...res.data.messages].reverse();
          setMessages(sorted);
        }
      } catch (err) {
        console.error("Lỗi khi tải lịch sử tin nhắn:", err);
      }
    };

    fetchMessages();
    setErrorBanner(null); // Reset banner lỗi
    setShowListOnMobile(false);

    return () => {
      socket.emit("chat:leave", { roomId: activeRoomId });
    };
  }, [activeRoomId]);

  // Helper tìm đối phương trong phòng chat
  const getRoomPartner = (room: any) => {
    if (!room || !room.participants) return null;
    const partner = room.participants.find(
      (p: any) => p.userId && p.userId._id !== currentUserId
    );
    return partner ? partner.userId : null;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeRoomId) return;

    const socket = socketRef.current;
    if (socket) {
      socket.emit("chat:message", {
        roomId: activeRoomId,
        text: inputValue.trim(),
        type: "text",
      });
      setInputValue("");
    }
  };

  const handleBackToList = () => {
    setShowListOnMobile(true);
    setActiveRoomId(null);
  };

  const activeRoom = rooms.find((r) => r._id === activeRoomId);
  const activePartner = getRoomPartner(activeRoom);
  const activePartnerName = activePartner ? activePartner.fullName : "Người dùng";
  const activePartnerAvatar = activePartner ? activePartner.avatarUrl : null;
  const activePartnerRole = activePartner ? activePartner.role : "";

  const formatTime = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="chatbox-container">
      {/* SIDEBAR: CONVERSATION LIST */}
      <div className={`chatbox-sidebar ${!showListOnMobile ? "hidden-on-mobile" : ""}`}>
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
          {rooms.map((room) => {
            const partner = getRoomPartner(room);
            const name = partner ? partner.fullName : "Người dùng";
            const avatar = partner ? partner.avatarUrl : null;
            const role = partner ? partner.role : "";
            const lastMsgText = room.lastMessage?.text || "Chưa có tin nhắn";
            const lastMsgTime = room.lastMessage?.sentAt ? formatTime(room.lastMessage.sentAt) : "";

            return (
              <div
                key={room._id}
                className={`chatbox-user-item ${activeRoomId === room._id ? "active" : ""}`}
                onClick={() => setActiveRoomId(room._id)}
              >
                <div className="chatbox-avatar-wrapper">
                  {avatar ? (
                    <img src={avatar} alt={name} className="chatbox-avatar-img" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <span className="chatbox-avatar">{role === "expert" ? "👩‍⚕️" : "👤"}</span>
                  )}
                  {/* Trạng thái online mặc định giả định */}
                  <span className="chatbox-online-dot"></span>
                </div>
                <div className="chatbox-user-info">
                  <div className="chatbox-user-name-row">
                    <h4>{name}</h4>
                    <span className="chatbox-user-time">{lastMsgTime}</span>
                  </div>
                  <p className="chatbox-user-lastmsg">{lastMsgText}</p>
                </div>
              </div>
            );
          })}

          {rooms.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
              Chưa có cuộc hội thoại nào.
            </div>
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className={`chatbox-main ${showListOnMobile ? "hidden-on-mobile" : ""}`}>
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="chatbox-main-header">
              <div className="chatbox-main-header-left">
                <button className="chatbox-mobile-back" onClick={handleBackToList}>
                  <i className="bx bx-arrow-back"></i>
                </button>
                <div className="chatbox-avatar-wrapper">
                  {activePartnerAvatar ? (
                    <img src={activePartnerAvatar} alt={activePartnerName} className="chatbox-avatar-img" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <span className="chatbox-avatar">{activePartnerRole === "expert" ? "👩‍⚕️" : "👤"}</span>
                  )}
                  <span className="chatbox-online-dot"></span>
                </div>
                <div className="chatbox-main-header-info">
                  <h3>{activePartnerName}</h3>
                  <p>{activePartnerRole === "expert" ? "Chuyên gia tâm lý" : "Học viên"}</p>
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
                const senderIdStr = typeof msg.senderId === "object" ? msg.senderId?._id : msg.senderId;
                const isMe = senderIdStr === currentUserId;
                return (
                  <div key={msg._id} className={`chatbox-msg-row ${isMe ? "msg-me" : "msg-them"}`}>
                    {!isMe && (
                      <span className="chatbox-msg-avatar">
                        {activePartnerAvatar ? (
                          <img src={activePartnerAvatar} alt={activePartnerName} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          activePartnerRole === "expert" ? "👩‍⚕️" : "👤"
                        )}
                      </span>
                    )}
                    <div className="chatbox-msg-content">
                      <div className={`chatbox-msg-bubble ${isMe ? "bubble-me" : "bubble-them"}`}>
                        {msg.text}
                      </div>
                      <span className="chatbox-msg-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Banner if restricted */}
            {errorBanner && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#ef4444",
                  padding: "10px 16px",
                  margin: "10px 15px 0 15px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <i className="bx bx-error-circle" style={{ fontSize: "1.25rem" }}></i>
                <span>{errorBanner}</span>
              </div>
            )}

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
                  className={`chatbox-send-btn ${inputValue.trim() ? "active" : ""}`}
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
