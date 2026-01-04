import Image from "next/image";
import Link from "next/link";

export const News1 = () => {
  const newsItems: {
    image: string;
    day: string;
    month: string;
    category: string;
    title: string;
    link: string;
    comments: string;
    delay: string;
    active?: boolean;
  }[] = [
    {
      image: "/assets/img/news/04.jpg",
      day: "20",
      month: "Feb",
      category: "Food",
      title: "Take Your Online Donation to the Next Level!",
      link: "news-details",
      comments: "02 Comments",
      delay: ".3s",
    },
    {
      image: "/assets/img/news/05.jpg",
      day: "22",
      month: "April",
      category: "Water",
      title: "Providing Clean Water on the Blue Planet",
      link: "news-details",
      comments: "02 Comments",
      delay: ".5s",
      active: true,
    },
    {
      image: "/assets/img/news/06.jpg",
      day: "20",
      month: "Feb",
      category: "Children",
      title: "Children in Africa Draw their Dreams",
      link: "news-details",
      comments: "02 Comments",
      delay: ".7s",
    },
  ];

  return (
    <section className="news-section fix section-padding pt-0">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title color-2 wow fadeInUp">
            <i className="far fa-heart" />
            News &amp; Articles
          </span>
          <h2 className="mt-char-animation">Recent News</h2>
        </div>
        <div className="row">
          {newsItems.map((item, index) => (
            <div
              key={index}
              className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp"
              data-wow-delay={item.delay}
            >
              <div
                className={`single-news-items-2 ${item.active ? "active" : ""}`}
              >
                <div
                  className="news-image bg-cover"
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  <div className="post-date">
                    <h5>{item.day}</h5>
                    <span>{item.month}</span>
                  </div>
                  <div className="news-content">
                    <div className="icon">
                      <i className="fal fa-tag" />
                      <span>{item.category}</span>
                    </div>
                    <h4>
                      <Link href={item.link}>{item.title}</Link>
                    </h4>
                    <ul className="post-list">
                      <li>
                        <i className="far fa-comment-alt" />
                        <span>{item.comments}</span>
                      </li>
                      <li>
                        <Link href={item.link}>
                          <i className="fas fa-long-arrow-right" />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const News2 = () => {
  const newsData: {
    img: string;
    day: string;
    month: string;
    author: string;
    category: string;
    title: string;
    delay: string;
  }[] = [
    {
      img: "/assets/img/news/07.jpg",
      day: "17",
      month: "Feb",
      author: "Admin",
      category: "Help",
      title: "Why are forest so important for earth?",
      delay: ".3s",
    },
    {
      img: "/assets/img/news/08.jpg",
      day: "25",
      month: "Feb",
      author: "Admin",
      category: "Help",
      title: "10 ways to give to charity your budget.",
      delay: ".5s",
    },
    {
      img: "/assets/img/news/09.jpg",
      day: "21",
      month: "Feb",
      author: "Admin",
      category: "Help",
      title: "Why are forest so important for earth?",
      delay: ".7s",
    },
  ];
  return (
    <section className="news-section section-padding fix">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title color-2 wow fadeInUp">
            <i className="far fa-heart" />
            Our Insights
          </span>
          <h2 className="mt-char-animation">News Feeds</h2>
        </div>
        <div className="row">
          {newsData.map((item, index) => (
            <div
              key={index}
              className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp"
              data-wow-delay={item.delay}
            >
              <div className="news-card-items-2">
                <div className="news-image">
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    src={item.img}
                    alt="news-img"
                  />
                  <div className="post-date">
                    <h3>
                      {item.day} <br />
                      <span>{item.month}</span>
                    </h3>
                  </div>
                </div>
                <div className="news-content">
                  <ul>
                    <li>
                      <i className="far fa-user" /> By {item.author}
                    </li>
                    <li>
                      <i className="far fa-tag" /> {item.category}
                    </li>
                  </ul>
                  <h4>
                    <Link href="/news-details">{item.title}</Link>
                  </h4>
                  <Link href="/news-details" className="link-btn">
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const News3 = () => {
  interface NewsItem {
    date: string;
    month: string;
    title: string;
    author: string;
    tags: string;
    description: string;
    image?: string; // optional for right-side news
    delay: string;
  }

  const mainNews: NewsItem = {
    date: "23",
    month: "June",
    title: "Many of us have no idea what it's like",
    author: "Shikhon Islam",
    tags: "Charity, Fundrise",
    description:
      "Many of us have no idea what it's like to be thirsty. We have plenty of water to drink -- even the water in our toilets But many people around the world don’t have tha",
    image: "/assets/img/news/01.jpg",
    delay: ".3s",
  };

  const sideNews: NewsItem[] = [
    {
      date: "23",
      month: "June",
      title: "A story about two sisters",
      author: "Shikhon Islam",
      tags: "Charity, Fundrise",
      description:
        "Many of us have no idea what it's like to be thirsty. We have plenty of water to drink even.",
      delay: ".3s",
    },
    {
      date: "14",
      month: "Feb",
      title: "The New Volunteer Workforce",
      author: "Shikhon Islam",
      tags: "Charity, Fundrise",
      description:
        "Many of us have no idea what it's like to be thirsty. We have plenty of water to drink even.",
      delay: ".5s",
    },
    {
      date: "07",
      month: "Jan",
      title: "Be Aware of Stereotyping",
      author: "Shikhon Islam",
      tags: "Charity, Fundrise",
      description:
        "Many of us have no idea what it's like to be thirsty. We have plenty of water to drink even.",
      delay: ".7s",
    },
  ];

  return (
    <section className="news-section section-padding fix">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title color-2">
            <i className="far fa-heart wow fadeInUp" />
            Our Insights
          </span>
          <h2 className="mt-char-animation">News Feeds</h2>
        </div>
        <div className="row">
          {/* Main News */}
          <div
            className="col-lg-6 wow fadeInUp"
            data-wow-delay={mainNews.delay}
          >
            <div className="news-box-items">
              <div
                className="news-image bg-cover"
                style={{ backgroundImage: `url(${mainNews.image})` }}
              />
              <div className="news-content">
                <ul className="post-list">
                  <li>
                    <i className="far fa-user" /> {mainNews.author}
                  </li>
                  <li>
                    <i className="far fa-tags" /> {mainNews.tags}
                  </li>
                </ul>
                <h3>
                  <Link href="/news-details">{mainNews.title}</Link>
                </h3>
                <p>{mainNews.description}</p>
              </div>
            </div>
          </div>

          {/* Side News */}
          <div className="col-lg-6">
            <div className="news-right-area">
              {sideNews.map((news, index) => (
                <div
                  key={index}
                  className="single-news-items wow fadeInUp"
                  data-wow-delay={news.delay}
                >
                  <div
                    className={`post-date ${
                      index !== 0 ? `color-${index + 1}` : ""
                    }`}
                  >
                    <span>{news.date}</span>
                    {news.month}
                  </div>
                  <div className="post-content">
                    <ul className="post-list">
                      <li>
                        <i className="far fa-user" /> {news.author}
                      </li>
                      <li>
                        <i className="far fa-tags" /> {news.tags}
                      </li>
                    </ul>
                    <h3>
                      <Link href="/news-details">{news.title}</Link>
                    </h3>
                    <p>{news.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const News4 = () => {
  const newsData: {
    image: string;
    date: string;
    title: string;
    description: string;
  }[] = [
    {
      image: "/assets/img/news/04.jpg",
      date: "24th September 2024",
      title: "Group of donors is a cover operating",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
    },
    {
      image: "/assets/img/news/05.jpg",
      date: "24th September 2024",
      title: "Everyone Deserves Clean Water",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
    },
    {
      image: "/assets/img/news/06.jpg",
      date: "24th September 2024",
      title: "Childhood Teaching Free support",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
    },
  ];

  return (
    <section className="news-section section-padding fix">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title color-2 wow fadeInUp">
            <i className="far fa-heart" />
            Our Insights
          </span>
          <h2 className="mt-char-animation">News Feeds</h2>
        </div>
        <div className="row">
          {newsData.map((news, index) => (
            <div
              key={index}
              className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp"
              data-wow-delay={`.${3 + index * 2}s`} // .3s, .5s, .7s
            >
              <div className="news-card-items">
                <div className="news-image">
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    src={news.image}
                    alt="img"
                  />
                </div>
                <div className="news-content">
                  <span>
                    <i className="far fa-calendar-alt" /> {news.date}
                  </span>
                  <h3>
                    <Link href="/news-details">{news.title}</Link>
                  </h3>
                  <p>{news.description}</p>
                  <Link href="/news-details" className="link-btn">
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
