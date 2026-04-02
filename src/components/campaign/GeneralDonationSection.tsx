"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { campaignService } from "@/services/campaignService";
import { paymentService, CreatePaymentRequest } from "@/services/paymentService";
import { useAuth } from "@/contexts/AuthContextProxy";
import { CampaignDto } from "@/types/campaign";
import toast from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
} from "@/components/ui/dialog";

export const GeneralDonationSection = () => {
    const [campaign, setCampaign] = useState<CampaignDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const [selectedAmount, setSelectedAmount] = useState<number>(50000);
    const [tipPercent, setTipPercent] = useState<number>(10);
    const [paymentMethod, setPaymentMethod] = useState<string>("payos");
    const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
    const [agreed, setAgreed] = useState<boolean>(false);

    const { user } = useAuth();

    useEffect(() => {
        const fetchCampaign = async () => {
            setLoading(true);
            try {
                const data = await campaignService.getById(1);
                setCampaign(data);
            } catch (error) {
                console.error("Error fetching general fund:", error);
                toast.error("Không thể tải thông tin quỹ chung");
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, []);

    const tipAmount = (selectedAmount * tipPercent) / 100;
    const totalAmount = selectedAmount + tipAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            toast.error("Vui lòng đồng ý với điều khoản");
            setShowTerms(true);
            return;
        }
        if (selectedAmount < 2000) {
            toast.error("Số tiền tối thiểu là 2.000 đ");
            return;
        }

        setSubmitting(true);
        try {
            const userIdStr = user?.id ? user.id.toString() : "GUEST";
            const description = `USER${userIdStr}FUND1`;

            const payload: CreatePaymentRequest = {
                donorId: user?.id || null,
                campaignId: 1, // General Fund ID
                donationAmount: selectedAmount,
                tipAmount: tipAmount,
                description: description,
                isAnonymous: isAnonymous,
                items: []
            };

            const response = await paymentService.createPayment(payload);
            if (response.paymentUrl) {
                window.location.href = response.paymentUrl;
            } else {
                toast.error("Không nhận được link thanh toán");
            }
        } catch (error: any) {
            console.error("Payment error:", error);
            toast.error(error?.response?.data?.message || "Lỗi khi tạo giao dịch thanh toán");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAgree = () => {
        setAgreed(true);
        setShowTerms(false);
    };

    const amountPresets = [20000, 50000, 100000, 200000];

    const getFundTypeLabel = (type?: string | null) => {
        switch (type) {
            case "GENERAL_FUND": return "Quỹ Chung";
            case "AUTHORIZED": return "Quỹ Ủy Quyền";
            case "ITEMIZED": return "Quỹ Vật Phẩm";
            default: return "Cứu Trợ";
        }
    };

    if (loading) {
        return (
            <div className="w-full py-40 flex items-center justify-center bg-[#F9FBFC]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-[#F84D43]" />
                    <p className="text-slate-400 font-medium animate-pulse">Đang tải thông tin quỹ...</p>
                </div>
            </div>
        );
    }

    return (
        <section id="general-donation" className="w-full py-20 bg-[#F9FBFC] border-t border-slate-100 scroll-mt-32">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 items-center max-w-6xl mx-auto">
                    {/* Left Panel: Information */}
                    <div className="w-full lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <p className="text-[#F84D43] text-[12px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                <span className="w-6 h-[2px] bg-[#F84D43]"></span>
                                Trao gửi yêu thương
                            </p>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
                                {campaign?.title || "Chung tay vì một cộng đồng tốt đẹp hơn"}
                            </h2>
                            <p className="text-slate-500 text-base mb-8 leading-relaxed">
                                {campaign?.description || "Mọi sự đóng góp của bạn, dù lớn hay nhỏ, đều là nguồn động viên to lớn giúp chúng tôi tiếp tục sứ mệnh lan tỏa yêu thương."}
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                                        <MapPin className="h-6 w-6 text-[#F84D43]" />
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-widest mb-0.5">Địa chỉ</h4>
                                        <p className="text-slate-600 text-sm font-medium">FPT University, Thủ Đức, TP. HCM</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                                        <Phone className="h-6 w-6 text-[#F84D43]" />
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-widest mb-0.5">Điện thoại</h4>
                                        <p className="text-slate-600 text-sm font-medium">+1 100 234 5909</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                                        <Mail className="h-6 w-6 text-[#F84D43]" />
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-widest mb-0.5">Email</h4>
                                        <p className="text-slate-600 text-sm font-medium">trustfundme@co.vn</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Panel: Polished Form Card (Compact) */}
                    <div className="w-full lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden"
                        >
                            {/* Header Section */}
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="w-5 h-[4px] rounded-full bg-[#F84D43]"></span>
                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                        {getFundTypeLabel(campaign?.type)}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Amount Picker */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-4 gap-2">
                                        {amountPresets.map((amt) => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setSelectedAmount(amt)}
                                                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all duration-300 border-2 ${selectedAmount === amt
                                                    ? "bg-[#F84D43] border-[#F84D43] text-white shadow-md shadow-red-100 scale-105"
                                                    : "bg-white border-slate-50 text-slate-400 hover:border-slate-100"
                                                    }`}
                                            >
                                                {amt.toLocaleString("vi-VN").replace(/,000$/, ".000")}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                            <span className="text-[#F84D43] text-xl font-bold">đ</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={selectedAmount.toLocaleString("vi-VN")}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                                                setSelectedAmount(Number(val) || 0);
                                            }}
                                            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-50 rounded-xl text-2xl font-extrabold text-slate-900 focus:outline-none focus:border-slate-100 transition-all text-left"
                                        />
                                    </div>
                                </div>

                                {/* Summary Box (Halved Height) */}
                                <div className="bg-[#F8F9FA] rounded-xl p-2 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tổng đóng góp</p>
                                        <p className="text-lg font-black text-slate-900">{totalAmount.toLocaleString("vi-VN")} đ</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-white">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" strokeWidth="2.5">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                    </div>
                                </div>

                                {/* Tip Slider */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                        <span className="text-slate-400">Tip ({tipPercent}%)</span>
                                        <span className="text-slate-900">+ {tipAmount.toLocaleString("vi-VN")} đ</span>
                                    </div>
                                    <div className="relative pt-0.5 pb-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="30"
                                            step="5"
                                            value={tipPercent}
                                            onChange={(e) => setTipPercent(Number(e.target.value))}
                                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#F84D43]"
                                        />
                                        <div className="flex justify-between px-1 mt-1.5 text-[8px] font-bold text-slate-300">
                                            <span>0%</span>
                                            <span>10%</span>
                                            <span>20%</span>
                                            <span>30%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thanh toán</p>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {[
                                            {
                                                id: "payos", name: "PayOS", icon: (
                                                    <div className="flex gap-0.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-800"></div>
                                                    </div>
                                                )
                                            }
                                        ].map((method) => (
                                            <label
                                                key={method.id}
                                                className={`flex items-center justify-between p-2 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id
                                                    ? "border-slate-100 bg-white"
                                                    : "border-slate-50 bg-slate-50/30 hover:border-slate-100"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-50">
                                                        {method.icon}
                                                    </div>
                                                    <span className="font-bold text-[13px] text-slate-700">{method.name}</span>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    checked={paymentMethod === method.id}
                                                    onChange={() => setPaymentMethod(method.id)}
                                                    className="w-3.5 h-3.5 accent-[#F84D43]"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="space-y-3 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={isAnonymous}
                                                onChange={() => setIsAnonymous(!isAnonymous)}
                                                className="peer hidden"
                                            />
                                            <div className="w-5 h-5 border-2 border-slate-200 rounded-md peer-checked:bg-[#F84D43] peer-checked:border-[#F84D43] transition-all"></div>
                                            <svg className="absolute top-0.5 left-0.5 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">Quyên góp ẩn danh</span>
                                    </label>

                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={agreed}
                                                    onChange={() => setAgreed(!agreed)}
                                                    className="peer hidden"
                                                />
                                                <div className="w-5 h-5 border-2 border-slate-200 rounded-md peer-checked:bg-[#F84D43] peer-checked:border-[#F84D43] transition-all"></div>
                                                <svg className="absolute top-0.5 left-0.5 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </label>
                                        <p className="text-xs font-bold text-slate-600">
                                            Tôi đồng ý với <button type="button" onClick={() => setShowTerms(true)} className="text-[#F84D43] underline hover:text-red-600 transition-colors">điều khoản & cam kết</button>
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submitting || !agreed}
                                    className={`w-full ${agreed ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"} text-white font-black py-2.5 text-xs rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest mt-1 flex items-center justify-center gap-2`}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        "Thanh toán ngay"
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions Modal */}
            <Dialog open={showTerms} onOpenChange={setShowTerms}>
                <DialogContent className="max-w-5xl">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-[#F84D43] rounded-full"></span>
                            Cam Kết Đồng Hành Cùng Quỹ Chung
                        </DialogTitle>
                    </DialogHeader>
                    <DialogBody className="text-slate-600 leading-relaxed space-y-3 max-h-[80vh] overflow-y-auto px-8 custom-scrollbar">
                        <p className="font-medium text-slate-900 border-l-4 border-slate-100 pl-4 py-1 italic text-sm">
                            "Khi bạn trao đi tấm lòng mình vào Quỹ Chung của TrustFundME, bạn không chỉ gửi gắm một khoản tài chính, mà còn là niềm tin và hy vọng dành cho những hoàn cảnh đang cần sự trợ giúp khẩn cấp nhất."
                        </p>

                        <p className="text-xs">Bằng việc xác nhận đóng góp, bạn thấu hiểu và đồng thuận rằng:</p>

                        <div className="space-y-3 pt-0.5">
                            <div className="flex gap-4">
                                <div className="h-5 w-5 rounded-full bg-red-50 text-[#F84D43] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                                <div>
                                    <h5 className="font-bold text-slate-900 text-xs mb-0.5 uppercase tracking-wider">Sứ mệnh điều tiết</h5>
                                    <p className="text-xs">Quỹ Chung là nguồn lực dự phòng chiến lược. Platform nắm toàn quyền quyết định điều tiết, hỗ trợ hoặc thu hồi nguồn vốn giữa các chiến dịch dựa trên mức độ ưu tiên và tính cấp thiết.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-5 w-5 rounded-full bg-red-50 text-[#F84D43] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                                <div>
                                    <h5 className="font-bold text-slate-900 text-xs mb-0.5 uppercase tracking-wider">Minh bạch và Trách nhiệm</h5>
                                    <p className="text-xs">Chúng tôi cam kết sử dụng nguồn lực này tối ưu và công bằng nhất. Mọi sự chuyển dịch ngân sách đều hướng tới mục tiêu duy nhất: Tận dụng triệt để mọi đồng tiền của cộng đồng để không ai bị bỏ lại phía sau.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-5 w-5 rounded-full bg-red-50 text-[#F84D43] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                                <div>
                                    <h5 className="font-bold text-slate-900 text-xs mb-0.5 uppercase tracking-wider">Niềm tin trọn vẹn</h5>
                                    <p className="text-xs">Bạn trao cho chúng tôi quyền đại diện để đưa ra những quyết định tài chính nhanh chóng và hiệu quả nhất trong những tình huống ngặt nghèo mà quy trình gây quỹ thông thường không thể đáp ứng kịp.</p>
                                </div>
                            </div>
                        </div>

                        <p className="pt-2 text-center font-bold text-[#F84D43] text-xs italic">
                            Cảm ơn bạn đã tin tưởng và cùng chúng tôi viết tiếp những câu truyện về lòng nhân ái.
                        </p>
                    </DialogBody>
                    <DialogFooter className="gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowTerms(false)}
                            className="flex-1 border-slate-200 font-bold uppercase tracking-widest text-[10px] h-9"
                        >
                            Đóng
                        </Button>
                        <Button
                            onClick={handleAgree}
                            className="flex-1 bg-[#F84D43] hover:bg-red-600 text-white font-bold uppercase tracking-widest text-[10px] h-9 shadow-md shadow-red-100"
                        >
                            Tôi đồng ý và tiếp tục
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
};
