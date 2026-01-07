import BlogSidebar from "@/components/BlogSidebar";
import PageBanner from "@/components/PageBanner";
import DanboxLayout from "@/layout/DanboxLayout";
import Link from "next/link";
import { getAllPostsMeta } from "@/lib/blog";

const CausesPage = () => {
  // Lưu ý: hiện tại frontend-only, data blog đang lấy từ file trong repo (MDX local).
  const posts = getAllPostsMeta();

  return (
    <DanboxLayout>
      <PageBanner pageName="News Feeds" />
      <section className="blog-wrapper news-wrapper section-padding">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-8">
              <div className="blog-posts">
                {posts.map((item, index) => (
                  <div className="single-blog-post" key={index}>
                    {item.coverImage && (
                      <div
                        className="post-featured-thumb bg-cover"
                        style={{
                          backgroundImage: `url(${item.coverImage})`,
                        }}
                      />
                    )}
                    <div className="post-content">
                      <div className="post-cat">
                        <Link href="/news">{item.category}</Link>
                      </div>
                      <h2>
                        <Link href={`/news/${item.slug}`}>{item.title}</Link>
                      </h2>
                      <div className="post-meta">
                        <span>
                          <i className="fal fa-calendar-alt" />
                          {item.date}
                        </span>
                      </div>
                      {item.excerpt && <p>{item.excerpt}</p>}
                      <div className="d-flex justify-content-between align-items-center mt-30">
                        <div className="author-info">
                          <h5>
                            <a href="#">by {item.author}</a>
                          </h5>
                        </div>
                        <div className="post-link">
                          <Link href={`/news/${item.slug}`}>
                            <i className="fal fa-arrow-right" /> Read More
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="page-nav-wrap mt-5 text-center">
                <ul>
                  <li>
                    <a className="page-numbers" href="#">
                      <i className="fal fa-long-arrow-left" />
                    </a>
                  </li>
                  <li>
                    <a className="page-numbers" href="#">
                      01
                    </a>
                  </li>
                  <li>
                    <a className="page-numbers" href="#">
                      02
                    </a>
                  </li>
                  <li>
                    <a className="page-numbers" href="#">
                      ..
                    </a>
                  </li>
                  <li>
                    <a className="page-numbers" href="#">
                      10
                    </a>
                  </li>
                  <li>
                    <a className="page-numbers" href="#">
                      11
                    </a>
                  </li>
                  <li>
                    <a className="page-numbers" href="#">
                      <i className="fal fa-long-arrow-right" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <BlogSidebar />
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
};

export default CausesPage;
