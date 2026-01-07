// src/app/news/[slug]/page.tsx
// Mục tiêu: Render trang chi tiết bài viết từ MDX local theo slug.

import BlogSidebar from "@/components/BlogSidebar"; // Sidebar.
import PageBanner from "@/components/PageBanner"; // Banner.
import DanboxLayout from "@/layout/DanboxLayout"; // Layout.
import { getAllPostsMeta, getPostBySlug } from "@/lib/blog"; // Blog reader.
import { MDXRemote } from "next-mdx-remote/rsc"; // Render MDX trong App Router.
import Link from "next/link"; // Link.
import { notFound } from "next/navigation"; // 404.

// Khai báo params cho route động.
interface PageProps {
  // Params từ URL.
  params: Promise<{ slug: string }>;
}

// Generate static params để build SSG cho các bài local.
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  // Lấy meta.
  const posts = getAllPostsMeta();

  // Trả slug list.
  return posts.map((p) => ({ slug: p.slug }));
}

// Page component.
export default async function NewsDetailPage(props: PageProps) {
  // Lấy slug.
  const { slug } = await props.params;

  // Lấy post.
  const post = getPostBySlug(slug);

  // Không có thì 404.
  if (!post) {
    notFound();
  }

  // Render.
  return (
    <DanboxLayout>
      <PageBanner pageName={post.title} />
      <section className="blog-wrapper news-wrapper section-padding">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-8">
              <div className="blog-post-details border-wrap">
                <div className="single-blog-post post-details">
                  <div className="post-content">
                    <div className="post-cat">
                      <Link href="/news">{post.category}</Link>
                    </div>
                    <h2>{post.title}</h2>
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
                    {/* Render MDX content */}
                    <div className="mt-4">
                      <MDXRemote source={post.content} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <BlogSidebar />
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
}
