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
        <div className="mb-12">
            <div className="pl-6 pr-10 py-6 bg-white relative group/flow border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col lg:flex-row items-center">
                <div className="w-72 h-72 flex-shrink-0 relative z-20 lg:-ml-14 lg:-mr-16 transition-transform duration-700 group-hover/flow:scale-110 pointer-events-none drop-shadow-2xl">
                    <Image src={flowBgImg} alt="Flow Bg" width={300} height={300} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 relative z-10 py-2">
                    <p className="text-[11px] font-black text-[#1b4332] uppercase tracking-[4px] mb-4 flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100"><Clock className="w-4 h-4" /></span> {label}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {[
                            { title: 'Nhận Donate', desc: 'Ghi nhận & cập nhật số dư' },
                            { title: 'Gửi yêu cầu', desc: 'Kế hoạch & tiền rút (≤ quỹ)' },
                            { title: 'Staff duyệt', desc: 'Phê duyệt hoặc Từ chối' },
                            { title: 'Chuyển tiền', desc: '3 ngày (không tính lễ/tết)' },
                            { title: 'Up minh chứng', desc: 'Đầy đủ & đúng thời hạn' },
                        ].map((item, idx, arr) => {
                            const isActive = idx === 0;
                            return (
                                <div
                                    key={idx}
                                    className={`relative flex-1 min-w-[170px] py-6 px-10 transition-all duration-500 overflow-hidden ${isActive ? 'bg-[#1b4332] text-white' : 'bg-[#f4f7f6] text-[#1b4332]'
                                        }`}
                                    style={{
                                        clipPath: idx === 0
                                            ? 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)'
                                            : idx === arr.length - 1
                                                ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)'
                                                : 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)',
                                        marginLeft: idx === 0 ? '0' : '-18px'
                                    }}
                                >
                                    <div className="relative z-10 flex flex-col items-start ml-2">
                                        <span className={`text-[13px] font-black leading-tight tracking-tight ${isActive ? 'text-white' : 'text-[#1b4332]'}`}>
                                            {item.title}
                                        </span>
                                        <span className={`text-[9px] font-black uppercase tracking-[1px] mt-1.5 opacity-40 leading-tight`}>
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
