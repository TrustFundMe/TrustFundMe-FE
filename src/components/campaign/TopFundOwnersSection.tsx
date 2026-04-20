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
                whileHover={{ y: -10 }}
                className="relative group overflow-hidden rounded-sm aspect-[3/4] cursor-pointer"
            >
                <img
                    src={owner.userAvatarUrl || "/assets/img/default-avatar.png"}
                    alt={owner.userFullName}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                    <h4 className="text-xl font-bold uppercase tracking-wider mb-1">
                        {owner.userFullName}
                    </h4>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[#F84D43]">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-bold">{owner.totalScore.toFixed(1)}</span>
                        </div>
                        {owner.campaignCount !== undefined && (
                            <span className="text-slate-300 text-xs uppercase tracking-widest">
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
            <section className="w-full py-20 bg-[#F7F3F0]">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#F84D43] border-r-transparent"></div>
                </div>
            </section>
        );
    }

    if (owners.length === 0) return null;

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
                    {owners.map((owner) => (
                        <OwnerCard key={owner.userId} owner={owner} />
                    ))}
                </div>
            </div>
        </section>
    );
};
