"use client";

import { useState, useEffect, useMemo } from 'react';
import { Calendar, X, RefreshCw, Plus, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';
import { appointmentService, CreateAppointmentRequest } from '@/services/appointmentService';
import { campaignService } from '@/services/campaignService';
import { userService, UserInfo } from '@/services/userService';
import type { CampaignDto } from '@/types/campaign';

interface CreateAppointmentModalProps {
    staffId: number;
    onClose: () => void;
    onCreated: (appointmentId?: number) => void;
    initialDonorId?: number;
    initialCampaignId?: number;
}

export default function CreateAppointmentModal({ staffId, onClose, onCreated, initialDonorId, initialCampaignId }: CreateAppointmentModalProps) {
    const [form, setForm] = useState<CreateAppointmentRequest>({ 
        donorId: initialDonorId || 0, 
        staffId, 
        startTime: '', 
        endTime: '', 
        location: '', 
        purpose: '' 
    });
    const [loading, setLoading] = useState(false);
    const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
    const [users, setUsers] = useState<Map<number, UserInfo>>(new Map());
    const [loadingData, setLoadingData] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | undefined>(initialCampaignId);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                // Fetch campaigns - include APPROVED and DISABLED for staff to manage
                const campaignResp = await campaignService.getAll(0, 5000);
                const relevantCampaigns = (campaignResp.content || []).filter((c: CampaignDto) => c.status === 'APPROVED' || c.status === 'DISABLED');
                setCampaigns(relevantCampaigns);

                // Fetch users for relevant campaigns
                const userIds = [...new Set(relevantCampaigns.map(c => c.fundOwnerId))];
                const userMap = new Map<number, UserInfo>();

                // Fetch all users and filter
                const allUsersResult = await userService.getAllUsers(0, 5000);
                if (allUsersResult.success && allUsersResult.data && allUsersResult.data.content) {
                    allUsersResult.data.content.forEach(user => {
                        if (userIds.includes(user.id)) {
                            userMap.set(user.id, user);
                        }
                    });
                }
                setUsers(userMap);

                // If initialCampaignId is provided, find its owner and set it
                if (initialCampaignId) {
                    const target = relevantCampaigns.find(c => c.id === initialCampaignId);
                    if (target) {
                        setForm(f => ({ ...f, donorId: target.fundOwnerId }));
                        setSelectedCampaignId(target.id);
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [initialCampaignId]);

    // Update if props change later
    useEffect(() => {
        if (initialDonorId) setForm(f => ({ ...f, donorId: initialDonorId }));
        if (initialCampaignId) setSelectedCampaignId(initialCampaignId);
    }, [initialDonorId, initialCampaignId]);

    const filteredCampaigns = useMemo(() => {
        if (!searchTerm) return campaigns;
        const term = searchTerm.toLowerCase();
        return campaigns.filter(c => {
            const user = users.get(c.fundOwnerId);
            return (
                c.title.toLowerCase().includes(term) ||
                String(c.fundOwnerId).includes(term) ||
                user?.fullName?.toLowerCase().includes(term)
            );
        });
    }, [campaigns, searchTerm, users]);

    const selectedCampaign = useMemo(() => {
        if (selectedCampaignId) return campaigns.find(c => c.id === selectedCampaignId);
        return campaigns.find(c => c.fundOwnerId === form.donorId);
    }, [campaigns, selectedCampaignId, form.donorId]);

    const handleSelectDonor = (fundOwnerId: number, campaignId: number) => {
        setForm(f => ({ ...f, donorId: fundOwnerId }));
        setSelectedCampaignId(campaignId);
        setShowDropdown(false);
        setSearchTerm('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convert Date objects to ISO strings for API
        const startTimeISO = (form.startTime as any) instanceof Date ? (form.startTime as any).toISOString() : form.startTime;
        const endTimeISO = (form.endTime as any) instanceof Date ? (form.endTime as any).toISOString() : form.endTime;

        if (!form.donorId || !startTimeISO || !endTimeISO) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (new Date(endTimeISO) <= new Date(startTimeISO)) {
            toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
            return;
        }

        const hoursUntilStart = (new Date(startTimeISO).getTime() - Date.now()) / 3600000;
        if (hoursUntilStart < 24) {
            toast.error(`Lịch hẹn phải được đặt trước tối thiểu 24 tiếng. Hiện tại chỉ còn ${Math.floor(hoursUntilStart)} tiếng đến giờ hẹn.`);
            return;
        }

        setLoading(true);
        try {
            const result = await appointmentService.create({
                ...form,
                startTime: startTimeISO,
                endTime: endTimeISO
            });
            toast.success('Tạo lịch hẹn thành công!');
            onCreated(result.id); 
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Không thể tạo lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-white/20">
                <div className="bg-gradient-to-br from-[#446b5f] to-[#2d4a42] px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                            <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-sm uppercase tracking-widest">Tạo lịch hẹn mới</h2>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Đặt lịch gặp với người dùng</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition text-white border border-white/10">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                    <div className="relative">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Người dùng <span className="text-[#446b5f]">*</span></label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#db5945]/5 focus:border-[#db5945]/30 transition bg-white text-left flex items-center justify-between shadow-sm"
                            >
                                {selectedCampaign ? (
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-black text-gray-900 truncate uppercase tracking-tight">{users.get(form.donorId)?.fullName || `User #${form.donorId}`}</span>
                                        <span className="text-[10px] text-gray-400 font-bold truncate italic">{selectedCampaign.title}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400">Chọn người dùng (có chiến dịch)</span>
                                )}
                                <ChevronDown className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                            </button>
                            {showDropdown && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-64 overflow-hidden border-t-4 border-t-[#446b5f]">
                                    <div className="p-3 border-b border-gray-50 bg-gray-50/30">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            placeholder="Tìm kiếm chiến dịch..."
                                            className="w-full px-4 py-2 text-xs border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#446b5f]/5 focus:border-[#446b5f]/30 font-bold shadow-sm"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="overflow-y-auto max-h-48 custom-scrollbar">
                                        {loadingData ? (
                                            <div className="p-6 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic animate-pulse whitespace-nowrap">Đang tải dữ liệu...</div>
                                        ) : filteredCampaigns.length === 0 ? (
                                            <div className="p-6 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Không thấy kết quả</div>
                                        ) : (
                                            filteredCampaigns.map(campaign => {
                                                const user = users.get(campaign.fundOwnerId);
                                                return (
                                                    <button
                                                        key={campaign.id}
                                                        type="button"
                                                        onClick={() => handleSelectDonor(campaign.fundOwnerId, campaign.id)}
                                                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${(selectedCampaignId === campaign.id || (!selectedCampaignId && form.donorId === campaign.fundOwnerId)) ? 'bg-orange-50/50' : ''}`}
                                                    >
                                                        <div className="font-black text-[11px] text-gray-900 truncate uppercase tracking-tight">{campaign.title}</div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5 font-bold">{user?.fullName || `User #${campaign.fundOwnerId}`}</div>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <input type="hidden" value={form.donorId} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Bắt đầu <span className="text-[#446b5f]">*</span></label>
                            <DatePicker
                                selected={form.startTime ? new Date(form.startTime) : null}
                                onChange={(date: Date | null) => setForm(f => ({ ...f, startTime: date ? date.toISOString() : '' }))}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="dd/MM/yyyy HH:mm"
                                placeholderText="Ngày & giờ bắt đầu"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#db5945]/5 focus:border-[#db5945]/30 transition bg-white shadow-sm"
                                minDate={new Date(Date.now() + 24 * 3600000)}
                                minTime={form.startTime && new Date(form.startTime).toDateString() === new Date(Date.now() + 24 * 3600000).toDateString() ? new Date(Date.now() + 24 * 3600000) : new Date(new Date().setHours(0, 0, 0, 0))}
                                maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Kết thúc <span className="text-[#446b5f]">*</span></label>
                            <DatePicker
                                selected={form.endTime ? new Date(form.endTime) : null}
                                onChange={(date: Date | null) => setForm(f => ({ ...f, endTime: date ? date.toISOString() : '' }))}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="dd/MM/yyyy HH:mm"
                                placeholderText="Ngày & giờ kết thúc"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#db5945]/5 focus:border-[#db5945]/30 transition bg-white shadow-sm"
                                minDate={form.startTime ? new Date(form.startTime) : new Date(Date.now() + 24 * 3600000)}
                                minTime={form.endTime && form.startTime && new Date(form.endTime).toDateString() === new Date(form.startTime).toDateString() ? new Date(form.startTime) : new Date(new Date().setHours(0, 0, 0, 0))}
                                maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Địa điểm</label>
                        <input type="text" value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Nhập địa điểm gặp mặt..." className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#db5945]/5 focus:border-[#db5945]/30 transition bg-white shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Mục đích</label>
                        <textarea value={form.purpose || ''} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Mô tả nội dung cuộc hẹn..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#db5945]/5 focus:border-[#db5945]/30 transition bg-white shadow-sm resize-none" />
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-gray-50">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition active:scale-95 shadow-sm">Hủy bỏ</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#446b5f] to-[#5a8075] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#446b5f]/20 active:scale-95">
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {loading ? 'Đang xử lý...' : 'Tạo lịch hẹn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
