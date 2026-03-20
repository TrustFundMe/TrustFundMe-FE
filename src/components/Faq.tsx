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
      question: "Làm sao để bắt đầu một chiến dịch gây quỹ?",
      answer:
        "Bắt đầu gây quỹ rất đơn giản! Nhấn nút 'Bắt đầu gây quỹ', điền thông tin chiến dịch gồm mục tiêu số tiền, câu chuyện và tải lên hình ảnh liên quan. Đội ngũ của chúng tôi sẽ xem xét và phê duyệt chiến dịch trong vòng 24 giờ. Sau khi được duyệt, bạn có thể bắt đầu chia sẻ chiến dịch với bạn bè, gia đình và mạng xã hội.",
      delay: 0,
    },
    {
      key: "faq2",
      question: "Nền tảng thu những khoản phí nào?",
      answer:
        "Chúng tôi thu một khoản phí nền tảng nhỏ để chi trả chi phí xử lý thanh toán và vận hành hệ thống. Điều này giúp dịch vụ hoạt động ổn định và hỗ trợ hàng ngàn chiến dịch. Không có phí ẩn, và bạn sẽ thấy rõ số tiền thực nhận trước khi rút.",
      delay: 100,
    },
    {
      key: "faq3",
      question: "Mất bao lâu để nhận tiền?",
      answer:
        "Tiền thường có thể rút trong khoảng 2-5 ngày làm việc sau khi khoản ủng hộ được ghi nhận. Bạn có thể rút bất kỳ lúc nào khi số dư đã sẵn sàng trong tài khoản. Chúng tôi sử dụng cổng thanh toán bảo mật để đảm bảo tiền được chuyển an toàn về tài khoản ngân hàng của bạn.",
      delay: 200,
    },
    {
      key: "faq4",
      question: "Tôi có thể ủng hộ ẩn danh không?",
      answer:
        "Có! Khi ủng hộ, bạn có thể chọn chế độ ẩn danh. Tên của bạn sẽ không hiển thị công khai trên trang gây quỹ, tuy nhiên người tạo chiến dịch vẫn có thể xem thông tin để gửi lời cảm ơn và xử lý chứng từ khi cần.",
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
          Câu hỏi thường gặp
        </span>
        <h2 className="mt-char-animation">
          Bạn có thắc mắc? <br />
          Chúng tôi có câu trả lời
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
