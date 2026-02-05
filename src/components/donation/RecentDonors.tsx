import { RecentDonor } from './types';

type RecentDonorsProps = {
    donors: RecentDonor[];
};

export default function RecentDonors({ donors }: RecentDonorsProps) {
    return (
        <div className="pt-4 border-t border-gray-200 border-dashed">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 text-center">Mới nhất</h3>
            <div className="space-y-2">
                {donors.map(donor => (
                    <div key={donor.id} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                            <div className="font-bold text-gray-700">{donor.name}</div>
                        </div>
                        <div className="font-bold text-[#dc2626] text-right">{donor.amount.toLocaleString('vi-VN')}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
