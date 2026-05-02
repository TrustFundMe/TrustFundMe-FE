import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftRight } from 'lucide-react';

interface ExpenditureStatsProps {
    campaignId: string | number;
    balance: number;
    withdrawalCount: number;
    totalWithdrawnAmount: number;
}

const planeImg = '/assets/img/campaign/5.png';
const blocksImg = '/assets/img/campaign/6.png';
const infinityImg = '/assets/img/campaign/7.png';

export default function ExpenditureStats({ campaignId, balance, withdrawalCount, totalWithdrawnAmount }: ExpenditureStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Card 1: Balance */}
            <Link href={`/account/campaigns/transactions?campaignId=${campaignId}`} className="relative h-[100px] bg-[#2d3a30] rounded-2xl p-4 flex flex-col justify-center group overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
                <div className="absolute top-[-40%] right-[-15%] w-[180px] h-[180px] pointer-events-none opacity-80 transition-transform group-hover:scale-110">
                    <Image src={planeImg} alt="Balance" width={180} height={180} className="w-full h-full object-contain" />
                </div>
                <div className="absolute bottom-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                        <ArrowLeftRight className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black text-white tracking-tighter leading-none mb-1">
                        {new Intl.NumberFormat('vi-VN').format(balance)} <span className="text-[10px] align-top opacity-60">VNĐ</span>
                    </h3>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[1px] flex items-center gap-1 group-hover:text-white transition-colors">
                        SỐ DƯ HIỆN TẠI (XEM BIẾN ĐỘNG)
                    </p>
                </div>
            </Link>

            {/* Card 2: Count */}
            <div className="relative h-[100px] bg-[#a8ba9a] rounded-2xl p-4 flex flex-col justify-center group overflow-hidden transition-all duration-500 hover:shadow-lg border border-[#a8ba9a]/50">
                <div className="absolute top-[-25%] right-[-10%] w-[160px] h-[160px] pointer-events-none opacity-80 transition-transform group-hover:scale-110">
                    <Image src={blocksImg} alt="Expenditures" width={160} height={160} className="w-full h-full object-contain" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black text-[#2d3a30] tracking-tighter leading-none mb-1">
                        {withdrawalCount ?? 0} <span className="text-[10px] align-top opacity-40">LẦN</span>
                    </h3>
                    <p className="text-[10px] font-black text-[#2d3a30]/50 uppercase tracking-[1px]">Số lần đã rút tiền</p>
                </div>
            </div>

            {/* Card 3: Total Withdrawn */}
            <div className="relative h-[100px] bg-[#e3dec8] rounded-2xl p-4 flex flex-col justify-center group overflow-hidden transition-all duration-500 hover:shadow-lg border border-[#e3dec8]/50">
                <div className="absolute top-[-25%] right-[-10%] w-[160px] h-[160px] pointer-events-none opacity-80 transition-transform group-hover:scale-110">
                    <Image src={infinityImg} alt="Total Withdrawn" width={160} height={160} className="w-full h-full object-contain" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black text-[#2d3a30] tracking-tighter leading-none mb-1">
                        {new Intl.NumberFormat('vi-VN').format(totalWithdrawnAmount || 0)} <span className="text-[10px] align-top opacity-40">VNĐ</span>
                    </h3>
                    <p className="text-[10px] font-black text-[#2d3a30]/50 uppercase tracking-[1px]">Tổng tiền đã rút thực tế</p>
                </div>
            </div>
        </div>
    );
}
