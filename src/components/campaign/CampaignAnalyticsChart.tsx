'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { paymentService, CampaignAnalyticsResponse, ChartPoint } from '@/services/paymentService';

interface Props {
    campaignId?: number | string;
}

interface ExtendedResponse extends CampaignAnalyticsResponse {
    phases?: { key: string; type: string }[];
}

const CampaignAnalyticsChart = ({ campaignId }: Props) => {
    const [data, setData] = useState<ExtendedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('Tháng');

    useEffect(() => {
        if (!campaignId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const id = typeof campaignId === 'string' ? parseInt(campaignId, 10) : campaignId;
                const res = await paymentService.getCampaignAnalytics(id, period);

                const generateSlots = (p: string) => {
                    const slots = [];
                    const now = new Date();

                    if (p === 'Ngày') {
                        const currentHour = now.getHours();
                        for (let i = 0; i <= currentHour; i++) {
                            slots.push(`${i.toString().padStart(2, '0')}h`);
                        }
                    } else if (p === 'Tuần') {
                        const day = now.getDay();
                        const limit = day === 0 ? 7 : day;
                        const allDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                        for (let i = 0; i < limit; i++) {
                            slots.push(allDays[i]);
                        }
                    } else if (p === 'Tháng') {
                        const currentDay = now.getDate();
                        const month = now.getMonth();
                        for (let i = 1; i <= currentDay; i++) {
                            slots.push(`${i.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}`);
                        }
                    } else if (p === 'Năm') {
                        const currentMonth = now.getMonth() + 1;
                        for (let i = 1; i <= currentMonth; i++) {
                            slots.push(`Tháng ${i}`);
                        }
                    }
                    return slots;
                };

                const extractSlot = (dateStr: string, p: string) => {
                    if (!dateStr) return '';
                    if (p === 'Ngày') {
                        if (dateStr.includes('T')) return `${new Date(dateStr).getHours().toString().padStart(2, '0')}h`;
                        const m = dateStr.match(/(\d{2}):(\d{2})/);
                        if (m) return `${m[1]}h`;
                    } else if (p === 'Tuần') {
                        if (dateStr.startsWith('T') || dateStr === 'CN') return dateStr;
                    } else if (p === 'Tháng') {
                        if (dateStr.includes('/')) return dateStr;
                    } else if (p === 'Năm') {
                        if (dateStr.toLowerCase().includes('tháng')) {
                            const m = dateStr.replace(/\D/g, '');
                            return `Tháng ${parseInt(m, 10)}`;
                        }
                    }
                    return dateStr;
                };

                const parsedSlots = generateSlots(period);
                const lastBalancesPerSlot = new Map<string, number>();
                if (res && res.chartData) {
                    res.chartData.forEach(d => {
                        const s = extractSlot(d.date, period);
                        const rawB = (d.balanceGreen !== undefined && d.balanceGreen !== null) ? d.balanceGreen : (d.balanceRed !== null ? d.balanceRed : 0);
                        const b = Math.max(0, rawB);
                        lastBalancesPerSlot.set(s, b);
                    });
                }

                let currentBal = 0;
                const finalBalances = parsedSlots.map(slot => {
                    if (lastBalancesPerSlot.has(slot)) {
                        currentBal = lastBalancesPerSlot.get(slot)!;
                    }
                    return { slot, balance: currentBal };
                });

                const formattedChartData: Record<string, string | number | null>[] = parsedSlots.map(slot => ({ date: slot, tooltipBalance: null }));

                let currentPhaseType = finalBalances.length > 1 && finalBalances[1].balance >= finalBalances[0].balance ? 'green' : 'red';
                let currentPhaseIndex = 0;
                let phaseKey = `${currentPhaseType}_${currentPhaseIndex}`;
                const phases = [{ key: phaseKey, type: currentPhaseType }];

                if (finalBalances.length > 0) {
                    formattedChartData[0][phaseKey] = finalBalances[0].balance;
                    formattedChartData[0].tooltipBalance = finalBalances[0].balance;
                }

                for (let i = 1; i < finalBalances.length; i++) {
                    const prev = finalBalances[i - 1];
                    const curr = finalBalances[i];
                    const segType = curr.balance >= prev.balance ? 'green' : 'red';

                    if (segType !== currentPhaseType) {
                        currentPhaseType = segType;
                        currentPhaseIndex++;
                        phaseKey = `${currentPhaseType}_${currentPhaseIndex}`;
                        phases.push({ key: phaseKey, type: currentPhaseType });

                        formattedChartData[i - 1][phaseKey] = prev.balance;
                    }

                    formattedChartData[i][phaseKey] = curr.balance;
                    formattedChartData[i].tooltipBalance = curr.balance;
                }

                const extendedRes = res as ExtendedResponse;
                extendedRes.phases = phases;

                if (extendedRes) extendedRes.chartData = formattedChartData as unknown as ChartPoint[];
                setData(extendedRes);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [campaignId, period]);

    const formatYAxisTick = (value: number) => {
        if (value === 0) return '0';
        if (value >= 1000000) {
            const tr = value / 1000000;
            return `${Number.isInteger(tr) ? tr : tr.toFixed(1).replace('.', ',')} Tr`;
        }
        if (value >= 1000) {
            const n = value / 1000;
            return `${Number.isInteger(n) ? n : n.toFixed(1).replace('.', ',')} N`;
        }
        return value.toString();
    };

    const CustomTooltipContent = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
        if (active && payload && payload.length) {
            const balanceData = payload.find((p: any) => p.payload && p.payload.tooltipBalance !== undefined);
            const val = balanceData ? Math.max(balanceData.payload.tooltipBalance, 0) : Math.max(payload[0].value, 0);
            const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
            return (
                <div style={{ background: '#fff', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#6B7280', fontSize: 13 }}>{label}</p>
                    <p style={{ margin: 0, color: '#111827', fontWeight: 800, fontSize: 15 }}>Số dư: <span style={{ color: '#0f172a' }}>{formatted}</span></p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 0' }}>
                <div style={{ width: 24, height: 24, border: '3px solid #e2e8f0', borderTopColor: '#ff5e14', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
        );
    }

    if (!data) return null;

    const hasData = (data.chartData && data.chartData.length > 0) && (data.totalReceived > 0 || data.totalSpent > 0);

    return (
        <div>
            {/* Header row with link + period selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Link
                    href={`/account/campaigns/transactions?campaignId=${campaignId}`}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 14px',
                        borderRadius: 9999,
                        background: '#ff5e14',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textDecoration: 'none',
                        transition: 'background 150ms',
                    }}
                >
                    Xem biến động số dư
                </Link>

                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    style={{
                        background: '#f8f9fa',
                        borderRadius: 8,
                        fontSize: 13,
                        cursor: 'pointer',
                        padding: '6px 28px 6px 12px',
                        border: '1px solid rgba(15,23,42,0.10)',
                        fontWeight: 600,
                        color: '#334155',
                        outline: 'none',
                    }}
                >
                    <option value="Tháng">Tháng</option>
                    <option value="Tuần">Tuần</option>
                    <option value="Ngày">Ngày</option>
                </select>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                    { label: 'Tổng nhận', value: data.totalReceived, color: '#10b981' },
                    { label: 'Tổng rút', value: data.totalSpent, color: '#ef4444' },
                    { label: 'Nhận từ quỹ chung', value: data.receivedFromGeneralFund || 0, color: '#3b82f6' },
                    { label: 'Số dư hiện tại', value: data.currentBalance, color: '#0f172a' },
                ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{item.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: item.color }}>
                            {new Intl.NumberFormat('vi-VN').format(item.value)} ₫
                        </span>
                    </div>
                ))}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginBottom: 16 }}>
                *Chú thích: Tr = Triệu đồng, N = Nghìn đồng
            </div>

            <div style={{ width: '100%', height: 350, position: 'relative' }}>
                {!hasData && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                        textAlign: 'center',
                        color: '#9CA3AF',
                        fontSize: 14,
                        fontWeight: 500,
                        background: 'rgba(255,255,255,0.8)',
                        padding: '8px 16px',
                        borderRadius: '8px'
                    }}>
                        Chưa có dữ liệu đóng góp/chi tiêu
                    </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data.chartData}
                        margin={{ top: 10, right: 30, left: 20, bottom: (data.chartData && data.chartData.length > 15) ? 40 : 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                            tickLine={{ stroke: '#E5E7EB' }}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                            interval={0}
                            angle={(data.chartData && data.chartData.length > 15) ? -45 : 0}
                            textAnchor={(data.chartData && data.chartData.length > 15) ? 'end' : 'middle'}
                            padding={{ left: 10, right: 10 }}
                            height={(data.chartData && data.chartData.length > 15) ? 60 : 30}
                        />
                        <YAxis
                            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                            tickLine={{ stroke: '#E5E7EB' }}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickFormatter={formatYAxisTick}
                            dx={-10}
                            domain={[0, 'auto']}
                        />
                        <Tooltip content={<CustomTooltipContent />} cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        {data.phases && data.phases.map(p => (
                            <Line
                                key={p.key}
                                type="monotone"
                                dataKey={p.key}
                                stroke={p.type === 'green' ? '#10b981' : '#ef4444'}
                                strokeWidth={3}
                                dot={{ r: 4, fill: p.type === 'green' ? '#10b981' : '#ef4444', strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                                animationDuration={1000}
                                connectNulls={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CampaignAnalyticsChart;
