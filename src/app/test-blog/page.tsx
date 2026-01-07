// src/app/test-blog/page.tsx
// Mục tiêu: Trang test nhanh để kiểm tra blog MDX local (list + link chi tiết).

import DanboxLayout from "@/layout/DanboxLayout"; // Layout.
import PageBanner from "@/components/PageBanner"; // Banner.
import { getAllPostsMeta } from "@/lib/blog"; // Blog reader.
import Link from "next/link"; // Link.

// Page test blog.
export default function TestBlogPage() {
  // Lấy danh sách bài viết.
  const posts = getAllPostsMeta();

  // Render.
  return (
    <DanboxLayout>
      <PageBanner pageName="Test Blog" />
      <section className="blog-wrapper news-wrapper section-padding">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="blog-posts">
                {/* Nếu chưa có bài viết */}
                {posts.length === 0 && (
                  <div className="alert alert-warning" role="alert">
                    Chưa có bài viết nào trong <code>content/blog</code>.
                  </div>
                )}

                {/* Render list */}
                {posts.map((post) => (
                  <div className="single-blog-post" key={post.slug}>
                    {post.coverImage && (
                      <div
                        className="post-featured-thumb bg-cover"
                        style={{
                          backgroundImage: `url(${post.coverImage})`,
                        }}
                      />
                    )}

                    <div className="post-content">
                      <div className="post-cat">
                        <Link href="/test-blog">{post.category}</Link>
                      </div>

                      <h2>
                        <Link href={`/news/${post.slug}`}>{post.title}</Link>
                      </h2>

                      <div className="post-meta">
                        <span>
                          <i className="fal fa-calendar-alt" />
                          {post.date}
                        </span>
                        <span>
                          <i className="fal fa-user" />
                          {post.author}
                        </span>
                      </div>

                      {post.excerpt && <p>{post.excerpt}</p>}

                      <div className="post-link">
                        <Link href={`/news/${post.slug}`}>
                          <i className="fal fa-arrow-right" /> Mở bài viết
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
}
