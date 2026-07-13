import { useState, useEffect } from "react";
import { AppointmentController, AppointmentWithStudent } from "../../controllers/AppointmentController";
import "./ExpertCalendar.css";

interface ExpertCalendarProps {
  onBack: () => void;
}

interface AppointmentsByDate {
  [date: string]: AppointmentWithStudent[];
}

function ExpertCalendar({ onBack }: ExpertCalendarProps) {
  const [appointments, setAppointments] = useState<AppointmentWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithStudent | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await AppointmentController.getExpertAppointments();
      // Cast to AppointmentWithStudent since backend should populate student data
      setAppointments(data as AppointmentWithStudent[]);
    } catch (err) {
      setError("Không thể tải lịch hẹn. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Bạn có chắc muốn hủy lịch hẹn này?")) return;
    
    try {
      setCancelling(true);
      await AppointmentController.cancelAppointment(appointmentId);
      await loadAppointments();
      setSelectedAppointment(null);
    } catch (err) {
      alert("Không thể hủy lịch hẹn. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const handleStartSession = async (appointmentId: string) => {
    try {
      setActionInProgress(true);
      await AppointmentController.startSession(appointmentId);
      await loadAppointments();
      setSelectedAppointment(null);
    } catch (err) {
      alert("Không thể bắt đầu phiên tư vấn. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleEndSession = async (appointmentId: string) => {
    try {
      setActionInProgress(true);
      await AppointmentController.endSession(appointmentId);
      await loadAppointments();
      setSelectedAppointment(null);
    } catch (err) {
      alert("Không thể kết thúc phiên tư vấn. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setActionInProgress(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert Sunday (0) to 7 for Mon-Sun week
    return firstDay === 0 ? 7 : firstDay;
  };

  const groupAppointmentsByDate = (): AppointmentsByDate => {
    const grouped: AppointmentsByDate = {};
    
    appointments.forEach((apt) => {
      const date = new Date(apt.scheduledStartAt);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });

    // Sort appointments by time within each day
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => 
        new Date(a.scheduledStartAt).getTime() - new Date(b.scheduledStartAt).getTime()
      );
    });

    return grouped;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "Chờ thanh toán";
      case "booked":
        return "Đã đặt";
      case "confirmed":
        return "Đã xác nhận";
      case "in_progress":
        return "Đang tư vấn";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      case "no_show":
        return "Không đến";
      case "rescheduled":
        return "Đã đổi lịch";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "confirmed":
      case "booked":
        return "status-success";
      case "in_progress":
        return "status-info";
      case "completed":
        return "status-completed";
      case "pending_payment":
        return "status-warning";
      case "cancelled":
      case "no_show":
        return "status-error";
      default:
        return "";
    }
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const appointmentsByDate = groupAppointmentsByDate();
    
    const days = [];
    const totalCells = Math.ceil((daysInMonth + firstDay - 1) / 7) * 7;

    // Previous month trailing days
    const prevMonthDays = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    for (let i = firstDay - 2; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i),
        appointments: []
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      days.push({
        day,
        isCurrentMonth: true,
        date,
        appointments: appointmentsByDate[dateKey] || []
      });
    }

    // Next month leading days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day),
        appointments: []
      });
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="expert-calendar">
      {/* Header */}
      <div className="calendar-header">
        <button className="back-button" onClick={onBack}>
          ← Quay lại
        </button>
        <h1 className="calendar-title">Lịch hẹn của tôi</h1>
      </div>

      {/* Month Navigation */}
      <div className="calendar-controls">
        <button className="nav-button" onClick={goToPreviousMonth} disabled={loading}>
          ←
        </button>
        <div className="month-display">
          <h2 className="month-title">{formatMonthYear(currentDate)}</h2>
          <button className="today-button" onClick={goToToday} disabled={loading}>
            Hôm nay
          </button>
        </div>
        <button className="nav-button" onClick={goToNextMonth} disabled={loading}>
          →
        </button>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-button" onClick={loadAppointments}>
            Thử lại
          </button>
        </div>
      )}

      {/* Calendar Grid */}
      {!error && (
        <div className="calendar-container">
          {/* Week day headers */}
          <div className="calendar-weekdays">
            {weekDays.map((day) => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="calendar-grid">
            {loading ? (
              // Skeleton loading
              Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="calendar-day skeleton-day">
                  <div className="day-number skeleton-number"></div>
                </div>
              ))
            ) : (
              // Actual calendar days
              calendarDays.map((dayData, index) => (
                <div
                  key={index}
                  className={`calendar-day ${!dayData.isCurrentMonth ? 'other-month' : ''} ${isToday(dayData.date) ? 'today' : ''}`}
                >
                  <div className="day-number">{dayData.day}</div>
                  <div className="day-appointments">
                    {dayData.appointments.map((apt) => (
                      <div
                        key={apt._id}
                        className={`appointment-slot ${getStatusClass(apt.status)}`}
                        onClick={() => setSelectedAppointment(apt)}
                        title={`${formatTime(apt.scheduledStartAt)}${apt.studentName ? ` - ${apt.studentName}` : ''} - ${getStatusLabel(apt.status)}`}
                      >
                        <span className="slot-time">{formatTime(apt.scheduledStartAt)}</span>
                        {apt.studentName && (
                          <span className="slot-student">{apt.studentName.split(' ')[0]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Legend */}
          <div className="calendar-legend">
            <div className="legend-title">Trạng thái:</div>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color status-success"></span>
                <span className="legend-label">Đã đặt / Xác nhận</span>
              </div>
              <div className="legend-item">
                <span className="legend-color status-info"></span>
                <span className="legend-label">Đang tư vấn</span>
              </div>
              <div className="legend-item">
                <span className="legend-color status-completed"></span>
                <span className="legend-label">Hoàn thành</span>
              </div>
              <div className="legend-item">
                <span className="legend-color status-warning"></span>
                <span className="legend-label">Chờ thanh toán</span>
              </div>
              <div className="legend-item">
                <span className="legend-color status-error"></span>
                <span className="legend-label">Đã hủy</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Chi tiết lịch hẹn</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedAppointment(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <span className="detail-label">Trạng thái</span>
                <span className={`status-badge ${getStatusClass(selectedAppointment.status)}`}>
                  {getStatusLabel(selectedAppointment.status)}
                </span>
              </div>

              <div className="detail-section">
                <span className="detail-label">Ngày</span>
                <span className="detail-value">{formatDate(selectedAppointment.scheduledStartAt)}</span>
              </div>

              <div className="detail-section">
                <span className="detail-label">Thời gian</span>
                <span className="detail-value">
                  {formatTime(selectedAppointment.scheduledStartAt)} - {formatTime(selectedAppointment.scheduledEndAt)}
                </span>
              </div>

              <div className="detail-section">
                <span className="detail-label">Học viên</span>
                <span className="detail-value">
                  {selectedAppointment.studentName || `ID: ${selectedAppointment.studentId}`}
                </span>
              </div>

              {selectedAppointment.amount && (
                <div className="detail-section">
                  <span className="detail-label">Phí tư vấn</span>
                  <span className="detail-value">
                    {selectedAppointment.amount.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              )}

              {selectedAppointment.studentNote && (
                <div className="detail-section">
                  <span className="detail-label">Ghi chú từ học viên</span>
                  <p className="detail-note">{selectedAppointment.studentNote}</p>
                </div>
              )}

              {selectedAppointment.expertNote && (
                <div className="detail-section">
                  <span className="detail-label">Ghi chú của bạn</span>
                  <p className="detail-note">{selectedAppointment.expertNote}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              {(selectedAppointment.status === "booked" || selectedAppointment.status === "confirmed") && (
                <button
                  className="action-button primary"
                  onClick={() => handleStartSession(selectedAppointment._id)}
                  disabled={actionInProgress}
                >
                  {actionInProgress ? "Đang xử lý..." : "Bắt đầu phiên tư vấn"}
                </button>
              )}

              {selectedAppointment.status === "in_progress" && (
                <button
                  className="action-button primary"
                  onClick={() => handleEndSession(selectedAppointment._id)}
                  disabled={actionInProgress}
                >
                  {actionInProgress ? "Đang xử lý..." : "Kết thúc phiên tư vấn"}
                </button>
              )}

              {(selectedAppointment.status === "pending_payment" || selectedAppointment.status === "booked") && (
                <button
                  className="action-button destructive"
                  onClick={() => handleCancelAppointment(selectedAppointment._id)}
                  disabled={cancelling || actionInProgress}
                >
                  {cancelling ? "Đang hủy..." : "Hủy lịch hẹn"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpertCalendar;
