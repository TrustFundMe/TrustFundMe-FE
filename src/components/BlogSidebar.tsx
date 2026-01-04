import Link from "next/link";

interface SidebarItem {
  type: "search" | "popularPosts" | "categories" | "social" | "tags";
  title?: string;
  posts?: {
    image: string;
    title: string;
    date: string;
    link: string;
  }[];
  categories?: {
    name: string;
    count: number;
    link: string;
  }[];
  socialLinks?: {
    platform: string;
    link: string;
    iconClass: string;
  }[];
  tags?: {
    name: string;
    link: string;
  }[];
}

const sidebarData: SidebarItem[] = [
  { type: "search", title: "Search" },
  {
    type: "popularPosts",
    title: "Popular Feeds",
    posts: [
      {
        image: "assets/img/news/pp3.jpg",
        title: "Lorem ipsum dolor sit cing elit, sed do.",
        date: "24th March 2024",
        link: "news-details",
      },
      {
        image: "assets/img/news/pp1.jpg",
        title: "Lorem ipsum dolor sit cing elit, sed do.",
        date: "25th March 2024",
        link: "news-details",
      },
      {
        image: "assets/img/news/pp2.jpg",
        title: "Lorem ipsum dolor sit cing elit, sed do.",
        date: "26th March 2024",
        link: "news-details",
      },
      {
        image: "assets/img/news/pp4.jpg",
        title: "Lorem ipsum dolor sit cing elit, sed do.",
        date: "29th March 2024",
        link: "news-details",
      },
    ],
  },
  {
    type: "categories",
    title: "Categories",
    categories: [
      { name: "Consultant", count: 23, link: "news" },
      { name: "Help", count: 24, link: "news" },
      { name: "Education", count: 11, link: "news" },
      { name: "Technology", count: 5, link: "news" },
      { name: "Business", count: 6, link: "news" },
      { name: "Events", count: 10, link: "news" },
    ],
  },
  {
    type: "social",
    title: "Never Miss News",
    socialLinks: [
      { platform: "facebook", link: "#", iconClass: "fab fa-facebook-f" },
      { platform: "twitter", link: "#", iconClass: "fab fa-twitter" },
      { platform: "instagram", link: "#", iconClass: "fab fa-instagram" },
      { platform: "linkedin", link: "#", iconClass: "fab fa-linkedin-in" },
      { platform: "youtube", link: "#", iconClass: "fab fa-youtube" },
    ],
  },
  {
    type: "tags",
    title: "Popular Tags",
    tags: [
      { name: "Popular", link: "news" },
      { name: "desgin", link: "news-details" },
      { name: "oil", link: "news-details" },
      { name: "usability", link: "news-details" },
      { name: "develop", link: "news-details" },
      { name: "kit", link: "news-details" },
      { name: "keyboard", link: "news-details" },
      { name: "mouse", link: "news-details" },
    ],
  },
];

const BlogSidebar = () => {
  return (
    <div className="col-12 col-lg-4">
      <div className="main-sidebar">
        {sidebarData.map((item, index) => {
          switch (item.type) {
            case "search":
              return (
                <div key={index} className="single-sidebar-widget">
                  <div className="wid-title">
                    <h3>{item.title}</h3>
                  </div>
                  <div className="search_widget">
                    <form action="#">
                      <input type="text" placeholder="Search your keyword..." />
                      <button type="submit">
                        <i className="fal fa-search" />
                      </button>
                    </form>
                  </div>
                </div>
              );

            case "popularPosts":
              return (
                <div key={index} className="single-sidebar-widget">
                  <div className="wid-title">
                    <h3>{item.title}</h3>
                  </div>
                  <div className="popular-posts">
                    {item.posts?.map((post, idx) => (
                      <div key={idx} className="single-post-item">
                        <div
                          className="thumb bg-cover"
                          style={{ backgroundImage: `url(${post.image})` }}
                        />
                        <div className="post-content">
                          <h5>
                            <Link href={post.link}>{post.title}</Link>
                          </h5>
                          <div className="post-date">
                            <i className="far fa-calendar-alt" /> {post.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case "categories":
              return (
                <div key={index} className="single-sidebar-widget">
                  <div className="wid-title">
                    <h3>{item.title}</h3>
                  </div>
                  <div className="widget_categories">
                    <ul>
                      {item.categories?.map((cat, idx) => (
                        <li key={idx}>
                          <Link href={cat.link}>
                            {cat.name} <span>{cat.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );

            case "social":
              return (
                <div key={index} className="single-sidebar-widget">
                  <div className="wid-title">
                    <h3>{item.title}</h3>
                  </div>
                  <div className="social-link">
                    {item.socialLinks?.map((social, idx) => (
                      <a key={idx} href={social.link}>
                        <i className={social.iconClass} />
                      </a>
                    ))}
                  </div>
                </div>
              );

            case "tags":
              return (
                <div key={index} className="single-sidebar-widget">
                  <div className="wid-title">
                    <h3>{item.title}</h3>
                  </div>
                  <div className="tagcloud">
                    {item.tags?.map((tag, idx) => (
                      <Link key={idx} href={tag.link}>
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default BlogSidebar;
