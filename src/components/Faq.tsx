"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Accordion from "react-bootstrap/Accordion";

const Faq = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const faqs: {
    key: string;
    question: string;
    answer: string;
    delay: number;
  }[] = [
    {
      key: "faq1",
      question: "How do I start a fundraiser?",
      answer:
        "Starting a fundraiser is simple! Click on 'Start a Fundraiser' button, fill in your campaign details including your goal amount, story, and upload relevant images. Our team will review and approve your campaign within 24 hours. Once approved, you can start sharing your fundraiser with friends, family, and social networks.",
      delay: 0,
    },
    {
      key: "faq2",
      question: "What fees does your platform charge?",
      answer:
        "We charge a small platform fee of 2.9% + $0.30 per donation to cover payment processing and platform maintenance. This helps us keep the service running and support thousands of campaigns. There are no hidden fees, and you'll see exactly what you'll receive before withdrawing funds.",
      delay: 100,
    },
    {
      key: "faq3",
      question: "How long does it take to receive funds?",
      answer:
        "Funds are typically available for withdrawal within 2-5 business days after a donation is made. You can withdraw funds at any time once they're available in your account. We use secure payment processors to ensure your money is transferred safely to your bank account.",
      delay: 200,
    },
    {
      key: "faq4",
      question: "Can I donate anonymously?",
      answer:
        "Yes! When making a donation, you have the option to remain anonymous. Your name won't be displayed publicly on the fundraiser page, though the campaign organizer will still be able to see your information for thank-you purposes and tax receipts.",
      delay: 300,
    },
  ];
  
  return (
    <div ref={sectionRef} className="faq-content">
      <div 
        className={`section-title transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <span className="sub-title color-2">
          <i className="far fa-heart" />
          Frequently Asked Questions
        </span>
        <h2 className="mt-char-animation">
          Got Questions? <br />
          We've Got Answers
        </h2>
      </div>
      <div className="faq-accordion mt-4 mt-md-0">
        <Accordion defaultActiveKey="faq1">
          {faqs.map(({ key, question, answer, delay }) => (
            <Accordion.Item
              key={key}
              eventKey={key}
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
              style={{ 
                transitionDelay: isVisible ? `${delay + 200}ms` : '0ms'
              }}
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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="faq-section fix section-padding">
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <Faq />
          </div>
          <div className="col-lg-6">
            <div className="faq-image-items">
              <div 
                className={`counter-box transition-all duration-700 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
                style={{ transitionDelay: '200ms', zIndex: 1 }}
              >
                <h2>
                  <span className="count">10</span>K+
                </h2>
                <p>Funds Raised</p>
              </div>
              <div className="row g-4">
                <div className="col-lg-6 col-md-6">
                  <div 
                    className={`faq-image transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: '300ms' }}
                  >
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
                <div className="col-lg-6 col-md-6">
                  <div 
                    className={`faq-image transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: '400ms' }}
                  >
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
                <div className="col-lg-6 col-md-6">
                  <div 
                    className={`faq-image transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: '500ms' }}
                  >
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
                <div className="col-lg-6 col-md-6">
                  <div 
                    className={`faq-image transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: '600ms' }}
                  >
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
