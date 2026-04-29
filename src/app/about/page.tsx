"use client";

import { About2 } from "@/components/About";
import { CounterSection1 } from "@/components/CounterSection";
import { Team2 } from "@/components/Team";
import DanboxLayout from "@/layout/DanboxLayout";

const AboutPage = () => {
  return (
    <DanboxLayout header={4}>
      <div className="relative min-h-screen bg-[#f7fbfa]">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#dcefea] to-transparent pointer-events-none" />

        <div className="relative z-10 pt-24">
          <section className="container mx-auto px-4 py-16 md:py-20">
            <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#d8e9e4] bg-white p-8 md:p-12 shadow-[0_10px_30px_-20px_rgba(15,93,81,0.3)]">
              <span className="inline-block rounded-full bg-[#e9f6f1] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f5d51]">
                Về TrustFundMe
              </span>
              <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight text-[#103d36]">
                Nền tảng gây quỹ minh bạch cho cộng đồng
              </h1>
              <p className="mt-5 text-base md:text-lg leading-relaxed text-[#32564f]">
                TrustFundMe kết nối người cần giúp đỡ, chủ chiến dịch và nhà hảo tâm trên cùng một nền tảng.
                Chúng tôi tập trung vào minh bạch dòng tiền, tiến độ theo mốc và trải nghiệm quyên góp rõ ràng để
                mọi đóng góp tạo ra tác động thực tế.
              </p>
            </div>
          </section>

          <section className="py-8 md:py-14">
            <div className="container mx-auto px-4 text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-[#103d36]">
                Đồng hành cùng những người tạo tác động
              </h2>
              <p className="mt-3 text-[#4f6f69] max-w-3xl mx-auto">
                Chúng tôi giúp bạn tìm, theo dõi và ủng hộ các chiến dịch uy tín bằng dữ liệu rõ ràng thay vì lời hứa chung chung.
              </p>
            </div>
            <div className="relative z-10">
              <Team2 />
            </div>
          </section>

          <section className="relative z-10 space-y-14 pb-16">
            <div className="bg-white/90 border-y border-[#d8e9e4]">
              <About2 containerClass="section-padding pb-0" />
            </div>
            <div className="container mx-auto px-4">
              <CounterSection1 />
            </div>
          </section>
        </div>
      </div>
    </DanboxLayout>
  );
};

export default AboutPage;
