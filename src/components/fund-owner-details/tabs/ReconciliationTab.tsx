import React, { useState, useEffect } from 'react';
import { auditService, AuditLog } from '@/services/auditService';
import { campaignService } from '@/services/campaignService';
import { paymentService } from '@/services/paymentService';
import { expenditureService } from '@/services/expenditureService';
import { FileText, Search, RefreshCw, CheckCircle2, ShieldCheck, ChevronDown, ChevronUp, Database, AlertCircle, Copy, ShieldAlert, XCircle, Link2Off, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface ReconciliationTabProps {
  id: string | number;
}

interface VerifyResult {
  valid: boolean;
  dataValid: boolean;
  chainValid: boolean;
  storedHash: string;
  actualHash: string;
  tamperedEntity: string;
}

const ReconciliationTab = ({ id }: ReconciliationTabProps) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [campaignMap, setCampaignMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // State for accordion expansion
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [verifyResults, setVerifyResults] = useState<Record<number, VerifyResult>>({});
  const [liveCheckResults, setLiveCheckResults] = useState<Record<number, 'match' | 'mismatch' | 'not_found'>>({});

  // Vietnamese translations for entity types and actions
  const getVietnameseType = (type: string) => {
    const types: Record<string, string> = {
      'DONATION_TRANSACTION': 'Giao dịch quyên góp',
      'CAMPAIGN': 'Chiến dịch',
      'CAMPAIGN_APPROVAL': 'Duyệt chiến dịch',
      'CAMPAIGN_COMMITMENT': 'Cam kết chiến dịch',
      'EVIDENCE_SUBMISSION': 'Minh chứng chi tiêu',
      'EVIDENCE_SUBMITTED': 'Nộp minh chứng',
      'EXPENDITURE_REVIEW': 'Duyệt chi tiêu',
      'EXPENDITURE_WITHDRAWAL': 'Yêu cầu rút tiền',
      'EVIDENCE_REVIEW': 'Duyệt minh chứng',
      'KYC': 'Xác thực danh tính',
      'USER_KYC': 'Hồ sơ KYC',
      'DONATION': 'Khoản quyên góp',
    };
    return types[type] || type;
  };

  const getVietnameseAction = (action: string) => {
    const actions: Record<string, string> = {
      'CREATE': 'Tạo mới',
      'UPDATE': 'Cập nhật',
      'APPROVE': 'Phê duyệt',
      'REJECT': 'Từ chối',
      'SIGN': 'Ký cam kết',
      'DONATION_RECEIVED': 'Nhận tiền ủng hộ',
      'EXPENDITURE_DISBURSED': 'Giải ngân chi tiêu',
      'EXPENDITURE_APPROVED': 'Duyệt chi tiêu',
      'EXPENDITURE_REJECTED': 'Từ chối chi tiêu',
      'EXPENDITURE_CORRECTION_REQUESTED': 'Yêu cầu chỉnh sửa',
      'EXPENDITURE_COMPLETED': 'Hoàn tất chi tiêu',
      'EXPENDITURE_STATUS_CHANGED': 'Cập nhật trạng thái',
      'WITHDRAWAL_REQUESTED': 'Yêu cầu rút tiền',
      'EVIDENCE_SUBMITTED': 'Nộp minh chứng',
      'EVIDENCE_APPROVED': 'Duyệt minh chứng',
      'EVIDENCE_REJECTED': 'Từ chối minh chứng',
    };
    return actions[action] || action;
  };

  const toggleCampaign = (campaignId: string) => {
    const isExpanding = !expandedCampaigns[campaignId];
    setExpandedCampaigns(prev => ({
      ...prev,
      [campaignId]: isExpanding
    }));

    // Lazy verify: when expanding a campaign group, verify its logs
    if (isExpanding) {
      const campaignLogs = logs.filter(log => getCampaignIdFromLog(log) === campaignId);
      campaignLogs.forEach(log => {
        if (verifyResults[log.id] === undefined) {
          auditService.verifyIntegrity(log.id).then(result => {
            setVerifyResults(prev => ({ ...prev, [log.id]: result as VerifyResult }));
          }).catch(() => {
            setVerifyResults(prev => ({
              ...prev,
              [log.id]: {
                valid: false, dataValid: false, chainValid: false,
                storedHash: '', actualHash: '', tamperedEntity: 'Lỗi xác minh'
              }
            }));
          });
        }
      });
    }
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
    } catch (e) { }

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
          try {
            liveData = await paymentService.getDonation(entityId);
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        case 'DONATION_TRANSACTION':
          // entityId is campaignId for DONATION_TRANSACTION (set by CassoWebhookService)
          // Fetch the actual Casso transaction by tid from the snapshot
          try {
            const snap = JSON.parse(log.dataSnapshot || '{}');
            const txTid = snap.tid;
            if (txTid && entityId) {
              const cassoTxs = await paymentService.getCassoTransactionsByCampaign(entityId);
              liveData = cassoTxs.find((tx: any) => String(tx.tid) === String(txTid)) || null;
            }
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        case 'EVIDENCE_SUBMISSION':
        case 'EVIDENCE_SUBMITTED':
          // entityId is campaignId — need to get evidenceId from snapshot
          try {
            const evidenceSnap = JSON.parse(log.dataSnapshot || '{}');
            const evidenceId = evidenceSnap.evidenceId;
            if (evidenceId) {
              liveData = await expenditureService.getEvidenceById(evidenceId);
            }
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        case 'EXPENDITURE_REVIEW':
        case 'EXPENDITURE_WITHDRAWAL':
        case 'EVIDENCE_REVIEW':
          // entityId is campaignId for these types — fetch campaign as live data
          try {
            liveData = await campaignService.getById(entityId);
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        case 'CAMPAIGN_COMMITMENT':
          try {
            liveData = await campaignService.getCommitment(entityId);
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
        toast('Dữ liệu không tồn tại trên Live DB (Có thể đã bị xóa) 🗑️', 'error');
        setLiveCheckResults(prev => ({ ...prev, [log.id]: 'not_found' }));
        setVerifyingId(null);
        return;
      }

      // For entity types where the snapshot is a self-contained transaction record
      // (not a mirror of the live entity), only verify the entity exists on Live DB.
      // The snapshot fields (tid, counterAccountName, etc.) don't map to campaign fields.
      const selfContainedTypes = [
        'EXPENDITURE_REVIEW', 'EXPENDITURE_WITHDRAWAL',
        'EVIDENCE_REVIEW'
      ];

      if (selfContainedTypes.includes(log.entityType)) {
        // Entity exists on Live DB — that's sufficient verification
        toast('Dữ liệu khớp hoàn toàn với Live DB ✅', 'success');
        setLiveCheckResults(prev => ({ ...prev, [log.id]: 'match' }));
      } else {
        // Full field-by-field comparison for entity types where snapshot mirrors the entity
        const snapshot = JSON.parse(log.dataSnapshot || '{}');

        let isMatch = true;
        const mismatchedFields: string[] = [];

        // Essential fields to check (ignoring timestamps and derived fields if they differ in format)
        const fieldsToIgnore = ['updatedAt', 'createdAt', 'approvedAt', 'id', 'source'];

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
          setLiveCheckResults(prev => ({ ...prev, [log.id]: 'match' }));
        } else {
          toast(`Phát hiện sai lệch tại các trường: ${mismatchedFields.join(', ')} ⚠️`, 'error');
          setLiveCheckResults(prev => ({ ...prev, [log.id]: 'mismatch' }));
        }
      }
    } catch (error) {
      console.error('Check live data error:', error);
      toast('Lỗi khi kiểm tra dữ liệu live', 'error');
      setLiveCheckResults(prev => ({ ...prev, [log.id]: 'mismatch' }));
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

  // Check if search term looks like a hash (hex string >= 32 chars)
  const isHashSearch = /^[a-fA-F0-9]{32,}$/.test(searchTerm.trim());

  const filteredCampaigns = Object.keys(groupedLogs).filter(cId => {
    const title = campaignMap[cId] || (cId === 'Khác' ? 'Chiến dịch chung/Hệ thống' : `Chiến dịch #${cId} (Đã xóa/Không xác định)`);
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cId.includes(searchTerm) ||
      groupedLogs[cId].some(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.auditHash.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  // Auto-expand campaign group and log detail when hash search finds exactly one match
  useEffect(() => {
    if (!isHashSearch || !searchTerm.trim()) return;

    // Find the matching log across all campaigns
    let matchedLog: AuditLog | null = null;
    let matchedCampaignId: string | null = null;

    for (const cId of filteredCampaigns) {
      const found = groupedLogs[cId].find(log =>
        log.auditHash.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (found) {
        matchedLog = found;
        matchedCampaignId = cId;
        break;
      }
    }

    if (matchedLog && matchedCampaignId) {
      // Auto-expand the campaign group
      setExpandedCampaigns(prev => ({ ...prev, [matchedCampaignId!]: true }));
      // Auto-expand the log detail
      setExpandedLogId(matchedLog.id);
    }
  }, [searchTerm, filteredCampaigns.length]);

  return (
    <div className="reconciliation-tab">
      <div className="toolbar">
        <div className="search-box">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo Tên chiến dịch, loại dữ liệu, hoặc dán mã Hash SHA-256..."
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
        {isLoading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={32} style={{ color: '#ff5e14' }} />
            <p>Đang tải dữ liệu đối soát...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck className="h-10 w-10" style={{ color: '#0f172a', opacity: 0.2 }} />
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
                      <div key={log.id}>
                        <div
                          className={`log-item ${expandedLogId === log.id ? 'log-item-selected' : ''}`}
                          onClick={() => {
                            const isClosing = expandedLogId === log.id;
                            setExpandedLogId(isClosing ? null : log.id);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="log-icon">
                            {verifyResults[log.id] ? (
                              verifyResults[log.id].valid ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <ShieldAlert className="h-4 w-4 text-red-500" />
                              )
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </div>
                          <div className="log-details">
                            <div className="log-title">
                              <span className="entity-type">{getVietnameseType(log.entityType)}</span>
                              <span className="action">{getVietnameseAction(log.action)}</span>
                              {/* Inline integrity badges */}
                              {verifyResults[log.id] && !verifyResults[log.id].dataValid && (
                                <span className="tamper-badge">
                                  <XCircle className="h-3 w-3" /> Hash bị sửa
                                </span>
                              )}
                              {verifyResults[log.id] && !verifyResults[log.id].chainValid && (
                                <span className="chain-break-badge">
                                  <Link2Off className="h-3 w-3" /> Đứt chuỗi
                                </span>
                              )}
                              {verifyResults[log.id] && verifyResults[log.id].valid && (
                                <span className="valid-badge">
                                  <CheckCircle2 className="h-3 w-3" /> Hợp lệ
                                </span>
                              )}
                              {/* Live DB check badges */}
                              {liveCheckResults[log.id] === 'match' && (
                                <span className="valid-badge">
                                  <Database className="h-3 w-3" /> Live DB khớp
                                </span>
                              )}
                              {liveCheckResults[log.id] === 'mismatch' && (
                                <span className="tamper-badge">
                                  <Database className="h-3 w-3" /> Live DB sai lệch
                                </span>
                              )}
                              {liveCheckResults[log.id] === 'not_found' && (
                                <span className="chain-break-badge">
                                  <Database className="h-3 w-3" /> Đã bị xóa
                                </span>
                              )}
                            </div>
                            <div className="log-time">
                              {new Date(log.createdAt).toLocaleString('vi-VN')}
                            </div>
                            <div className={`log-hash ${verifyResults[log.id] && !verifyResults[log.id].dataValid ? 'log-hash-tampered' : ''}`}>
                              <span className="hash-label">SHA-256:</span> {log.auditHash}
                            </div>
                          </div>
                          <div className="log-status">
                            <button
                              className="live-check-btn"
                              onClick={(e) => { e.stopPropagation(); checkLiveData(log); }}
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
                        {expandedLogId === log.id && (
                          <div className="log-detail-panel">
                            {/* TAMPER ALERT BANNER */}
                            {verifyResults[log.id] && !verifyResults[log.id].valid && (
                              <div className="tamper-alert">
                                <div className="tamper-alert-header">
                                  <AlertTriangle className="h-5 w-5" />
                                  <strong>⚠️ PHÁT HIỆN GIẢ MẠO DỮ LIỆU</strong>
                                </div>
                                <div className="tamper-alert-body">
                                  {!verifyResults[log.id].dataValid && (
                                    <div className="tamper-detail-row">
                                      <XCircle className="h-4 w-4 text-red-400" />
                                      <div>
                                        <strong>Hash bị thay đổi trực tiếp trong DB</strong>
                                        <p>Mã Hash lưu trong DB không khớp với SHA-256 tính lại từ dữ liệu gốc (dataSnapshot + previousHash).</p>
                                        <div className="hash-compare">
                                          <div><span className="hash-compare-label">Hash lưu trong DB:</span> <code className="hash-stored">{verifyResults[log.id].storedHash}</code></div>
                                          <div><span className="hash-compare-label">Hash tính lại:</span> <code className="hash-actual">{verifyResults[log.id].actualHash}</code></div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {!verifyResults[log.id].chainValid && (
                                    <div className="tamper-detail-row">
                                      <Link2Off className="h-4 w-4 text-amber-400" />
                                      <div>
                                        <strong>Chuỗi liên kết (Chain) bị đứt</strong>
                                        <p>Previous Hash của bản ghi này không khớp với Hash của bản ghi liền trước, có thể bản ghi trước đã bị chèn/xóa/sửa.</p>
                                        {verifyResults[log.id].tamperedEntity && verifyResults[log.id].tamperedEntity !== 'None' && (
                                          <p className="tamper-entity">Bản ghi bị nghi ngờ: <strong>{verifyResults[log.id].tamperedEntity}</strong></p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Valid integrity confirmation */}
                            {verifyResults[log.id] && verifyResults[log.id].valid && (
                              <div className="integrity-ok">
                                <ShieldCheck className="h-4 w-4" />
                                <span>Bản ghi toàn vẹn — Hash khớp & Chuỗi liên kết hợp lệ</span>
                              </div>
                            )}

                            <div className="detail-grid">
                              <div className="detail-cell">
                                <span className="detail-label">Thời điểm ghi nhận</span>
                                <span className="detail-value">{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                              </div>
                              <div className="detail-cell">
                                <span className="detail-label">Người thực hiện</span>
                                <span className="detail-value">{log.actorName || 'Hệ thống'}</span>
                              </div>
                              <div className="detail-cell">
                                <span className="detail-label">Loại</span>
                                <span className="detail-value">{getVietnameseType(log.entityType)}</span>
                              </div>
                              <div className="detail-cell">
                                <span className="detail-label">Hành động</span>
                                <span className="detail-value">{getVietnameseAction(log.action)}</span>
                              </div>
                            </div>
                            <div className="detail-snapshot">
                              <div className="detail-snapshot-header">
                                <span>Dữ liệu gốc (Snapshot)</span>
                                <button
                                  className="copy-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(log.auditHash);
                                    toast('Đã sao chép mã Hash!', 'success');
                                  }}
                                >
                                  <Copy className="h-3 w-3 mr-1" /> Sao chép Hash
                                </button>
                              </div>
                              <pre className="snapshot-content">{JSON.stringify(JSON.parse(log.dataSnapshot || '{}'), null, 2)}</pre>
                            </div>
                            {log.previousHash && (
                              <div className="detail-chain">
                                <span className="detail-label">Previous Hash (Chain)</span>
                                <span className="chain-hash">{log.previousHash}</span>
                              </div>
                            )}
                          </div>
                        )}
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
          background: #fff;
          font-family: var(--font-dm-sans, 'DM Sans', 'Inter', sans-serif);
        }
        .toolbar {
          display: flex;
          gap: 12px;
          padding: 16px 24px;
          background: #fff;
          border-bottom: 1px solid rgba(15,23,42,0.10);
        }
        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.15);
          border-radius: 8px;
          transition: all 0.2s;
        }
        .search-box:focus-within {
          border-color: #ff5e14;
          box-shadow: 0 0 0 3px rgba(255, 94, 20, 0.08);
        }
        .search-box input {
          border: none;
          background: none;
          outline: none;
          width: 100%;
          font-size: 13px;
          color: #0f172a;
          font-family: inherit;
        }
        .search-box input::placeholder { color: #0f172a; opacity: 0.4; }
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.15);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .refresh-btn:hover { background: #fff3ed; color: #ff5e14; border-color: #ff5e14; }
        .content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          gap: 12px;
        }
        .loading-state p {
          color: #0f172a;
          font-size: 14px;
          font-weight: 700;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #0f172a;
          font-size: 13px;
          font-weight: 600;
          gap: 8px;
        }
        .campaign-group {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.10);
          border-radius: 12px;
          margin-bottom: 16px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .campaign-group:hover {
          border-color: rgba(15,23,42,0.20);
        }
        .campaign-group.expanded {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border-color: #ff5e14;
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
          background: #fff3ed;
        }
        .expanded .campaign-header {
          background: #fff3ed;
          border-bottom: 1px solid rgba(15,23,42,0.10);
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
          color: #0f172a;
        }
        .badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          background: #fff3ed;
          color: #ff5e14;
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
          border-bottom: 1px solid rgba(15,23,42,0.06);
          align-items: flex-start;
          transition: background 0.2s;
        }
        .log-item:hover {
          background: #fafafa;
        }
        .log-item:last-child {
          border-bottom: none;
        }
        .log-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #fff3ed;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff5e14;
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
          background: rgba(15,23,42,0.06);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .action {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
        }
        .log-time {
          font-size: 11px;
          color: #0f172a;
          opacity: 0.5;
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
          padding: 4px 12px;
          border-radius: 12px;
        }
        .live-check-btn {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #10b981;
          color: #10b981;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .live-check-btn:hover:not(:disabled) {
          background: #10b981;
          color: #fff;
        }
        .live-check-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .log-item-selected {
          background: #f0f9ff !important;
          border-left: 3px solid #0ea5e9;
        }
        .log-detail-panel {
          padding: 16px 16px 16px 64px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }
        .detail-cell {
          background: white;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .detail-label {
          display: block;
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .detail-value {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
        }
        .detail-snapshot {
          margin-bottom: 12px;
        }
        .detail-snapshot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          font-size: 10px;
          font-weight: 700;
          color: #1e293b;
          text-transform: uppercase;
        }
        .copy-btn {
          display: flex;
          align-items: center;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: white;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .copy-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .snapshot-content {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          font-family: monospace;
          font-size: 10px;
          color: #475569;
          max-height: 180px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-break: break-all;
          margin: 0;
        }
        .detail-chain {
          background: #0f172a;
          border-radius: 8px;
          padding: 10px 12px;
        }
        .detail-chain .detail-label {
          color: #64748b;
        }
        .chain-hash {
          font-family: monospace;
          font-size: 9px;
          color: #94a3b8;
          word-break: break-all;
        }

        /* === Tamper Detection Badges === */
        .tamper-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 7px;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 4px;
          animation: pulseRed 2s ease-in-out infinite;
        }
        .chain-break-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 7px;
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fde68a;
          border-radius: 4px;
        }
        .valid-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 7px;
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
          border-radius: 4px;
        }
        @keyframes pulseRed {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.2); }
          50% { box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1); }
        }

        /* Hash row turns red when tampered */
        .log-hash-tampered {
          background: #fef2f2 !important;
          color: #dc2626 !important;
          border: 1px solid #fecaca;
        }
        .log-hash-tampered .hash-label {
          color: #dc2626 !important;
        }

        /* === Tamper Alert Banner (expanded detail) === */
        .tamper-alert {
          background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%);
          border: 1.5px solid #fca5a5;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 14px;
          animation: slideDown 0.3s ease-out;
        }
        .tamper-alert-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #dc2626;
          font-size: 13px;
          margin-bottom: 10px;
        }
        .tamper-alert-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tamper-detail-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 12px;
          color: #1e293b;
        }
        .tamper-detail-row strong {
          display: block;
          margin-bottom: 2px;
          font-size: 12px;
        }
        .tamper-detail-row p {
          margin: 0;
          font-size: 11px;
          color: #64748b;
          line-height: 1.5;
        }
        .hash-compare {
          margin-top: 6px;
          font-family: monospace;
          font-size: 9px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .hash-compare-label {
          font-weight: 700;
          color: #64748b;
          font-family: system-ui;
          font-size: 9px;
        }
        .hash-stored {
          color: #dc2626;
          background: #fee2e2;
          padding: 2px 6px;
          border-radius: 3px;
          word-break: break-all;
        }
        .hash-actual {
          color: #059669;
          background: #d1fae5;
          padding: 2px 6px;
          border-radius: 3px;
          word-break: break-all;
        }
        .tamper-entity {
          margin-top: 4px !important;
          color: #b45309 !important;
          font-weight: 600;
        }

        /* === Integrity OK Banner === */
        .integrity-ok {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          color: #059669;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 14px;
        }
      `}</style>
    </div>
  );
};

export default ReconciliationTab;
