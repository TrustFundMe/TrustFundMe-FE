"use client";
import Image from "next/image";
import Link from "next/link";
import Accordion from "react-bootstrap/Accordion";

const Faq = () => {
  const faqs: {
    key: string;
    question: string;
    answer: string;
    delay: string;
  }[] = [
    {
      key: "faq1",
      question: "How To Become A Volunteer In Zambia State?",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
      delay: ".3s",
    },
    {
      key: "faq2",
      question: "How to customize this theme?",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
      delay: ".5s",
    },
    {
      key: "faq3",
      question: "How Can I Give My Clothes And Other Products?",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
      delay: ".7s",
    },
  ];
  return (
    <div className="faq-content">
      <div className="section-title">
        <span className="sub-title color-2 wow fadeInUp">
          <i className="far fa-heart" />
          Our Faq Now
        </span>
        <h2 className="mt-char-animation">
          We’ve Funded 5k <br />
          Dollars Over
        </h2>
      </div>
      <div className="faq-accordion mt-4 mt-md-0">
        <Accordion defaultActiveKey="faq2">
          {faqs.map(({ key, question, answer, delay }) => (
            <Accordion.Item
              key={key}
              eventKey={key}
              className="wow fadeInUp"
              data-wow-delay={delay}
            >
              <Accordion.Header>{question}</Accordion.Header>
              <Accordion.Body>{answer}</Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export const Faq1 = () => {
  return (
    <section className="faq-section fix section-padding">
      <div className="container">
        <div className="faq-wrapper">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <Faq />
            </div>
            <div className="col-lg-6 wow fadeInUp" data-wow-delay=".3s">
              <div className="faq-image-items-2">
                <Image
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: "100%", height: "auto" }}
                  src="/assets/img/faq/faq5.jpg"
                  alt="img"
                  className="faq-img"
                />
                <div className="faq-image-2">
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    src="/assets/img/faq/faq6.jpg"
                    alt="img"
                  />
                </div>
                <div className="faq-image-3">
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    src="/assets/img/faq/faq7.jpg"
                    alt="img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Faq2 = () => {
  return (
    <section className="faq-section fix section-padding">
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <Faq />
          </div>
          <div className="col-lg-6">
            <div className="faq-image-items">
              <div className="counter-box">
                <h2>
                  <span className="count">19</span>+
                </h2>
                <p>Year Experience</p>
              </div>
              <div className="row g-4">
                <div
                  className="col-lg-6 col-md-6 wow fadeInUp"
                  data-wow-delay=".2s"
                >
                  <div className="faq-image">
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: "100%", height: "auto" }}
                      src="/assets/img/faq/faq1.jpg"
                      alt="img"
                    />
                  </div>
                </div>
                <div
                  className="col-lg-6 col-md-6 wow fadeInUp"
                  data-wow-delay=".4s"
                >
                  <div className="faq-image">
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: "100%", height: "auto" }}
                      src="/assets/img/faq/faq2.jpg"
                      alt="img"
                    />
                  </div>
                </div>
                <div
                  className="col-lg-6 col-md-6 wow fadeInUp"
                  data-wow-delay=".6s"
                >
                  <div className="faq-image">
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: "100%", height: "auto" }}
                      src="/assets/img/faq/faq3.jpg"
                      alt="img"
                    />
                  </div>
                </div>
                <div
                  className="col-lg-6 col-md-6 wow fadeInUp"
                  data-wow-delay=".7s"
                >
                  <div className="faq-image">
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: "100%", height: "auto" }}
                      src="/assets/img/faq/faq4.jpg"
                      alt="img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Faq3 = () => {
  const faqItems: {
    title: string;
    description: string;
    bgImage: string;
    icon: string;
    link: string;
    cardClass: string;
  }[] = [
    {
      title: "Payment & Refund",
      description:
        "Many of us have no idea what it's like to be thirsty have plenty",
      bgImage: "/assets/img/fc1.jpg",
      icon: "/assets/img/f1.png",
      link: "/contact",
      cardClass: "card1",
    },
    {
      title: "Administrations",
      description:
        "Many of us have no idea what it's like to be thirsty have plenty",
      bgImage: "/assets/img/fc2.jpg",
      icon: "/assets/img/f2.png",
      link: "/about",
      cardClass: "card2",
    },
    {
      title: "Team & Volunteer",
      description:
        "Many of us have no idea what it's like to be thirsty have plenty",
      bgImage: "/assets/img/fc3.jpg",
      icon: "/assets/img/f3.png",
      link: "/team",
      cardClass: "card3",
    },
  ];
  return (
    <section className="faq-wrap section-padding pb-0 text-center">
      <div className="container">
        <div className="row">
          {faqItems.map((item, idx) => (
            <div key={idx} className="col-12 col-md-6 col-lg-4 wow fadeInUp">
              <div
                className={`single-faq-card ${item.cardClass}`}
                style={{ backgroundImage: `url(${item.bgImage})` }}
              >
                <div className="icon">
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ height: "50px", width: "auto" }}
                    src={item.icon}
                    alt="icon"
                  />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link href={item.link}>
                  <i className="fal fa-arrow-right" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
