"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Globe, PackageOpen } from "lucide-react";
import Link from "next/link";

const FundTypeCard = ({
    title,
    subtitle,
    description,
    Icon,
    bgColor,
    isMiddle = false,
    href,
    ctaLabel,
}: {
    title: string;
    subtitle?: string;
    description: string;
    Icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    isMiddle?: false | true;
    href: string;
    ctaLabel: string;
}) => {
    return (
        <div
            className={`flex flex-col items-center justify-center text-center p-8 md:p-12 transition-all duration-500 ${isMiddle ? "md:scale-105 z-10 shadow-xl py-12 md:py-16" : ""
                }`}
            style={{ backgroundColor: bgColor }}
        >
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
            <Link
                href={href}
                className="inline-block border-2 border-slate-900 px-8 py-2 text-sm font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-colors duration-300"
            >
                {ctaLabel}
            </Link>
        </div>
    );
};

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
                    ctaLabel="Xem quỹ"
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
                    ctaLabel="Xem quỹ"
                />
            </div>
        </section>
    );
};
