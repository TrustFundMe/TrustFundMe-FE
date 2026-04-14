import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Users, CheckCircle2, Search, ArrowUpDown, ChevronDown } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { CampaignDto } from '@/types/campaign';
import { TrustPagination } from '@/components/ui/TrustPagination';

const CampaignCard = ({ campaign }: { campaign: CampaignDto }) => {
    const isMandated = campaign.type === 'MANDATED';
    const typeLabel = isMandated ? 'Quỹ Ủy Quyền' : 'Quỹ Vật Phẩm';

    const targetAmount = campaign.activeGoal?.targetAmount || 0;
    const progress = targetAmount > 0 ? Math.min(100, Math.round((campaign.balance / targetAmount) * 100)) : 0;

    const isFinished = ['SETTLED', 'CLOSED', 'COMPLETED', 'EVIDENCE_COMPLETED'].includes(campaign.status);

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Đang chờ duyệt';
            case 'APPROVED': return 'Đã duyệt';
            case 'ACTIVE': return 'Đang hoạt động';
            case 'SETTLED': return 'Đã tất toán';
            case 'CLOSED': return 'Đã đóng';
            case 'EVIDENCE_COMPLETED': return 'Đã tất toán & Hoàn tất bằng chứng';
            case 'REJECTED': return 'Bị từ chối';
            default: return status;
        }
    };

    return (
        <div className="campaign-card">
            <div className="card-image">
                <Image
                    src={campaign.coverImageUrl || "/assets/img/defaul.jpg"}
                    alt={campaign.title}
                    fill
                    className="img"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <span className={`type-badge ${campaign.type?.toLowerCase()}`}>{typeLabel}</span>
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
                                <span>0 Người ủng hộ</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <style jsx>{`
        .campaign-card { background: #fff; border-radius: 12px; border: 1px solid #f1f5f9; overflow: hidden; transition: all 0.2s ease; position: relative; }
        .campaign-card:hover { transform: translateY(-3px); border-color: #fee2e2; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
        .card-image { position: relative; width: 100%; height: 140px; }
        .img { object-fit: cover; }
        .type-badge { position: absolute; top: 8px; left: 8px; padding: 3px 8px; border-radius: 4px; font-size: 9px; font-weight: 800; z-index: 2; }
        .type-badge.mandated { background: #eff6ff; color: #3b82f6; }
        .type-badge.item { background: #fff7ed; color: #f97316; }
        .status-overlay { position: absolute; bottom: 8px; right: 8px; background: rgba(255, 255, 255, 0.9); color: #1e293b; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; z-index: 2; }
        .card-content { padding: 12px; }
        .card-title { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0; height: 40px; overflow: hidden; line-height: 1.4; }
        .progress-section { margin-bottom: 8px; }
        .progress-bar { height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
        .progress-fill { height: 100%; background: #dc2626; border-radius: 2px; }
        .progress-info { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; }
        .percent { color: #dc2626; }
        .label { color: #94a3b8; }
        .card-footer { display: flex; align-items: center; color: #64748b; font-size: 11px; font-weight: 600; }
        .donors { display: flex; align-items: center; gap: 4px; }
        .finished-status { display: flex; align-items: center; gap: 6px; color: #991b1b; font-size: 11px; font-weight: 700; background: #fef2f2; padding: 6px; border-radius: 6px; }
      `}</style>
        </div>
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

    const pageSize = 8;

    const allStatuses = [
        { val: 'ALL', label: 'Tất cả trạng thái' },
        { val: 'PENDING', label: 'PENDING' },
        { val: 'APPROVED', label: 'APPROVED' },
        { val: 'ACTIVE', label: 'ACTIVE' },
        { val: 'SETTLED', label: 'SETTLED' },
        { val: 'CLOSED', label: 'CLOSED' },
        { val: 'COMPLETED', label: 'COMPLETED' },
        { val: 'EVIDENCE_COMPLETED', label: 'EVIDENCE_COMPLETED' }
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
            const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
            return matchesSearch && matchesStatus;
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
                                placeholder="Search campaigns"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="dropdown-controls">
                        <div className="dropdown-box">
                            <ArrowUpDown size={14} className="icon" />
                            <span>Sort by</span>
                            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                <option value="NEWEST">Mới nhất</option>
                                <option value="OLDEST">Cũ nhất</option>
                            </select>
                        </div>

                        <div className="dropdown-box">
                            <ChevronDown size={14} className="icon" />
                            <span>Status</span>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                {allStatuses.map(s => (
                                    <option key={s.val} value={s.val}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="right-controls">
                    <button className="create-document-btn">
                        <span>Create campaign</span>
                        <ChevronDown size={16} />
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
                                <p>No campaigns found matching your filters.</p>
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
                    width: 220px;
                    display: flex;
                    align-items: center;
                }
                .search-icon {
                    position: absolute;
                    left: 12px;
                    color: #94a3b8;
                    pointer-events: none;
                    z-index: 10;
                }
                .search-input-wrapper input {
                    width: 100%;
                    padding: 8px 12px 8px 36px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #1e293b;
                    outline: none;
                    background: #fff;
                    height: 38px;
                }
                .search-input-wrapper input:focus { border-color: #cbd5e1; }

                .dropdown-controls { display: flex; gap: 12px; align-items: center; height: 100%; }
                .dropdown-box {
                    position: relative;
                    padding: 0 12px;
                    height: 38px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #fff;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .dropdown-box span { font-size: 13px; font-weight: 600; color: #475569; }
                .dropdown-box .icon { color: #64748b; }
                .dropdown-box select {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    cursor: pointer;
                    width: 100%;
                    height: 100%;
                }

                .right-controls { display: flex; align-items: center; height: 100%; }
                .create-document-btn {
                    padding: 0 16px;
                    height: 38px;
                    background: #fff;
                    border: 1.5px solid #dc2626;
                    color: #dc2626;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .create-document-btn:hover { background: #fef2f2; }

                .scroll-content { flex: 1; padding: 24px 32px; overflow-y: auto; }
                .campaign-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
                .no-result { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 0; color: #94a3b8; font-weight: 600; gap: 12px; }
                .loading-bar { padding: 40px; display: flex; justify-content: center; }
                .loader { width: 30px; height: 30px; border: 3px solid #f3f4f6; border-top: 3px solid #dc2626; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .pagination-wrapper { padding: 12px 32px; border-top: 1px solid #f1f5f9; }
            `}</style>
        </div>
    );
};

export default CampaignsTab;
