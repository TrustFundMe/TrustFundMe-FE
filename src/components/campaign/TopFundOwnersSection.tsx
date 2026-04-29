"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { trustScoreService, LeaderboardEntry } from "@/services/trustScoreService";
import { campaignService } from "@/services/campaignService";
import Link from "next/link";

interface FundOwner extends LeaderboardEntry {
    campaignCount?: number;
}

const OwnerCard = ({ owner }: { owner: FundOwner }) => {
    return (
        <Link href={`/fund-owner-details?id=${owner.userId}`}>
            <motion.div
                whileHover={{ y: -6 }}
                className="relative group overflow-hidden rounded-sm aspect-[4/5] cursor-pointer"
            >
                <img
                    src={owner.userAvatarUrl || "/assets/img/default-avatar.png"}
                    alt={owner.userFullName}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                    <h4 className="text-sm font-bold uppercase tracking-wide mb-0.5 line-clamp-1">
                        {owner.userFullName}
                    </h4>
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 text-[#ff5e14]">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="text-xs font-bold">{owner.totalScore.toFixed(1)}</span>
                        </div>
                        {owner.campaignCount !== undefined && (
                            <span className="text-slate-300 text-[10px] uppercase tracking-wide">
                                • {owner.campaignCount} Chiến dịch
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export const TopFundOwnersSection = () => {
    const [owners, setOwners] = useState<FundOwner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const leaderboard = await trustScoreService.getLeaderboard(3);

                // Fetch campaign counts for each top owner
                const ownersWithCounts = await Promise.all(
                    leaderboard.map(async (entry) => {
                        try {
                            const count = await campaignService.getCampaignCount(entry.userId);
                            return { ...entry, campaignCount: count };
                        } catch (err) {
                            return entry;
                        }
                    })
                );

                setOwners(ownersWithCounts);
            } catch (error) {
                console.error("Error fetching top fund owners:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <section className="w-full py-12 bg-[#F7F3F0]">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#ff5e14] border-r-transparent"></div>
                </div>
            </section>
        );
    }

    if (owners.length === 0) return null;

    return (
        <section className="w-full py-12 bg-[#F7F3F0]">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-8">
                    <p className="text-[#ff5e14] text-[11px] font-bold uppercase tracking-[0.24em] mb-3">
                        CHỦ QUỸ UY TÍN • CỘNG ĐỒNG • LAN TỎA
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 uppercase tracking-tight">
                        Kết nối với những người như bạn
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                        "Tìm kiếm và đồng hành cùng những người dẫn đầu đầy tâm huyết. Chúng tôi ở đây để giúp bạn kết nối với những chủ quỹ uy tín nhất, đảm bảo mọi sự đóng góp của bạn đều đi đúng hướng và tạo ra thay đổi thực sự."
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {owners.map((owner) => (
                        <OwnerCard key={owner.userId} owner={owner} />
                    ))}
                </div>
            </div>
        </section>
    );
};
