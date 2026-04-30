"use client";

import DanboxLayout from "@/layout/DanboxLayout";
import { useAuth } from "@/contexts/AuthContextProxy";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ReloadIcon } from "@radix-ui/react-icons";

export default function SignOutPage() {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  return (
    <DanboxLayout header={4} footer={2}>
      <section className="relative min-h-[100dvh] overflow-hidden bg-[#f8f5f2] px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#ff5e14]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-[1100px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-[2rem] bg-black/[0.03] p-2 ring-1 ring-black/[0.06]"
          >
            <div className="rounded-[calc(2rem-0.5rem)] bg-white p-6 md:p-10">
              <div className="flex flex-col gap-8 md:grid md:grid-cols-[1.2fr_0.8fr] md:items-start">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#fff0e8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b44a1d]">
                    <CheckIcon className="h-3.5 w-3.5" />
                    Phiên đăng xuất hoàn tất
                  </div>
                  <h1 className="text-3xl font-black leading-[1.06] tracking-tight text-[#1f2937] md:text-5xl">
                    Bạn đã đăng xuất an toàn khỏi TrustFundMe
                  </h1>
                  <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[#4b5563] md:text-base">
                    Cảm ơn bạn đã đồng hành. Khi quay lại, mọi dữ liệu chiến dịch và lịch sử ủng hộ vẫn được lưu giữ đầy đủ trong tài khoản của bạn.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/sign-in"
                      className="group inline-flex items-center rounded-full bg-[#111827] px-6 py-3 text-sm font-bold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#0b1220] active:scale-[0.98]"
                    >
                      Đăng nhập lại
                      <span className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                        <ArrowRightIcon className="h-4 w-4" />
                      </span>
                    </Link>
                    <Link
                      href="/campaigns"
                      className="inline-flex items-center rounded-full border border-[#111827]/20 bg-white px-6 py-3 text-sm font-bold text-[#111827] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#111827]/35 hover:bg-[#f8fafc] active:scale-[0.98]"
                    >
                      Xem chiến dịch đang mở
                    </Link>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-[#f8fafc] p-4 ring-1 ring-black/[0.08] md:p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b7280]">
                    Bước gợi ý tiếp theo
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      "Đăng nhập lại để tiếp tục theo dõi tiến độ chiến dịch.",
                      "Kiểm tra phần cập nhật để xem tác động mới nhất.",
                      "Quay về trang chủ để khám phá các chiến dịch đang cần hỗ trợ.",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl bg-white px-3 py-3 text-sm leading-relaxed text-[#334155] ring-1 ring-black/[0.06]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#ff5e14] transition-colors duration-300 hover:text-[#e0520f]"
                  >
                    <ReloadIcon className="h-4 w-4" />
                    Về trang chủ
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </DanboxLayout>
  );
}
