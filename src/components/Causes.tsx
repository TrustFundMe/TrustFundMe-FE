"use client";
import { sliderProps } from "@/utility/sliderProps";
import Image from "next/image";
import Link from "next/link";
import { Nav, Tab } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";

export const Causes1 = () => {
  const causesData: {
    img: string;
    title: string;
    description: string;
    progress: number;
    raised: string;
    goal: string;
    delay: string;
  }[] = [
    {
      img: "/assets/img/causes/04.png",
      title: "Care charity names \n its new chief",
      description:
        "Under his leadership, we believe \n strengthen our position",
      progress: 70,
      raised: "$4,407",
      goal: "$10.000",
      delay: ".3s",
    },
    {
      img: "/assets/img/causes/05.png",
      title: "Our Donation Is Hope For Poor Children's",
      description:
        "Under his leadership, we believe \n strengthen our position",
      progress: 45,
      raised: "$3,500",
      goal: "$8.000",
      delay: ".5s",
    },
    {
      img: "/assets/img/causes/06.png",
      title: "Raise Fund For Clean & Healthy Water",
      description:
        "Under his leadership, we believe \n strengthen our position",
      progress: 65,
      raised: "$6,370",
      goal: "$10.000",
      delay: ".3s",
    },
    {
      img: "/assets/img/causes/07.png",
      title: "Emergency Response And Schools Food",
      description:
        "Under his leadership, we believe \n strengthen our position",
      progress: 90,
      raised: "$4,407",
      goal: "$10.000",
      delay: ".5s",
    },
  ];
  return (
    <section className="causes-section fix section-bg section-padding">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title color-2 wow fadeInUp">
            <i className="far fa-heart" />
            Help The People
          </span>
          <h2 className="mt-char-animation">Our Popular Causes</h2>
        </div>
        <div className="row">
          {causesData.map((item, i) => (
            <div
              key={i}
              className="col-xl-6 wow fadeInUp"
              data-wow-delay={item.delay}
            >
              <div className="popular-causes-card-items">
                <div className="row g-4 align-items-center">
                  <div className="col-lg-6">
                    <div className="thumb">
                      <Image
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: "100%", height: "auto" }}
                        src={item.img}
                        alt="cause"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="content">
                      <h4>
                        <Link href="/causes-details">{item.title}</Link>
                      </h4>
                      <p>{item.description}</p>
                      <div className="progress-items">
                        <span className="point">{item.progress}%</span>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: `${item.progress}%` }}
                            role="progressbar"
                            aria-valuenow={item.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <div className="progress-goals">
                          <span>
                            Raised <b>{item.raised}</b>
                          </span>
                          <span>
                            Goal <b>{item.goal}</b>
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/donation-details"
                        className="theme-btn transparent-btn-2"
                      >
                        <i className="far fa-heart" /> Donate Now
                      </Link>
                    </div>
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

export const Causes2 = () => {
  const causesData: {
    img: string;
    category: string;
    title: string;
    progress: number;
    raised: string;
    goal: string;
  }[] = [
    {
      img: "/assets/img/causes/04.jpg",
      category: "Water",
      title: "Rebecca's New Album Aid for the Needy",
      progress: 70,
      raised: "$4,407",
      goal: "$10.000",
    },
    {
      img: "/assets/img/causes/05.jpg",
      category: "Foods",
      title: "Charity Showcases Nation's Kindness",
      progress: 90,
      raised: "$4,407",
      goal: "$10.000",
    },
    {
      img: "/assets/img/causes/06.jpg",
      category: "Medical",
      title: "Provide Healthy Meals to an Impoverished Rural Child",
      progress: 55,
      raised: "$4,407",
      goal: "$10.000",
    },
    {
      img: "/assets/img/causes/07.jpg",
      category: "Water",
      title: "Rebecca's New Album Aid for the Needy",
      progress: 80,
      raised: "$4,407",
      goal: "$10.000",
    },
    {
      img: "/assets/img/causes/04.jpg",
      category: "Water",
      title: "Rebecca's New Album Aid for the Needy",
      progress: 70,
      raised: "$4,407",
      goal: "$10.000",
    },
    {
      img: "/assets/img/causes/05.jpg",
      category: "Foods",
      title: "Charity Showcases Nation's Kindness",
      progress: 90,
      raised: "$4,407",
      goal: "$10.000",
    },
    {
      img: "/assets/img/causes/06.jpg",
      category: "Medical",
      title: "Provide Healthy Meals to an Impoverished Rural Child",
      progress: 55,
      raised: "$4,407",
      goal: "$10.000",
    },
    {
      img: "/assets/img/causes/07.jpg",
      category: "Water",
      title: "Rebecca's New Album Aid for the Needy",
      progress: 80,
      raised: "$4,407",
      goal: "$10.000",
    },
  ];
  return (
    <section className="causes-section fix section-bg section-padding">
      <div className="container">
        <div className="section-title-area">
          <div className="section-title">
            <span className="sub-title color-2 wow fadeInUp">
              <i className="far fa-heart" /> Recent Causes
            </span>
            <h2 className="mt-char-animation">
              Introducing Our <br /> Campaigns
            </h2>
          </div>
          <div className="array-button">
            <button className="array-prev">
              <i className="fas fa-long-arrow-left" />
            </button>
            <button className="array-next">
              <i className="fas fa-long-arrow-right" />
            </button>
          </div>
        </div>
        <div className="causes-wrapper">
          <Swiper {...sliderProps.causes1} className="swiper causes-slider-2">
            <div className="swiper-wrapper">
              {causesData.map((cause, index) => (
                <SwiperSlide className="swiper-slide" key={index}>
                  <div className="causes-card-items card-style-2">
                    <div className="causes-image">
                      <Image
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: "100%", height: "auto" }}
                        src={cause.img}
                        alt={cause.title}
                      />
                      <div className="post-cat">{cause.category}</div>
                    </div>
                    <div className="causes-content">
                      <h3>
                        <Link href="/causes-details">{cause.title}</Link>
                      </h3>
                      <div className="progress-items">
                        <span className="point">{cause.progress}%</span>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: `${cause.progress}%` }}
                          />
                        </div>
                        <div className="progress-goals">
                          <span>
                            Raised <b>{cause.raised}</b>
                          </span>
                          <span>
                            Goal <b>{cause.goal}</b>
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/donation-details"
                        className="theme-btn transparent-btn-2"
                      >
                        <i className="far fa-heart" /> Donate Now
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </div>
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export const Causes3 = () => {
  const causes: {
    delay: string;
    bgImage: string;
    category: string;
    author: string;
    title: string;
    raised: number;
    goal: number;
  }[] = [
    {
      delay: ".3s",
      bgImage: "/assets/img/causes/01.jpg",
      category: "Water",
      author: "Miranda H.",
      title: "Because Everyone Deserves Clean Water",
      raised: 70,
      goal: 3000,
    },
    {
      delay: ".5s",
      bgImage: "/assets/img/causes/02.jpg",
      category: "Health",
      author: "Miranda H.",
      title: "Free And Cost-Effective Health Care for the poor",
      raised: 9500,
      goal: 20000,
    },
    {
      delay: ".7s",
      bgImage: "/assets/img/causes/03.jpg",
      category: "Foods",
      author: "Miranda H.",
      title: "Our Donation Is Hope For Poor Children's",
      raised: 3000,
      goal: 7000,
    },
  ];

  return (
    <section className="causes-section fix section-padding fix section-bg">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title wow fadeInUp">
            <i className="far fa-heart" />
            Trending Cause
          </span>
          <h2 className="mt-char-animation">
            It’s About Impact, <br />
            <span>Good</span> History
          </h2>
        </div>
        <div className="row">
          {causes.map((cause, index) => (
            <div
              key={index}
              className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp"
              data-wow-delay={cause.delay}
            >
              <div className="causes-box-items">
                <div
                  className="causes-image bg-cover"
                  style={{ backgroundImage: `url(${cause.bgImage})` }}
                />
                <div className="cause-content">
                  <div className="cause-meta">
                    <Link href="/causes" className="cause-cat">
                      {cause.category}
                    </Link>
                    <a href="#" className="cause-author">
                      <i className="fal fa-user" /> By {cause.author}
                    </a>
                  </div>
                  <h4>
                    <Link href="/causes-details">{cause.title}</Link>
                  </h4>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      data-wow-duration=".9s"
                      role="progressbar"
                      style={{ width: `${(cause.raised / cause.goal) * 100}%` }}
                      aria-valuenow={cause.raised}
                      aria-valuemin={0}
                      aria-valuemax={cause.goal}
                    />
                  </div>
                  <div className="cause-amount d-flex justify-content-between">
                    <div className="price-raised">
                      <i className="far fa-heart" />
                      <span>{cause.raised}</span> Raised
                    </div>
                    <div className="price-goal">
                      <i className="far fa-analytics" />
                      <span>${cause.goal}</span> Goal
                    </div>
                    <div className="read-cause-link">
                      <Link href="/causes-details">
                        <i className="fal fa-share" />
                      </Link>
                    </div>
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

export const Causes4 = () => {
  const causes: {
    title: string;
    description: string;
    image: string;
    progress: number;
    raised: string;
    goal: string;
  }[] = [
    {
      title: "Raise Fund For Clean & Healthy Food",
      description:
        "There are only a few times in each of our lives that we get to witness.",
      image: "/assets/img/causes/01.png",
      progress: 70,
      raised: "$4,407",
      goal: "$10.000",
    },
    {
      title: "Give African Child A Good Education",
      description:
        "There are only a few times in each of our lives that we get to witness.",
      image: "/assets/img/causes/02.png",
      progress: 90,
      raised: "$4,407",
      goal: "$10.000",
    },
    {
      title: "Raise Fund For Clean & Healthy Food",
      description:
        "There are only a few times in each of our lives that we get to witness.",
      image: "/assets/img/causes/03.png",
      progress: 55,
      raised: "$4,407",
      goal: "$10.000",
    },
  ];

  return (
    <section className="causes-section-2 fix section-padding fix section-bg">
      <div className="container">
        <div className="section-title">
          <span className="sub-title color-2 wow fadeInUp">
            <i className="far fa-heart" />
            Help The People
          </span>
          <h2 className="mt-char-animation">
            Our <span>Popular</span> Causes
          </h2>
        </div>
        <Swiper {...sliderProps.causes2} className="swiper causes-slider">
          <div className="swiper-wrapper">
            {causes.map((cause, index) => (
              <SwiperSlide key={index} className="swiper-slide">
                <div className="causes-card-items">
                  <div className="causes-image">
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: "100%", height: "auto" }}
                      src={cause.image}
                      alt="img"
                    />
                  </div>
                  <div className="causes-content">
                    <h3>
                      <Link href="/donation-details">{cause.title}</Link>
                    </h3>
                    <p>{cause.description}</p>
                    <div className="progress-items">
                      <span className="point">{cause.progress}%</span>
                      <div className="progress">
                        <div
                          className="progress-bar"
                          data-wow-duration=".9s"
                          role="progressbar"
                          style={{ width: `${cause.progress}%` }}
                          aria-valuenow={cause.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <div className="progress-goals">
                        <span>
                          Raised <b> {cause.raised}</b>
                        </span>
                        <span>
                          Goal <b> {cause.goal}</b>
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/donation-details"
                      className="theme-btn transparent-btn-2"
                    >
                      <i className="far fa-heart" /> Donate Now
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </div>
        </Swiper>
      </div>
    </section>
  );
};

export const Causes5 = () => {
  const events: {
    category: string;
    date: string;
    title: string;
    location: string;
    image: string;
  }[] = [
    {
      category: "Water Day",
      date: "24th January 2024",
      title: "2024 Water Full Day Main Conference",
      location: "M12/A Miranda Hall Town Hall Street New York, United States",
      image: "/assets/img/event/event-card-bg.jpg",
    },
    {
      category: "Friendship Day",
      date: "24th May 2024",
      title: "How We Can Be A Good Friends",
      location: "M12/A Miranda Hall Town Hall Street New York, United States",
      image: "/assets/img/event/event-card-bg.jpg",
    },
    {
      category: "Teachers Day",
      date: "24th January 2024",
      title: "Teachers Presentation Day of 2024",
      location: "M12/A Miranda Hall Town Hall Street New York, United States",
      image: "/assets/img/event/event-card-bg.jpg",
    },
  ];

  return (
    <section className="event-section fix section-padding fix section-bg">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title color-2 wow fadeInUp">
            <i className="far fa-heart" />
            Events
          </span>
          <h2 className="mt-char-animation">Upcoming Events</h2>
        </div>
        <div className="row">
          {events.map((event, index) => {
            const delay = (0.3 + index * 0.2).toFixed(1) + "s";
            return (
              <div
                key={index}
                className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp"
                data-wow-delay={delay}
              >
                <div
                  className="event-box-items bg-cover"
                  style={{ backgroundImage: `url(${event.image})` }}
                >
                  <div className="cat-name">
                    <Link href="/events">{event.category}</Link>
                  </div>
                  <span>{event.date}</span>
                  <h3>
                    <Link href="/event-details">{event.title}</Link>
                  </h3>
                  <p>
                    <i className="fal fa-map-marker-alt" /> {event.location}
                  </p>
                  <Link href="/event-details" className="buy-ticket">
                    <i className="fal fa-chair" /> Book Your Seat
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const CausesCard = ({
  id,
  delay,
  image,
  category,
  author,
  title,
  progress,
  raised,
  goal,
}: {
  id: number;
  delay: string;
  image: string;
  category: string;
  author: string;
  title: string;
  progress: number;
  raised: number;
  goal: number;
}) => (
  <div
    key={id}
    className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp"
    data-wow-delay={delay}
  >
    <div className="causes-box-items box-shadow">
      <div
        className="causes-image bg-cover"
        style={{ backgroundImage: `url("${image}")` }}
      />
      <div className="cause-content">
        <div className="cause-meta">
          <Link href="/causes" className="cause-cat">
            {category}
          </Link>
          <a href="#" className="cause-author">
            <i className="fal fa-user" />
            By {author}
          </a>
        </div>
        <h4>
          <Link href="/causes-details">{title}</Link>
        </h4>
        <div className="progress">
          <div
            className="progress-bar"
            data-wow-duration=".9s"
            role="progressbar"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="cause-amount d-flex justify-content-between">
          <div className="price-raised">
            <i className="far fa-heart" />
            <span>{raised}</span> Raised
          </div>
          <div className="price-goal">
            <i className="far fa-analytics" />
            <span>${goal}</span> Goal
          </div>
          <div className="read-cause-link">
            <Link href="/causes-details">
              <i className="fal fa-share" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const CausesTab = () => {
  const tabs: {
    key: string;
    label: string;
    active?: boolean;
    delay?: string;
  }[] = [
    { key: "categories", label: "All Categories", active: true, delay: ".3s" },
    { key: "education", label: "Education", delay: ".5s" },
    { key: "madicine", label: "Medicine", delay: ".7s" },
    { key: "food", label: "Foods", delay: ".9s" },
    { key: "water", label: "Water", delay: "1.1s" },
  ];

  const tabContentItems: Record<
    string,
    {
      id: number;
      category: string;
      image: string;
      title: string;
      raised: number;
      goal: number;
      progress: number;
      author: string;
      delay: string;
    }[]
  > = {
    categories: [
      {
        id: 1,
        category: "Water",
        image: "/assets/img/causes/01.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 55,
        author: "Miranda H.",
        delay: ".3s",
      },
      {
        id: 2,
        category: "Foods",
        image: "/assets/img/causes/02.jpg",
        title: "Our Donation Is Hope For Poor Children's",
        raised: 220,
        goal: 6000,
        progress: 45,
        author: "Miranda H.",
        delay: ".5s",
      },
      {
        id: 3,
        category: "Healthy",
        image: "/assets/img/causes/03.jpg",
        title: "Raise Fund For Clean & Healthy Water",
        raised: 70,
        goal: 3000,
        progress: 70,
        author: "Miranda H.",
        delay: ".7s",
      },
      {
        id: 4,
        category: "Education",
        image: "/assets/img/causes/03.jpg",
        title: "Emergency Response And Schools Food",
        raised: 1220,
        goal: 8000,
        progress: 90,
        author: "Miranda H.",
        delay: ".3s",
      },
      {
        id: 5,
        category: "Education",
        image: "/assets/img/causes/01.jpg",
        title: "Children Education Needs For Change The World.",
        raised: 6400,
        goal: 9000,
        progress: 80,
        author: "Miranda H.",
        delay: ".5s",
      },
      {
        id: 6,
        category: "Health",
        image: "/assets/img/causes/02.jpg",
        title: "Free And Cost-Effective Health Care",
        raised: 350,
        goal: 2000,
        progress: 85,
        author: "Miranda H.",
        delay: ".7s",
      },
      {
        id: 7,
        category: "Water",
        image: "/assets/img/causes/01.jpg",
        title: "Everyone Deserves Pure Clean Water",
        raised: 800,
        goal: 4500,
        progress: 70,
        author: "Miranda H.",
        delay: ".3s",
      },
      {
        id: 8,
        category: "Education",
        image: "/assets/img/causes/02.jpg",
        title: "Fundraising For Early Childhood Rise",
        raised: 70,
        goal: 3000,
        progress: 55,
        author: "Miranda H.",
        delay: ".5s",
      },
      {
        id: 9,
        category: "Education",
        image: "/assets/img/causes/03.jpg",
        title: "Children Education Needs For Change The World.",
        raised: 70,
        goal: 3000,
        progress: 65,
        author: "Miranda H.",
        delay: ".7s",
      },
    ],
    education: [
      {
        id: 1,
        category: "Water",
        image: "/assets/img/causes/01.jpg",
        title: "Everyone in the world Clean Water",
        raised: 70,
        goal: 3000,
        progress: 90,
        author: "Miranda H.",
        delay: ".3s",
      },
      {
        id: 2,
        category: "Water",
        image: "/assets/img/causes/02.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 50,
        author: "Miranda H.",
        delay: ".5s",
      },
      {
        id: 3,
        category: "Water",
        image: "/assets/img/causes/03.jpg",
        title: "Deserves Basic Education for the poor",
        raised: 670,
        goal: 6000,
        progress: 90,
        author: "Miranda H.",
        delay: ".7s",
      },
      {
        id: 4,
        category: "Water",
        image: "/assets/img/causes/03.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 760,
        goal: 6600,
        progress: 70,
        author: "Miranda H.",
        delay: ".3s",
      },
      {
        id: 5,
        category: "Foods",
        image: "/assets/img/causes/01.jpg",
        title: "Everyone Want to eating foods",
        raised: 700,
        goal: 2000,
        progress: 60,
        author: "Miranda H.",
        delay: ".5s",
      },
    ],
    madicine: [
      {
        id: 1,
        category: "Water",
        image: "/assets/img/causes/02.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 40,
        author: "Miranda H.",
        delay: ".5s",
      },
      {
        id: 2,
        category: "Water",
        image: "/assets/img/causes/01.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 80,
        author: "Miranda H.",
        delay: ".3s",
      },
      {
        id: 3,
        category: "Water",
        image: "/assets/img/causes/02.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 88,
        author: "Miranda H.",
        delay: ".5s",
      },
    ],
    food: [
      {
        id: 1,
        category: "Water",
        image: "/assets/img/causes/01.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 44,
        author: "Miranda H.",
        delay: ".3s",
      },
      {
        id: 2,
        category: "Water",
        image: "/assets/img/causes/02.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 90,
        author: "Miranda H.",
        delay: ".5s",
      },
      {
        id: 3,
        category: "Water",
        image: "/assets/img/causes/01.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 60,
        author: "Miranda H.",
        delay: ".7s",
      },
      {
        id: 4,
        category: "Water",
        image: "/assets/img/causes/02.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 50,
        author: "Miranda H.",
        delay: ".5s",
      },
      {
        id: 5,
        category: "Water",
        image: "/assets/img/causes/03.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 90,
        author: "Miranda H.",
        delay: ".7s",
      },
    ],
    water: [
      {
        id: 1,
        category: "Water",
        image: "/assets/img/causes/02.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 90,
        author: "Miranda H.",
        delay: ".3s",
      },
      {
        id: 2,
        category: "Water",
        image: "/assets/img/causes/01.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 60,
        author: "Miranda H.",
        delay: ".5s",
      },
      {
        id: 3,
        category: "Water",
        image: "/assets/img/causes/02.jpg",
        title: "Because Everyone Deserves Clean Water",
        raised: 70,
        goal: 3000,
        progress: 70,
        author: "Miranda H.",
        delay: ".7s",
      },
    ],
  };
  return (
    <section className="causes-section fix section-padding fix">
      <div className="container">
        <Tab.Container defaultActiveKey={"categories"}>
          <div className="cuases-tab-header">
            <Nav as={"ul"} className="nav mb-4" role="tablist">
              {tabs.map((tab) => (
                <Nav.Item
                  key={tab.key}
                  as="li"
                  className="nav-item wow fadeInUp"
                  data-wow-delay={tab.delay}
                  role="presentation"
                >
                  <Nav.Link
                    as="a"
                    href={`#${tab.key}`}
                    eventKey={tab.key}
                    data-bs-toggle="tab"
                    className="nav-link"
                    role="tab"
                  >
                    {tab.label}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </div>
          <Tab.Content className="tab-content">
            {Object.entries(tabContentItems).map(([key, events]) => (
              <Tab.Pane key={key} eventKey={key} className="tab-pane fade">
                <div className="row">
                  {events.map((event) => (
                    <CausesCard
                      key={event.id}
                      id={event.id}
                      delay={event.delay}
                      image={event.image}
                      category={event.category}
                      author={event.author}
                      title={event.title}
                      progress={event.progress}
                      raised={event.raised}
                      goal={event.goal}
                    />
                  ))}
                </div>
              </Tab.Pane>
            ))}
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
          </Tab.Content>
        </Tab.Container>
      </div>
    </section>
  );
};
