import React, { useState, useEffect } from 'react';
import { auditService, AuditLog } from '@/services/auditService';
import { campaignService } from '@/services/campaignService';
import { paymentService } from '@/services/paymentService';
import { expenditureService } from '@/services/expenditureService';
import { FileText, Search, RefreshCw, CheckCircle2, ShieldCheck, ChevronDown, ChevronUp, Database, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface ReconciliationTabProps {
  id: string | number;
}

const ReconciliationTab = ({ id }: ReconciliationTabProps) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [campaignMap, setCampaignMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  // State for accordion expansion
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const toggleCampaign = (campaignId: string) => {
    setExpandedCampaigns(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  const getCampaignIdFromLog = (log: AuditLog): string => {
    try {
      if (log.dataSnapshot) {
        const snap = JSON.parse(log.dataSnapshot);
        // dataSnapshot might have campaignId inside it for DONATION/EXPENDITURE
        if (snap.campaignId) {
          return snap.campaignId.toString();
        }
      }
    } catch (e) {}
    
    // Fallback to entityId
    return log.entityId ? log.entityId.toString() : 'Khác';
  };

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // 1. Fetch Campaigns owned by user to get the IDs for context
      const userCampaigns = await campaignService.getByFundOwner(id);
      const campaignIds = userCampaigns ? userCampaigns.map(c => c.id) : [];

      // 2. Fetch Reconciliation Logs (User actions + Campaign events like donations/withdrawals)
      const data = await auditService.getReconciliationLogs(id, campaignIds, 0, 500);
      
      // EXCLUDE KYC to avoid leaking personal info as requested
      const safeLogs = (data.content || []).filter(
        log => log.entityType !== 'KYC' && log.entityType !== 'USER_KYC'
      );
      setLogs(safeLogs);

      // 3. Extract unique campaign IDs correctly (even if entityId is DonationID/EvidenceID)
      const uniqueCampaignIds = Array.from(new Set(
        safeLogs
          .map(log => getCampaignIdFromLog(log))
          .filter(cId => cId !== 'Khác')
      ));

      // 4. Fetch Campaign Titles for mapping
      const map: Record<string, string> = {};
      
      await Promise.allSettled(
        uniqueCampaignIds.map(async (cId) => {
          if (!cId) return;
          try {
            // Check if we already have it from userCampaigns
            const existing = userCampaigns.find(c => c.id.toString() === cId.toString());
            if (existing) {
              map[cId.toString()] = existing.title;
            } else {
              const campaign = await campaignService.getById(Number(cId));
              if (campaign && campaign.title) {
                map[cId.toString()] = campaign.title;
              }
            }
          } catch (e) {
            console.warn(`Could not fetch title for campaign ${cId}`);
          }
        })
      );
      
      setCampaignMap(map);

    } catch (error) {
      console.error('Error fetching reconciliation data:', error);
      toast('Lỗi tải dữ liệu đối soát', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const checkLiveData = async (log: AuditLog) => {
    setVerifyingId(log.id);
    try {
      let liveData: any = null;
      // We try to get the real entityId from the snapshot or use entityId
      const targetId = getCampaignIdFromLog(log) === log.entityId?.toString() ? log.entityId : (JSON.parse(log.dataSnapshot || '{}').id || log.entityId);
      const entityId = Number(targetId);

      switch (log.entityType) {
        case 'CAMPAIGN':
        case 'CAMPAIGN_APPROVAL':
          try {
            liveData = await campaignService.getById(entityId);
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        case 'DONATION':
        case 'DONATION_TRANSACTION':
          try {
            liveData = await paymentService.getDonation(entityId);
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        case 'EVIDENCE_SUBMISSION':
        case 'EVIDENCE_SUBMITTED':
          try {
            liveData = await expenditureService.getEvidenceById(entityId);
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        default:
          toast(`Không hỗ trợ kiểm tra live cho loại ${log.entityType}`, 'info');
          setVerifyingId(null);
          return;
      }

      if (!liveData) {
        toast('Dữ liệu không tồn tại trên Live DB (Có thể đã bị xóa) 🗑️', 'warning');
        setVerifyingId(null);
        return;
      }

      // Compare snapshot with live data
      const snapshot = JSON.parse(log.dataSnapshot || '{}');
      
      let isMatch = true;
      const mismatchedFields: string[] = [];

      // Essential fields to check (ignoring timestamps and derived fields if they differ in format)
      const fieldsToIgnore = ['updatedAt', 'createdAt', 'approvedAt', 'id'];

      for (const key in snapshot) {
        if (Object.prototype.hasOwnProperty.call(snapshot, key) && !fieldsToIgnore.includes(key)) {
          const snapshotVal = snapshot[key];
          const liveVal = liveData[key];
          
          if (snapshotVal !== undefined && liveVal !== undefined) {
             // Convert to string for comparison to handle number/string variations
             if (String(snapshotVal) !== String(liveVal)) {
                isMatch = false;
                mismatchedFields.push(key);
             }
          }
        }
      }

      if (isMatch) {
        toast('Dữ liệu khớp hoàn toàn với Live DB ✅', 'success');
      } else {
        toast(`Phát hiện sai lệch tại các trường: ${mismatchedFields.join(', ')} ⚠️`, 'error');
      }
    } catch (error) {
      console.error('Check live data error:', error);
      toast('Lỗi khi kiểm tra dữ liệu live', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Group logs by Campaign
  const groupedLogs = logs.reduce((acc, log) => {
    const campaignId = getCampaignIdFromLog(log);
    if (!acc[campaignId]) acc[campaignId] = [];
    acc[campaignId].push(log);
    return acc;
  }, {} as Record<string, AuditLog[]>);

  const filteredCampaigns = Object.keys(groupedLogs).filter(cId => {
    const title = campaignMap[cId] || (cId === 'Khác' ? 'Chiến dịch chung/Hệ thống' : `Chiến dịch #${cId} (Đã xóa/Không xác định)`);
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cId.includes(searchTerm) || 
      groupedLogs[cId].some(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  return (
    <div className="reconciliation-tab">
      <div className="toolbar">
        <div className="search-box">
          <Search className="h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Tìm theo Tên chiến dịch, loại dữ liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="refresh-btn" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Tải lại
        </button>
      </div>

      <div className="content">
        {filteredCampaigns.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck className="h-10 w-10 text-slate-200 mb-2" />
            <p>Không có dữ liệu đối soát nào</p>
          </div>
        ) : (
          filteredCampaigns.map(campaignId => {
            const isExpanded = expandedCampaigns[campaignId];
            const title = campaignMap[campaignId] || (campaignId === 'Khác' ? 'Chiến dịch chung/Hệ thống' : `Chiến dịch #${campaignId} (Đã xóa/Không xác định)`);
            
            return (
              <div key={campaignId} className={`campaign-group ${isExpanded ? 'expanded' : ''}`}>
                <div 
                  className="campaign-header" 
                  onClick={() => toggleCampaign(campaignId)}
                >
                  <div className="header-left">
                    <h3>{title}</h3>
                    <span className="badge">{groupedLogs[campaignId].length} bản ghi</span>
                  </div>
                  <div className="header-right">
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="logs-list">
                    {groupedLogs[campaignId].map(log => (
                      <div key={log.id} className="log-item">
                        <div className="log-icon">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="log-details">
                          <div className="log-title">
                            <span className="entity-type">{log.entityType}</span>
                            <span className="action">{log.action}</span>
                          </div>
                          <div className="log-time">
                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </div>
                          <div className="log-hash">
                            <span className="hash-label">SHA-256:</span> {log.auditHash}
                          </div>
                        </div>
                        <div className="log-status">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-600 text-xs font-medium ml-1 mr-3">Toàn vẹn (Log)</span>
                          
                          <button 
                            className="live-check-btn"
                            onClick={() => checkLiveData(log)}
                            disabled={verifyingId === log.id}
                          >
                            {verifyingId === log.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Database className="h-3 w-3 mr-1" />
                            )}
                            Kiểm tra Live DB
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .reconciliation-tab {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #f8fafc;
        }
        .toolbar {
          display: flex;
          gap: 12px;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #f1f5f9;
        }
        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .search-box:focus-within {
          border-color: #cbd5e1;
          box-shadow: 0 0 0 2px #f1f5f9;
        }
        .search-box input {
          border: none;
          background: none;
          outline: none;
          width: 100%;
          font-size: 13px;
        }
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }
        .refresh-btn:hover { background: #f8fafc; }
        .content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
        }
        .campaign-group {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 16px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .campaign-group:hover {
          border-color: #cbd5e1;
        }
        .campaign-group.expanded {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border-color: #cbd5e1;
        }
        .campaign-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #fff;
          cursor: pointer;
          transition: background 0.2s;
        }
        .campaign-header:hover {
          background: #f8fafc;
        }
        .expanded .campaign-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-left h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
        }
        .badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          background: #e2e8f0;
          color: #475569;
          border-radius: 12px;
        }
        .logs-list {
          display: flex;
          flex-direction: column;
          background: #fff;
        }
        .log-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          align-items: flex-start;
          transition: background 0.2s;
        }
        .log-item:hover {
          background: #f8fafc;
        }
        .log-item:last-child {
          border-bottom: none;
        }
        .log-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          flex-shrink: 0;
        }
        .log-details {
          flex: 1;
          min-width: 0;
        }
        .log-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .entity-type {
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .action {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }
        .log-time {
          font-size: 11px;
          color: #94a3b8;
          margin-bottom: 6px;
        }
        .log-hash {
          font-family: monospace;
          font-size: 10px;
          color: #10b981;
          word-break: break-all;
          background: #ecfdf5;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .hash-label {
          color: #059669;
          font-weight: bold;
        }
        .log-status {
          display: flex;
          align-items: center;
          background: #ecfdf5;
          padding: 4px 12px;
          border-radius: 12px;
        }
        .live-check-btn {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #10b981;
          color: #10b981;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .live-check-btn:hover:not(:disabled) {
          background: #10b981;
          color: white;
        }
        .live-check-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ReconciliationTab;
