import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export function VolunteerDoubleCta() {
    return (
        <section className="relative w-full flex flex-col md:flex-row min-h-[200px] lg:min-h-[240px]">
            {/* Left Box */}
            <div
                className="flex-1 relative flex items-center justify-center p-6 lg:p-10 bg-cover bg-center overflow-hidden"
                style={{ backgroundImage: 'url("/assets/img/campaign/2.jpg")' }} // Custom background 1
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-[#E85B42]/85 z-0"></div>
                <div className="relative z-10 text-center max-w-sm text-white flex flex-col items-center">
                    <h2 className="font-chelsea_market text-2xl sm:text-3xl md:text-3xl lg:text-4xl mb-2 text-white">Quỹ ủy quyền</h2>
                    <p className="text-sm opacity-95 mb-6 font-dm-sans leading-relaxed">
                        Nhà tài trợ ủy thác cho TrustFundMe toàn quyền quản lý và thực hiện các chiến dịch gây quỹ thay mặt mình.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center bg-[#800000] text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-[#155449] transition-all font-dm-sans"
                    >
                        Xem
                    </Link>
                </div>
            </div>

            {/* Right Box */}
            <div
                className="flex-1 relative flex items-center justify-center p-6 lg:p-10 bg-cover bg-center overflow-hidden"
                style={{ backgroundImage: 'url("/assets/img/campaign/3.png")' }} // Custom background 2
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-[#283838]/85 z-0"></div>
                <div className="relative z-10 text-center max-w-sm text-white flex flex-col items-center">
                    <h2 className="font-chelsea_market text-2xl sm:text-3xl md:text-3xl lg:text-4xl mb-2 text-white">Quỹ vật phẩm</h2>
                    <p className="text-sm opacity-90 mb-6 font-dm-sans leading-relaxed">
                        Nhà tài trợ lựa chọn những mặt hàng được cung cấp rồi ra quyết định quyên góp phù hợp.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center bg-[#ea550c] text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-[#155449] transition-all font-dm-sans"
                    >
                        Xem
                    </Link>
                </div>
            </div>

            {/* Center Icon Overlay */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center">
                <div className="bg-transparent rounded-full flex items-center justify-center p-0 relative">
                    <img
                        src="/assets/img/campaign/1.png"
                        alt="Volunteer Logo"
                        className="w-24 h-24 lg:w-32 lg:h-32 object-contain"
                    />
                </div>
            </div>
        </section>
    );
}
