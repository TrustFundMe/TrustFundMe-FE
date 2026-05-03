import { NewCampaignTestState } from './types';

/** Logo placeholder — thay bằng CDN thật khi tích hợp. */
export const mockBanks = [
  { code: 'VCB', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', shortName: 'Vietcombank', logoUrl: 'https://img.vietqr.io/img/VCB.png' },
  { code: 'TCB', name: 'Ngân hàng TMCP Kỹ Thương Việt Nam', shortName: 'Techcombank', logoUrl: 'https://img.vietqr.io/img/TCB.png' },
  { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', shortName: 'BIDV', logoUrl: 'https://img.vietqr.io/img/BIDV.png' },
  { code: 'CTG', name: 'Ngân hàng TMCP Công thương Việt Nam', shortName: 'VietinBank', logoUrl: 'https://img.vietqr.io/img/CTG.png' },
  { code: 'MBB', name: 'Ngân hàng TMCP Quân Đội', shortName: 'MB Bank', logoUrl: 'https://img.vietqr.io/img/MB.png' },
  { code: 'ACB', name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB', logoUrl: 'https://img.vietqr.io/img/ACB.png' },
  { code: 'VPB', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank', logoUrl: 'https://img.vietqr.io/img/VPB.png' },
  { code: 'TPB', name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank', logoUrl: 'https://img.vietqr.io/img/TPB.png' },
  { code: 'STB', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', shortName: 'Sacombank', logoUrl: 'https://img.vietqr.io/img/STB.png' },
  { code: 'HDB', name: 'Ngân hàng TMCP Phát triển TP.HCM', shortName: 'HDBank', logoUrl: 'https://img.vietqr.io/img/HDB.png' },
  { code: 'VIB', name: 'Ngân hàng TMCP Quốc Tế', shortName: 'VIB', logoUrl: 'https://img.vietqr.io/img/VIB.png' },
  { code: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', shortName: 'SHB', logoUrl: 'https://img.vietqr.io/img/SHB.png' },
  { code: 'MSB', name: 'Ngân hàng TMCP Hàng Hải', shortName: 'MSB', logoUrl: 'https://img.vietqr.io/img/MSB.png' },
  { code: 'OCB', name: 'Ngân hàng TMCP Phương Đông', shortName: 'OCB', logoUrl: 'https://img.vietqr.io/img/OCB.png' },
  { code: 'LPB', name: 'Ngân hàng TMCP Bưu Điện Liên Việt', shortName: 'LienVietPostBank', logoUrl: 'https://img.vietqr.io/img/LPB.png' },
] as const;

export const lawReferences = [
  'Nghị định 93/2021/NĐ-CP về vận động, tiếp nhận, phân phối và sử dụng đóng góp tự nguyện.',
  'Nghị định 93/2019/NĐ-CP về tổ chức, hoạt động của quỹ xã hội, quỹ từ thiện.',
  'Nghị định 45/2010/NĐ-CP về tổ chức, hoạt động và quản lý hội.',
  'Thông tư 41/2022/TT-BTC về chế độ kế toán hoạt động xã hội, từ thiện.',
];

/** Nội dung rút gọn: tài khoản nhận riêng (tham chiếu Nghị định 93/2021). */
export const decree93SeparateAccountNotice = `Căn cứ quy định về huy động và sử dụng đóng góp tự nguyện, chủ tài khoản cam kết sử dụng tài khoản thanh toán tách bạch, phục vụ xử lý dòng tiền gây quỹ minh bạch và đối soát, không trộn lẫn mục đích cá nhân ngoài phạm vi chiến dịch đã công bố.
Việc cung cấp sao kê/ảnh thẻ (che số dư) nhằm xác minh quyền sử dụng tài khoản; nền tảng không lưu thông tin nhạy cảm dư thừa sau khi đạt mục đích đối soát.`;

export const riskPolicyExcerpt = [
  'Quỹ tổng là ví duy nhất của chiến dịch; hạng mục là dự toán, không phải ví riêng.',
  'Chiến dịch có thể nhận vượt mục tiêu trong phạm vi mục đích thiện nguyện đã công bố.',
  'Nếu thiếu hụt ngân sách cuối kỳ, chủ quỹ phải nộp kế hoạch tái cấu trúc milestone để Staff duyệt.',
  'Tiền dư cuối kỳ không được rút về tài khoản cá nhân; xử lý theo chính sách minh bạch đã cam kết.',
];

export const fullRiskTermsVietnamese = `Căn cứ Nghị định số 93/2021/NĐ-CP của Chính phủ về vận động, tiếp nhận, phân phối và sử dụng các nguồn đóng góp tự nguyện.
Căn cứ các quy định pháp luật hiện hành về phòng chống gian lận và tính minh bạch tài chính.

Điều 1. Nguyên tắc quản lý quỹ tổng và phân bổ dự toán
Mọi khoản đóng góp được ghi nhận vào một quỹ tổng duy nhất của chiến dịch.
Các hạng mục chi phí là dự toán ngân sách, không phải ví riêng. Chênh lệch thực chi được xử lý từ quỹ tổng, với điều kiện có chứng từ hợp lệ.

Điều 2. Chính sách vượt mục tiêu quyên góp
Nền tảng không áp hardcap tuyệt đối ở 100% mục tiêu.
Khi vượt mục tiêu, hệ thống bắt buộc thông báo rõ cho nhà tài trợ.
Khoản vượt chỉ được dùng cho cùng mục đích thiện nguyện đã công bố và phải báo cáo minh bạch.

Điều 3. Chính sách thiếu hụt ngân sách
Khi kết thúc chiến dịch mà chưa đạt mục tiêu, chủ quỹ phải nộp kế hoạch tái cấu trúc giải ngân.
Chủ quỹ được phép scale down, nhưng phải giữ hạng mục thiết yếu.
Nền tảng có quyền từ chối kế hoạch không khả thi và hoàn tiền theo quy định.

Điều 4. Chính sách tiền dư cuối kỳ
Nghiêm cấm chuyển tiền dư về tài khoản cá nhân.
Tiền dư được xử lý theo chính sách minh bạch của nền tảng và được công khai đối soát.

Điều 5. Nguồn lực đối ứng ngoài nền tảng
Nguồn hỗ trợ ngoài nền tảng không được cộng vào tổng quyên góp điện tử để tránh sai lệch kiểm toán.
Chủ quỹ chỉ được ghi nhận dưới dạng giải trình nguồn lực đối ứng trong báo cáo.

Điều 6. Chế tài
Nền tảng có quyền đóng băng giải ngân, đình chỉ chiến dịch và chuyển hồ sơ cơ quan chức năng nếu phát hiện gian lận, làm giả chứng từ hoặc sử dụng sai mục đích.`;

export const seedState: NewCampaignTestState = {
  kycStatus: 'APPROVED',
  kycFullName: 'NGUYEN VAN A',
  kycRejectReason: '',
  credibilityStatus: 'APPROVED',
  credibilityReason: '',
  credibilityPitch:
    'Tổ chức đã triển khai 12 chương trình cứu trợ trong 3 năm gần nhất, có báo cáo tài chính công khai và đối tác địa phương xác thực.',
  credibilityFiles: [
    { id: 'f1', name: 'ho-so-uy-tin-to-chuc.pdf', sizeKb: 824 },
    { id: 'f2', name: 'xac-nhan-dia-phuong.pdf', sizeKb: 622 },
  ],
  fundMode: 'TRANSPARENT_TARGET',
  campaignCore: {
    title: 'Chiến dịch hỗ trợ vùng lũ miền Trung 2026',
    objective:
      'Huy động quỹ tổng để cung cấp nhu yếu phẩm, vận chuyển, và tổ chức phân phối an toàn cho 2.000 hộ dân.',
    targetAmount: 1000000000,
    startDate: '',
    endDate: '',
    category: 'Cứu trợ thiên tai',
    region: 'Quảng Bình - Quảng Trị',
    beneficiaryType: 'Hộ gia đình bị ảnh hưởng trực tiếp',
    thankMessage: 'Cảm ơn bạn đã cùng chúng tôi giữ an toàn cho người dân vùng lũ.',
    coverImageUrl: 'https://picsum.photos/seed/tf-cover-a/1200/675',
    campaignImages: [
      { id: 'img1', url: 'https://picsum.photos/seed/tf-cover-a/1200/675' },
      { id: 'img2', url: 'https://picsum.photos/seed/tf-cover-b/1200/675' },
    ],
    coverImageId: 'img1',
  },
  budgetLines: [],
  milestones: [],
  bankInfo: {
    bankCode: '',
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    branch: '',
    webhookKey: '',
  },
  bankProofFiles: [],
  acknowledgements: {
    legalRead: true,
    slaAccepted: true,
    overfundPolicyAccepted: false,
    termsAccepted: false,
    transparencyAccepted: false,
    legalLiabilityAccepted: false,
  },
};
