// src/lib/blog.ts
// Mục tiêu: Đọc blog posts từ file MDX local (frontend-only) để render /news và /news/[slug].

import fs from "fs"; // Đọc file hệ thống.
import path from "path"; // Xử lý đường dẫn.
import matter from "gray-matter"; // Parse frontmatter.

// Định nghĩa kiểu metadata cho blog post.
export interface BlogPostMeta {
  // Tiêu đề bài viết.
  title: string;
  // Slug dùng cho URL /news/[slug].
  slug: string;
  // Danh mục.
  category: string;
  // Ngày đăng (string ISO hoặc yyyy-mm-dd).
  date: string;
  // Tác giả.
  author: string;
  // Ảnh cover (path trong /public).
  coverImage?: string;
  // Trích đoạn.
  excerpt?: string;
}

// Định nghĩa kiểu dữ liệu đầy đủ cho blog post.
export interface BlogPost extends BlogPostMeta {
  // Nội dung MDX thô (chưa compile).
  content: string;
}

// Tạo đường dẫn tuyệt đối tới thư mục chứa blog posts.
const BLOG_DIR = path.join(process.cwd(), "content", "blog");

// Hàm kiểm tra thư mục blog có tồn tại không.
function ensureBlogDir(): void {
  // Nếu chưa có thư mục, tạo mới để tránh crash.
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }
}

// Đọc tất cả file .mdx trong content/blog.
function getAllMdxFilenames(): string[] {
  // Đảm bảo thư mục tồn tại.
  ensureBlogDir();

  // Lấy danh sách file.
  const files = fs.readdirSync(BLOG_DIR);

  // Lọc chỉ lấy .mdx.
  return files.filter((f) => f.toLowerCase().endsWith(".mdx"));
}

// Parse 1 file MDX để lấy meta + content.
export function getPostFromFile(filename: string): BlogPost {
  // Ghép path.
  const fullPath = path.join(BLOG_DIR, filename);

  // Đọc raw string.
  const raw = fs.readFileSync(fullPath, "utf8");

  // Parse frontmatter.
  const parsed = matter(raw);

  // Ép kiểu data.
  const data = parsed.data as Partial<BlogPostMeta>;

  // Fallback slug từ tên file.
  const fallbackSlug = filename.replace(/\.mdx$/i, "");

  // Validate tối thiểu để tránh undefined gây lỗi UI.
  const meta: BlogPostMeta = {
    title: data.title ?? fallbackSlug,
    slug: data.slug ?? fallbackSlug,
    category: data.category ?? "News",
    date: data.date ?? "",
    author: data.author ?? "",
    coverImage: data.coverImage,
    excerpt: data.excerpt,
  };

  // Trả về post.
  return {
    ...meta,
    content: parsed.content,
  };
}

// Lấy danh sách post metadata (phục vụ trang list).
export function getAllPostsMeta(): BlogPostMeta[] {
  // Đọc file list.
  const filenames = getAllMdxFilenames();

  // Map sang post.
  const posts = filenames.map((f) => getPostFromFile(f));

  // Sort theo date giảm dần nếu parse được.
  posts.sort((a, b) => {
    // Parse date.
    const da = Date.parse(a.date || "");
    const db = Date.parse(b.date || "");

    // Nếu date invalid, đẩy xuống cuối.
    if (Number.isNaN(da) && Number.isNaN(db)) return 0;
    if (Number.isNaN(da)) return 1;
    if (Number.isNaN(db)) return -1;

    // Mặc định mới nhất trước.
    return db - da;
  });

  // Chỉ trả meta.
  return posts.map(({ content: _content, ...meta }) => meta);
}

// Lấy post theo slug.
export function getPostBySlug(slug: string): BlogPost | null {
  // Đọc file list.
  const filenames = getAllMdxFilenames();

  // Tìm file nào có slug match.
  for (const filename of filenames) {
    // Parse meta.
    const post = getPostFromFile(filename);

    // Match.
    if (post.slug === slug) {
      return post;
    }
  }

  // Không tìm thấy.
  return null;
}
