'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const TrendLineChart = () => (
    <svg viewBox="0 0 400 180" className="w-full h-full">
        <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f3f4f6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
        </defs>

        {/* Grid Lines (Horizontal) */}
        {[0, 30, 60, 90, 120, 150].map((y, i) => (
            <line key={i} x1="0" y1={y} x2="400" y2={y} stroke="#f1f5f9" strokeWidth="1" />
        ))}

        <path
            d="M 0,130 Q 50,110 100,120 T 200,90 T 300,100 T 400,40 V 150 H 0 Z"
            fill="url(#trendGradient)"
        />
        <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d="M 0,130 Q 50,110 100,120 T 200,90 T 300,100 T 400,40"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2"
            strokeLinecap="round"
        />

        {/* Tooltip dot */}
        <circle cx="280" cy="98" r="4" fill="#1a1a1a" stroke="white" strokeWidth="2" shadow-md="true" />

        {/* X-Axis labels (Mockup) */}
        <g className="text-[8px] font-bold fill-gray-400 uppercase tracking-tighter">
            <text x="0" y="175">Jan</text>
            <text x="35" y="175">Feb</text>
            <text x="70" y="175">Mar</text>
            <text x="105" y="175">Apr</text>
            <text x="140" y="175">May</text>
            <text x="175" y="175">Jun</text>
            <text x="210" y="175">Jul</text>
            <text x="245" y="175">Aug</text>
            <text x="280" y="175">Sep</text>
            <text x="315" y="175">Oct</text>
            <text x="350" y="175">Nov</text>
            <text x="385" y="175">Dec</text>
        </g>
    </svg>
);

export function GeneralFundChart() {
    return (
        <div className="bg-white p-3 rounded-[20px] shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-wider">Xu hướng nguồn vốn</h3>
                <button className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-100 rounded-lg text-[8px] font-black text-gray-900 shadow-sm hover:bg-gray-50 uppercase tracking-widest">
                    Năm nay
                    <ChevronDown className="h-3 w-3" />
                </button>
            </div>

            <div className="flex-1 min-h-[100px] relative">
                <TrendLineChart />
                {/* Mock Tooltip */}
                <div className="absolute top-[40px] left-[260px] bg-white shadow-xl border border-gray-100 rounded-lg p-1.5 px-2 z-10 scale-75 origin-top-left">
                    <div className="text-[7px] font-black text-gray-400 uppercase">Tháng 9</div>
                    <div className="text-[9px] font-black text-gray-900">120.000.000đ</div>
                </div>
            </div>
        </div>
    );
}

