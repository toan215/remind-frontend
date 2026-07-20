import { useState, useEffect } from "react";
import { ExpertController } from "../../controllers/ExpertController";
import { Expert, ExpertFormData } from "../../models/Expert";
import "./Admin.css";

export function AdminExpertCrud() {
  const [experts, setExperts] = useState<Expert[]>([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterApproval, setFilterApproval] = useState("all");

  // Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingExpertId, setEditingExpertId] = useState<string | number | null>(null);
  const [targetDeleteId, setTargetDeleteId] = useState<string | number | null>(null);

  // Form State
  const [formData, setFormData] = useState<ExpertFormData>({
    name: "",
    avatar: "👩‍⚕️",
    specialty: "Trầm cảm",
    experience: "5 năm kinh nghiệm",
    languages: ["Tiếng Việt"],
    cost: 400000,
    status: "available",
    desc: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState("");

  // ponytail: map backend expert shape to the CRUD model fields the UI expects
  const mapExpert = (e: any): Expert => ({
    id: Number(e._id) || 0,
    _id: e._id,
    name: e.fullName || e.email || "Chuyên gia",
    avatar: "👩‍⚕️",
    specialty: e.expert?.profile?.professionalTitle || "Chưa cập nhật",
    experience: e.expert?.profile?.experience || "",
    rating: e.expert?.rating?.toString() || "0",
    reviews: e.expert?.reviews || 0,
    languages: e.expert?.profile?.languages || ["Tiếng Việt"],
    cost: e.expert?.profile?.cost || 0,
    costDisplay: e.expert?.profile?.cost ? `${e.expert.profile.cost} VNĐ` : "—",
    status: e.status === "active" ? "available" : e.status === "suspended" ? "unavailable" : "limited",
    statusLabel: e.status || "limited",
    desc: e.expert?.profile?.bio || "",
    approvalStatus: e.approvalStatus || "approved",
    createdAt: e.createdAt || "",
  });

  const loadExperts = async () => {
    try {
      const data = await ExpertController.getExpertsForAdmin();
      setExperts(data.map(mapExpert));
    } catch (err) {
      console.error("Failed to load experts:", err);
    }
  };

  useEffect(() => {
    loadExperts();
  }, []);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // Filter & Search Logic
  const filteredExperts = experts.filter((expert) => {
    const matchesSearch =
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.desc.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      filterSpecialty === "all" || expert.specialty === filterSpecialty;

    const matchesStatus =
      filterStatus === "all" || expert.status === filterStatus;

    const matchesApproval =
      filterApproval === "all" || expert.approvalStatus === filterApproval;

    return matchesSearch && matchesSpecialty && matchesStatus && matchesApproval;
  });

  // Extract unique specialties for filtering dropdown
  const uniqueSpecialties = Array.from(new Set(experts.map(e => e.specialty)));

  // Form Actions
  const handleOpenAddModal = () => {
    setEditingExpertId(null);
    setFormData({
      name: "",
      avatar: "👩‍⚕️",
      specialty: "Trầm cảm",
      experience: "5 năm kinh nghiệm",
      languages: ["Tiếng Việt"],
      cost: 400000,
      status: "available",
      desc: ""
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleOpenEditModal = (expert: Expert) => {
    setEditingExpertId(expert._id);
    setFormData({
      name: expert.name,
      avatar: expert.avatar,
      specialty: expert.specialty,
      experience: expert.experience,
      languages: [...expert.languages],
      cost: expert.cost,
      status: expert.status,
      desc: expert.desc
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleCheckboxChange = (lang: string) => {
    const currentLangs = formData.languages;
    if (currentLangs.includes(lang)) {
      setFormData({ ...formData, languages: currentLangs.filter(l => l !== lang) });
    } else {
      setFormData({ ...formData, languages: [...currentLangs, lang] });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = ExpertController.validate(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (editingExpertId !== null) {
        // Update
        ExpertController.updateExpert(editingExpertId, formData);
        triggerToast("Cập nhật thông tin chuyên gia thành công!");
      } else {
        // Create
        ExpertController.createExpert(formData);
        triggerToast("Thêm chuyên gia mới thành công! Hồ sơ ở trạng thái chờ duyệt.");
      }
      setShowFormModal(false);
      loadExperts();
    }
  };

  // Verification Actions
  const handleApprove = (id: string | number) => {
    ExpertController.approveExpert(id);
    triggerToast("Đã phê duyệt hồ sơ chuyên gia!");
    loadExperts();
  };

  const handleSuspend = (id: string | number) => {
    ExpertController.suspendExpert(id);
    triggerToast("Đã tạm đình chỉ chuyên gia!");
    loadExperts();
  };

  // Delete Actions
  const handleOpenDeleteConfirm = (id: string | number) => {
    setTargetDeleteId(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (targetDeleteId !== null) {
      ExpertController.deleteExpert(targetDeleteId);
      triggerToast("Đã xóa vĩnh viễn chuyên gia ra khỏi danh bạ!");
      setShowConfirmModal(false);
      setTargetDeleteId(null);
      loadExperts();
    }
  };

  return (
    <div className="admin-crud-container">
      {/* Header Banner */}
      <div className="admin-dash-header-card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="admin-chip-badge teal">Vận hành & Danh bạ</span>
              <span className="text-xs text-slate-400 font-medium">Tổng số {experts.length} chuyên gia</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Danh sách & Quản lý Chuyên gia
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Tra cứu, điều chỉnh hồ sơ chuyên môn, cấp phép hoạt động và quản lý thông tin các chuyên gia tư vấn.
            </p>
          </div>
          <button
            className="rm-btn rm-btn-outline text-xs px-4 py-2.5 font-bold shadow-xs flex items-center gap-2"
            onClick={loadExperts}
          >
            <i className="bx bx-refresh text-base"></i> Làm mới danh sách
          </button>
        </div>
      </div>

      {/* ===== TOOLBAR CARD ===== */}
      <section className="admin-panel-card mb-6">
        {/* Row 1: Search + Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-lg">
            <i className="bx bx-search absolute left-3.5 top-3 text-slate-400 text-lg pointer-events-none"></i>
            <input
              type="text"
              className="admin-form-input pl-10 text-xs font-medium"
              placeholder="Tìm tên chuyên gia, chuyên môn hoặc từ khóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-base border-none bg-transparent cursor-pointer"
                onClick={() => setSearchTerm("")}
              >
                <i className="bx bx-x"></i>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="rm-btn rm-btn-primary flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-5 shadow-xs hover:shadow-md transition-all whitespace-nowrap"
          >
            <i className="bx bx-plus text-base"></i>
            <span>Thêm Chuyên gia mới</span>
          </button>
        </div>

        {/* Row 2: Inline Filter Chips */}
        <div className="pt-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
            <i className="bx bx-filter-alt text-teal-600"></i>
            <span>Bộ lọc:</span>
          </span>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Chuyên môn:</span>
            <select
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {uniqueSpecialties.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Lịch hẹn:</span>
            <select
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="available">Sẵn sàng hỗ trợ</option>
              <option value="limited">Lịch hẹn giới hạn</option>
              <option value="unavailable">Bận / Đầy lịch</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Phê duyệt:</span>
            <select
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              value={filterApproval}
              onChange={(e) => setFilterApproval(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="approved">Đã phê duyệt</option>
              <option value="pending">Chờ phê duyệt</option>
              <option value="suspended">Bị đình chỉ</option>
            </select>
          </div>

          {(filterSpecialty !== "all" || filterStatus !== "all" || filterApproval !== "all" || searchTerm) && (
            <button
              type="button"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              onClick={() => {
                setSearchTerm("");
                setFilterSpecialty("all");
                setFilterStatus("all");
                setFilterApproval("all");
              }}
            >
              <i className="bx bx-reset text-sm"></i>
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>
      </section>

      {/* ===== DATA TABLE CARD ===== */}
      <section className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Chuyên gia</th>
                <th>Chuyên môn</th>
                <th>Chi phí tư vấn</th>
                <th>Lịch hẹn</th>
                <th>Phê duyệt</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredExperts.length > 0 ? (
                filteredExperts.map((expert) => (
                  <tr key={expert.id}>
                    <td>
                      <div className="admin-table-expert-cell">
                        <div className="admin-table-expert-avatar">
                          {expert.avatar}
                        </div>
                        <div className="admin-table-expert-name-box">
                          <span className="admin-table-expert-name">{expert.name}</span>
                          <span className="admin-table-expert-exp">{expert.experience}</span>
                        </div>
                      </div>
                    </td>
                    <td>{expert.specialty}</td>
                    <td>{expert.costDisplay}</td>
                    <td>
                      <span className={`rm-badge rm-badge-${expert.status === "available" ? "success" : expert.status === "limited" ? "warning" : "error"}`}>
                        {expert.status === "available" ? "Sẵn sàng" : expert.status === "limited" ? "Giới hạn" : "Bận"}
                      </span>
                    </td>
                    <td>
                      <span className={`rm-badge rm-badge-${expert.approvalStatus === "approved" ? "success" : expert.approvalStatus === "pending" ? "warning" : "error"}`}>
                        {expert.approvalStatus === "approved" ? "Đã duyệt" : expert.approvalStatus === "pending" ? "Chờ duyệt" : "Đình chỉ"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions-cell">
                        {/* Validation/Verify quick triggers */}
                        {expert.approvalStatus !== "approved" && (
                          <button
                            className="admin-action-btn-sm approve"
                            onClick={() => handleApprove(expert._id)}
                            title="Phê duyệt hoạt động"
                          >
                            Duyệt
                          </button>
                        )}
                        {expert.approvalStatus === "approved" && (
                          <button
                            className="admin-action-btn-sm reject"
                            onClick={() => handleSuspend(expert._id)}
                            title="Tạm đình chỉ hoạt động"
                          >
                            Đình chỉ
                          </button>
                        )}

                        <button
                          className="rm-btn rm-btn-outline"
                          onClick={() => handleOpenEditModal(expert)}
                          title="Sửa thông tin"
                        >
                          Sửa
                        </button>
                        <button
                          className="rm-btn rm-btn-outline"
                          onClick={() => handleOpenDeleteConfirm(expert._id)}
                          style={{ borderColor: "var(--error-bg)", color: "var(--error)" }}
                          title="Xóa chuyên gia"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="admin-table-empty">
                    <i className="bx bx-search-alt"></i>
                    <p>Không tìm thấy chuyên gia nào phù hợp bộ lọc.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== ADD / EDIT MODAL POPUP ===== */}
      {showFormModal && (
        <div className="rm-modal-overlay admin-modal-overlay">
          <div className="rm-modal" style={{ maxWidth: "540px" }}>
            <div className="rm-modal-header">
              <h3 className="rm-modal-title">
                {editingExpertId !== null ? "Cập nhật hồ sơ chuyên gia" : "Thêm mới chuyên gia y khoa"}
              </h3>
              <button className="rm-modal-close" onClick={() => setShowFormModal(false)}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="rm-modal-body" style={{ gap: "0" }}>
                {/* Name */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Tên Chuyên gia</label>
                  <input
                    type="text"
                    className={`admin-form-input ${formErrors.name ? "error" : ""}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: ThS. BS. Nguyễn Văn A"
                  />
                  {formErrors.name && (
                    <span className="admin-form-error-msg">{formErrors.name}</span>
                  )}
                </div>

                {/* Avatar & Specialty Row */}
                <div className="admin-form-group row">
                  <div>
                    <label className="admin-form-label">Ảnh đại diện (Emoji)</label>
                    <select
                      className="admin-form-input"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    >
                      <option value="👩‍⚕️">👩‍⚕️ Nữ Bác sĩ</option>
                      <option value="👨‍⚕️">👨‍⚕️ Nam Bác sĩ</option>
                      <option value="🧑‍⚕️">🧑‍⚕️ Tư vấn viên</option>
                      <option value="👩">👩 Nữ Chuyên gia</option>
                      <option value="👨">👨 Nam Chuyên gia</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-form-label">Chuyên môn</label>
                    <select
                      className="admin-form-input"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    >
                      <option value="Trầm cảm">Trầm cảm</option>
                      <option value="Lo âu">Lo âu</option>
                      <option value="Stress công việc">Stress công việc</option>
                      <option value="Mối quan hệ">Mối quan hệ</option>
                      <option value="LGBTQ+">LGBTQ+</option>
                    </select>
                  </div>
                </div>

                {/* Experience & Cost Row */}
                <div className="admin-form-group row">
                  <div>
                    <label className="admin-form-label">Kinh nghiệm</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="Ví dụ: 8 năm kinh nghiệm"
                    />
                  </div>
                  <div>
                    <label className="admin-form-label">Chi phí (VNĐ / 50 phút)</label>
                    <input
                      type="number"
                      className={`admin-form-input ${formErrors.cost ? "error" : ""}`}
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                      placeholder="0 đại diện cho Miễn phí"
                    />
                    {formErrors.cost && (
                      <span className="admin-form-error-msg">{formErrors.cost}</span>
                    )}
                  </div>
                </div>

                {/* Status & Languages */}
                <div className="admin-form-group row">
                  <div>
                    <label className="admin-form-label">Trạng thái đặt lịch</label>
                    <select
                      className="admin-form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="available">Sẵn sàng hỗ trợ</option>
                      <option value="limited">Lịch hẹn giới hạn</option>
                      <option value="unavailable">Bận / Đầy lịch</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-form-label">Ngôn ngữ</label>
                    <div className="admin-languages-checklist">
                      <label className="admin-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes("Tiếng Việt")}
                          onChange={() => handleCheckboxChange("Tiếng Việt")}
                        />
                        Tiếng Việt
                      </label>
                      <label className="admin-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes("Tiếng Anh")}
                          onChange={() => handleCheckboxChange("Tiếng Anh")}
                        />
                        Tiếng Anh
                      </label>
                    </div>
                    {formErrors.languages && (
                      <span className="admin-form-error-msg">{formErrors.languages}</span>
                    )}
                  </div>
                </div>

                {/* Short Bio Description */}
                <div className="admin-form-group" style={{ marginBottom: "0" }}>
                  <label className="admin-form-label">Mô tả tóm tắt</label>
                  <textarea
                    rows={3}
                    className={`admin-form-input ${formErrors.desc ? "error" : ""}`}
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    placeholder="Giới thiệu kỹ năng điều trị, đối tượng hướng tới..."
                    style={{ resize: "none", fontFamily: "var(--sans)", fontSize: "14px" }}
                  />
                  {formErrors.desc && (
                    <span className="admin-form-error-msg">{formErrors.desc}</span>
                  )}
                </div>
              </div>

              <div className="rm-modal-footer">
                <button
                  type="button"
                  className="rm-btn rm-btn-outline"
                  onClick={() => setShowFormModal(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="rm-btn rm-btn-primary">
                  {editingExpertId !== null ? "Lưu thay đổi" : "Tạo chuyên gia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {showConfirmModal && (
        <div className="rm-modal-overlay admin-modal-overlay">
          <div className="rm-modal" style={{ maxWidth: "380px" }}>
            <div className="rm-modal-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <button className="rm-modal-close" onClick={() => setShowConfirmModal(false)} style={{ marginLeft: "auto" }}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="rm-modal-body" style={{ paddingTop: 0 }}>
              <div className="admin-confirm-body">
                <i className="bx bx-info-circle"></i>
                <h4>Xác nhận xóa chuyên gia?</h4>
                <p>Hành động này sẽ xóa hoàn toàn chuyên gia khỏi cơ sở dữ liệu hệ thống ReMind.</p>
              </div>
            </div>
            <div className="rm-modal-footer" style={{ borderTop: "none", paddingTop: 0, justifyContent: "center" }}>
              <button
                className="rm-btn rm-btn-outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                className="rm-btn rm-btn-primary"
                onClick={handleConfirmDelete}
                style={{ backgroundColor: "var(--error)", borderColor: "var(--error)" }}
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SUCCESS TOAST ===== */}
      {toastMessage && (
        <div className="book-toast" style={{ bottom: "24px", transform: "translateX(-50%)" }}>
          <i className="bx bx-check-circle" style={{ color: "var(--success)" }}></i>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default AdminExpertCrud;
