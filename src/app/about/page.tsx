"use client";

import Image from "next/image";
import Link from "next/link";
import DanboxLayout from "@/layout/DanboxLayout";

const AboutPage = () => {
  return (
    <DanboxLayout header={4}>
      <div className="min-h-screen bg-[#f8fafe]">
        <section className="container mx-auto px-4 pt-24 pb-10 md:pt-28 md:pb-14">
          <div className="rounded-[2rem] border border-[rgba(15,23,42,0.12)] bg-white p-7 md:p-10">
            <span className="inline-flex rounded-full bg-[#fff0e8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d14f1b]">
              Về TrustFundMe
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight text-[#111827] leading-[1.06]">
              Nền tảng gây quỹ minh bạch cho cộng đồng Việt
            </h1>
            <p className="mt-5 max-w-[72ch] text-[15px] md:text-[17px] leading-relaxed text-[#4b5563]">
              TrustFundMe giúp kết nối người cần giúp đỡ, chủ chiến dịch và nhà hảo tâm trên cùng một nền tảng.
              Mọi khoản đóng góp, mọi đợt chi tiêu và từng cập nhật tiến độ đều được hiển thị rõ để cộng đồng theo dõi.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/campaigns"
                className="inline-flex h-11 items-center rounded-full bg-[#111827] px-6 text-sm font-extrabold text-white transition-colors hover:bg-[#1f2937]"
              >
                Xem chiến dịch
              </Link>
              <Link
                href="/new-campaign-test"
                className="inline-flex h-11 items-center rounded-full border border-[#111827] bg-white px-6 text-sm font-extrabold text-[#111827] transition-colors hover:bg-[#f3f4f6]"
              >
                Tạo chiến dịch
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-10 md:pb-14">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { title: "Minh bạch dòng tiền", value: "100%", desc: "Khoản đóng góp, giải ngân và số dư được hiển thị rõ ràng." },
              { title: "Theo dõi theo mốc", value: "Theo thời gian thực", desc: "Mỗi milestone đều có tiến độ và hồ sơ chi tiêu tương ứng." },
              { title: "Tập trung tác động thật", value: "Dữ liệu trước, cảm tính sau", desc: "Ưu tiên quyết định dựa trên thông tin và bằng chứng." },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.25rem] border border-[rgba(15,23,42,0.12)] bg-white p-5"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6b7280]">{item.title}</p>
                <p className="mt-2 text-2xl font-black text-[#111827]">{item.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-12 md:pb-16">
          <div className="rounded-[2rem] border border-[rgba(15,23,42,0.12)] bg-white p-6 md:p-8">
            <div className="mb-5">
              <h2 className="text-2xl md:text-3xl font-black text-[#111827] tracking-tight">
                Câu chuyện và hoạt động cộng đồng
              </h2>
              <p className="mt-2 text-sm md:text-base text-[#4b5563]">
                Hình ảnh hoạt động thực tế giúp nhà hảo tâm thấy rõ chiến dịch đang triển khai ra sao.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                "/assets/img/about/05.jpg",
                "/assets/img/about/06.jpg",
                "/assets/img/about/07.jpg",
              ].map((src, idx) => (
                <div
                  key={src}
                  className="overflow-hidden rounded-[1.25rem] border border-[rgba(15,23,42,0.12)] bg-[#f3f4f6]"
                >
                  <Image
                    src={src}
                    alt={`Hoạt động cộng đồng ${idx + 1}`}
                    width={900}
                    height={650}
                    className="h-[260px] w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DanboxLayout>
  );
};

export default AboutPage;
