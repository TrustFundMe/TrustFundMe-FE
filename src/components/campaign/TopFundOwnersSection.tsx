"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface FundOwner {
    id: number;
    name: string;
    reputation: number;
    image: string;
    count: number;
}

const MOCK_OWNERS: FundOwner[] = [
    {
        id: 1,
        name: "Nguyễn Văn An",
        reputation: 9.8,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
        count: 24,
    },
    {
        id: 2,
        name: "Trần Thị Bình",
        reputation: 9.5,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
        count: 18,
    },
    {
        id: 3,
        name: "Phạm Minh Đức",
        reputation: 9.2,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
        count: 15,
    },
];

const OwnerCard = ({ owner }: { owner: FundOwner }) => {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="relative group overflow-hidden rounded-sm aspect-[3/4] cursor-pointer"
        >
            <img
                src={owner.image}
                alt={owner.name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                <h4 className="text-xl font-bold uppercase tracking-wider mb-1">
                    {owner.name}
                </h4>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[#F84D43]">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-bold">{owner.reputation}</span>
                    </div>
                    <span className="text-slate-300 text-xs uppercase tracking-widest">
                        • {owner.count} Chiến dịch
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export const TopFundOwnersSection = () => {
    return (
        <section className="w-full py-20 bg-[#F7F3F0]">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="text-[#F84D43] text-sm font-bold uppercase tracking-[0.3em] mb-4">
                        CHỦ QUỸ UY TÍN • CỘNG ĐỒNG • LAN TỎA
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 uppercase tracking-tight">
                        Kết nối với những người như bạn
                    </h2>
                    <p className="text-slate-600 leading-relaxed italic">
                        "Tìm kiếm và đồng hành cùng những người dẫn đầu đầy tâm huyết. Chúng tôi ở đây để giúp bạn kết nối với những chủ quỹ uy tín nhất, đảm bảo mọi sự đóng góp của bạn đều đi đúng hướng và tạo ra thay đổi thực sự."
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {MOCK_OWNERS.map((owner) => (
                        <OwnerCard key={owner.id} owner={owner} />
                    ))}
                </div>
            </div>
        </section>
    );
};
