import Link from 'next/link';
import { decree93SeparateAccountNotice, fullRiskTermsVietnamese, lawReferences } from '@/components/campaign/new-campaign-test/mockData';

export default function NewCampaignLegalPage() {
  return (
    <main className="min-h-[100dvh] bg-[#f9fafb] px-4 py-8 md:py-10">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Điều khoản pháp lý</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">Chính sách tạo chiến dịch và KYC</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            Trước khi tạo chiến dịch, chủ quỹ cần hoàn tất KYC và dùng tài khoản ngân hàng chính chủ để tiếp nhận - giải ngân quỹ minh bạch.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold text-brand transition hover:bg-orange-100"
              href="/templates/mau-cam-ket-tai-khoan.txt"
              download
            >
              Tải mẫu cam kết tài khoản
            </a>
            <a
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              href="/templates/mau-ke-khai-thong-tin-ca-nhan.txt"
              download
            >
              Tải mẫu kê khai thông tin cá nhân
            </a>
          </div>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-base font-semibold text-gray-900">Yêu cầu bắt buộc về KYC và tài khoản ngân hàng</h2>
          <p className="mt-2 text-justify text-sm leading-relaxed text-gray-700">{decree93SeparateAccountNotice}</p>
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Lưu ý: Nếu KYC chưa đạt hoặc tài khoản ngân hàng không trùng tên KYC, hệ thống sẽ chặn bước tạo chiến dịch.
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-base font-semibold text-gray-900">Văn bản tham chiếu</h2>
          <ul className="mt-2 space-y-2 text-sm text-gray-700">
            {lawReferences.map((law) => (
              <li key={law} className="rounded-lg bg-gray-50 px-3 py-2">
                {law}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-base font-semibold text-gray-900">Toàn văn điều khoản</h2>
          <pre className="mt-2 whitespace-pre-wrap text-justify text-sm leading-relaxed text-gray-700">{fullRiskTermsVietnamese}</pre>
        </section>

        <div className="flex justify-end">
          <Link
            href="/new-campaign-test"
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            Quay lại tạo chiến dịch
          </Link>
        </div>
      </div>
    </main>
  );
}
