import { useState, useEffect } from "react";
import { ExpertController } from "../../controllers/ExpertController";
import { Expert } from "../../models/Expert";
import "./ExpertDirectory.css";

interface ExpertDirectoryProps {
  onBack: () => void;
  userRole?: string;
  onLoginRequired?: () => void;
}

const TIME_SLOTS = [
  "09:00 - 10:00",
  "10:30 - 11:30",
  "14:00 - 15:00",
  "15:30 - 16:30",
  "19:00 - 20:00",
  "20:30 - 21:30"
];

function ExpertDirectory({ onBack, userRole = "guest", onLoginRequired }: ExpertDirectoryProps) {
  const [expertsData, setExpertsData] = useState<Expert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tất cả");
  const [selectedLanguage, setSelectedLanguage] = useState("Tất cả");
  const [selectedCost, setSelectedCost] = useState("Tất cả");

  // Booking Modal State
  const [bookingExpert, setBookingExpert] = useState<Expert | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    setExpertsData(ExpertController.getApprovedExpertsForGuest());
  }, []);

  // Filter handlers
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Filter Logic
  const filteredExperts = expertsData.filter((expert) => {
    // Search Term
    const matchesSearch =
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.desc.toLowerCase().includes(searchTerm.toLowerCase());

    // Specialty
    const matchesSpecialty =
      selectedSpecialty === "Tất cả" || expert.specialty.includes(selectedSpecialty);

    // Language
    const matchesLanguage =
      selectedLanguage === "Tất cả" || expert.languages.includes(selectedLanguage);

    // Cost
    let matchesCost = true;
    if (selectedCost !== "Tất cả") {
      if (selectedCost === "Miễn phí") {
        matchesCost = expert.cost === 0;
      } else if (selectedCost === "< 500k") {
        matchesCost = expert.cost > 0 && expert.cost <= 500000;
      } else if (selectedCost === ">= 500k") {
        matchesCost = expert.cost >= 500000;
      }
    }

    return matchesSearch && matchesSpecialty && matchesLanguage && matchesCost;
  });

  const handleOpenBooking = (expert: Expert) => {
    if (userRole === "guest") {
      alert("Vui lòng đăng nhập để đặt lịch hẹn với chuyên gia.");
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    setBookingExpert(expert);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split("T")[0]);
    setSelectedSlot("");
  };

  const handleCloseBooking = () => {
    setBookingExpert(null);
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot || !bookingDate) return;

    setBookingSuccess(true);
    setBookingExpert(null);

    // Auto close toast after 3 seconds
    setTimeout(() => {
      setBookingSuccess(false);
    }, 3000);
  };

  return (
    <div className="expert-screen" id="expert-screen">
      {/* ===== HEADER ===== */}
      <header className="expert-header" id="expert-header">
        <button
          className="rm-back-btn"
          id="expert-back-btn"
          onClick={onBack}
          title="Quay lại"
        >
          <i className="bx bx-arrow-back"></i>
        </button>
        <h1 className="expert-header-title">Danh bạ Chuyên gia</h1>
      </header>

      {/* ===== MAIN CONTAINER ===== */}
      <main className="expert-container">
        {/* Intro */}
        <div className="expert-intro">
          <h2>Tìm kiếm Chuyên gia Phù hợp</h2>
          <p>
            Kết nối với các bác sĩ tâm lý lâm sàng và tư vấn viên giàu kinh nghiệm để nhận được sự hỗ trợ chất lượng.
          </p>
        </div>

        {/* ===== SEARCH & FILTER PANEL ===== */}
        <section className="expert-search-panel" id="expert-search-panel">
          <div className="rm-input-wrapper">
            <i className="bx bx-search expert-search-icon"></i>
            <input
              type="text"
              className="rm-input-field expert-search-input"
              id="expert-search-input"
              placeholder="Tìm theo tên chuyên gia, chuyên môn hoặc từ khóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="expert-clear-btn"
                id="expert-clear-search"
                onClick={handleClearSearch}
                title="Xóa tìm kiếm"
              >
                <i className="bx bx-x"></i>
              </button>
            )}
          </div>

          <div className="expert-filters-section">
            {/* Specialty filter */}
            <div className="expert-filter-group" id="filter-group-specialty">
              <span className="expert-filter-label">Chuyên môn</span>
              <div className="expert-filter-chips">
                {["Tất cả", "Trầm cảm", "Lo âu", "Stress công việc", "Mối quan hệ", "LGBTQ+"].map((spec) => (
                  <button
                    key={spec}
                    className={`expert-filter-chip ${selectedSpecialty === spec ? "active" : ""}`}
                    onClick={() => setSelectedSpecialty(spec)}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Language filter */}
            <div className="expert-filter-group" id="filter-group-language">
              <span className="expert-filter-label">Ngôn ngữ</span>
              <div className="expert-filter-chips">
                {["Tất cả", "Tiếng Việt", "Tiếng Anh"].map((lang) => (
                  <button
                    key={lang}
                    className={`expert-filter-chip ${selectedLanguage === lang ? "active" : ""}`}
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost filter */}
            <div className="expert-filter-group" id="filter-group-cost">
              <span className="expert-filter-label">Chi phí</span>
              <div className="expert-filter-chips">
                {["Tất cả", "Miễn phí", "< 500k", ">= 500k"].map((cost) => (
                  <button
                    key={cost}
                    className={`expert-filter-chip ${selectedCost === cost ? "active" : ""}`}
                    onClick={() => setSelectedCost(cost)}
                  >
                    {cost}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== LIST SECTION ===== */}
        <section className="expert-list" id="expert-list">
          {filteredExperts.length > 0 ? (
            filteredExperts.map((expert) => (
              <div key={expert.id} className="expert-card" id={`expert-card-${expert.id}`}>
                <div className="expert-avatar-box">
                  {expert.avatar}
                </div>

                <div className="expert-card-details">
                  <div className="expert-card-top">
                    <div className="expert-name-row">
                      <h3 className="expert-name">{expert.name}</h3>
                      <div className="expert-meta">
                        <span className="expert-exp">{expert.experience}</span>
                        <span>•</span>
                        <span className="expert-rating">
                          ★ {expert.rating} ({expert.reviews} nhận xét)
                        </span>
                      </div>
                    </div>
                    <span className={`rm-badge rm-badge-${expert.status === 'available' ? 'success' : expert.status === 'limited' ? 'warning' : 'error'}`}>
                      {expert.statusLabel}
                    </span>
                  </div>

                  <p className="expert-desc">{expert.desc}</p>

                  <div className="expert-tags">
                    <span className="expert-tag">{expert.specialty}</span>
                    {expert.languages.map((l) => (
                      <span key={l} className="expert-tag">{l}</span>
                    ))}
                  </div>

                  <div className="expert-card-footer">
                    <div className="expert-price-box">
                      <span className="expert-price-label">Chi phí tư vấn</span>
                      <span className="expert-price-val">{expert.costDisplay}</span>
                    </div>

                    <div className="expert-actions">
                      <button
                        className="rm-btn rm-btn-outline"
                        id={`view-profile-${expert.id}`}
                        title="Xem chi tiết hồ sơ chuyên gia"
                      >
                        Hồ sơ
                      </button>
                      <button
                        className="rm-btn rm-btn-primary"
                        id={`book-expert-${expert.id}`}
                        disabled={expert.status === "unavailable"}
                        onClick={() => handleOpenBooking(expert)}
                        title="Đặt lịch tư vấn trực tuyến"
                      >
                        Đặt lịch
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="expert-empty" id="expert-empty">
              <i className="bx bx-search-alt expert-empty-icon"></i>
              <h3>Không tìm thấy chuyên gia</h3>
              <p>Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại các bộ lọc xem sao bạn nhé.</p>
            </div>
          )}
        </section>
      </main>

      {/* ===== BOOKING MODAL ===== */}
      {bookingExpert && (
        <div className="rm-modal-overlay" id="book-modal-overlay">
          <div className="rm-modal" id="book-modal" style={{ maxWidth: "440px" }}>
            <div className="rm-modal-header">
              <h3 className="rm-modal-title">Đặt lịch hẹn tư vấn</h3>
              <button
                className="rm-modal-close"
                id="book-modal-close"
                onClick={handleCloseBooking}
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            <div className="rm-modal-body" style={{ gap: "16px" }}>
              <div className="book-expert-summary">
                <span style={{ fontSize: "24px" }}>{bookingExpert.avatar}</span>
                <div>
                  <h4 className="book-expert-name">{bookingExpert.name}</h4>
                  <p className="book-expert-spec">{bookingExpert.specialty}</p>
                </div>
              </div>

              <div className="book-form-group">
                <label className="book-form-label" htmlFor="booking-date-input">
                  Chọn ngày hẹn
                </label>
                <div className="rm-input-wrapper">
                  <input
                    type="date"
                    id="booking-date-input"
                    className="rm-input-field book-input"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    style={{ padding: "10px 12px" }}
                  />
                </div>
              </div>

              <div className="book-form-group">
                <label className="book-form-label">Chọn khung giờ tư vấn</label>
                <div className="book-slots-grid" id="book-slots-grid">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`book-slot-btn ${selectedSlot === slot ? "selected" : ""}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rm-modal-footer">
              <button
                className="rm-btn rm-btn-outline"
                id="book-modal-cancel"
                onClick={handleCloseBooking}
              >
                Hủy bỏ
              </button>
              <button
                className="rm-btn rm-btn-primary"
                id="book-modal-confirm"
                disabled={!selectedSlot || !bookingDate}
                onClick={handleConfirmBooking}
              >
                Xác nhận đặt lịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SUCCESS TOAST ===== */}
      {bookingSuccess && (
        <div className="book-toast" id="book-toast">
          <i className="bx bx-check-circle"></i>
          <span>Đặt lịch hẹn thành công! Kiểm tra email để xem thông tin chi tiết.</span>
        </div>
      )}
    </div>
  );
}

export default ExpertDirectory;
