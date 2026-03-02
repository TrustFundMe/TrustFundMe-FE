import type { Campaign, CampaignPlan, CampaignPost, User } from "./types";

const u = (id: string, name: string, avatar: string): User => ({
  id,
  name,
  avatar,
});

export const mockCampaign: Campaign = {
  id: "cmp_01",
  title: "TrustFundMe - Giúp trẻ em vùng cao đến trường",
  category: "Giáo dục",
  description:
    "Chiến dịch này nhằm hỗ trợ sách vở, học bổng và cải thiện điều kiện học tập cho trẻ em ở các vùng xa xôi. Chúng tui sẽ công khai cập nhật minh bạch cho từng giai đoạn chi tiêu.",
  coverImage: "/assets/img/campaign/4.jpg",
  galleryImages: [
    "/assets/img/campaign/4.jpg",
    "/assets/img/campaign/1.jpg",
    "/assets/img/campaign/2.jpg",
  ],
  goalAmount: 7000,
  raisedAmount: 4900,
  creator: u("u_creator", "Nguyen Minh", "/assets/img/about/01.jpg"),
  followers: [
    u("u_01", "Ha Vy", "/assets/img/about/02.jpg"),
    u("u_02", "Tuan Anh", "/assets/img/about/03.jpg"),
    u("u_03", "Thao My", "/assets/img/about/04.jpg"),
    u("u_04", "Hoang Long", "/assets/img/about/05.jpg"),
    u("u_05", "Lan Anh", "/assets/img/about/06.jpg"),
    u("u_06", "Minh Khang", "/assets/img/about/07.jpg"),
  ],
  liked: false,
  followed: false,
  flagged: false,
  likeCount: 128,
  followerCount: 352,
  commentCount: 24,
};

export const mockPlans: CampaignPlan[] = [
  {
    id: "plan_01",
    title: "Giai đoạn 1: Mua sách giáo khoa",
    amount: 1500000,
    description: "Mua sách giáo khoa cho 50 học sinh",
    date: "05-01-2026",
  },
  {
    id: "plan_02",
    title: "Giai đoạn 2: Học bổng",
    amount: 2500000,
    description: "Cung cấp học bổng cho 25 học sinh xuất sắc",
    date: "10-02-2026",
  },
  {
    id: "plan_03",
    title: "Giai đoạn 3: Dụng cụ học tập",
    amount: 900000,
    description: "Vở, bút, ba lô cho học sinh",
    date: "01-03-2026",
  },
];

export const mockPosts: CampaignPost[] = [
  {
    id: "post_01",
    author: u("u_creator", "Nguyen Minh", "/assets/img/about/01.jpg"),
    content:
      "Hôm nay chúng tui đã liên hệ với trường để xác nhận danh sách học sinh nhận sách. Cảm ơn mọi người đã theo dõi và ủng hộ!",
    createdAt: "2 giờ trước",
    attachments: [
      { type: "image", url: "/assets/img/causes/p2.jpg" },
      { type: "image", url: "/assets/img/causes/p3.jpg" },
    ],
    liked: false,
    likeCount: 32,
    flagged: false,
    comments: [
      {
        id: "c_01",
        user: u("u_02", "Tuấn Anh", "/assets/img/about/03.jpg"),
        content: "Công việc tuyệt vời — rất vui được ủng hộ!",
        createdAt: "1 giờ trước",
      },
      {
        id: "c_02",
        user: u("u_01", "Hà Vy", "/assets/img/about/02.jpg"),
        content: "Hóng ảnh thực tế từ buổi giao hàng!",
        createdAt: "35 phút trước",
      },
    ],
  },
  {
    id: "post_02",
    author: u("u_creator", "Nguyen Minh", "/assets/img/about/01.jpg"),
    content:
      "Cập nhật minh bạch: Tui sẽ công khai kế hoạch và hóa đơn sau khi hoàn thành mỗi giai đoạn. Vui lòng bình chọn để chúng tui ưu tiên các hạng mục cần thiết nhất.",
    createdAt: "Hôm qua",
    liked: true,
    likeCount: 78,
    flagged: false,
    comments: [],
  },
  {
    id: "post_03",
    author: u("u_02", "Tuan Anh", "/assets/img/about/03.jpg"),
    content: "Vừa quyên góp xong — hy vọng chiến dịch sớm đạt mục tiêu!",
    createdAt: "2 ngày trước",
    liked: false,
    likeCount: 5,
    flagged: false,
    comments: [
      {
        id: "c_03",
        user: u("u_creator", "Nguyen Minh", "/assets/img/about/01.jpg"),
        content: "Cảm ơn bạn rất nhiều!",
        createdAt: "2 ngày trước",
      },
    ],
  },
  {
    id: "post_04",
    author: u("u_01", "Ha Vy", "/assets/img/about/02.jpg"),
    content: "Chia sẻ tệp tham khảo cho danh sách sách — mọi người xem qua nhé.",
    createdAt: "1 tuần trước",
    attachments: [
      {
        type: "file",
        url: "/assets/files/danh-sach-sach.pdf",
        name: "book-list.pdf",
      },
    ],
    liked: false,
    likeCount: 12,
    flagged: false,
    comments: [],
  },
];

export const mockComments = [
  {
    id: "cm_01",
    user: u("u_01", "Ha Vy", "/assets/img/about/02.jpg"),
    content:
      "Rất thích ý tưởng này. Hãy chia sẻ ảnh ngày trao quà để mọi người thấy được tác động nhé.",
    createdAt: "08:39 sáng",
    likes: 12,
    replies: 1,
  },
  {
    id: "cm_01_r1",
    user: u("u_creator", "Nguyen Minh", "/assets/img/about/01.jpg"),
    content: "Chắc chắn rồi! Chúng tui sẽ đăng ảnh và hóa đơn ngay sau giai đoạn đầu tiên.",
    createdAt: "08:45 sáng",
    likes: 3,
    replies: 0,
    parentId: "cm_01",
  },
  {
    id: "cm_02",
    user: u("u_02", "Tuấn Anh", "/assets/img/about/03.jpg"),
    content: "Tui ủng hộ chiến dịch này. Cập nhật rõ ràng như thế này tạo niềm tin rất lớn.",
    createdAt: "09:02 sáng",
    likes: 6,
    replies: 0,
  },
  {
    id: "cm_03",
    user: u("u_03", "Thảo My", "/assets/img/about/04.jpg"),
    content: "Nếu bạn cần tình nguyện viên giúp giao sách, tui sẵn sàng.",
    createdAt: "09:10 sáng",
    likes: 2,
    replies: 0,
  },
  {
    id: "cm_04",
    user: u("u_05", "Lan Anh", "/assets/img/about/06.jpg"),
    content:
      "Gợi ý nhỏ: vui lòng liệt kê số lượng học sinh dự kiến cho mỗi giai đoạn để dễ theo dõi.",
    createdAt: "09:18 sáng",
    likes: 4,
    replies: 0,
  },
  {
    id: "cm_05",
    user: u("u_06", "Minh Khang", "/assets/img/about/07.jpg"),
    content: "Đã quyên góp. Hy vọng các em sớm nhận được những gì cần thiết!",
    createdAt: "09:25 sáng",
    likes: 1,
    replies: 0,
  },
] as const;
