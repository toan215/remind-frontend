import { useState, useEffect } from 'react';
import './Settings.css';
import { ExpertController } from './ExpertController';

interface SettingsProps {
    userRole: 'student' | 'expert' | 'admin';
}

const Settings = ({ userRole }: SettingsProps) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        specialties: [] as string[], // For expert
        profile: {
            bio: '',
            professionalTitle: ''
        }
    });
    const [status, setStatus] = useState({ loading: true, error: '', success: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            setStatus({ loading: true, error: '', success: '' });
            if (userRole === 'expert') {
                try {
                    const data = await ExpertController.getSettings();
                    setFormData({
                        fullName: data.fullName || '',
                        email: data.email || '',
                        specialties: data.specialties || [],
                        profile: {
                            bio: data.profile?.bio || '',
                            professionalTitle: data.profile?.professionalTitle || ''
                        }
                    });
                } catch (err) {
                    setStatus(prev => ({ ...prev, error: 'Lỗi tải cài đặt.' }));
                } finally {
                    setStatus(prev => ({ ...prev, loading: false }));
                }
            } else if (userRole === 'admin') {
                // TODO: Implement admin settings fetch
                setFormData({ fullName: 'Admin Moderator', email: 'admin@remind.com', specialties: [], profile: { bio: '', professionalTitle: '' } });
                setStatus({ loading: false, error: '', success: '' });
            } else {
                // TODO: Implement student settings fetch
                setStatus({ loading: false, error: '', success: '' });
            }
        };
        fetchSettings();
    }, [userRole]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: '' });
        try {
            if (userRole === 'expert') {
                const { email, ...updateData } = formData;
                await ExpertController.updateSettings(updateData);
            }
            setStatus({ loading: false, error: '', success: 'Cập nhật thành công!' });
        } catch (err) {
            setStatus({ loading: false, success: '', error: 'Cập nhật thất bại. Vui lòng thử lại.' });
        }
    };

    return (
        <div className="settings-page">
            {status.loading && <div className="loading-overlay">Đang tải...</div>}
            <h1 className="settings-title">Cài đặt tài khoản</h1>
            <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="fullName">Họ và tên</label>
                    <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className="rm-input-field" />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} disabled className="rm-input-field" />
                </div>
                {userRole === 'expert' && (
                    <>
                        <div className="form-group">
                            <label htmlFor="specialties">Chuyên môn (phân cách bởi dấu phẩy)</label>
                            <input type="text" id="specialties" name="specialties" value={formData.specialties.join(', ')} onChange={(e) => setFormData(prev => ({...prev, specialties: e.target.value.split(',').map(s => s.trim())}))} className="rm-input-field" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="professionalTitle">Chức danh</label>
                            <input type="text" id="professionalTitle" name="professionalTitle" value={formData.profile.professionalTitle} onChange={(e) => setFormData(p => ({...p, profile: {...p.profile, professionalTitle: e.target.value}}))} className="rm-input-field" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="bio">Tiểu sử</label>
                            <textarea id="bio" name="bio" value={formData.profile.bio} onChange={(e) => setFormData(p => ({...p, profile: {...p.profile, bio: e.target.value}}))} className="rm-input-field" rows={4}></textarea>
                        </div>
                    </>
                )}
                <button type="submit" className="rm-btn rm-btn-primary" disabled={status.loading}>
                    {status.loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                {status.success && <p className="form-success">{status.success}</p>}
                {status.error && <p className="form-error">{status.error}</p>}
            </form>
        </div>
    );
};

export default Settings;