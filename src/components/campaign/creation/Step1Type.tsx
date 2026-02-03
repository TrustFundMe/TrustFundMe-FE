'use client';

import { useState } from 'react';
import { ShieldCheck, Target, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface Step1TypeProps {
    data: any;
    onChange: (key: any, value: any) => void;
}

export default function Step1Type({ data, onChange }: Step1TypeProps) {
    const [flipped, setFlipped] = useState<string | null>(null);

    const isAuthorized = data.fundType === 'AUTHORIZED';
    const isItemized = data.fundType === 'ITEMIZED';

    const handleFlip = (type: string) => {
        setFlipped(flipped === type ? null : type);
    };

    const handleSelect = (e: React.MouseEvent, type: string) => {
        e.stopPropagation();
        onChange('fundType', type);
        setFlipped(null);
    };

    return (
        <div className="flex flex-col items-center pt-0">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black tracking-tight text-black mb-3">Chọn Loại Quỹ</h2>
                <p className="text-[13px] font-bold text-black/30">Nhấn vào thẻ để biết chi tiết loại quỹ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-2xl px-4">
                {/* Quỹ Ủy Quyền */}
                <div className="perspective-1000 group">
                    <div
                        onClick={() => handleFlip('AUTHORIZED')}
                        className={`relative w-full h-[320px] transition-transform duration-700 preserve-3d cursor-pointer ${flipped === 'AUTHORIZED' ? 'rotate-y-180' : ''
                            }`}
                    >
                        {/* Front */}
                        <div className={`absolute inset-0 backface-hidden rounded-[2.5rem] p-4 flex flex-col items-center justify-between transition-all duration-500 pb-8 ${isAuthorized
                            ? 'bg-white shadow-[0_40px_80px_-15px_rgba(220,38,38,0.15)] ring-2 ring-red-500/10'
                            : 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
                            }`}>
                            <div className="relative w-[110%] h-[200px] transition-transform duration-500 group-hover:scale-105 mt-[-20px]">
                                <Image
                                    src="/assets/img/campaign/trust.webp"
                                    alt="Authorized Fund"
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <h3 className={`text-xl font-black tracking-tight ${isAuthorized ? 'text-[#dc2626]' : 'text-black/80'}`}>
                                    Quỹ Ủy Quyền
                                </h3>
                                {isAuthorized && (
                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#dc2626]">
                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                        Đã chọn
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[2.5rem] p-8 flex flex-col items-center justify-center bg-[#dc2626] text-white overflow-hidden">
                            <ShieldCheck className="absolute top-[-10px] right-[-10px] h-24 w-24 opacity-10 rotate-12" />
                            <h3 className="text-xl font-black mb-3 tracking-tight">Cơ chế Ủy Quyền</h3>
                            <p className="text-[12px] text-center leading-relaxed font-bold opacity-80 mb-6 max-w-[200px]">
                                Donor tin tưởng vào uy tín cá nhân. Phù hợp cho cứu trợ khẩn cấp hoặc các quỹ linh hoạt.
                            </p>
                            <button
                                onClick={(e) => handleSelect(e, 'AUTHORIZED')}
                                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isAuthorized
                                    ? 'bg-white text-[#dc2626] shadow-2xl scale-95 opacity-80'
                                    : 'bg-white text-[#dc2626] hover:scale-105 shadow-xl shadow-red-900/20'
                                    }`}
                            >
                                {isAuthorized ? 'Đã được chọn' : 'Chọn loại quỹ này'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quỹ Mục Tiêu */}
                <div className="perspective-1000 group">
                    <div
                        onClick={() => handleFlip('ITEMIZED')}
                        className={`relative w-full h-[320px] transition-transform duration-700 preserve-3d cursor-pointer ${flipped === 'ITEMIZED' ? 'rotate-y-180' : ''
                            }`}
                    >
                        {/* Front */}
                        <div className={`absolute inset-0 backface-hidden rounded-[2.5rem] p-4 flex flex-col items-center justify-between transition-all duration-500 pb-8 ${isItemized
                            ? 'bg-white shadow-[0_40px_80px_-15px_rgba(220,38,38,0.15)] ring-2 ring-red-500/10'
                            : 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
                            }`}>
                            <div className="relative w-[110%] h-[200px] transition-transform duration-500 group-hover:scale-105 mt-[-20px]">
                                <Image
                                    src="/assets/img/campaign/select.webp"
                                    alt="Itemized Fund"
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <h3 className={`text-xl font-black tracking-tight ${isItemized ? 'text-[#dc2626]' : 'text-black/80'}`}>
                                    Quỹ Mục Tiêu
                                </h3>
                                {isItemized && (
                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#dc2626]">
                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                        Đã chọn
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[2.5rem] p-8 flex flex-col items-center justify-center bg-[#dc2626] text-white overflow-hidden">
                            <Target className="absolute top-[-10px] right-[-10px] h-24 w-24 opacity-10 rotate-12" />
                            <h3 className="text-xl font-black mb-3 tracking-tight">Cơ chế Mục Tiêu</h3>
                            <p className="text-[12px] text-center leading-relaxed font-bold opacity-80 mb-6 max-w-[200px]">
                                Minh bạch từng vật phẩm. Phù hợp cho xây trường, ca phẫu thuật hoặc mua sắm nhu yếu phẩm.
                            </p>
                            <button
                                onClick={(e) => handleSelect(e, 'ITEMIZED')}
                                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isItemized
                                    ? 'bg-white text-[#dc2626] shadow-2xl scale-95 opacity-80'
                                    : 'bg-white text-[#dc2626] hover:scale-105 shadow-xl shadow-red-900/20'
                                    }`}
                            >
                                {isItemized ? 'Đã được chọn' : 'Chọn loại quỹ này'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
}
