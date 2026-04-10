import { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import { paymentService, RecentDonor } from "@/services/paymentService";
import { TrustPagination } from "@/components/ui/TrustPagination";

type DonorsModalProps = {
    campaignId: number;
    onClose: () => void;
};

// Lowering page size for demonstration/small lists as requested to see pagination
const PAGE_SIZE = 5;

function formatTimeAgo(dateString: string) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "Vừa xong";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ph`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`;

        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        return dateString;
    }
}

export default function DonorsModal({ campaignId, onClose }: DonorsModalProps) {
    const [donors, setDonors] = useState<RecentDonor[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);

    useEffect(() => {
        const fetchDonors = async () => {
            try {
                const data = await paymentService.getRecentDonors(campaignId, 100);
                setDonors(data);
            } catch (error) {
                console.error("Failed to fetch all donors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDonors();
    }, [campaignId]);

    const paginatedDonors = useMemo(() => {
        const start = page * PAGE_SIZE;
        return donors.slice(start, start + PAGE_SIZE);
    }, [donors, page]);

    const totalPages = Math.ceil(donors.length / PAGE_SIZE) || 1;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden"
                style={{ maxHeight: 'calc(100vh - 120px)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Super Compact */}
                <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h3 className="text-sm font-black text-gray-900 tracking-tight leading-none mb-0.5">Danh sách ủng hộ</h3>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                            {donors.length} lượt quyên góp
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all active:scale-95"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content - No extra padding on outer, tight rows */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-50">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-white">
                                    <div className="w-9 h-9 bg-gray-50 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-2.5 bg-gray-50 rounded w-1/2 mb-1.5"></div>
                                        <div className="h-2 bg-gray-50 rounded w-1/4"></div>
                                    </div>
                                    <div className="w-12 h-2.5 bg-gray-50 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : donors.length === 0 ? (
                        <div className="text-center py-20 bg-white">
                            <div className="text-gray-300 mb-2">
                                <svg className="w-10 h-10 mx-auto mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="text-sm font-black text-gray-400">Trống</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {paginatedDonors.map((donor, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 px-3 py-1.5 border-b border-r border-gray-50 hover:bg-gray-50 transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                        <img
                                            src={donor.donorAvatar || "/assets/img/defaul.jpg"}
                                            alt={donor.donorName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/assets/img/defaul.jpg";
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-black text-gray-900 truncate">
                                            {donor.anonymous ? "Người ẩn danh" : donor.donorName}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {formatTimeAgo(donor.createdAt)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[13px] font-black text-[#dc2626] tracking-tight">
                                            {donor.amount.toLocaleString('vi-VN')} đ
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Always show pagination to verify */}
                <TrustPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalElements={donors.length}
                    pageSize={PAGE_SIZE}
                    forceShow={true}
                />
            </div>
        </div>
    );
}
