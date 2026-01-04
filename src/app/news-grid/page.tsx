import PageBanner from "@/components/PageBanner";
import DanboxLayout from "@/layout/DanboxLayout";
import Link from "next/link";

const CausesPage = () => {
  interface NewsCard {
    image: string;
    day?: string;
    month?: string;
    category?: string;
    title: string;
    comments?: string;
    delay: string;
  }

  const newsCards: NewsCard[] = [
    {
      image: "/assets/img/news/04.jpg",
      day: "20",
      month: "Feb",
      category: "Startup",
      title: "Crafting a digital identity: the art of agency web design",
      comments: "02 Comments",
      delay: ".3",
    },
    {
      image: "/assets/img/news/05.jpg",
      day: "22",
      month: "April",
      category: "Consulting",
      title: "How to manage business’s online reputation",
      comments: "02 Comments",
      delay: ".5",
    },
    {
      image: "/assets/img/news/06.jpg",
      day: "20",
      month: "Feb",
      category: "Business",
      title: "Top crypto exchange systems influencers in China",
      comments: "02 Comments",
      delay: ".7",
    },
    {
      image: "/assets/img/news/06.jpg",
      day: "20",
      month: "Feb",
      category: "Business",
      title: "Top crypto exchange systems influencers in China",
      comments: "02 Comments",
      delay: ".3",
    },
    {
      image: "/assets/img/news/04.jpg",
      day: "20",
      month: "Feb",
      category: "Startup",
      title: "Crafting a digital identity: the art of agency web design",
      comments: "02 Comments",
      delay: ".5",
    },
    {
      image: "/assets/img/news/05.jpg",
      day: "22",
      month: "April",
      category: "Consulting",
      title: "How to manage business’s online reputation",
      comments: "02 Comments",
      delay: ".7",
    },
  ];

  return (
    <DanboxLayout>
      <PageBanner pageName="News Grid" />
      <section className="news-section fix section-padding">
        <div className="container">
          <div className="row g-4">
            {newsCards.map((card, index) => (
              <div
                key={index}
                className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp"
                data-wow-delay={`${card.delay}s`}
              >
                <div className="single-news-items-2 mt-0">
                  <div
                    className="news-image bg-cover"
                    style={{ backgroundImage: `url("${card.image}")` }}
                  >
                    <div className="post-date">
                      <h5>{card.day}</h5>
                      <span>{card.month}</span>
                    </div>
                    <div className="news-content">
                      <div className="icon">
                        <i className="fal fa-tag" />
                        <span>{card.category}</span>
                      </div>
                      <h4>
                        <Link href="/news-details">{card.title}</Link>
                      </h4>
                      <ul className="post-list">
                        <li>
                          <i className="far fa-comment-alt" />{" "}
                          <span>{card.comments}</span>
                        </li>
                        <li>
                          <Link href="/news-details">
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
    </DanboxLayout>
  );
};

export default CausesPage;
