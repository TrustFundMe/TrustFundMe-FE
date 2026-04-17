import Image from 'next/image';
import { Clock } from 'lucide-react';

const flowBgImg = '/assets/img/campaign/8.png';

interface ExpenditureProcessFlowProps {
    campaignType: 'AUTHORIZED' | 'ITEMIZED';
}

export default function ExpenditureProcessFlow({ campaignType }: ExpenditureProcessFlowProps) {
    if (!campaignType) return null;

    const label = campaignType === 'AUTHORIZED' ? 'QUY TRÌNH GIẢI NGÂN (QUỸ ỦY QUYỀN)' : 'QUY TRÌNH GIẢI NGÂN (QUỸ VẬT PHẨM)';

    return (
        <div>
            <div className="flex flex-col items-start gap-4">
                <div className="flex-1 relative z-10 w-full">
                    <p className="text-[11px] font-black text-[#1b4332] uppercase tracking-[2px] mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {label}
                    </p>
                    <div className="flex flex-col gap-2">
                        {[
                            { title: 'Nhận Donate', desc: 'Sổ dư cập nhật công khai.' },
                            { title: 'Gửi yêu cầu', desc: 'Lập kế hoạch rút tiền.' },
                            { title: 'Staff duyệt', desc: 'Kiểm tra tính hợp lệ.' },
                            { title: 'Chuyển tiền', desc: 'Nhận tiền trong 3 ngày.' },
                            { title: 'Minh chứng', desc: 'Đối soát & công khai.' },
                        ].map((item, idx) => {
                            return (
                                <div
                                    key={idx}
                                    className="relative flex items-center gap-4 p-3 rounded-2xl bg-[#f8fafc] border border-slate-100 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex-shrink-0 flex items-center justify-center text-sm font-black text-[#1b4332] border border-slate-100">
                                        {idx + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-[#1b4332] tracking-tight">
                                            {item.title}
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-500 leading-tight">
                                            {item.desc}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
