'use client';

import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { paymentService, CampaignAnalyticsResponse } from '@/services/paymentService';

interface Props {
    campaignId?: number | string;
}

const CampaignAnalyticsChart = ({ campaignId }: Props) => {
    const [data, setData] = useState<CampaignAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('Tháng');

    useEffect(() => {
        if (!campaignId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const id = typeof campaignId === 'string' ? parseInt(campaignId, 10) : campaignId;
                console.log("📊 [Analytics] Fetching data for ID:", id, "period:", period);
                const res = await paymentService.getCampaignAnalytics(id, period);
                console.log("📊 [Analytics] Success:", res);
                setData(res);
            } catch (err: any) {
                console.error("❌ Failed to fetch campaign analytics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [campaignId, period]);

    const customTooltipFormatter = (value: any) => {
        if (typeof value === 'number') {
            return [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Số dư'];
        }
        return [value, 'Số dư'];
    };

    if (loading) {
        return (
            <div style={{
                border: '1px solid rgba(0,0,0,0.10)',
                borderRadius: 16,
                padding: '48px',
                background: '#fff',
                marginTop: '32px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const hasData = (data.chartData && data.chartData.length > 0) && (data.totalReceived > 0 || data.totalSpent > 0);

    return (
        <div style={{
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 16,
            padding: '24px',
            background: '#fff',
            marginTop: '32px',
            position: 'relative'
        }}>
            <div className="d-flex flex-column gap-4" style={{ marginBottom: 32 }}>
                <div className="d-flex align-items-center justify-content-between">
                    <h4 style={{ marginBottom: 0, fontSize: 20, fontWeight: 700 }}>Thống Kê Giao Dịch</h4>

                    <div className="d-flex align-items-center gap-2">
                        <select
                            className="form-select text-sm border-0"
                            style={{ background: '#f8f9fa', borderRadius: 8, fontSize: 13, cursor: 'pointer', paddingRight: '28px' }}
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        >
                            <option value="Năm">Năm</option>
                            <option value="Tháng">Tháng</option>
                            <option value="Tuần">Tuần</option>
                            <option value="Ngày">Ngày</option>
                        </select>
                    </div>
                </div>

                {/* Custom Legend - Horizontal */}
                <div className="d-flex align-items-center gap-4 flex-wrap">
                    <div className="d-flex align-items-center">
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#0F5D51' }}></div>
                        <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>Tổng nhận</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#0F5D51', marginLeft: 8 }}>
                            {new Intl.NumberFormat('vi-VN').format(data.totalReceived)} ₫
                        </span>
                    </div>
                    <div className="d-flex align-items-center">
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                        <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>Tổng rút</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#ef4444', marginLeft: 8 }}>
                            {new Intl.NumberFormat('vi-VN').format(data.totalSpent)} ₫
                        </span>
                    </div>
                    <div className="d-flex align-items-center">
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#000' }}></div>
                        <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>Số dư hiện tại</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#000', marginLeft: 8 }}>
                            {new Intl.NumberFormat('vi-VN').format(data.currentBalance)} ₫
                        </span>
                    </div>
                </div>
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
                        margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                            tickLine={{ stroke: '#E5E7EB' }}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                            padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                            tickLine={{ stroke: '#E5E7EB' }}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)}
                            dx={-10}
                            domain={[0, Number(data.targetAmount) > 0 ? Number(data.targetAmount) : 1000000]}
                        />
                        <Tooltip
                            formatter={customTooltipFormatter}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                            itemStyle={{ fontWeight: 600 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="balanceGreen"
                            stroke="#0F5D51"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#0F5D51', strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                            animationDuration={1000}
                        />
                        <Line
                            type="monotone"
                            dataKey="balanceRed"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                            animationDuration={1000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CampaignAnalyticsChart;
