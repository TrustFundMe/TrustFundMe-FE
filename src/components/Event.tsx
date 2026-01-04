"use client";
import { sliderProps } from "@/utility/sliderProps";
import Image from "next/image";
import Link from "next/link";
import { Nav, Tab } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";

export const Event1 = () => {
  const eventsData: {
    img: string;
    date: string;
    time: string;
    location: string;
    title: string;
    link: string;
    description: string;
    delay: string;
  }[] = [
    {
      img: "/assets/img/event/09.jpg",
      date: "13 Nov 2024",
      time: "10:00 PM",
      location: "66 Broklyant, New York India",
      title: "Rebecca's Album Supports Needy",
      link: "event-details",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit sed do \n eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      delay: ".3s",
    },
    {
      img: "/assets/img/event/15.jpg",
      date: "13 Nov 2024",
      time: "10:00 PM",
      location: "66 Broklyant, New York India",
      title: "Be Hungry No More and Leave",
      link: "event-details",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit sed do \n eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      delay: ".5s",
    },
    {
      img: "/assets/img/event/16.jpg",
      date: "13 Nov 2024",
      time: "10:00 PM",
      location: "66 Broklyant, New York India",
      title: "Charities Learn Forward",
      link: "event-details",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit sed do \n eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      delay: ".3s",
    },
    {
      img: "/assets/img/event/17.jpg",
      date: "13 Nov 2024",
      time: "10:00 PM",
      location: "66 Broklyant, New York India",
      title: "Help Us Touch Their Live",
      link: "event-details",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit sed do \n eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      delay: ".5s",
    },
  ];

  return (
    <section className="event-section-4 fix section-padding">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title color-2 wow fadeInUp">
            <i className="far fa-heart" />
            our event
          </span>
          <h2 className="mt-char-animation">Our Upcoming Event</h2>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          {eventsData.map((event, i) => (
            <div
              className="col-xl-6 wow fadeInUp"
              data-wow-delay={event.delay}
              key={i}
            >
              <div className="event-card-items">
                <div className="event-image">
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{
                      width: "285px",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    src={event.img}
                    alt="img"
                  />
                </div>
                <div className="event-content">
                  <ul>
                    <li>
                      <i className="fal fa-calendar-alt" />
                      {event.date}
                    </li>
                    <li>
                      <i className="far fa-clock" />
                      {event.time}
                    </li>
                    <li>
                      <i className="far fa-map-marker-alt" />
                      {event.location}
                    </li>
                  </ul>
                  <h3>
                    <Link href="/event-details">{event.title}</Link>
                  </h3>
                  <p>{event.description}</p>
                  <Link href="/event-details" className="link-btn">
                    Read More <i className="far fa-long-arrow-right" />
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

export const Event2 = () => {
  const eventsData: {
    img: string;
    date: string;
    time: string;
    location: string;
    title: string;
    description: string;
    delay: string;
  }[] = [
    {
      img: "/assets/img/event/02.jpg",
      date: "13 Nov 2024",
      time: "10:00 PM",
      location: "66 Broklyant, New York India",
      title: "How to build a loyal community offline",
      description:
        "Nullam faucibus eleifend mi eu varius. Integer vel tincidunt massa, quis semper odio. Mauris et mollis quam. Nullam fringilla erat id ante commodo sodales.",
      delay: ".3s",
    },
    {
      img: "/assets/img/event/08.jpg",
      date: "13 Nov 2024",
      time: "10:00 PM",
      location: "66 Broklyant, New York India",
      title: "Start a campaign to reach your creative",
      description:
        "Nullam faucibus eleifend mi eu varius. Integer vel tincidunt massa, quis semper odio. Mauris et mollis quam. Nullam fringilla erat id ante commodo sodales.",
      delay: ".5s",
    },
  ];
  return (
    <section className="event-section fix section-padding">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title color-2 wow fadeInUp">
            <i className="far fa-heart" /> Our Events
          </span>
          <h2 className="mt-char-animation">
            Be ready for our upcoming <br /> charity events
          </h2>
        </div>
        <div className="row">
          {eventsData.map((event, index) => (
            <div
              key={index}
              className="col-lg-6 wow fadeInUp"
              data-wow-delay={event.delay}
            >
              <div className="event-box-items-2">
                <div className="event-image">
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    src={event.img}
                    alt={event.title}
                  />
                </div>
                <div className="event-content">
                  <ul>
                    <li>
                      <i className="fal fa-calendar-alt" /> {event.date}
                    </li>
                    <li>
                      <i className="far fa-clock" /> {event.time}
                    </li>
                    <li>
                      <i className="far fa-map-marker-alt" /> {event.location}
                    </li>
                  </ul>
                  <h3>
                    <Link href="/event-details">{event.title}</Link>
                  </h3>
                  <p>{event.description}</p>
                  <Link
                    href="/event-details"
                    className="theme-btn transparent-btn-2"
                  >
                    <i className="far fa-heart" /> Join Now
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

export const Event3 = () => {
  const events: {
    bgImage: string;
    date: string;
    month: string;
    colorClass?: string;
    category: string;
    title: string;
    time: string;
    author: string;
  }[] = [
    {
      bgImage: "/assets/img/event/01.jpg",
      date: "11",
      month: "July",
      category: "School",
      title: "Need To Playing For This Worlds",
      time: "13:00 - 18:00",
      author: "Shikhon Islam",
    },
    {
      bgImage: "/assets/img/event/04.jpg",
      date: "11",
      month: "July",
      colorClass: "color-2",
      category: "School",
      title: "Need To Playing For This Worlds",
      time: "13:00 - 18:00",
      author: "Shikhon Islam",
    },
    {
      bgImage: "/assets/img/event/05.jpg",
      date: "11",
      month: "July",
      colorClass: "color-3",
      category: "School",
      title: "Need To Playing For This Worlds",
      time: "13:00 - 18:00",
      author: "Shikhon Islam",
    },
    {
      bgImage: "/assets/img/event/06.jpg",
      date: "11",
      month: "July",
      colorClass: "color-4",
      category: "School",
      title: "Need To Playing For This Worlds",
      time: "13:00 - 18:00",
      author: "Shikhon Islam",
    },
    {
      bgImage: "/assets/img/event/07.jpg",
      date: "11",
      month: "July",
      colorClass: "color-5",
      category: "School",
      title: "Need To Playing For This Worlds",
      time: "13:00 - 18:00",
      author: "Shikhon Islam",
    },
    {
      bgImage: "/assets/img/event/01.jpg",
      date: "11",
      month: "July",
      category: "School",
      title: "Need To Playing For This Worlds",
      time: "13:00 - 18:00",
      author: "Shikhon Islam",
    },
    {
      bgImage: "/assets/img/event/04.jpg",
      date: "11",
      month: "July",
      colorClass: "color-2",
      category: "School",
      title: "Need To Playing For This Worlds",
      time: "13:00 - 18:00",
      author: "Shikhon Islam",
    },
    {
      bgImage: "/assets/img/event/05.jpg",
      date: "11",
      month: "July",
      colorClass: "color-3",
      category: "School",
      title: "Need To Playing For This Worlds",
      time: "13:00 - 18:00",
      author: "Shikhon Islam",
    },
    {
      bgImage: "/assets/img/event/06.jpg",
      date: "11",
      month: "July",
      colorClass: "color-4",
      category: "School",
      title: "Need To Playing For This Worlds",
      time: "13:00 - 18:00",
      author: "Shikhon Islam",
    },
    {
      bgImage: "/assets/img/event/07.jpg",
      date: "11",
      month: "July",
      colorClass: "color-5",
      category: "School",
      title: "Need To Playing For This Worlds",
      time: "13:00 - 18:00",
      author: "Shikhon Islam",
    },
  ];

  return (
    <section className="event-section">
      <Swiper {...sliderProps.event} className="swiper event-slider">
        <div className="swiper-wrapper">
          {events.map((event, index) => (
            <SwiperSlide key={index} className="swiper-slide">
              <div className="event-single-items">
                <div
                  className="event-image bg-cover"
                  style={{ backgroundImage: `url(${event.bgImage})` }}
                >
                  <div className="event-content">
                    <div className="sub-content">
                      <div className={`event-date ${event.colorClass || ""}`}>
                        <span>{event.date}</span>
                        {event.month}
                      </div>
                      <div className="event-title">
                        <Link href="events" className="event-cat">
                          {event.category}
                        </Link>
                        <h4>
                          <Link href="/event-details">{event.title}</Link>
                        </h4>
                      </div>
                    </div>
                    <ul className="post-date">
                      <li>
                        <i className="fal fa-clock" /> {event.time}
                      </li>
                      <li>
                        <i className="fal fa-user" /> {event.author}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </div>
      </Swiper>
    </section>
  );
};

const EventCard = ({
  image,
  title,
  description,
}: {
  image: string;
  title: string;
  description: string;
}) => (
  <div className="event-card-main-items">
    <div className="event-card-items-2">
      <div className="event-image">
        <Image
          width={0}
          height={0}
          sizes="100vw"
          style={{ height: "auto", width: "100%" }}
          src={image}
          alt="img"
        />
        <div className="event-time-address">
          <span>
            <i className="fal fa-calendar-alt" />
            24th June 2024
          </span>
          <span>
            <i className="fal fa-map-marker-alt" />
            NY, London
          </span>
        </div>
      </div>
      <div className="event-content-itmes">
        <div className="event-content">
          <div className="event-title-top">
            <h3>
              <Link href="/event-details">{title}</Link>
            </h3>
            <p>{description}</p>
          </div>
          <div className="list-items">
            <ul>
              <li>
                <i className="fas fa-check" /> A place in history
              </li>
              <li>
                <i className="fas fa-check" /> It's about impact, goodness
              </li>
            </ul>
            <ul>
              <li>
                <i className="fas fa-check" /> More goodness in the world
              </li>
              <li>
                <i className="fas fa-check" /> The world we live
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <Link href="/event-details" className="theme-btn">
      <i className="fal fa-home me-2" />
      Book A Seat
    </Link>
  </div>
);

export const EventPage = () => {
  const tabs: {
    key: string;
    label: string;
    delay: string;
  }[] = [
    { key: "categories", label: "All Categories", delay: ".3s" },
    { key: "water", label: "Water Day", delay: ".5s" },
    { key: "festival", label: "Festival", delay: ".7s" },
    { key: "proevent", label: "ProEvent", delay: ".7s" },
    { key: "trending", label: "Trending", delay: ".7s" },
  ];

  const eventData: Record<
    string,
    {
      image: string;
      title: string;
    }[]
  > = {
    categories: [
      {
        image: "/assets/img/event/e1.jpg",
        title: "Project Management In The Voluntary Sector",
      },
      {
        image: "/assets/img/event/e2.jpg",
        title: "10 Ways To Help Others That Will Lead You",
      },
      {
        image: "/assets/img/event/e3.jpg",
        title: "Helping The Church To Serve Others",
      },
      {
        image: "/assets/img/event/e4.jpg",
        title: "Rebuilding Collapse Primary School",
      },
      {
        image: "/assets/img/event/e5.jpg",
        title: "Changing Leadership In A Changing World",
      },
      {
        image: "/assets/img/event/e6.jpg",
        title: "Charity Program In The Dhaka",
      },
    ],
    water: [
      {
        image: "/assets/img/event/e1.jpg",
        title: "Project Management In The Voluntary Sector",
      },
      {
        image: "/assets/img/event/e2.jpg",
        title: "10 Ways To Help Others That Will Lead You",
      },
      {
        image: "/assets/img/event/e5.jpg",
        title: "Changing Leadership In A Changing World",
      },
      {
        image: "/assets/img/event/e6.jpg",
        title: "Charity Program In The Dhaka",
      },
    ],
    festival: [
      {
        image: "/assets/img/event/e2.jpg",
        title: "10 Ways To Help Others That Will Lead You",
      },
      {
        image: "/assets/img/event/e3.jpg",
        title: "Helping The Church To Serve Others",
      },
      {
        image: "/assets/img/event/e4.jpg",
        title: "Rebuilding Collapse Primary School",
      },
      {
        image: "/assets/img/event/e5.jpg",
        title: "Changing Leadership In A Changing World",
      },
    ],
    proevent: [
      {
        image: "/assets/img/event/e1.jpg",
        title: "Project Management In The Voluntary Sector",
      },
      {
        image: "/assets/img/event/e2.jpg",
        title: "10 Ways To Help Others That Will Lead You",
      },
      {
        image: "/assets/img/event/e6.jpg",
        title: "Charity Program In The Dhaka",
      },
    ],
    trending: [
      {
        image: "/assets/img/event/e4.jpg",
        title: "Rebuilding Collapse Primary School",
      },
      {
        image: "/assets/img/event/e5.jpg",
        title: "Changing Leadership In A Changing World",
      },
      {
        image: "/assets/img/event/e6.jpg",
        title: "Charity Program In The Dhaka",
      },
    ],
  };
  const description =
    "Your $40.00 monthly donation can give 12 people clean water every year. 100% funds water projects.";

  return (
    <section className="event-section-4 fix section-padding">
      <div className="container">
        <Tab.Container defaultActiveKey="categories">
          <div className="event-tab-header">
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
            {Object.entries(eventData).map(([key, events]) => (
              <Tab.Pane key={key} eventKey={key} className="tab-pane fade">
                <div className="row">
                  <div className="col-xl-12">
                    {events.map((event, index) => (
                      <EventCard
                        key={index}
                        image={event.image}
                        title={event.title}
                        description={description}
                      />
                    ))}
                  </div>
                </div>
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
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
    </section>
  );
};
