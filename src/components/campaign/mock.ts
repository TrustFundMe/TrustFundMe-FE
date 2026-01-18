import type { Campaign, CampaignPlan, CampaignPost, User } from "./types";

const u = (id: string, name: string, avatar: string): User => ({
  id,
  name,
  avatar,
});

export const mockCampaign: Campaign = {
  id: "cmp_01",
  title: "TrustFundMe - Help children in remote areas go to school",
  category: "Education",
  description:
    "This fundraising campaign supports books, scholarships, and better learning conditions for children in remote areas. We will publish transparent updates for each spending phase.",
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
    title: "Phase 1: Buy textbooks",
    amount: 1500,
    description: "Buy textbooks for 50 students",
    date: "2026-01-05",
  },
  {
    id: "plan_02",
    title: "Phase 2: Scholarships",
    amount: 2500,
    description: "Provide scholarships for 25 top students",
    date: "2026-02-10",
  },
  {
    id: "plan_03",
    title: "Phase 3: School supplies",
    amount: 900,
    description: "Notebooks, pens, backpacks for students",
    date: "2026-03-01",
  },
];

export const mockPosts: CampaignPost[] = [
  {
    id: "post_01",
    author: u("u_creator", "Nguyen Minh", "/assets/img/about/01.jpg"),
    content:
      "We contacted the school today to confirm the final list of students receiving books. Thanks everyone for following and supporting!",
    createdAt: "2 hours ago",
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
        user: u("u_02", "Tuan Anh", "/assets/img/about/03.jpg"),
        content: "Amazing work—happy to support!",
        createdAt: "1 hour ago",
      },
      {
        id: "c_02",
        user: u("u_01", "Ha Vy", "/assets/img/about/02.jpg"),
        content: "Can’t wait for real photos from the delivery day!",
        createdAt: "35 minutes ago",
      },
    ],
  },
  {
    id: "post_02",
    author: u("u_creator", "Nguyen Minh", "/assets/img/about/01.jpg"),
    content:
      "Transparency update: I will publish each phase plan and receipts after completion. Please vote so we can prioritize the most needed items.",
    createdAt: "Yesterday",
    liked: true,
    likeCount: 78,
    flagged: false,
    comments: [],
  },
  {
    id: "post_03",
    author: u("u_02", "Tuan Anh", "/assets/img/about/03.jpg"),
    content: "Just donated—hope the campaign reaches the goal soon!",
    createdAt: "2 days ago",
    liked: false,
    likeCount: 5,
    flagged: false,
    comments: [
      {
        id: "c_03",
        user: u("u_creator", "Nguyen Minh", "/assets/img/about/01.jpg"),
        content: "Thank you so much!",
        createdAt: "2 days ago",
      },
    ],
  },
  {
    id: "post_04",
    author: u("u_01", "Ha Vy", "/assets/img/about/02.jpg"),
    content: "Sharing a reference file for the book list—please take a look.",
    createdAt: "1 week ago",
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
      "Love the idea. Please share photos of the distribution day so everyone can see the impact.",
    createdAt: "08:39 am",
    likes: 12,
    replies: 1,
  },
  {
    id: "cm_01_r1",
    user: u("u_creator", "Nguyen Minh", "/assets/img/about/01.jpg"),
    content: "Sure! We’ll post photos and receipts right after the first phase.",
    createdAt: "08:45 am",
    likes: 3,
    replies: 0,
    parentId: "cm_01",
  },
  {
    id: "cm_02",
    user: u("u_02", "Tuan Anh", "/assets/img/about/03.jpg"),
    content: "I support this campaign. Clear updates like this build trust.",
    createdAt: "09:02 am",
    likes: 6,
    replies: 0,
  },
  {
    id: "cm_03",
    user: u("u_03", "Thao My", "/assets/img/about/04.jpg"),
    content: "If you need volunteers to help deliver books, I’m in.",
    createdAt: "09:10 am",
    likes: 2,
    replies: 0,
  },
  {
    id: "cm_04",
    user: u("u_05", "Lan Anh", "/assets/img/about/06.jpg"),
    content:
      "Small suggestion: please list the expected number of students for each phase so it’s easy to follow.",
    createdAt: "09:18 am",
    likes: 4,
    replies: 0,
  },
  {
    id: "cm_05",
    user: u("u_06", "Minh Khang", "/assets/img/about/07.jpg"),
    content: "Donated. Hope the kids get what they need soon!",
    createdAt: "09:25 am",
    likes: 1,
    replies: 0,
  },
] as const;
