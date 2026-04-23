"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Globe, PackageOpen, X, Info } from "lucide-react";
import Link from "next/link";

/* ─── Small Popup Modal ────────────────────────────────────────────────── */
function FundInfoPopup({
    title,
    description,
    details,
    onClose,
}: {
    title: string;
    description: string;
    details: string[];
    onClose: () => void;
}) {
    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />

                {/* Card */}
                <motion.div
                    className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6"
                    initial={{ opacity: 0, scale: 0.88, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, y: 24 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                        <Info className="h-5 w-5 text-[#F84D43] shrink-0" />
                        <h4 className="text-base font-bold text-slate-900">{title}</h4>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{description}</p>

                    {/* Details list */}
                    {details.length > 0 && (
                        <ul className="space-y-2">
                            {details.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#F84D43] shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

/* ─── Fund definitions ─────────────────────────────────────────────────── */
const FUND_INFO: Record<string, { description: string; details: string[] }> = {
    "Quỹ Ủy Quyền": {
        description:
            "Quỹ Ủy Quyền cho phép nhà hảo tâm ủy thác toàn bộ việc phân bổ và quản lý số tiền quyên góp cho đội ngũ chuyên trách của chúng tôi, đảm bảo nguồn lực được sử dụng hiệu quả nhất.",
        details: [
            "Được kiểm duyệt bởi quản trị viên hệ thống.",
            "Minh bạch 100% — mọi giao dịch đều được ghi nhận và công khai.",
            "Phù hợp với người muốn đóng góp nhưng không có thời gian theo dõi chi tiết.",
        ],
    },
    "Quỹ Vật Phẩm": {
        description:
            "Quỹ Vật Phẩm cho phép người dùng quyên góp tiền để mua vật phẩm thiết yếu theo danh sách cụ thể, thời gian bắt đầu, kết thúc từng giai đoạn rõ ràng, minh bạch",
        details: [
            "Danh sách vật phẩm được xác định rõ ràng trước khi quyên góp.",
            "Nhà hảo tâm có thể chọn tài trợ một phần hoặc toàn bộ danh sách.",
            "Vật phẩm được kiểm tra bởi quản trị viên hệ thống đảm bảo giá cả không chênh lệch quá nhiều.",
            "Tránh lãng phí, đảm bảo đúng nhu cầu của người thụ hưởng.",
            "Minh bạch 100% — mọi giao dịch đều được ghi nhận và công khai.",
        ],
    },
};

/* ─── Card ─────────────────────────────────────────────────────────────── */
const FundTypeCard = ({
    title,
    subtitle,
    description,
    Icon,
    bgColor,
    isMiddle = false,
    href,
    ctaLabel,
    hasInfoPopup = false,
}: {
    title: string;
    subtitle?: string;
    description: string;
    Icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    isMiddle?: boolean;
    href: string;
    ctaLabel: string;
    hasInfoPopup?: boolean;
}) => {
    const [showPopup, setShowPopup] = useState(false);
    const info = FUND_INFO[title];

    return (
        <>
            <div
                className={`relative flex flex-col items-center justify-center text-center p-8 md:p-12 transition-all duration-500 ${isMiddle ? "md:scale-105 z-10 shadow-xl py-12 md:py-16" : ""
                    }`}
                style={{ backgroundColor: bgColor }}
            >
                {/* Info button — only for Quỹ Ủy Quyền & Quỹ Vật Phẩm */}
                {hasInfoPopup && (
                    <button
                        onClick={() => setShowPopup(true)}
                        title="Xem thông tin quỹ"
                        className="absolute top-4 right-4 rounded-full bg-black/10 p-1.5 text-slate-700 hover:bg-black/20 transition-colors duration-200"
                    >
                        <Info className="h-4 w-4" />
                    </button>
                )}

                <div className="mb-6 rounded-full bg-black/5 p-4">
                    <Icon className="h-10 w-10 md:h-12 md:w-12 text-slate-800 stroke-[1.5]" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-slate-900 mb-2">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-700 mb-4">
                        {subtitle}
                    </p>
                )}
                <p className="text-sm md:text-base text-slate-800/80 leading-relaxed max-w-xs mb-8">
                    {description}
                </p>

                {/* CTA: "Xem quỹ" links to the list; "Quyên góp" stays as before */}
                {hasInfoPopup ? (
                    <button
                        onClick={() => setShowPopup(true)}
                        className="inline-block border-2 border-slate-900 px-8 py-2 text-sm font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-colors duration-300"
                    >
                        Xem quỹ
                    </button>
                ) : (
                    <Link
                        href={href}
                        className="inline-block border-2 border-slate-900 px-8 py-2 text-sm font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-colors duration-300"
                    >
                        {ctaLabel}
                    </Link>
                )}
            </div>

            {/* Popup */}
            {showPopup && info && (
                <FundInfoPopup
                    title={title}
                    description={info.description}
                    details={info.details}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </>
    );
};

/* ─── Section ───────────────────────────────────────────────────────────── */
export const FundTypeSection = () => {
    return (
        <section className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 w-full border-b border-slate-200">
                <FundTypeCard
                    title="Quỹ Ủy Quyền"
                    subtitle="Authorized Fund"
                    description="Trao gửi niềm tin để chúng tôi tối ưu hóa sự đóng góp của bạn."
                    Icon={ShieldCheck}
                    bgColor="#CD6E57"
                    href="/campaigns/authorized"
                    ctaLabel="Khám phá"
                    hasInfoPopup
                />
                <FundTypeCard
                    title="Quỹ Chung"
                    subtitle="General Fund"
                    description="Nguồn dự phòng cộng đồng để cùng nhau giải quyết những vấn đề cấp bách nhất."
                    Icon={Globe}
                    bgColor="#AFBCAE"
                    isMiddle={true}
                    href="#general-donation"
                    ctaLabel="Quyên góp"
                />
                <FundTypeCard
                    title="Quỹ Vật Phẩm"
                    subtitle="Item-based Fund"
                    description="Quyên góp theo danh sách đồ dùng thiết yếu cho những hoàn cảnh khó khăn được lựa chọn bởi bạn."
                    Icon={PackageOpen}
                    bgColor="#EBCA8F"
                    href="/campaigns/items"
                    ctaLabel="Khám phá"
                    hasInfoPopup
                />
            </div>
        </section>
    );
};
