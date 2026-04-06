'use client';

import React from 'react';
import { ChevronDown, Eye, Search, RotateCw, ArrowDownLeft, ArrowUpRight, FileText, CheckCircle2 } from 'lucide-react';

const activities = [
    { id: 'TX123', time: '14:30 06/04', type: 'IN', fundType: 'Authorized', source: 'Nguyễn Văn A', target: 'Quỹ Chung', amount: '1.200.000', content: 'Ủng hộ miền Trung', evidence: 'view_link', status: 'Completed', statusColor: 'text-green-600 bg-green-50 border-green-100' },
    { id: 'TX124', time: '15:20 06/04', type: 'OUT', fundType: 'Item-based', source: 'Chiến dịch #104', target: 'Staff 3 (Quỹ Hy Vọng)', amount: '25.140.036', isItem: true, itemCount: '500 suất', content: 'EXP-882', evidence: 'pending', status: 'Pending', statusColor: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
    { id: 'TX125', time: '16:45 06/04', type: 'OUT', fundType: 'Authorized', source: 'Cứu hộ động vật', target: 'Staff 1', amount: '5.000.000', content: 'EXP-885', evidence: 'need_review', status: 'Flagged', statusColor: 'text-red-600 bg-red-50 border-red-100' },
    { id: 'TX126', time: '17:10 06/04', type: 'IN', fundType: 'Authorized', source: 'Trần Thị B', target: 'Quỹ Chung', amount: '500.000', content: 'Quyên góp định kỳ', evidence: 'view_link', status: 'Completed', statusColor: 'text-green-600 bg-green-50 border-green-100' },
    { id: 'TX127', time: '08:15 07/04', type: 'OUT', fundType: 'Authorized', source: 'Xây trường vùng cao', target: 'Mặt trận Tổ quốc', amount: '150.000.000', content: 'EXP-901', evidence: 'view_link', status: 'Completed', statusColor: 'text-green-600 bg-green-50 border-green-100' },
    { id: 'TX128', time: '09:45 07/04', type: 'IN', fundType: 'Item-based', source: 'Công ty ABC', target: 'Kho Vật phẩm', amount: '0', isItem: true, itemCount: '2000 thùng mì', content: 'Ủng hộ dịch bệnh', evidence: 'view_link', status: 'Completed', statusColor: 'text-green-600 bg-green-50 border-green-100' },
    { id: 'TX129', time: '10:30 07/04', type: 'OUT', fundType: 'Authorized', source: 'Hỗ trợ bệnh nhi', target: 'Bệnh viện K', amount: '2.856.000', content: 'EXP-905', evidence: 'pending', status: 'Pending', statusColor: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
];

export const ApprovalQueue = () => {
    return (
        <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
            {/* Top Filters Block */}
            <div className="flex flex-col gap-3 mb-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.2em]">Quản lý dòng tiền hệ thống</h3>
                        <span className="bg-indigo-50 text-indigo-600 text-[11px] font-black px-2 py-0.5 rounded-full border border-indigo-100">
                            1.242 giao dịch
                        </span>
                    </div>
                    <button className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-indigo-500 border border-gray-100 shadow-sm">
                        <RotateCw className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid grid-cols-5 gap-3">
                    <div className="relative">
                        <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input type="text" placeholder="Tìm mã GD, đối tác..." className="pl-11 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-bold w-full outline-none" />
                    </div>
                    {['Loại GD: Tất cả', 'Loại Quỹ: Tất cả', 'Trạng thái: Tất cả'].map((filter, i) => (
                        <div key={i} className="relative">
                            <select className="appearance-none w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer pr-10">
                                <option>{filter}</option>
                            </select>
                            <ChevronDown className="h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    ))}
                    <div className="relative">
                        <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-between group cursor-pointer">
                            <span className="text-gray-400">Khoảng ngày</span>
                            <ChevronDown className="h-3 w-3 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Block */}
            <div className="overflow-x-auto mb-3 flex-1">
                <table className="w-full text-left table-fixed border-separate border-spacing-y-1">
                    <thead>
                        <tr className="text-[11px] font-black text-gray-400 uppercase tracking-[0.12em]">
                            <th className="pb-2 px-2 w-[14%]">Mã GD / Thời gian</th>
                            <th className="pb-2 px-2 text-center w-[7%]">Loại</th>
                            <th className="pb-2 px-2 w-[22%]">Nguồn / Đích</th>
                            <th className="pb-2 px-2 text-center w-[16%]">Số tiền</th>
                            <th className="pb-2 px-2 w-[16%]">Nội dung / Đợt chi</th>
                            <th className="pb-2 px-2 text-center w-[10%]">Bằng chứng</th>
                            <th className="pb-2 px-2 text-center w-[10%]">Trạng thái</th>
                            <th className="pb-2 px-2 text-center w-[5%]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((activity) => (
                            <tr key={activity.id} className="group hover:bg-gray-50 transition-colors">
                                <td className="py-1.5 px-2">
                                    <div className="flex flex-col">
                                        <span className="text-[12px] font-black text-gray-900 leading-tight">#{activity.id}</span>
                                        <span className="text-[10px] font-bold text-gray-400">{activity.time}</span>
                                    </div>
                                </td>
                                <td className="py-1.5 px-2 text-center">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mx-auto shadow-sm ${activity.type === 'IN' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {activity.type === 'IN' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                    </div>
                                </td>
                                <td className="py-1.5 px-2">
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[12px] font-black text-gray-900 truncate tracking-tight">{activity.source}</span>
                                        <span className="text-[10px] font-bold text-gray-400 truncate opacity-80 leading-none">➜ {activity.target}</span>
                                    </div>
                                </td>
                                <td className="py-1.5 px-2 text-center">
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-black text-gray-900 tracking-tight">
                                            {activity.amount} <span className="underline text-[10px]">đ</span>
                                        </span>
                                        {activity.isItem && (
                                            <span className="text-[10px] font-black text-orange-500 italic">({activity.itemCount})</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-1.5 px-2">
                                    <div className="flex items-center gap-1.5 py-1 px-2.5 bg-gray-50 border border-gray-100 rounded-xl w-fit">
                                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-[11px] font-black text-gray-600 line-clamp-1">{activity.content}</span>
                                    </div>
                                </td>
                                <td className="py-1.5 px-2 text-center">
                                    {activity.evidence === 'view_link' ? (
                                        <button className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">Xem ảnh</button>
                                    ) : activity.evidence === 'pending' ? (
                                        <span className="text-[10px] font-bold text-gray-300 italic">Chờ...</span>
                                    ) : (
                                        <button className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">Audit</button>
                                    )}
                                </td>
                                <td className="py-1.5 px-2 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border tracking-tight ${activity.statusColor}`}>
                                        {activity.status === 'Completed' ? 'Thành công' : activity.status === 'Pending' ? 'Chờ duyệt' : 'Nghi vấn'}
                                    </span>
                                </td>
                                <td className="py-1.5 px-2 text-right">
                                    <button className="p-2 opacity-0 group-hover:opacity-100 transition-all text-gray-400 hover:text-indigo-600">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Block */}
            <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-50 text-[11px] font-bold text-gray-400">
                <span>Hiển thị {activities.length} / 1.242</span>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-300"><ChevronDown className="h-4 w-4 rotate-90" /></button>
                    <span className="mx-2 text-gray-900 font-black">Trang 1 / 178</span>
                    <button className="p-1.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-900"><ChevronDown className="h-4 w-4 -rotate-90" /></button>
                </div>
            </div>
        </div>
    );
};
