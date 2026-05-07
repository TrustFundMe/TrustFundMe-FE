'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { paymentService, CassoTransaction } from '@/services/paymentService';

interface Props {
    campaignId?: number | string;
}

const formatYAxisTick = (value: number) => {
    if (value === 0) return '0';
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    if (abs >= 1000000) {
        const tr = abs / 1000000;
        return `${sign}${Number.isInteger(tr) ? tr : tr.toFixed(1).replace('.', ',')} Tr`;
    }
    if (abs >= 1000) {
        const n = abs / 1000;
        return `${sign}${Number.isInteger(n) ? n : n.toFixed(1).replace('.', ',')} N`;
    }
    return value.toString();
};

const CustomTooltipContent = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.cumulativeTotal);
        return (
            <div style={{ background: '#fff', padding: 14, borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #ffe0cc', minWidth: 200 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 800, color: '#ff5e14', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {new Date(data.timestamp).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p style={{ margin: 0, color: '#0f172a', fontWeight: 900, fontSize: 16 }}>
                    Số dư: {formatted}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#0f172a' }}>
                    Giao dịch: <strong style={{ color: data.amount >= 0 ? '#16a34a' : '#dc2626' }}>
                        {data.amount >= 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(data.amount)} VNĐ
                    </strong>
                </p>
            </div>
        );
    }
    return null;
};

const CampaignAnalyticsChart = ({ campaignId }: Props) => {
    const [transactions, setTransactions] = useState<CassoTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!campaignId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const id = typeof campaignId === 'string' ? parseInt(campaignId, 10) : campaignId;
                const txns = await paymentService.getCassoTransactionsByCampaign(id);
                setTransactions(txns);
            } catch {
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [campaignId]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 0' }}>
                <div style={{ width: 24, height: 24, border: '3px solid #ffe0cc', borderTopColor: '#ff5e14', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
        );
    }

    const sorted = [...transactions].sort(
        (a, b) => new Date(a.transactionDate || a.createdAt).getTime() - new Date(b.transactionDate || b.createdAt).getTime()
    );

    let cum = 0;
    const chartData = sorted.map((t) => {
        cum += t.amount;
        return {
            timestamp: new Date(t.transactionDate || t.createdAt).getTime(),
            amount: t.amount,
            cumulativeTotal: cum,
        };
    });

    const totalIn = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const currentBalance = totalIn - totalOut;
    const hasData = chartData.length > 0;

    return (
        <div>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
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
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                    { label: 'Tổng nhận', value: totalIn, color: '#16a34a' },
                    { label: 'Tổng rút', value: totalOut, color: '#dc2626' },
                    { label: 'Số dư hiện tại', value: currentBalance, color: '#0f172a' },
                ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{item.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: item.color }}>
                            {new Intl.NumberFormat('vi-VN').format(item.value)} ₫
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ width: '100%', height: 300, position: 'relative' }}>
                {!hasData && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        zIndex: 10, textAlign: 'center', color: '#0f172a', fontSize: 14, fontWeight: 700,
                        background: 'rgba(255,255,255,0.8)', padding: '8px 16px', borderRadius: '8px'
                    }}>
                        Chưa có giao dịch nào
                    </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <defs>
                            <linearGradient id="chartFillAnalytics" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ff5e14" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#ff5e14" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="timestamp" type="number" domain={['dataMin', 'dataMax']}
                            axisLine={false} tickLine={false}
                            tick={{ fontSize: 10, fill: '#0f172a', fontWeight: 700 }}
                            dy={8}
                            tickFormatter={(ts) => new Date(ts).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        />
                        <YAxis
                            axisLine={false} tickLine={false}
                            tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 600 }}
                            tickFormatter={formatYAxisTick}
                            dx={-5}
                            domain={['auto', 'auto']}
                            width={60}
                        />
                        <Tooltip content={<CustomTooltipContent />} cursor={{ stroke: '#ff5e14', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Area
                            type="monotone" dataKey="cumulativeTotal"
                            stroke="#ff5e14" strokeWidth={3} fillOpacity={1} fill="url(#chartFillAnalytics)"
                            dot={{ r: 3, fill: '#ff5e14', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 5, fill: '#0f172a', strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CampaignAnalyticsChart;
