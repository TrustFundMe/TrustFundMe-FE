"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const GeneralDonationSection = () => {
    const [selectedAmount, setSelectedAmount] = React.useState<number>(50000);
    const [tipPercent, setTipPercent] = React.useState<number>(10);
    const [paymentMethod, setPaymentMethod] = React.useState<string>("payos");
    const [isAnonymous, setIsAnonymous] = React.useState<boolean>(false);
    const [agreed, setAgreed] = React.useState<boolean>(false);

    const tipAmount = (selectedAmount * tipPercent) / 100;
    const totalAmount = selectedAmount + tipAmount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Payment submitted:", { selectedAmount, tipPercent, totalAmount, paymentMethod, isAnonymous });
        alert("Chuyển hướng đến cổng thanh toán...");
    };

    const amountPresets = [20000, 50000, 100000, 200000];

    return (
        <section id="general-donation" className="w-full py-20 bg-[#F9FBFC] border-t border-slate-100">
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
                                Chung tay vì một cộng đồng tốt đẹp hơn
                            </h2>
                            <p className="text-slate-500 text-base mb-8 leading-relaxed">
                                Mọi sự đóng góp của bạn, dù lớn hay nhỏ, đều là nguồn động viên to lớn giúp chúng tôi tiếp tục sứ mệnh lan tỏa yêu thương.
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
                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em]">Quỹ Ủy Quyền</span>
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
                                        <p className="text-xs font-bold text-slate-600">
                                            Tôi đồng ý với <span className="text-[#F84D43] underline">điều khoản & cam kết</span>
                                        </p>
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!agreed}
                                    className="w-full bg-[#8E9093] hover:bg-slate-700 text-white font-black py-2.5 text-xs rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest mt-1"
                                >
                                    Thanh toán ngay
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
