import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, CheckCircle2, Search, ArrowUpDown, ChevronDown } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { paymentService, CampaignProgress } from '@/services/paymentService';
import { CampaignDto } from '@/types/campaign';
import { TrustPagination } from '@/components/ui/TrustPagination';

const CampaignCard = ({ campaign }: { campaign: CampaignDto }) => {
    const [progressData, setProgressData] = useState<CampaignProgress | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(true);

    const isMandated = campaign.type === 'AUTHORIZED';
    const isItemized = campaign.type === 'ITEMIZED';
    const typeLabel = isMandated ? 'Quỹ Ủy Quyền' : isItemized ? 'Quỹ Vật Phẩm' : 'Chiến dịch';

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const data = await paymentService.getCampaignProgress(campaign.id);
                setProgressData(data);
            } catch (error) {
                console.error("Error fetching progress for card:", error);
            } finally {
                setLoadingProgress(false);
            }
        };
        fetchProgress();
    }, [campaign.id]);

    const progress = progressData?.progressPercentage || 0;
    const donorCount = progressData?.donorCount || 0;

    const isFinished = ['SETTLED', 'CLOSED', 'COMPLETED', 'EVIDENCE_COMPLETED'].includes(campaign.status);

    const getStatusLabel = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'Đang chờ duyệt';
            case 'APPROVAL':
            case 'APPROVED': return 'Đã duyệt';
            case 'ACTIVE': return 'Đang hoạt động';
            case 'SETTLED': return 'Đã tất toán';
            case 'CLOSED': return 'Đã đóng';
            case 'EVIDENCE_COMPLETED': return 'Đã hoàn tất bằng chứng';
            case 'REJECTED': return 'Bị từ chối';
            case 'PAUSED': return 'Tạm dừng';
            case 'COMPLETED': return 'Hoàn thành';
            default: return status;
        }
    };

    return (
        <Link href={`/campaigns/${campaign.id}`} className="campaign-card-link">
            <div className="campaign-card">
                <div className="card-image">
                    <Image
                        src={campaign.coverImageUrl || "/assets/img/defaul.jpg"}
                        alt={campaign.title}
                        fill
                        className="img"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <span className={`type-badge ${campaign.type?.toLowerCase() || 'other'}`}>{typeLabel}</span>
                    <span className="status-overlay">{getStatusLabel(campaign.status)}</span>
                </div>
                <div className="card-content">
                    <h4 className="card-title">{campaign.title}</h4>
                    {isFinished ? (
                        <div className="finished-status">
                            <CheckCircle2 size={16} />
                            <span>{getStatusLabel(campaign.status)}</span>
                        </div>
                    ) : (
                        <>
                            <div className="progress-section">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="progress-info">
                                    <span className="percent">{progress}%</span>
                                    <span className="label">Đã đạt</span>
                                </div>
                            </div>
                            <div className="card-footer">
                                <div className="donors">
                                    <Users size={14} />
                                    <span>{donorCount} Người ủng hộ</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <style jsx>{`
            .campaign-card-link { text-decoration: none; color: inherit; display: block; }
            .campaign-card { background: #fff; border-radius: 12px; border: 1px solid #f1f5f9; overflow: hidden; transition: all 0.2s ease; position: relative; height: 100%; display: flex; flex-direction: column; }
            .campaign-card:hover { transform: translateY(-3px); border-color: #fee2e2; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
            .card-image { position: relative; width: 100%; height: 140px; flex-shrink: 0; }
            .img { object-fit: cover; }
            .type-badge { position: absolute; top: 12px; left: 12px; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; z-index: 2; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #0f172a; border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
            .status-overlay { position: absolute; bottom: 8px; right: 8px; background: rgba(255, 255, 255, 0.9); color: #1e293b; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; z-index: 2; }
            .card-content { padding: 12px; flex: 1; display: flex; flex-direction: column; }
            .card-title { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0; height: 40px; overflow: hidden; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
            .progress-section { margin-bottom: 8px; }
            .progress-bar { height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
            .progress-fill { height: 100%; background: #dc2626; border-radius: 2px; transition: width 0.3s ease; }
            .progress-info { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; }
            .percent { color: #dc2626; }
            .label { color: #94a3b8; }
            .card-footer { display: flex; align-items: center; color: #64748b; font-size: 11px; font-weight: 600; margin-top: auto; }
            .donors { display: flex; align-items: center; gap: 4px; }
            .finished-status { display: flex; align-items: center; gap: 6px; color: #991b1b; font-size: 11px; font-weight: 700; background: #fef2f2; padding: 6px; border-radius: 6px; margin-top: auto; }
          `}</style>
            </div>
        </Link>
    );
};

interface CampaignsTabProps {
    id: string | number;
}

const CampaignsTab = ({ id }: CampaignsTabProps) => {
    const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('NEWEST');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');

    const pageSize = 8;

    const allStatuses = [
        { val: 'ALL', label: 'Tất cả trạng thái' },
        { val: 'PENDING', label: 'Đang chờ duyệt' },
        { val: 'APPROVED', label: 'Đã duyệt' },
        { val: 'ACTIVE', label: 'Đang hoạt động' },
        { val: 'SETTLED', label: 'Đã tất toán' },
        { val: 'CLOSED', label: 'Đã đóng' },
        { val: 'COMPLETED', label: 'Hoàn thành' },
        { val: 'EVIDENCE_COMPLETED', label: 'Hoàn tất bằng chứng' }
    ];

    const allTypes = [
        { val: 'ALL', label: 'Tất cả loại hình' },
        { val: 'AUTHORIZED', label: 'Quỹ ủy quyền' },
        { val: 'ITEMIZED', label: 'Quỹ vật phẩm' }
    ];

    useEffect(() => {
        const fetchCampaigns = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await campaignService.getUserCampaignsPaginated(id, page, pageSize);
                setCampaigns(res.content || []);
                setTotalPages(res.totalPages || 0);
                setTotalElements(res.totalElements || 0);
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, [id, page]);

    const filteredCampaigns = campaigns
        .filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter || (statusFilter === 'APPROVED' && c.status === 'APPROVAL');
            const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        })
        .sort((a, b) => {
            if (sortOrder === 'NEWEST') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            if (sortOrder === 'OLDEST') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            return 0;
        });

    return (
        <div className="campaigns-tab">
            <div className="premium-filter-bar">
                <div className="left-controls">
                    <div className="search-group-container">
                        <div className="search-input-wrapper">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm chiến dịch"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="dropdown-controls">
                        <div className="dropdown-box">
                            <ArrowUpDown size={14} className="icon" />
                            <span>Sắp xếp theo</span>
                            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                <option value="NEWEST">Mới nhất</option>
                                <option value="OLDEST">Cũ nhất</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="right-controls">
                    <div className="dropdown-box status-dropdown">
                        <ChevronDown size={14} className="icon" />
                        <span>Trạng thái</span>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            {allStatuses.map(s => (
                                <option key={s.val} value={s.val}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="dropdown-box type-dropdown">
                        <ChevronDown size={14} className="icon" />
                        <span>Loại quỹ</span>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            {allTypes.map(t => (
                                <option key={t.val} value={t.val}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="clear-filter-btn"
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                            setTypeFilter('ALL');
                            setSortOrder('NEWEST');
                        }}
                    >
                        Xóa lọc
                    </button>
                </div>
            </div>

            <div className="scroll-content">
                {loading && page === 0 ? (
                    <div className="loading-bar">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <>
                        {filteredCampaigns.length > 0 ? (
                            <div className="campaign-grid">
                                {filteredCampaigns.map(camp => (
                                    <CampaignCard key={camp.id} campaign={camp} />
                                ))}
                            </div>
                        ) : (
                            <div className="no-result">
                                <Search size={40} className="empty-icon" />
                                <p>Không tìm thấy chiến dịch nào khớp với bộ lọc.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="pagination-wrapper">
                <TrustPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => setPage(p)}
                    totalElements={totalElements}
                    pageSize={pageSize}
                />
            </div>

            <style jsx>{`
                .campaigns-tab { height: 100%; display: flex; flex-direction: column; background: #fff; }
                
                .premium-filter-bar {
                    padding: 12px 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fff;
                    min-height: 56px;
                }
                
                .left-controls { display: flex; gap: 16px; align-items: center; height: 100%; }
                
                .search-group-container { display: flex; align-items: center; height: 100%; }
                .search-input-wrapper {
                    position: relative;
                    width: 260px;
                    display: flex;
                    align-items: center;
                }
                .search-icon { position: absolute; left: 12px; color: #94a3b8; pointer-events: none; z-index: 10; }
                .search-input-wrapper input {
                    width: 100%;
                    padding: 8px 12px 8px 38px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #1e293b;
                    outline: none;
                    background: #f8fafc;
                    height: 38px;
                    transition: all 0.2s;
                }
                .search-input-wrapper input:focus { border-color: #cbd5e1; background: #fff; box-shadow: 0 0 0 4px rgba(226, 232, 240, 0.4); }

                .dropdown-controls { display: flex; gap: 12px; align-items: center; height: 100%; }
                .dropdown-box {
                    position: relative;
                    padding: 0 16px;
                    height: 38px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #fff;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .dropdown-box:hover { border-color: #cbd5e1; background: #f8fafc; }
                .dropdown-box span { font-size: 13px; font-weight: 700; color: #475569; }
                .dropdown-box .icon { color: #64748b; }
                .dropdown-box select {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    cursor: pointer;
                    width: 100%;
                    height: 100%;
                }

                .status-dropdown, .type-dropdown { border-color: #e2e8f0; }
                .status-dropdown span, .type-dropdown span { color: #475569; }
                .status-dropdown .icon, .type-dropdown .icon { color: #64748b; }
                .status-dropdown:hover, .type-dropdown:hover { border-color: #cbd5e1; background: #f8fafc; }

                .clear-filter-btn {
                    padding: 0 16px;
                    height: 38px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #64748b;
                    background: #fff;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .clear-filter-btn:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                    border-color: #cbd5e1;
                }

                .right-controls { display: flex; align-items: center; height: 100%; }

                .scroll-content { flex: 1; padding: 24px 32px; overflow-y: auto; }
                .campaign-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
                .no-result { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 0; color: #94a3b8; font-weight: 600; gap: 12px; }
                .empty-icon { opacity: 0.3; }
                .loading-bar { padding: 40px; display: flex; justify-content: center; }
                .loader { width: 30px; height: 30px; border: 3px solid #f3f4f6; border-top: 3px solid #dc2626; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .pagination-wrapper { padding: 12px 32px; border-top: 1px solid #f1f5f9; background: #fff; }
            `}</style>
        </div>
    );
};

export default CampaignsTab;
