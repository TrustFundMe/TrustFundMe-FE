'use client';

import { useEffect, useState } from 'react';
import DanboxLayout from '@/layout/DanboxLayout';
import { trustScoreService, TrustScoreConfig } from '@/services/trustScoreService';

const FALLBACK_RULES: TrustScoreConfig[] = [
    { id: 1, ruleKey: 'CAMPAIGN_APPROVED', ruleName: 'Campaign được duyệt', points: 50, description: 'Cộng điểm khi chiến dịch được staff duyệt thành công', isActive: true, createdAt: '', updatedAt: '' },
    { id: 2, ruleKey: 'CAMPAIGN_REJECTED', ruleName: 'Campaign bị từ chối', points: -20, description: 'Trừ điểm khi chiến dịch bị staff từ chối', isActive: true, createdAt: '', updatedAt: '' },
    { id: 3, ruleKey: 'ON_TIME_SUBMIT', ruleName: 'Nộp đúng hạn', points: 20, description: 'Cộng điểm khi chi tiêu được duyệt đúng hoặc trước hạn nộp', isActive: true, createdAt: '', updatedAt: '' },
    { id: 4, ruleKey: 'LATE_SUBMIT', ruleName: 'Nộp muộn', points: -10, description: 'Trừ điểm khi chi tiêu nộp muộn so với hạn chót', isActive: true, createdAt: '', updatedAt: '' },
    { id: 5, ruleKey: 'DAILY_POST', ruleName: 'Đăng bài hàng ngày', points: 5, description: 'Cộng điểm khi đăng ít nhất 1 bài viết/ngày (tối đa 1 lần/ngày)', isActive: true, createdAt: '', updatedAt: '' },
    { id: 6, ruleKey: 'FLAG_PENALTY', ruleName: 'Bị tố cáo', points: -15, description: 'Trừ điểm khi bị cộng đồng tố cáo hợp lệ', isActive: true, createdAt: '', updatedAt: '' },
];

export default function TrustScorePage() {
    const [rules, setRules] = useState<TrustScoreConfig[]>(FALLBACK_RULES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const timeout = setTimeout(() => {
            if (!cancelled) setLoading(false);
        }, 5000);

        (async () => {
            try {
                const data = await trustScoreService.getConfigs();
                if (!cancelled && Array.isArray(data) && data.length > 0) setRules(data);
            } catch { /* use fallback */ }
            finally {
                if (!cancelled) { clearTimeout(timeout); setLoading(false); }
            }
        })();

        return () => { cancelled = true; clearTimeout(timeout); };
    }, []);

    const positiveRules = rules.filter(r => r.points > 0 && r.isActive);
    const negativeRules = rules.filter(r => r.points < 0 && r.isActive);

    if (loading) {
        return (
            <DanboxLayout header={4}>
                <div style={{ fontFamily: 'var(--font-dm-sans)', background: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 32, height: 32, border: '3px solid #ffe0cc', borderTopColor: '#ff5e14', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Đang tải dữ liệu...</div>
                    </div>
                </div>
            </DanboxLayout>
        );
    }

    return (
        <DanboxLayout header={4}>
            <div style={{ fontFamily: 'var(--font-dm-sans)', background: '#fff', minHeight: '100vh' }}>
                <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 48px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#ff5e14', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
                        Cơ chế minh bạch
                    </div>
                    <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900, color: '#0f172a', letterSpacing: -1.5, lineHeight: 1.1 }}>
                        Điểm Tin Cậy
                    </h1>
                    <p style={{ margin: '16px 0 0', fontSize: 16, fontWeight: 500, color: '#0f172a', lineHeight: 1.7, maxWidth: 600 }}>
                        Mỗi chủ quỹ trên TrustFundMe được hệ thống tự động chấm điểm dựa trên hành vi thực tế.
                        Điểm càng cao, mức độ đáng tin cậy càng lớn.
                    </p>
                </div>

                <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
                    {/* Positive */}
                    <div style={{ marginBottom: 48 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid #16a34a' }}>
                            Hành vi cộng điểm
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {positiveRules.map((rule, i) => (
                                <div key={rule.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', alignItems: 'center', padding: '16px 0', borderBottom: i < positiveRules.length - 1 ? '1px solid rgba(15,23,42,0.06)' : 'none' }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{rule.ruleName}</div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a', opacity: 0.6 }}>{rule.description}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: 18, fontWeight: 900, color: '#16a34a' }}>+{rule.points}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Negative */}
                    <div style={{ marginBottom: 48 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid #dc2626' }}>
                            Hành vi trừ điểm
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {negativeRules.map((rule, i) => (
                                <div key={rule.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', alignItems: 'center', padding: '16px 0', borderBottom: i < negativeRules.length - 1 ? '1px solid rgba(15,23,42,0.06)' : 'none' }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{rule.ruleName}</div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a', opacity: 0.6 }}>{rule.description}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: 18, fontWeight: 900, color: '#dc2626' }}>{rule.points}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div style={{ padding: '20px 24px', background: '#f8fafc', borderRadius: 12, border: '1px solid rgba(15,23,42,0.06)' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Lưu ý</div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, fontWeight: 500, color: '#0f172a', lineHeight: 1.8 }}>
                            <li>Điểm khởi tạo mặc định cho mỗi chủ quỹ mới là 100.</li>
                            <li>Điểm được cập nhật tự động sau mỗi hành vi liên quan.</li>
                            <li>Chủ quỹ có thể xem lịch sử điểm chi tiết trên trang cá nhân.</li>
                            <li>Hệ thống chấm điểm hoàn toàn tự động, không có sự can thiệp thủ công.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </DanboxLayout>
    );
}
