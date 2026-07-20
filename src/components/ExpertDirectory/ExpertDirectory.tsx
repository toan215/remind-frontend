import { useState, useEffect, useRef } from "react";
import { ExpertController } from "../../controllers/ExpertController";
import { Expert, ExpertSlot } from "../../models/Expert";
import { AppointmentController } from "../../controllers/AppointmentController";
import { apiHelper } from "../../utils/apiHelper";
import { API_ENDPOINTS } from "../../utils/constants";
import "./ExpertDirectory.css";
import gsap from "gsap";

interface ExpertDirectoryProps {
  onBack: () => void;
  userRole?: string;
  onLoginRequired?: () => void;
  onProceedToPayment?: (bookingDetails: any) => void;
  onOpenChat?: () => void;
}

interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
}

const MOCK_REVIEWS: Record<number, Review[]> = {
  1: [
    {
      id: "r1_1",
      author: "Nguyễn Văn An",
      avatar: "👨",
      rating: 5,
      date: "2026-07-18T10:30:00Z",
      content: "Bác sĩ rất nhiệt tình và lắng nghe ý kiến của tôi. Sau 3 buổi tư vấn, tôi cảm thấy chứng mất ngủ và lo âu của mình đã được cải thiện rõ rệt."
    },
    {
      id: "r1_2",
      author: "Trần Thị Bình",
      avatar: "👩",
      rating: 5,
      date: "2026-07-15T14:20:00Z",
      content: "Không gian làm việc chuyên nghiệp, bác sĩ đưa ra những lời khuyên rất thiết thực cho cuộc sống hàng ngày."
    },
    {
      id: "r1_3",
      author: "Lê Hoàng Long",
      avatar: "👨",
      rating: 5,
      date: "2026-07-10T08:00:00Z",
      content: "Bác sĩ tư vấn rất nhẹ nhàng, giúp tôi giải tỏa được nhiều áp lực từ công việc và gia đình."
    },
    {
      id: "r1_4",
      author: "Phạm Minh Thư",
      avatar: "👩",
      rating: 4,
      date: "2026-07-05T16:45:00Z",
      content: "Phương pháp tư vấn khoa học và dễ tiếp cận. Sẽ tiếp tục đặt lịch."
    }
  ],
  2: [
    {
      id: "r2_1",
      author: "Vũ Thị Chi",
      avatar: "👩",
      rating: 5,
      date: "2026-07-19T09:15:00Z",
      content: "Tôi rất biết ơn bác sĩ đã giúp tôi vượt qua giai đoạn khủng hoảng tâm lý sau biến cố. Bác sĩ cực kỳ kiên nhẫn và thấu hiểu."
    },
    {
      id: "r2_2",
      author: "Hoàng Đức Duy",
      avatar: "👨",
      rating: 5,
      date: "2026-07-16T11:00:00Z",
      content: "Tư vấn rất tập trung vào vấn đề cốt lõi. Giúp tôi có cách nhìn nhận tích cực hơn về cuộc sống."
    },
    {
      id: "r2_3",
      author: "Đỗ Bảo Trâm",
      avatar: "👩",
      rating: 5,
      date: "2026-07-12T15:30:00Z",
      content: "Rất hài lòng với dịch vụ tư vấn trực tuyến. Tiết kiệm thời gian di chuyển mà vẫn đạt hiệu quả cao."
    }
  ],
  3: [
    {
      id: "r3_1",
      author: "Ngô Quốc Khánh",
      avatar: "👨",
      rating: 5,
      date: "2026-07-17T14:00:00Z",
      content: "Gia đình tôi đã giải quyết được nhiều bất đồng nhờ các buổi tham vấn của ThS. Emily. Rất đề xuất cho các gia đình."
    },
    {
      id: "r3_2",
      author: "Bùi Tuyết Mai",
      avatar: "👩",
      rating: 5,
      date: "2026-07-13T10:30:00Z",
      content: "Tư vấn viên giàu kinh nghiệm, lắng nghe không phán xét."
    }
  ]
};

const getExpertReviews = (expertId: number): Review[] => {
  const reviews = MOCK_REVIEWS[expertId] || [
    {
      id: `r_${expertId}_1`,
      author: "Lê Minh Triết",
      avatar: "👨",
      rating: 5,
      date: "2026-07-18T12:00:00Z",
      content: "Chuyên gia tư vấn rất có tâm, trả lời thấu đáo mọi câu hỏi của tôi."
    },
    {
      id: `r_${expertId}_2`,
      author: "Nguyễn Hà Linh",
      avatar: "👩",
      rating: 5,
      date: "2026-07-15T09:30:00Z",
      content: "Trải nghiệm tư vấn tuyệt vời, cảm ơn chuyên gia rất nhiều!"
    },
    {
      id: `r_${expertId}_3`,
      author: "Phan Anh Tuấn",
      avatar: "👨",
      rating: 5,
      date: "2026-07-12T16:00:00Z",
      content: "Phương pháp rất hiệu quả, tôi cảm thấy bớt lo âu đi rất nhiều sau buổi nói chuyện."
    },
    {
      id: `r_${expertId}_4`,
      author: "Đặng Khánh Vy",
      avatar: "👩",
      rating: 5,
      date: "2026-07-08T14:20:00Z",
      content: "Rất nhiệt tình, thân thiện và giàu kinh nghiệm chuyên môn."
    }
  ];
  return [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

function ExpertDirectory({ onBack, userRole = "guest", onLoginRequired, onProceedToPayment, onOpenChat }: ExpertDirectoryProps) {
  const [showHero, setShowHero] = useState(true);
  const heroLeftRef = useRef<HTMLDivElement>(null);

  const [expertsData, setExpertsData] = useState<Expert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [hasBooked, setHasBooked] = useState(false);
  const [reviewLimit, setReviewLimit] = useState(3);
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileViewRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Report Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Spam / Quảng cáo");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isReasonDropdownOpen, setIsReasonDropdownOpen] = useState(false);

  const REPORT_REASONS = [
    { value: "Spam / Quảng cáo", icon: "bx-spam", color: "#f59e0b" },
    { value: "Ngôn từ gây thù ghét / Quấy rối", icon: "bx-angry", color: "#ef4444" },
    { value: "Thông tin sai lệch", icon: "bx-info-circle", color: "#3b82f6" },
    { value: "Lừa đảo / Giả mạo", icon: "bx-shield-x", color: "#dc2626" },
    { value: "Nội dung không phù hợp", icon: "bx-block", color: "#7c3aed" },
    { value: "Lý do khác", icon: "bx-dots-horizontal-rounded", color: "#6b7280" },
  ];

  // GSAP: animate profile view when an expert is selected
  useEffect(() => {
    if (selectedExpert && profileViewRef.current) {
      gsap.fromTo(
        profileViewRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
      );
    }
  }, [selectedExpert]);

  // Close reason dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsReasonDropdownOpen(false);
      }
    };
    if (isReasonDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isReasonDropdownOpen]);

  // GSAP: animate tab content when switching tabs
  const handleTabChange = (tab: "info" | "reviews") => {
    if (tab === activeTab) return;
    if (tabContentRef.current) {
      gsap.to(tabContentRef.current, {
        opacity: 0, y: 10, duration: 0.18, ease: "power2.in",
        onComplete: () => {
          setActiveTab(tab);
          gsap.fromTo(
            tabContentRef.current!,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.32, ease: "power3.out" }
          );
        },
      });
    } else {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    if (selectedExpert && userRole !== "guest") {
      AppointmentController.getStudentAppointments()
        .then((appts) => {
          const booked = appts.some(
            (appt) => String(appt.expertId) === String(selectedExpert._id) && appt.status !== 'cancelled'
          );
          setHasBooked(booked);
        })
        .catch((err) => {
          console.error("Error checking appointments:", err);
          setHasBooked(false);
        });
    } else {
      setHasBooked(false);
    }
    setReviewLimit(3);
    setActiveTab("info");
  }, [selectedExpert, userRole]);

  const handleTriggerAvatarEdit = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedExpert) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedExpert((prev) => {
          if (!prev) return null;
          const updated = { ...prev, avatar: base64String };
          setExpertsData((currentList) =>
            currentList.map((x) => (x.id === prev.id ? updated : x))
          );
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (showHero) {
      // Entrance animation for split screen
      gsap.fromTo(
        heroLeftRef.current ? heroLeftRef.current.children : [],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out" }
      );
      
      gsap.fromTo(
        ".gallery-item",
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)" }
      );
    }
  }, [showHero]);

  const triggerGalleryAnimation = () => {
    gsap.fromTo(
      ".gallery-item",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );
  };

  const handleCTAClick = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setShowHero(false);
      }
    });

    tl.to(heroLeftRef.current ? heroLeftRef.current.children : [], {
      opacity: 0,
      y: -20,
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.in"
    });
    
    tl.to(".gallery-item", {
      opacity: 0,
      y: 40,
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.in"
    }, "-=0.2");
  };

  // Reset window scroll when transitioning between Hero and Search list
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showHero]);

  useEffect(() => {
    if (!showHero) {
      gsap.fromTo(
        [".expert-intro", ".expert-search-panel", ".expert-list"],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [showHero]);

  const handleBack = () => {
    if (selectedExpert) {
      setSelectedExpert(null);
    } else if (!showHero) {
      setShowHero(true);
    } else {
      onBack();
    }
  };
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tất cả");
  const [selectedLanguage, setSelectedLanguage] = useState("Tất cả");
  const [selectedCost, setSelectedCost] = useState("Tất cả");

  // Booking Modal State
  const [bookingExpert, setBookingExpert] = useState<Expert | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [slots, setSlots] = useState<ExpertSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    ExpertController.getApprovedExpertsForGuest().then(setExpertsData);
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
    setSelectedSlotId("");
    setSlots([]);

    if (expert._id) {
      setSlotsLoading(true);
      ExpertController.getExpertSlots(expert._id)
        .then(setSlots)
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  };

  const handleCloseBooking = () => {
    setBookingExpert(null);
  };

  const selectedSlotObj = slots.find((s) => s._id === selectedSlotId);
  const formatSlotRange = (s: ExpertSlot) => {
    const start = new Date(s.startAt);
    const end = new Date(s.endAt);
    const t = (d: Date) => d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    return `${t(start)} - ${t(end)}`;
  };
  const formatSlotLabel = (s: ExpertSlot) => {
    const start = new Date(s.startAt);
    const end = new Date(s.endAt);
    const t = (d: Date) => d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    return `${start.getDate()}/${start.getMonth() + 1} ${t(start)} - ${t(end)}`;
  };

  const handleConfirmBooking = () => {
    if (!selectedSlotObj || !bookingDate || !bookingExpert) return;

    if (onProceedToPayment) {
      onProceedToPayment({
        expert: bookingExpert,
        expertId: bookingExpert._id,
        slotId: selectedSlotObj._id,
        date: bookingDate,
        slot: formatSlotLabel(selectedSlotObj),
        totalCost: selectedSlotObj.price,
      });
    } else {
      setBookingSuccess(true);
      setBookingExpert(null);

      setTimeout(() => {
        setBookingSuccess(false);
      }, 3000);
    }
  };

  const handleSubmitReport = async () => {
    if (userRole === "guest") {
      alert("Vui lòng đăng nhập để gửi báo cáo.");
      return;
    }

    if (!selectedExpert) return;

    setIsSubmittingReport(true);
    try {
      await apiHelper.post(API_ENDPOINTS.USERS.REPORTS, {
        targetType: "expert",
        targetId: selectedExpert._id,
        reason: reportReason,
        description: reportDescription,
      });

      alert("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét thông tin của chuyên gia.");
      setIsReportModalOpen(false);
      setReportDescription("");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Gửi báo cáo thất bại. Vui lòng thử lại.";
      alert(errorMsg);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleSelectExpert = (expert: Expert) => {
    const listEl = document.getElementById("expert-list");
    if (listEl) {
      gsap.to(listEl, {
        opacity: 0, y: -16, duration: 0.22, ease: "power2.in",
        onComplete: () => {
          gsap.set(listEl, { opacity: 1, y: 0 });
          setSelectedExpert(expert);
        },
      });
    } else {
      setSelectedExpert(expert);
    }
  };

  return (
    <div className="expert-screen" id="expert-screen">
      {showHero ? (
        <div className="expert-hero-split">
          <div className="expert-hero-left" ref={heroLeftRef}>
            <div className="expert-hero-badge">
              <i className="bx bxs-check-shield"></i> Chuyên Gia Đồng Hành
            </div>
            <h1 className="expert-hero-slogan">
              Kết nối với những chuyên gia hàng đầu
            </h1>
            <p className="expert-hero-desc">
              Hỗ trợ bạn giải quyết mọi vấn đề với đội ngũ chuyên gia giàu kinh nghiệm
            </p>
            <button
              className="rm-btn rm-btn-primary expert-hero-cta"
              onClick={handleCTAClick}
            >
              Tìm hiểu ngay <i className="bx bx-right-arrow-alt"></i>
            </button>
          </div>
          
          <div className="expert-hero-right" onClick={triggerGalleryAnimation} title="Nhấn để tải lại ảnh chuyên gia">
            <div className="expert-hero-gallery">
              <div className="gallery-item">
                <img src="/images/expert1.png" alt="Dr. Sarah Chen" />
                <div className="gallery-item-info">
                  <h4>Dr. Sarah Chen</h4>
                  <p>Clinical Psychologist</p>
                </div>
              </div>
              <div className="gallery-item">
                <img src="/images/expert2.png" alt="Dr. Alexander Vo" />
                <div className="gallery-item-info">
                  <h4>Dr. Alexander Vo</h4>
                  <p>Mental Health Counselor</p>
                </div>
              </div>
              <div className="gallery-item">
                <img src="/images/expert3.png" alt="ThS. Emily Nguyen" />
                <div className="gallery-item-info">
                  <h4>ThS. Emily Nguyen</h4>
                  <p>Family Therapist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <main className="expert-container">
          {selectedExpert ? (
            <div className="expert-profile-view" ref={profileViewRef}>
              <button className="expert-back-floating-btn" onClick={() => setSelectedExpert(null)}>
                <i className="bx bx-left-arrow-alt"></i> Quay lại
              </button>

              <div className="expert-profile-grid">
                {/* Left Column */}
                <div className="expert-profile-left-col">
                  <div className="expert-profile-avatar-large">
                    {selectedExpert.avatar.startsWith("http") || selectedExpert.avatar.startsWith("/") || selectedExpert.avatar.startsWith("data:") ? (
                      <img src={selectedExpert.avatar} alt={selectedExpert.name} className="expert-avatar-img-large" />
                    ) : (
                      selectedExpert.avatar
                    )}
                    {(userRole === "expert" || userRole === "admin") && (
                      <button className="avatar-edit-overlay" onClick={handleTriggerAvatarEdit} title="Thay đổi ảnh đại diện">
                        <i className="bx bx-camera"></i>
                      </button>
                    )}
                  </div>

                  <div className="expert-profile-left-section">
                    <h4 className="expert-profile-left-title">Chuyên ngành</h4>
                    <div className="expert-profile-work-item">
                      <h5>{selectedExpert.specialty}</h5>
                      <p>{selectedExpert.experience} kinh nghiệm</p>
                    </div>
                  </div>

                  <div className="expert-profile-left-section">
                    <h4 className="expert-profile-left-title">Ngôn ngữ</h4>
                    <div className="expert-profile-left-chips">
                      {selectedExpert.languages.map((l) => (
                        <span key={l} className="expert-profile-left-chip">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="expert-profile-right-col">
                  <div className="expert-profile-header-main">
                    <h2 className="expert-profile-name-large">{selectedExpert.name}</h2>
                    <p className="expert-profile-specialty-title">{selectedExpert.specialty}</p>

                    <div className="expert-profile-ranking">
                      <span className="ranking-score">{selectedExpert.rating}</span>
                      <div className="ranking-stars">
                        <i className="bx bxs-star"></i>
                        <i className="bx bxs-star"></i>
                        <i className="bx bxs-star"></i>
                        <i className="bx bxs-star"></i>
                        <i className="bx bxs-star"></i>
                      </div>
                      <span className="ranking-reviews">({selectedExpert.reviews} nhận xét)</span>
                    </div>
                  </div>

                  {/* Quick Actions Row */}
                  <div className="expert-profile-actions-row">
                    {hasBooked && (
                      <button
                        className="action-link-btn"
                        onClick={() => {
                          if (onOpenChat) onOpenChat();
                          else alert("Vui lòng truy cập mục Nhắn tin từ thanh điều hướng chính.");
                        }}
                      >
                        <i className="bx bx-message-square-detail"></i> Nhắn tin
                      </button>
                    )}

                    <button
                      className="action-link-btn primary-action"
                      disabled={userRole === "guest" || selectedExpert.status === "unavailable"}
                      onClick={() => handleOpenBooking(selectedExpert)}
                      title={userRole === "guest" ? "Vui lòng đăng nhập để đặt lịch" : "Đặt lịch tư vấn trực tuyến"}
                    >
                      <i className="bx bx-calendar-check"></i> {userRole === "guest" ? "Đăng nhập để đặt lịch" : "Đặt lịch tư vấn"}
                    </button>

                    <button
                      className="action-link-btn report-action"
                      disabled={userRole === "guest"}
                      onClick={() => setIsReportModalOpen(true)}
                      title={userRole === "guest" ? "Vui lòng đăng nhập để báo cáo chuyên gia" : "Báo cáo chuyên gia"}
                    >
                      Báo cáo chuyên gia
                    </button>
                  </div>

                  {/* Tabs Navigation */}
                  <div className="expert-profile-tabs-nav">
                    <button 
                      className={`tab-item ${activeTab === "info" ? "active" : ""}`}
                      onClick={() => handleTabChange("info")}
                      style={{ background: "none", border: "none", padding: "0 0 8px 0" }}
                    >
                      Thông tin chi tiết
                    </button>
                    <button 
                      className={`tab-item ${activeTab === "reviews" ? "active" : ""}`}
                      onClick={() => handleTabChange("reviews")}
                      style={{ background: "none", border: "none", padding: "0 0 8px 0" }}
                    >
                      Nhận xét
                    </button>
                  </div>

                  {/* Contact / Bio Information / Reviews */}
                  <div className="expert-profile-details-content" ref={tabContentRef}>
                    {activeTab === "info" && (
                      <>
                        <div className="info-block">
                          <h4 className="info-block-title">Giới thiệu chuyên gia</h4>
                          <p className="expert-profile-bio-text">{selectedExpert.desc}</p>
                        </div>

                        <div className="info-block">
                          <h4 className="info-block-title">Thông tin tư vấn</h4>
                          <table className="info-table">
                            <tbody>
                              <tr>
                                <td className="info-label">Chi phí:</td>
                                <td className="info-value text-highlight">{selectedExpert.costDisplay} / buổi (50 phút)</td>
                              </tr>
                              <tr>
                                <td className="info-label">Hình thức:</td>
                                <td className="info-value">Tư vấn trực tuyến qua Video Call</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}

                    {activeTab === "reviews" && (
                      <div className="info-block">
                        <h4 className="info-block-title">Đánh giá gần nhất</h4>
                        <div className="expert-reviews-list">
                          {getExpertReviews(selectedExpert.id)
                            .slice(0, reviewLimit)
                            .map((review) => (
                              <div key={review.id} className="review-item-card">
                                <div className="review-item-header">
                                  <div className="review-item-author-avatar">
                                    {review.avatar}
                                  </div>
                                  <div className="review-item-author-info">
                                    <h5>{review.author}</h5>
                                    <div className="review-item-rating">
                                      <span className="review-stars">
                                        {"★".repeat(Math.floor(review.rating))}
                                      </span>
                                      <span className="review-rating-num">{review.rating}</span>
                                    </div>
                                  </div>
                                  <span className="review-item-date">
                                    {new Date(review.date).toLocaleDateString("vi-VN", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric"
                                    })}
                                  </span>
                                </div>
                                <p className="review-item-content">{review.content}</p>
                              </div>
                            ))}
                        </div>

                        {getExpertReviews(selectedExpert.id).length > reviewLimit && (
                          <button
                            className="see-more-reviews-btn"
                            onClick={() => setReviewLimit((prev) => prev + 3)}
                          >
                            Xem thêm nhận xét
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden file input for avatar edit */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                style={{ display: "none" }}
                accept="image/*"
              />
            </div>
          ) : (
            <>
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
                    <div
                      key={expert.id}
                      className="expert-card"
                      id={`expert-card-${expert.id}`}
                      onMouseEnter={(e) => {
                        gsap.to(e.currentTarget, {
                          y: -6,
                          scale: 1.015,
                          boxShadow: "0 20px 40px rgba(23, 107, 104, 0.08), 0 1px 5px rgba(23, 107, 104, 0.02)",
                          borderColor: "#cbdcdb",
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                      onMouseLeave={(e) => {
                        gsap.to(e.currentTarget, {
                          y: 0,
                          scale: 1,
                          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01)",
                          borderColor: "rgba(23, 107, 104, 0.06)",
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                    >
                      <div className="expert-avatar-box">
                        {expert.avatar.startsWith("http") || expert.avatar.startsWith("/") || expert.avatar.startsWith("data:") ? (
                          <img src={expert.avatar} alt={expert.name} className="expert-avatar-img" />
                        ) : (
                          expert.avatar
                        )}
                      </div>

                      <div className="expert-card-details">
                        <div className="expert-card-top">
                          <h3 className="expert-name">{expert.name}</h3>
                          <span className={`rm-badge rm-badge-${expert.status === 'available' ? 'success' : expert.status === 'limited' ? 'warning' : 'error'}`}>
                            {expert.statusLabel}
                          </span>
                        </div>

                        <div className="expert-specialty-row">
                          <i className="bx bx-purchase-tag-alt specialty-icon"></i>
                          <span className="specialty-label">Chuyên môn:</span>
                          <span className="specialty-value">{expert.specialty}</span>
                        </div>

                        <div className="expert-experience-row">
                          <div className="expert-experience-item">
                            <i className="bx bx-briefcase-alt-2 experience-icon"></i>
                            <span>Kinh nghiệm: <strong>{expert.experience}</strong></span>
                          </div>
                          <div className="expert-rating-item">
                            <span className="expert-rating-stars">★ {expert.rating}</span>
                            <span className="expert-reviews-count">({expert.reviews} nhận xét)</span>
                          </div>
                        </div>

                        <p className="expert-desc">{expert.desc}</p>

                        <div className="expert-languages-tags">
                          {expert.languages.map((l) => (
                            <span key={l} className="expert-lang-tag">
                              <i className="bx bx-globe"></i> {l}
                            </span>
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
                              onClick={() => handleSelectExpert(expert)}
                            >
                              Hồ sơ
                            </button>
                            <button
                              className="rm-btn rm-btn-primary"
                              id={`book-expert-${expert.id}`}
                              disabled={userRole === "guest" || expert.status === "unavailable"}
                              onClick={() => handleOpenBooking(expert)}
                              title={userRole === "guest" ? "Vui lòng đăng nhập để đặt lịch" : "Đặt lịch tư vấn trực tuyến"}
                            >
                              {userRole === "guest" ? "Đăng nhập để đặt lịch" : "Đặt lịch"}
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
            </>
          )}
        </main>
      )}

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
                <span style={{ fontSize: "24px", width: "40px", height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "50%", background: "var(--brand-050)", border: "1px solid var(--brand-100)" }}>
                  {bookingExpert.avatar.startsWith("http") || bookingExpert.avatar.startsWith("/") || bookingExpert.avatar.startsWith("data:") ? (
                    <img src={bookingExpert.avatar} alt={bookingExpert.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    bookingExpert.avatar
                  )}
                </span>
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
                {slotsLoading ? (
                  <p className="book-slots-loading">Đang tải lịch trống...</p>
                ) : slots.length > 0 ? (
                  <div className="book-slots-grid" id="book-slots-grid">
                    {slots.map((slot) => (
                      <button
                        key={slot._id}
                        type="button"
                        className={`book-slot-btn ${selectedSlotId === slot._id ? "selected" : ""}`}
                        onClick={() => setSelectedSlotId(slot._id)}
                      >
                        <span className="book-slot-time">{formatSlotRange(slot)}</span>
                        <span className="book-slot-price">{slot.price.toLocaleString("vi-VN")} VNĐ</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="book-slots-empty">Chuyên gia hiện chưa có lịch trống.</p>
                )}
              </div>

              {selectedSlotObj ? (
                <div className="book-cost-summary">
                  <span className="book-cost-label">Tổng chi phí</span>
                  <span className="book-cost-amount">{selectedSlotObj.price.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              ) : bookingExpert.cost > 0 ? (
                <div className="book-cost-summary">
                  <span className="book-cost-label">Tổng chi phí</span>
                  <span className="book-cost-amount">{bookingExpert.cost.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              ) : (
                <div className="book-cost-summary book-cost-summary--free">
                  <span className="book-cost-label">Tổng chi phí</span>
                  <span className="book-cost-amount">Miễn phí</span>
                </div>
              )}
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
                disabled={!selectedSlotId || !bookingDate}
                onClick={handleConfirmBooking}
              >
                Xác nhận đặt lịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== REPORT MODAL ===== */}
      {isReportModalOpen && selectedExpert && (
        <div
          className="rm-modal-overlay"
          style={{ zIndex: 1200 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsReportModalOpen(false);
          }}
        >
          <div
            className="rm-modal"
            style={{ maxWidth: 520, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="rm-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg,#fef2f2,#fee2e2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: "#dc2626", flexShrink: 0
                }}>
                  <i className="bx bx-flag"></i>
                </span>
                <div>
                  <h3 className="rm-modal-title" style={{ marginBottom: 2 }}>Báo cáo chuyên gia</h3>
                  <p style={{ fontSize: 12, color: "var(--ink-500)", margin: 0 }}>
                    {selectedExpert.name}
                  </p>
                </div>
              </div>
              <button
                className="rm-modal-close"
                onClick={() => {
                  setIsReportModalOpen(false);
                  setIsReasonDropdownOpen(false);
                }}
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            {/* Body */}
            <div className="rm-modal-body" style={{ gap: 20 }}>
              {/* Reason Selector */}
              <div>
                <label style={{
                  display: "block", marginBottom: 10,
                  fontWeight: 700, fontSize: 13, color: "var(--ink-700)",
                  textTransform: "uppercase", letterSpacing: "0.04em"
                }}>
                  Lý do báo cáo <span style={{ color: "var(--error)", fontWeight: 700 }}>*</span>
                </label>

                {/* Custom Dropdown */}
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsReasonDropdownOpen((o) => !o)}
                    className="report-reason-trigger"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      padding: "11px 14px",
                      border: isReasonDropdownOpen
                        ? "2px solid var(--brand-600)"
                        : "1.5px solid var(--border-strong)",
                      borderRadius: isReasonDropdownOpen ? "10px 10px 0 0" : 10,
                      background: "var(--surface)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "border-color 0.15s ease, border-radius 0.15s ease",
                      boxSizing: "border-box",
                      boxShadow: isReasonDropdownOpen
                        ? "0 0 0 3px rgba(35,129,125,0.12)"
                        : "none",
                    }}
                  >
                    {/* Icon bubble */}
                    <span style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 17,
                      background: "var(--canvas)",
                      border: "1px solid var(--border)",
                      color: REPORT_REASONS.find(r => r.value === reportReason)?.color ?? "#6b7280",
                      transition: "color 0.15s ease",
                    }}>
                      <i className={`bx ${REPORT_REASONS.find(r => r.value === reportReason)?.icon ?? "bx-dots-horizontal-rounded"}`}></i>
                    </span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--ink-900)" }}>
                      {reportReason}
                    </span>
                    <i
                      className="bx bx-chevron-down"
                      style={{
                        fontSize: 20, color: "var(--ink-500)",
                        transition: "transform 0.2s ease",
                        transform: isReasonDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        flexShrink: 0,
                      }}
                    ></i>
                  </button>

                  {/* Dropdown Panel */}
                  {isReasonDropdownOpen && (
                    <div
                      className="report-reason-panel"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "var(--surface)",
                        border: "2px solid var(--brand-600)",
                        borderTop: "1px solid var(--border)",
                        borderRadius: "0 0 10px 10px",
                        boxShadow: "0 12px 32px rgba(23,42,42,0.12)",
                        zIndex: 50,
                        overflow: "hidden",
                        animation: "dropdownSlideIn 0.18s cubic-bezier(0.16,1,0.3,1) forwards",
                      }}
                    >
                      {REPORT_REASONS.map((r, idx) => {
                        const isSelected = reportReason === r.value;
                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => {
                              setReportReason(r.value);
                              setIsReasonDropdownOpen(false);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              width: "100%",
                              padding: "10px 14px",
                              background: isSelected ? "var(--brand-050)" : "var(--surface)",
                              border: "none",
                              borderBottom: idx < REPORT_REASONS.length - 1
                                ? "1px solid var(--border)"
                                : "none",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "background 0.12s ease",
                              boxSizing: "border-box",
                            }}
                            onMouseEnter={e => {
                              if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "var(--brand-050)";
                            }}
                            onMouseLeave={e => {
                              if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)";
                            }}
                          >
                            <span style={{
                              width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 16, color: r.color,
                              background: `${r.color}15`,
                              transition: "all 0.12s ease",
                            }}>
                              <i className={`bx ${r.icon}`}></i>
                            </span>
                            <span style={{
                              flex: 1,
                              fontSize: 13.5,
                              fontWeight: isSelected ? 700 : 500,
                              color: isSelected ? "var(--brand-700)" : "var(--ink-700)",
                            }}>
                              {r.value}
                            </span>
                            {isSelected && (
                              <i className="bx bx-check" style={{
                                fontSize: 18, color: "var(--brand-600)", flexShrink: 0,
                                fontWeight: 700,
                              }}></i>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>


              {/* Description */}
              <div>
                <label style={{
                  display: "block", marginBottom: 8,
                  fontWeight: 700, fontSize: 13, color: "var(--ink-700)",
                  textTransform: "uppercase", letterSpacing: "0.04em"
                }}>
                  Mô tả thêm  <span style={{ fontWeight: 400, color: "var(--ink-500)", textTransform: "none", letterSpacing: 0 }}>(không bắt buộc)</span>
                </label>
                <div className="rm-input-wrapper" style={{ borderRadius: 10 }}>
                  <textarea
                    placeholder="Vui lòng cung cấp thêm bằng chứng hoặc mô tả để ban quản trị xử lý nhanh hơn..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={3}
                    className="rm-input-field"
                    style={{
                      padding: "10px 12px",
                      resize: "vertical",
                      minHeight: 80,
                      fontFamily: "inherit",
                      fontSize: 13.5,
                    }}
                  />
                </div>
              </div>

              {/* Info note */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                padding: "10px 14px", borderRadius: 8,
                background: "var(--info-bg)", border: "1px solid var(--calm-blue-100)"
              }}>
                <i className="bx bx-info-circle" style={{ color: "var(--info)", fontSize: 16, marginTop: 1, flexShrink: 0 }}></i>
                <p style={{ fontSize: 12.5, color: "var(--info)", margin: 0, lineHeight: 1.5 }}>
                  Báo cáo sẽ được gửi đến ban quản trị và xử lý trong vòng 24h. Danh tính của bạn sẽ được bảo mật.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="rm-modal-footer">
              <button
                className="rm-btn rm-btn-outline"
                disabled={isSubmittingReport}
                onClick={() => {
                  setIsReportModalOpen(false);
                  setIsReasonDropdownOpen(false);
                }}
              >
                Hủy bỏ
              </button>
              <button
                className="rm-btn rm-btn-primary"
                disabled={isSubmittingReport}
                onClick={handleSubmitReport}
                style={{ minWidth: 120, gap: 8 }}
              >
                {isSubmittingReport ? (
                  <>
                    <i className="bx bx-loader-alt" style={{ animation: "spin 1s linear infinite" }}></i>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <i className="bx bx-send"></i>
                    Gửi báo cáo
                  </>
                )}
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
