import BlogSidebar from "@/components/BlogSidebar";
import PageBanner from "@/components/PageBanner";
import DanboxLayout from "@/layout/DanboxLayout";
import Link from "next/link";

const CausesPage = () => {
  interface BlogPost {
    image?: string;
    videoUrl?: string;
    category: string;
    title: string;
    comments: string;
    date: string;
    author: string;
    authorImage?: string;
    excerpt: string;
    isQuote?: boolean;
  }

  const blogPosts: BlogPost[] = [
    {
      image: "assets/img/news/post1.jpg",
      category: "Charity",
      title: "Save the Children’s Role in Fight Against Malnutrition Hailed",
      comments: "35 Comments",
      date: "24th March 2024",
      author: "Hetmayar",
      authorImage: "assets/img/news/author_img.jpg",
      excerpt:
        "With the cargo business blasting, financier firms are bouncing from organization to organization quickly, prompting high paces of turnover. Regularly, agents are beginning the work with the...",
    },
    {
      image: "assets/img/news/post2.jpg",
      category: "Charity",
      title: "Back to the future: Quality education through.",
      comments: "35 Comments",
      date: "17th July 2024",
      author: "Hetmayar",
      authorImage: "assets/img/news/author_img.jpg",
      excerpt:
        "We commit ourselves to complete all projects within the timeline set with our honorable clients. ex ea commodo consequat. We have a proven record of best result of building and reputable company in the United States.",
    },
    {
      image: "assets/img/news/post3.jpg",
      videoUrl: "https://www.youtube.com/watch?v=E1xkXZs0cAQ",
      category: "Charity",
      title: "Condolences to Families Effected By Flash Floods",
      comments: "35 Comments",
      date: "17th July 2024",
      author: "Hetmayar",
      authorImage: "assets/img/news/author_img.jpg",
      excerpt:
        "We commit ourselves to complete all projects within the timeline set with our honorable clients. ex ea commodo consequat. We have a proven record of best result of building and reputable company in the United States.",
    },
    {
      image: "assets/img/news/post4.jpg",
      category: "Charity",
      title: "Take Care Of The Elderly Without Home.",
      comments: "35 Comments",
      date: "24th March 2024",
      author: "Hetmayar",
      authorImage: "assets/img/news/author_img.jpg",
      excerpt:
        "We have a proven record of best result of building and reputable company in the United States. Thousands of successful projects we are one of the most trusted construction companies. We have a proven record of best result of building and reputable company in the United States.",
    },
    {
      isQuote: true,
      category: "Quote",
      title: "Excepteur sint occaecat cupida tat non proident, sunt in.",
      comments: "35 Comments",
      date: "24th March 2024",
      author: "Hetmayar",
      excerpt: "",
    },
  ];

  return (
    <DanboxLayout>
      <PageBanner pageName="News Feeds" />
      <section className="blog-wrapper news-wrapper section-padding">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-8">
              <div className="blog-posts">
                {blogPosts.map((item, index) =>
                  item.isQuote ? (
                    <div
                      className="single-blog-post quote-post format-quote"
                      key={index}
                    >
                      <div className="post-content text-white bg-cover">
                        <div className="quote-content">
                          <div className="icon">
                            <i className="fas fa-quote-left" />
                          </div>
                          <div className="quote-text">
                            <h2>{item.title}</h2>
                            <div className="post-meta">
                              <span>
                                <i className="fal fa-comments" />
                                {item.comments}
                              </span>
                              <span>
                                <i className="fal fa-calendar-alt" />
                                {item.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="single-blog-post" key={index}>
                      {item.image && (
                        <div
                          className="post-featured-thumb bg-cover"
                          style={{
                            backgroundImage: `url(${item.image})`,
                          }}
                        />
                      )}
                      <div className="post-content">
                        <div className="post-cat">
                          <Link href="/news">{item.category}</Link>
                        </div>
                        <h2>
                          <Link href="/news-details">{item.title}</Link>
                        </h2>
                        <div className="post-meta">
                          <span>
                            <i className="fal fa-comments" />
                            {item.comments}
                          </span>
                          <span>
                            <i className="fal fa-calendar-alt" />
                            {item.date}
                          </span>
                        </div>
                        {item.excerpt && <p>{item.excerpt}</p>}
                        <div className="d-flex justify-content-between align-items-center mt-30">
                          <div className="author-info">
                            <div
                              className="author-img bg-cover"
                              style={{
                                backgroundImage: `url(${item.authorImage})`,
                              }}
                            />
                            <h5>
                              <a href="#">by {item.author}</a>
                            </h5>
                          </div>
                          <div className="post-link">
                            <Link href="/news-details">
                              <i className="fal fa-arrow-right" /> Read More
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
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
