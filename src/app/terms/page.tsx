"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DanboxLayout from "@/layout/DanboxLayout";

/* ───────────────────────────── Data ───────────────────────────── */

interface Section {
  id: string;
  number: string;
  title: string;
  content: React.ReactNode;
}

const LAST_UPDATED = "06/05/2026";

const sections: Section[] = [
  /* ─── I ─── */
  {
    id: "dieu-khoan-chung",
    number: "I",
    title: "Điều khoản chung",
    content: (
      <>
        <h4 className="mt-0 mb-2 text-[15px] font-extrabold text-slate-800">1. Phạm vi áp dụng</h4>
        <p>
          Các Điều khoản sử dụng này (&quot;Điều khoản&quot;) áp dụng cho mọi cá nhân, tổ chức truy cập hoặc sử dụng
          nền tảng gây quỹ cộng đồng TrustFundMe, bao gồm nhưng không giới
          hạn ở website, ứng dụng di động, API và mọi dịch vụ liên quan (gọi chung là &quot;Nền tảng&quot;).
        </p>
        <p>
          Bằng việc truy cập hoặc sử dụng Nền tảng, bạn xác nhận đã đọc, hiểu và đồng ý ràng buộc bởi toàn bộ nội
          dung Điều khoản này. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng Nền tảng ngay lập tức.
        </p>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">2. Định nghĩa thuật ngữ</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 px-3 py-2 text-left font-bold text-slate-700">Thuật ngữ</th>
                <th className="border border-slate-200 px-3 py-2 text-left font-bold text-slate-700">Định nghĩa</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr><td className="border border-slate-200 px-3 py-2 font-semibold">Nền tảng</td><td className="border border-slate-200 px-3 py-2">Hệ thống TrustFundMe, bao gồm website, ứng dụng và toàn bộ dịch vụ đi kèm.</td></tr>
              <tr><td className="border border-slate-200 px-3 py-2 font-semibold">Người dùng</td><td className="border border-slate-200 px-3 py-2">Bất kỳ cá nhân hoặc tổ chức nào đăng ký tài khoản hoặc truy cập Nền tảng.</td></tr>
              <tr><td className="border border-slate-200 px-3 py-2 font-semibold">Chiến dịch</td><td className="border border-slate-200 px-3 py-2">Một dự án gây quỹ được tạo trên Nền tảng với mục tiêu, mô tả và kế hoạch chi tiêu cụ thể.</td></tr>
              <tr><td className="border border-slate-200 px-3 py-2 font-semibold">Nhà tổ chức</td><td className="border border-slate-200 px-3 py-2">Người dùng tạo và quản lý chiến dịch gây quỹ trên Nền tảng.</td></tr>
              <tr><td className="border border-slate-200 px-3 py-2 font-semibold">Người quyên góp</td><td className="border border-slate-200 px-3 py-2">Người dùng thực hiện đóng góp tài chính cho một chiến dịch.</td></tr>
              <tr><td className="border border-slate-200 px-3 py-2 font-semibold">Đợt chi tiêu (Expenditure)</td><td className="border border-slate-200 px-3 py-2">Khoản giải ngân từ quỹ chiến dịch, gắn với mốc tiến độ và bằng chứng chi tiêu.</td></tr>
              <tr><td className="border border-slate-200 px-3 py-2 font-semibold">Mốc tiến độ (Milestone)</td><td className="border border-slate-200 px-3 py-2">Cột mốc trong kế hoạch triển khai chiến dịch, đánh dấu giai đoạn hoàn thành.</td></tr>
              <tr><td className="border border-slate-200 px-3 py-2 font-semibold">Mục tiêu gây quỹ</td><td className="border border-slate-200 px-3 py-2">Số tiền cần huy động cho chiến dịch, được nhà tổ chức đặt khi tạo chiến dịch.</td></tr>
              <tr><td className="border border-slate-200 px-3 py-2 font-semibold">Điểm tin cậy (Trust Score)</td><td className="border border-slate-200 px-3 py-2">Chỉ số đánh giá mức độ uy tín của nhà tổ chức dựa trên lịch sử hoạt động.</td></tr>
              <tr><td className="border border-slate-200 px-3 py-2 font-semibold">KYC</td><td className="border border-slate-200 px-3 py-2">Know Your Customer – quy trình xác minh danh tính người dùng.</td></tr>
            </tbody>
          </table>
        </div>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">3. Điều kiện sử dụng dịch vụ</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Người dùng phải từ đủ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ hợp pháp.</li>
          <li>Người dùng phải cung cấp thông tin chính xác, đầy đủ khi đăng ký tài khoản.</li>
          <li>Mỗi cá nhân chỉ được sở hữu một (01) tài khoản trên Nền tảng.</li>
          <li>Việc sử dụng Nền tảng phải tuân thủ pháp luật Việt Nam và các quy định quốc tế có liên quan.</li>
          <li>Nền tảng có quyền từ chối cung cấp dịch vụ cho bất kỳ ai mà không cần nêu lý do.</li>
        </ul>
      </>
    ),
  },

  /* ─── II ─── */
  {
    id: "tai-khoan-nguoi-dung",
    number: "II",
    title: "Tài khoản người dùng",
    content: (
      <>
        <h4 className="mt-0 mb-2 text-[15px] font-extrabold text-slate-800">1. Đăng ký &amp; Xác minh (KYC)</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Để sử dụng đầy đủ tính năng (tạo chiến dịch, quyên góp), người dùng cần hoàn tất đăng ký tài khoản bằng email hoặc số điện thoại hợp lệ.</li>
          <li>Nhà tổ chức chiến dịch <strong>bắt buộc</strong> phải hoàn tất xác minh danh tính (KYC) trước khi chiến dịch được phê duyệt. Quy trình KYC bao gồm:
            <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
              <li>Cung cấp ảnh chụp CMND/CCCD/Hộ chiếu còn hiệu lực (mặt trước và mặt sau).</li>
              <li>Ảnh chân dung selfie (đối chiếu khuôn mặt với giấy tờ tùy thân).</li>
              <li>Xác minh sinh trắc học khuôn mặt (Face Biometric) nếu được yêu cầu.</li>
              <li>Thông tin tài khoản ngân hàng chính chủ để nhận giải ngân.</li>
            </ul>
          </li>
          <li>Nền tảng có quyền yêu cầu bổ sung hồ sơ xác minh bất kỳ lúc nào.</li>
          <li>Thời gian xử lý KYC thông thường là 1–3 ngày làm việc.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">2. Bảo mật tài khoản</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập (email, mật khẩu, mã OTP).</li>
          <li>Không chia sẻ tài khoản hoặc quyền truy cập cho bên thứ ba.</li>
          <li>Thông báo ngay cho Nền tảng khi phát hiện truy cập trái phép vào tài khoản qua email <strong>support@trustfundme.vn</strong>.</li>
          <li>Nền tảng khuyến nghị sử dụng mật khẩu mạnh (tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt).</li>
          <li>Nền tảng không chịu trách nhiệm cho các thiệt hại phát sinh do người dùng không bảo mật tài khoản đúng cách.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">3. Trách nhiệm của người dùng</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Cung cấp thông tin cá nhân chính xác, trung thực và cập nhật khi có thay đổi.</li>
          <li>Tuân thủ mọi quy định của Nền tảng và pháp luật hiện hành.</li>
          <li>Không sử dụng Nền tảng cho mục đích bất hợp pháp, gian lận, hoặc vi phạm đạo đức.</li>
          <li>Chịu trách nhiệm hoàn toàn cho mọi hoạt động diễn ra dưới tài khoản của mình.</li>
        </ul>
      </>
    ),
  },

  /* ─── III ─── */
  {
    id: "chien-dich-gay-quy",
    number: "III",
    title: "Chiến dịch gây quỹ",
    content: (
      <>
        <h4 className="mt-0 mb-2 text-[15px] font-extrabold text-slate-800">1. Điều kiện tạo chiến dịch</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Nhà tổ chức phải hoàn tất KYC và có tài khoản ngân hàng đã xác minh.</li>
          <li>Chiến dịch phải thuộc các danh mục được phép: Y tế, Giáo dục, Thiên tai, Cộng đồng, Môi trường, Trẻ em, Người cao tuổi, và các danh mục khác do Nền tảng quy định.</li>
          <li>Mô tả chiến dịch phải rõ ràng, trung thực, bao gồm: mục đích gây quỹ, đối tượng thụ hưởng, kế hoạch sử dụng quỹ, mốc tiến độ dự kiến.</li>
          <li>Mỗi chiến dịch phải có ít nhất một (01) mục tiêu gây quỹ (Fundraising Goal) với số tiền cụ thể.</li>
          <li>Chiến dịch phải có kế hoạch chi tiêu (Expenditure Plan) với các mốc tiến độ (Milestones) rõ ràng.</li>
          <li>Nhà tổ chức phải cam kết tuân thủ Bộ quy tắc ứng xử của Nền tảng trước khi đăng chiến dịch.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">2. Quy trình phê duyệt chiến dịch</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li><strong>Nộp hồ sơ:</strong> Nhà tổ chức hoàn tất form tạo chiến dịch với đầy đủ thông tin bắt buộc.</li>
          <li><strong>Kiểm duyệt nội dung:</strong> Đội ngũ quản trị viên (Staff) xem xét nội dung, hình ảnh, kế hoạch chi tiêu trong vòng 3–5 ngày làm việc.</li>
          <li><strong>Yêu cầu bổ sung:</strong> Nếu hồ sơ chưa đầy đủ, nhà tổ chức sẽ nhận được yêu cầu bổ sung qua email và thông báo trên Nền tảng.</li>
          <li><strong>Phê duyệt / Từ chối:</strong> Chiến dịch được phê duyệt sẽ xuất hiện công khai trên Nền tảng. Chiến dịch bị từ chối sẽ kèm lý do cụ thể.</li>
          <li><strong>Kháng nghị:</strong> Nhà tổ chức có quyền kháng nghị quyết định từ chối trong vòng 7 ngày kể từ ngày nhận thông báo.</li>
        </ol>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">3. Cam kết của nhà tổ chức</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sử dụng 100% quỹ đúng mục đích đã nêu trong chiến dịch.</li>
          <li>Cập nhật tiến độ thường xuyên (tối thiểu mỗi 2 tuần/lần) thông qua bài đăng (Feed Post) trên trang chiến dịch.</li>
          <li>Cung cấp bằng chứng chi tiêu (hóa đơn, biên lai, hình ảnh thực tế) cho mỗi đợt giải ngân.</li>
          <li>Phản hồi các câu hỏi, thắc mắc từ người quyên góp trong thời gian hợp lý (tối đa 5 ngày làm việc).</li>
          <li>Không sử dụng thông tin sai lệch, hình ảnh giả mạo hoặc phóng đại tình trạng thực tế.</li>
          <li>Báo cáo tổng kết khi chiến dịch kết thúc, bao gồm tổng thu, tổng chi và kết quả đạt được.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">4. Quản lý đợt chi tiêu (Expenditure)</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Mỗi đợt chi tiêu phải được gắn với một mốc tiến độ (Milestone) cụ thể trong kế hoạch đã duyệt.</li>
          <li>Nhà tổ chức phải nộp yêu cầu giải ngân kèm:
            <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
              <li>Mô tả mục đích chi tiêu.</li>
              <li>Danh sách các hạng mục chi (Expenditure Items) với số tiền cụ thể.</li>
              <li>Bằng chứng (Expenditure Evidence): hóa đơn, ảnh chụp, báo giá.</li>
            </ul>
          </li>
          <li>Đợt chi tiêu sẽ được kiểm duyệt bởi đội ngũ quản trị trước khi giải ngân.</li>
          <li>Nền tảng có quyền yêu cầu giải trình bổ sung hoặc từ chối đợt chi tiêu nếu phát hiện bất thường.</li>
          <li>Lịch sử chi tiêu được công khai cho tất cả người quyên góp theo dõi.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">5. Quyền của Nền tảng đối với chiến dịch</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Tạm dừng chiến dịch:</strong> Khi phát hiện dấu hiệu vi phạm, nhận được tố cáo có căn cứ, hoặc cần xác minh thêm thông tin.</li>
          <li><strong>Đóng chiến dịch vĩnh viễn:</strong> Khi xác định chiến dịch gian lận, sử dụng quỹ sai mục đích, hoặc vi phạm nghiêm trọng Điều khoản.</li>
          <li><strong>Yêu cầu hoàn tiền:</strong> Trong trường hợp chiến dịch bị đóng do vi phạm, Nền tảng có quyền yêu cầu nhà tổ chức hoàn trả toàn bộ số tiền đã nhận.</li>
          <li><strong>Chỉnh sửa nội dung:</strong> Nền tảng có quyền yêu cầu chỉnh sửa hoặc gỡ bỏ nội dung không phù hợp trên trang chiến dịch.</li>
        </ul>
      </>
    ),
  },

  /* ─── IV ─── */
  {
    id: "quyen-gop-thanh-toan",
    number: "IV",
    title: "Quyên góp & Thanh toán",
    content: (
      <>
        <h4 className="mt-0 mb-2 text-[15px] font-extrabold text-slate-800">1. Phương thức thanh toán</h4>
        <p>Nền tảng hỗ trợ các phương thức thanh toán sau:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>VietQR:</strong> Quét mã QR để chuyển khoản nhanh qua ứng dụng ngân hàng. Hệ thống sẽ tự động xác nhận giao dịch trong vòng 1–5 phút.</li>
          <li><strong>Chuyển khoản ngân hàng:</strong> Chuyển khoản trực tiếp theo thông tin tài khoản được hiển thị trên trang chiến dịch. Nội dung chuyển khoản phải đúng cú pháp được hệ thống chỉ định.</li>
        </ul>
        <p>Nền tảng có thể bổ sung thêm phương thức thanh toán mới và sẽ thông báo trước cho người dùng.</p>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">2. Chính sách hoàn tiền</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Quyên góp về bản chất là khoản đóng góp tự nguyện và <strong>không hoàn lại</strong> trong điều kiện thông thường.</li>
          <li>Các trường hợp được xem xét hoàn tiền:
            <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
              <li>Chiến dịch bị Nền tảng đóng do phát hiện gian lận.</li>
              <li>Chiến dịch không đạt mục tiêu tối thiểu và nhà tổ chức chọn chế độ &quot;Hoàn tiền nếu không đạt mục tiêu&quot; (All-or-Nothing).</li>
              <li>Lỗi kỹ thuật dẫn đến giao dịch trùng lặp hoặc sai số tiền.</li>
            </ul>
          </li>
          <li>Yêu cầu hoàn tiền phải được gửi trong vòng 30 ngày kể từ ngày quyên góp.</li>
          <li>Thời gian xử lý hoàn tiền: 7–14 ngày làm việc kể từ khi yêu cầu được chấp thuận.</li>
          <li>Phí chuyển khoản (nếu có) sẽ được khấu trừ từ khoản hoàn tiền.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">3. Quyên góp ẩn danh</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Người quyên góp có thể chọn &quot;Quyên góp ẩn danh&quot; khi thực hiện giao dịch.</li>
          <li>Khi quyên góp ẩn danh, tên người quyên góp sẽ <strong>không</strong> hiển thị công khai trên trang chiến dịch — thay vào đó hiển thị &quot;Người ủng hộ ẩn danh&quot;.</li>
          <li>Tuy nhiên, thông tin người quyên góp ẩn danh vẫn được lưu trữ nội bộ phục vụ mục đích đối soát, phòng chống rửa tiền và theo quy định pháp luật.</li>
          <li>Nền tảng cam kết không tiết lộ danh tính người quyên góp ẩn danh cho nhà tổ chức hoặc bên thứ ba, trừ khi có yêu cầu từ cơ quan có thẩm quyền.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">4. Giới hạn quyên góp</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Mức quyên góp tối thiểu: <strong>10.000 VNĐ</strong> mỗi lần.</li>
          <li>Mức quyên góp tối đa: <strong>500.000.000 VNĐ</strong> (năm trăm triệu đồng) mỗi giao dịch. Các khoản lớn hơn cần liên hệ trực tiếp với Nền tảng.</li>
          <li>Nền tảng có quyền điều chỉnh giới hạn này và sẽ thông báo trước cho người dùng.</li>
          <li>Các giao dịch có giá trị bất thường có thể bị tạm giữ để xác minh theo quy định phòng chống rửa tiền.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">5. Phí dịch vụ</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>TrustFundMe hiện <strong>không thu phí</strong> trên các khoản quyên góp (0% phí nền tảng).</li>
          <li>Phí chuyển khoản ngân hàng (nếu có) do ngân hàng của người quyên góp quy định và nằm ngoài trách nhiệm của Nền tảng.</li>
          <li>Nền tảng bảo lưu quyền áp dụng phí dịch vụ trong tương lai. Mọi thay đổi sẽ được thông báo trước ít nhất 30 ngày và chỉ áp dụng cho các giao dịch mới.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">6. Xử lý phần quyên góp vượt mục tiêu đợt</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Khi khoản quyên góp lớn hơn số tiền còn thiếu của đợt hiện tại, hệ thống sẽ tách giao dịch thành 2 phần: phần hoàn thành đợt hiện tại và phần vượt mục tiêu.</li>
          <li>Phần vượt mục tiêu được <strong>ưu tiên ghi nhận</strong> cho đợt tiếp theo của <strong>cùng chiến dịch</strong> khi đợt đó được phê duyệt và mở nhận quyên góp.</li>
          <li>Trong trường hợp chiến dịch không mở thêm đợt chi tiêu hợp lệ trong thời hạn vận hành, phần vượt mục tiêu có thể được điều phối sang <strong>chiến dịch khác cùng hạng mục</strong> theo quyết định của Nền tảng và quy định pháp luật hiện hành.</li>
          <li>Mọi điều phối (nếu có) phải được ghi nhận trên hệ thống và công khai để người dùng tra cứu trong lịch sử giao dịch/chứng từ liên quan.</li>
          <li>Người dùng đồng ý cơ chế này khi xác nhận thanh toán ở bước cảnh báo vượt mục tiêu.</li>
        </ul>
      </>
    ),
  },

  /* ─── V ─── */
  {
    id: "bao-ve-quyen-loi",
    number: "V",
    title: "Bảo vệ quyền lợi người quyên góp",
    content: (
      <>
        <h4 className="mt-0 mb-2 text-[15px] font-extrabold text-slate-800">1. Quyền theo dõi tiến độ</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Người quyên góp có quyền xem toàn bộ tiến độ chiến dịch, bao gồm: số tiền đã gây quỹ, các đợt chi tiêu, bài đăng cập nhật của nhà tổ chức.</li>
          <li>Lịch sử giao dịch quyên góp được lưu trữ và có thể truy cập từ trang &quot;Tài khoản&quot; của người dùng.</li>
          <li>Người quyên góp nhận thông báo (email, in-app) khi chiến dịch có cập nhật quan trọng.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">2. Quyền tố cáo chiến dịch vi phạm</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Bất kỳ người dùng nào cũng có quyền tố cáo (Flag) chiến dịch mà họ nghi ngờ vi phạm.</li>
          <li>Khi tố cáo, người dùng cần chọn loại vi phạm và cung cấp mô tả chi tiết cùng bằng chứng (nếu có).</li>
          <li>Nền tảng cam kết xem xét mọi tố cáo trong vòng 3–5 ngày làm việc.</li>
          <li>Danh tính người tố cáo được bảo mật tuyệt đối và không được tiết lộ cho nhà tổ chức.</li>
          <li>Tố cáo sai sự thật, ác ý hoặc lặp lại nhằm phá hoại chiến dịch hợp lệ sẽ bị xử lý theo Mục IX.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">3. Điểm tin cậy (Trust Score)</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Mỗi nhà tổ chức có một Điểm tin cậy được tính toán tự động dựa trên:
            <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
              <li>Tỷ lệ hoàn thành chiến dịch thành công.</li>
              <li>Tần suất cập nhật tiến độ.</li>
              <li>Chất lượng bằng chứng chi tiêu.</li>
              <li>Phản hồi từ người quyên góp.</li>
              <li>Số lượng tố cáo (Flags) được xác nhận.</li>
              <li>Trạng thái KYC đã xác minh.</li>
            </ul>
          </li>
          <li>Trust Score được hiển thị công khai trên trang chiến dịch để người quyên góp tham khảo.</li>
          <li>Trust Score thấp có thể dẫn đến việc chiến dịch mới bị kiểm duyệt kỹ hơn hoặc bị từ chối.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">4. Cơ chế giải quyết tranh chấp</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li><strong>Bước 1 — Liên hệ nhà tổ chức:</strong> Người quyên góp liên hệ trực tiếp nhà tổ chức thông qua hệ thống tin nhắn (Chat) trên Nền tảng.</li>
          <li><strong>Bước 2 — Gửi khiếu nại:</strong> Nếu không giải quyết được, gửi khiếu nại tới đội ngũ hỗ trợ qua email <strong>support@trustfundme.vn</strong> hoặc chức năng Flag trên Nền tảng.</li>
          <li><strong>Bước 3 — Xem xét &amp; Phân xử:</strong> Nền tảng sẽ xem xét, thu thập bằng chứng từ cả hai bên và đưa ra quyết định trong vòng 14 ngày làm việc.</li>
          <li><strong>Bước 4 — Thực thi:</strong> Quyết định của Nền tảng bao gồm hoàn tiền, tạm dừng/đóng chiến dịch hoặc các biện pháp khác. Quyết định có hiệu lực ràng buộc trên Nền tảng.</li>
          <li><strong>Bước 5 — Khiếu nại pháp lý:</strong> Nếu các bên không đồng ý với quyết định, có thể giải quyết theo thủ tục tố tụng dân sự tại Tòa án nhân dân có thẩm quyền.</li>
        </ol>
      </>
    ),
  },

  /* ─── VI ─── */
  {
    id: "quyen-so-huu-tri-tue",
    number: "VI",
    title: "Quyền sở hữu trí tuệ",
    content: (
      <>
        <h4 className="mt-0 mb-2 text-[15px] font-extrabold text-slate-800">1. Nội dung do người dùng tạo</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Người dùng giữ quyền sở hữu trí tuệ đối với nội dung gốc mà họ tạo ra và đăng tải trên Nền tảng (bao gồm văn bản mô tả, hình ảnh, video).</li>
          <li>Bằng việc đăng tải nội dung lên Nền tảng, người dùng cấp cho TrustFundMe giấy phép không độc quyền, miễn phí bản quyền, trên phạm vi toàn cầu để sử dụng, hiển thị, sao chép và phân phối nội dung đó nhằm mục đích vận hành và quảng bá Nền tảng.</li>
          <li>Người dùng cam đoan nội dung đăng tải là nguyên bản hoặc có quyền sử dụng hợp pháp, và không vi phạm quyền sở hữu trí tuệ của bên thứ ba.</li>
          <li>Nền tảng không chịu trách nhiệm cho nội dung vi phạm bản quyền do người dùng đăng tải.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">2. Quyền của Nền tảng đối với nội dung</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Toàn bộ thiết kế, mã nguồn, logo, thương hiệu &quot;TrustFundMe&quot; thuộc quyền sở hữu của đội ngũ phát triển Nền tảng.</li>
          <li>Nghiêm cấm sao chép, tái tạo, phân phối lại bất kỳ phần nào của Nền tảng mà không có sự đồng ý bằng văn bản.</li>
          <li>Nền tảng có quyền gỡ bỏ bất kỳ nội dung nào vi phạm quyền sở hữu trí tuệ mà không cần thông báo trước.</li>
        </ul>
      </>
    ),
  },

  /* ─── VII ─── */
  {
    id: "bao-mat-quyen-rieng-tu",
    number: "VII",
    title: "Bảo mật & Quyền riêng tư",
    content: (
      <>
        <h4 className="mt-0 mb-2 text-[15px] font-extrabold text-slate-800">1. Thu thập dữ liệu</h4>
        <p>Nền tảng thu thập các loại dữ liệu sau:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Thông tin cá nhân:</strong> Họ tên, email, số điện thoại, ngày sinh, địa chỉ.</li>
          <li><strong>Thông tin KYC:</strong> Ảnh giấy tờ tùy thân, ảnh selfie, dữ liệu sinh trắc học khuôn mặt.</li>
          <li><strong>Thông tin tài chính:</strong> Số tài khoản ngân hàng, lịch sử giao dịch quyên góp.</li>
          <li><strong>Dữ liệu hoạt động:</strong> Nhật ký truy cập, địa chỉ IP, loại thiết bị, trình duyệt, hành vi sử dụng Nền tảng.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">2. Sử dụng dữ liệu</h4>
        <p>Dữ liệu thu thập được sử dụng cho các mục đích:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Cung cấp, duy trì và cải thiện dịch vụ của Nền tảng.</li>
          <li>Xác minh danh tính người dùng (KYC) và phòng chống gian lận.</li>
          <li>Xử lý giao dịch quyên góp và giải ngân.</li>
          <li>Gửi thông báo liên quan đến tài khoản, chiến dịch và giao dịch.</li>
          <li>Phân tích, thống kê để nâng cao trải nghiệm người dùng.</li>
          <li>Tuân thủ nghĩa vụ pháp lý và yêu cầu của cơ quan có thẩm quyền.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">3. Chia sẻ dữ liệu với bên thứ ba</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Nền tảng <strong>không bán</strong> dữ liệu cá nhân cho bên thứ ba.</li>
          <li>Dữ liệu có thể được chia sẻ với:
            <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
              <li>Đối tác thanh toán (ngân hàng, cổng thanh toán) để xử lý giao dịch.</li>
              <li>Nhà cung cấp dịch vụ KYC để xác minh danh tính.</li>
              <li>Cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp.</li>
            </ul>
          </li>
          <li>Mọi bên thứ ba nhận dữ liệu đều phải cam kết bảo mật theo tiêu chuẩn tương đương hoặc cao hơn.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">4. Cookie &amp; Công nghệ theo dõi</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Nền tảng sử dụng cookie và các công nghệ tương tự để:
            <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
              <li>Duy trì phiên đăng nhập.</li>
              <li>Ghi nhớ tùy chọn người dùng.</li>
              <li>Phân tích lưu lượng truy cập (analytics).</li>
            </ul>
          </li>
          <li>Người dùng có thể tắt cookie qua cài đặt trình duyệt, nhưng một số tính năng có thể bị ảnh hưởng.</li>
          <li>Nền tảng không sử dụng cookie để quảng cáo nhắm mục tiêu (targeted advertising).</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">5. Lưu trữ &amp; Bảo vệ dữ liệu</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Dữ liệu được lưu trữ trên máy chủ bảo mật với mã hóa tiêu chuẩn ngành (TLS/SSL, AES-256).</li>
          <li>Dữ liệu KYC nhạy cảm được mã hóa riêng và chỉ nhân sự có thẩm quyền mới được truy cập.</li>
          <li>Nền tảng thực hiện sao lưu định kỳ và có kế hoạch khôi phục dữ liệu trong trường hợp sự cố.</li>
          <li>Dữ liệu cá nhân sẽ được lưu trữ trong thời gian tài khoản còn hoạt động hoặc theo yêu cầu pháp luật (tối thiểu 5 năm cho dữ liệu giao dịch tài chính).</li>
        </ul>
      </>
    ),
  },

  /* ─── VIII ─── */
  {
    id: "gioi-han-trach-nhiem",
    number: "VIII",
    title: "Giới hạn trách nhiệm",
    content: (
      <>
        <h4 className="mt-0 mb-2 text-[15px] font-extrabold text-slate-800">1. Miễn trừ trách nhiệm của Nền tảng</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>TrustFundMe hoạt động với vai trò là <strong>nền tảng trung gian</strong> kết nối nhà tổ chức và người quyên góp. Nền tảng <strong>không phải</strong> là tổ chức từ thiện, quỹ tín thác hoặc tổ chức tài chính.</li>
          <li>Nền tảng không đảm bảo tính chính xác, trung thực hoặc hợp pháp của nội dung chiến dịch do nhà tổ chức đăng tải, mặc dù có quy trình kiểm duyệt.</li>
          <li>Nền tảng không chịu trách nhiệm cho:
            <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
              <li>Thiệt hại phát sinh từ hành vi gian lận, sai sự thật của nhà tổ chức.</li>
              <li>Gián đoạn dịch vụ do lỗi kỹ thuật, bảo trì hệ thống hoặc sự kiện bất khả kháng.</li>
              <li>Thiệt hại gián tiếp, ngẫu nhiên hoặc mang tính hậu quả phát sinh từ việc sử dụng Nền tảng.</li>
              <li>Nội dung, hành vi, sản phẩm hoặc dịch vụ của bên thứ ba được liên kết trên Nền tảng.</li>
            </ul>
          </li>
          <li>Trong mọi trường hợp, tổng trách nhiệm bồi thường của Nền tảng (nếu có) không vượt quá số tiền phí dịch vụ mà người dùng đã thanh toán trong 12 tháng trước đó.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">2. Rủi ro khi quyên góp</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Quyên góp trên Nền tảng mang tính tự nguyện. Người quyên góp tự chịu trách nhiệm cho quyết định quyên góp của mình.</li>
          <li>Mặc dù Nền tảng có hệ thống Trust Score, kiểm duyệt chiến dịch và giám sát chi tiêu, nhưng <strong>không thể đảm bảo 100%</strong> rằng mọi chiến dịch đều hợp lệ hoặc sử dụng quỹ đúng mục đích.</li>
          <li>Người quyên góp nên tự nghiên cứu, đánh giá chiến dịch trước khi quyên góp, bao gồm: xem Trust Score, đọc cập nhật tiến độ, kiểm tra bằng chứng chi tiêu.</li>
          <li>Nền tảng khuyến khích người dùng quyên góp trong khả năng tài chính cho phép.</li>
        </ul>
      </>
    ),
  },

  /* ─── IX ─── */
  {
    id: "cham-dut-vi-pham",
    number: "IX",
    title: "Chấm dứt & Vi phạm",
    content: (
      <>
        <h4 className="mt-0 mb-2 text-[15px] font-extrabold text-slate-800">1. Hành vi bị cấm</h4>
        <p>Nghiêm cấm các hành vi sau trên Nền tảng:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Tạo chiến dịch giả mạo, lừa đảo hoặc gây quỹ cho mục đích bất hợp pháp.</li>
          <li>Cung cấp thông tin cá nhân, KYC giả mạo hoặc mạo danh người khác.</li>
          <li>Sử dụng quỹ chiến dịch sai mục đích đã cam kết.</li>
          <li>Quấy rối, đe dọa, phỉ báng người dùng khác trên Nền tảng.</li>
          <li>Spam, gửi tin nhắn rác, đăng nội dung không liên quan lặp lại.</li>
          <li>Tố cáo sai sự thật, ác ý nhằm phá hoại chiến dịch hợp lệ.</li>
          <li>Can thiệp, phá hoại hoạt động kỹ thuật của Nền tảng (hacking, DDoS, scraping trái phép).</li>
          <li>Rửa tiền hoặc tài trợ cho các hoạt động bất hợp pháp thông qua Nền tảng.</li>
          <li>Tạo nhiều tài khoản để lạm dụng hệ thống hoặc trốn tránh biện pháp xử lý.</li>
          <li>Đăng tải nội dung vi phạm pháp luật: bạo lực, khiêu dâm, kích động thù hận, xâm phạm quyền trẻ em.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">2. Quyền chấm dứt tài khoản</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Người dùng tự nguyện:</strong> Người dùng có thể yêu cầu xóa tài khoản bất kỳ lúc nào bằng cách liên hệ đội ngũ hỗ trợ. Tài khoản sẽ bị vô hiệu hóa trong vòng 7 ngày làm việc. Dữ liệu giao dịch vẫn được lưu trữ theo quy định pháp luật.</li>
          <li><strong>Nền tảng chấm dứt:</strong> Nền tảng có quyền tạm khóa hoặc xóa vĩnh viễn tài khoản người dùng vi phạm Điều khoản mà không cần thông báo trước trong trường hợp vi phạm nghiêm trọng.</li>
          <li>Trước khi chấm dứt, Nền tảng sẽ nỗ lực thông báo cho người dùng (trừ trường hợp khẩn cấp hoặc vi phạm nghiêm trọng).</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">3. Hậu quả vi phạm</h4>
        <p>Tùy theo mức độ vi phạm, Nền tảng có thể áp dụng một hoặc nhiều biện pháp:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Cảnh cáo:</strong> Gửi thông báo cảnh cáo lần đầu cho vi phạm nhẹ.</li>
          <li><strong>Hạn chế tính năng:</strong> Tạm thời hạn chế quyền tạo chiến dịch, đăng bài, hoặc quyên góp.</li>
          <li><strong>Tạm khóa tài khoản:</strong> Khóa tài khoản trong thời gian xác định (7–30 ngày) để điều tra.</li>
          <li><strong>Đóng chiến dịch:</strong> Đóng vĩnh viễn chiến dịch vi phạm và đóng băng quỹ liên quan.</li>
          <li><strong>Xóa tài khoản vĩnh viễn:</strong> Xóa tài khoản và cấm đăng ký lại.</li>
          <li><strong>Trừ điểm Trust Score:</strong> Giảm đáng kể điểm tin cậy của nhà tổ chức.</li>
          <li><strong>Chuyển cơ quan chức năng:</strong> Trong trường hợp vi phạm pháp luật (lừa đảo, rửa tiền), Nền tảng sẽ phối hợp với cơ quan công an và cơ quan chức năng có liên quan.</li>
        </ul>
      </>
    ),
  },

  /* ─── X ─── */
  {
    id: "dieu-khoan-khac",
    number: "X",
    title: "Điều khoản khác",
    content: (
      <>
        <h4 className="mt-0 mb-2 text-[15px] font-extrabold text-slate-800">1. Sửa đổi điều khoản</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Nền tảng có quyền sửa đổi, bổ sung Điều khoản này bất kỳ lúc nào.</li>
          <li>Các thay đổi quan trọng sẽ được thông báo cho người dùng qua email và/hoặc thông báo trên Nền tảng trước ít nhất <strong>15 ngày</strong> trước khi có hiệu lực.</li>
          <li>Việc tiếp tục sử dụng Nền tảng sau khi Điều khoản được sửa đổi đồng nghĩa với việc bạn chấp nhận phiên bản mới.</li>
          <li>Phiên bản Điều khoản hiện hành luôn được cập nhật tại trang này (<code>/terms</code>).</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">2. Luật áp dụng</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Điều khoản này được điều chỉnh và giải thích theo <strong>pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam</strong>.</li>
          <li>Mọi tranh chấp phát sinh từ hoặc liên quan đến Điều khoản này sẽ được giải quyết tại Tòa án nhân dân có thẩm quyền tại Thành phố Hồ Chí Minh, Việt Nam.</li>
          <li>Trong trường hợp có sự khác biệt giữa phiên bản tiếng Việt và bản dịch, phiên bản tiếng Việt sẽ được ưu tiên áp dụng.</li>
        </ul>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">3. Điều khoản tách rời</h4>
        <p>
          Nếu bất kỳ điều khoản nào trong Điều khoản này bị coi là vô hiệu hoặc không thể thi hành, các điều khoản còn
          lại vẫn giữ nguyên hiệu lực. Điều khoản vô hiệu sẽ được thay thế bằng điều khoản có hiệu lực gần nhất với
          ý định ban đầu.
        </p>

        <h4 className="mt-6 mb-2 text-[15px] font-extrabold text-slate-800">4. Liên hệ</h4>
        <p>Nếu bạn có bất kỳ câu hỏi, góp ý hoặc khiếu nại nào về Điều khoản sử dụng, vui lòng liên hệ:</p>
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-1.5">
          <p><strong>Nền tảng gây quỹ cộng đồng TrustFundMe </strong></p>
          <p>📧 Email: <a href="mailto:support@trustfundme.vn" className="text-[#ff5e14] font-semibold underline underline-offset-2 hover:text-[#ea550c]">support@trustfundme.vn</a></p>
          <p>📞 Hotline: <strong>1900-xxxx</strong> (Giờ hành chính, Thứ 2 – Thứ 6)</p>
          <p>🌐 Website: <a href="/" className="text-[#ff5e14] font-semibold underline underline-offset-2 hover:text-[#ea550c]">trustfundme.vn</a></p>
          <p>📍 Địa chỉ: Thành phố Hồ Chí Minh, Việt Nam</p>
        </div>
      </>
    ),
  },
];

/* ───────────────────────────── Component ───────────────────────────── */

export default function TermsPage() {
  const [activeId, setActiveId] = useState<string>(sections[0].id);
  const [tocOpen, setTocOpen] = useState(false);

  /* ── Intersection Observer to highlight active section ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTocOpen(false);
    }
  }, []);

  return (
    <DanboxLayout header={4}>
      <div className="min-h-screen bg-[#f8fafe]">
        {/* ─── Breadcrumb + Header ─── */}
        <section className="container mx-auto px-4 pt-24 pb-4 md:pt-28 md:pb-6">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-[#ff5e14] transition-colors font-medium">
              Trang chủ
            </Link>
            <span className="select-none">/</span>
            <span className="font-semibold text-slate-800">Điều khoản sử dụng</span>
          </nav>

          <div className="rounded-[2rem] border border-[rgba(15,23,42,0.12)] bg-white p-7 md:p-10">
            <span className="inline-flex rounded-full bg-[#fff0e8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d14f1b]">
              Pháp lý
            </span>
            <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-[#111827] leading-[1.1]">
              Điều khoản sử dụng
            </h1>
            <p className="mt-3 max-w-[72ch] text-[15px] md:text-[17px] leading-relaxed text-[#4b5563]">
              Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng nền tảng gây quỹ cộng đồng TrustFundMe.
              Bằng việc sử dụng dịch vụ, bạn đồng ý tuân thủ toàn bộ nội dung điều khoản này.
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-400">
              Cập nhật lần cuối: {LAST_UPDATED}
            </p>
          </div>
        </section>

        {/* ─── Content area: TOC + Sections ─── */}
        <section className="container mx-auto px-4 pb-16 md:pb-20">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── Table of Contents (mobile: collapsible, desktop: sticky sidebar) ── */}
            <aside className="w-full lg:w-[280px] shrink-0">
              {/* Mobile toggle */}
              <button
                onClick={() => setTocOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-4 py-3 text-sm font-bold text-slate-800 lg:hidden"
              >
                <span>📑 Mục lục</span>
                <svg
                  className={`h-4 w-4 text-slate-500 transition-transform ${tocOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* TOC list */}
              <nav
                className={`mt-2 lg:mt-0 lg:sticky lg:top-28 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white p-4 transition-all overflow-hidden ${
                  tocOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100 border-transparent lg:border-[rgba(15,23,42,0.12)]"
                }`}
              >
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Mục lục
                </h3>
                <ul className="space-y-1">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => scrollTo(s.id)}
                        className={`w-full text-left rounded-lg px-3 py-2 text-[13px] font-semibold transition-all ${
                          activeId === s.id
                            ? "bg-[#ff5e14]/10 text-[#d14f1b]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="mr-1.5 font-extrabold">{s.number}.</span>
                        {s.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 min-w-0 space-y-6">
              {sections.map((s) => (
                <article
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-28 rounded-[1.5rem] border border-[rgba(15,23,42,0.12)] bg-white p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff5e14]/10 text-sm font-black text-[#d14f1b]">
                      {s.number}
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-[#111827] tracking-tight">
                      {s.title}
                    </h2>
                  </div>
                  <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_table]:mb-3">
                    {s.content}
                  </div>
                </article>
              ))}

              {/* Footer note */}
              <div className="rounded-xl border border-dashed border-[rgba(15,23,42,0.15)] bg-slate-50/80 p-5 text-center">
                <p className="text-sm text-slate-500">
                  Bằng việc tiếp tục sử dụng TrustFundMe, bạn xác nhận đã đọc và đồng ý với toàn bộ Điều khoản sử dụng này.
                </p>
                <div className="mt-3 flex justify-center gap-3">
                  <Link
                    href="/"
                    className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    ← Về trang chủ
                  </Link>
                  <Link
                    href="/campaigns"
                    className="inline-flex h-10 items-center rounded-full bg-[#111827] px-5 text-xs font-bold text-white transition-colors hover:bg-[#1f2937]"
                  >
                    Khám phá chiến dịch
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DanboxLayout>
  );
}
