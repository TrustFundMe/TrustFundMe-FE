import type { FeedPost } from "@/types/feedPost";
import type { CampaignInfo } from "./CampaignCard";

export const mockCampaigns: CampaignInfo[] = [
  {
    id: "1",
    title: "Xây dựng trường học cho trẻ em vùng cao",
    image: "/assets/img/campaign/1.jpg",
    raised: 350000000,
    goal: 500000000,
    progress: 70,
  },
  {
    id: "2",
    title: "Hỗ trợ quà Tết cho gia đình khó khăn",
    image: "/assets/img/campaign/2.jpg",
    raised: 120000000,
    goal: 200000000,
    progress: 60,
  },
  {
    id: "3",
    title: "Chương trình từ thiện cuối năm",
    image: "/assets/img/campaign/1.jpg",
    raised: 500000000,
    goal: 800000000,
    progress: 62,
  },
];

export const mockFeedPosts: (FeedPost & { campaign?: CampaignInfo })[] = [
  {
    id: "1",
    author: {
      id: "1",
      name: "Nguyễn Văn A",
      avatar: "/assets/img/about/01.jpg",
    },
    title: "Cập nhật về dự án xây trường học",
    content:
      "Chúng tôi rất vui mừng thông báo rằng dự án xây trường học tại vùng cao đã hoàn thành 70%. Cảm ơn tất cả các nhà tài trợ đã đóng góp! 🙏",
    type: "UPDATE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    attachments: [
      {
        type: "image",
        url: "/assets/img/campaign/1.jpg",
      },
    ],
    liked: false,
    likeCount: 124,
    flagged: false,
    comments: [
      {
        id: "c1",
        user: {
          id: "2",
          name: "Trần Thị B",
          avatar: "/assets/img/about/01.jpg",
        },
        content: "Tuyệt vời! Cảm ơn bạn đã cập nhật",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ],
    budgetId: 1,
    campaign: mockCampaigns[0],
  },
  {
    id: "2",
    author: {
      id: "2",
      name: "Trần Thị B",
      avatar: "/assets/img/about/01.jpg",
    },
    title: null,
    content:
      "Hôm nay chúng tôi đã trao 500 phần quà cho các em nhỏ vùng cao. Nụ cười của các em là động lực lớn nhất của chúng tôi! 😊",
    type: "ANNOUNCEMENT",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    attachments: [
      {
        type: "image",
        url: "/assets/img/campaign/2.jpg",
      },
    ],
    liked: true,
    likeCount: 256,
    flagged: false,
    comments: [
      {
        id: "c2",
        user: {
          id: "3",
          name: "Lê Văn C",
          avatar: "/assets/img/about/01.jpg",
        },
        content: "Cảm ơn các bạn rất nhiều!",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "c3",
        user: {
          id: "1",
          name: "Nguyễn Văn A",
          avatar: "/assets/img/about/01.jpg",
        },
        content: "Chúc mừng!",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
    ],
    budgetId: 2,
    campaign: mockCampaigns[1],
  },
  {
    id: "3",
    author: {
      id: "3",
      name: "Lê Văn C",
      avatar: "/assets/img/about/01.jpg",
    },
    title: "Thông báo về chương trình từ thiện mới",
    content:
      "Chúng tôi sẽ tổ chức chương trình từ thiện mới vào cuối tháng này. Mọi người hãy đóng góp để giúp đỡ những hoàn cảnh khó khăn nhé!",
    type: "NEWS",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    attachments: [],
    liked: false,
    likeCount: 89,
    flagged: false,
    comments: [],
  },
  {
    id: "4",
    author: {
      id: "1",
      name: "Nguyễn Văn A",
      avatar: "/assets/img/about/01.jpg",
    },
    title: null,
    content:
      "Một ngày làm việc ý nghĩa tại trung tâm bảo trợ xã hội. Cảm ơn tất cả tình nguyện viên đã tham gia!",
    type: "UPDATE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    attachments: [
      {
        type: "image",
        url: "/assets/img/campaign/1.jpg",
      },
    ],
    liked: true,
    likeCount: 312,
    flagged: false,
    comments: [
      {
        id: "c4",
        user: {
          id: "2",
          name: "Trần Thị B",
          avatar: "/assets/img/about/01.jpg",
        },
        content: "Tuyệt vời!",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "5",
    author: {
      id: "4",
      name: "Phạm Thị D",
      avatar: "/assets/img/about/01.jpg",
    },
    title: "Kết quả chiến dịch gây quỹ",
    content:
      "Chúng tôi đã gây quỹ được 500 triệu đồng trong tháng vừa qua. Cảm ơn tất cả các nhà hảo tâm!",
    type: "ANNOUNCEMENT",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    attachments: [
      {
        type: "image",
        url: "/assets/img/campaign/2.jpg",
      },
    ],
    liked: false,
    likeCount: 445,
    flagged: false,
    comments: [
      {
        id: "c5",
        user: {
          id: "1",
          name: "Nguyễn Văn A",
          avatar: "/assets/img/about/01.jpg",
        },
        content: "Tuyệt vời quá!",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "c6",
        user: {
          id: "2",
          name: "Trần Thị B",
          avatar: "/assets/img/about/01.jpg",
        },
        content: "Chúc mừng!",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    budgetId: 3,
    campaign: mockCampaigns[2],
  },
  {
    id: "6",
    author: {
      id: "2",
      name: "Trần Thị B",
      avatar: "/assets/img/about/01.jpg",
    },
    title: null,
    content:
      "Hôm nay chúng tôi đã đến thăm và tặng quà cho các cụ già tại viện dưỡng lão. Mong rằng những món quà nhỏ này sẽ mang lại niềm vui cho các cụ.",
    type: "UPDATE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    attachments: [
      {
        type: "image",
        url: "/assets/img/campaign/1.jpg",
      },
    ],
    liked: true,
    likeCount: 278,
    flagged: false,
    comments: [],
  },
];
