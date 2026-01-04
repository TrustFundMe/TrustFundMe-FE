"use client";
import { sliderProps } from "@/utility/sliderProps";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";

export const Testimonial1 = () => {
  const testimonials: {
    quoteIcon: string;
    ratingTitle: string;
    rating: number;
    text: string;
    clientImage: string;
    clientName: string;
    clientRole: string;
  }[] = [
    {
      quoteIcon: "/assets/img/testimonial/quote2.png",
      ratingTitle: "Quality Services",
      rating: 5,
      text: "On the other hand we denounce with see righteous indignation and dislike men who arey beguiled and demoralized by leisure moments line desire",
      clientImage: "/assets/img/testimonial/client.png",
      clientName: "James N. Johnson",
      clientRole: "CEO & Founder",
    },
    {
      quoteIcon: "/assets/img/testimonial/quote2.png",
      ratingTitle: "Quality Services",
      rating: 5,
      text: "On the other hand we denounce with see righteous indignation and dislike men who arey beguiled and demoralized by leisure moments line desire",
      clientImage: "/assets/img/testimonial/client2.png",
      clientName: "David K. McKinney",
      clientRole: "Senior Manager",
    },
    {
      quoteIcon: "/assets/img/testimonial/quote2.png",
      ratingTitle: "Quality Services",
      rating: 5,
      text: "On the other hand we denounce with see righteous indignation and dislike men who arey beguiled and demoralized by leisure moments line desire",
      clientImage: "/assets/img/testimonial/client.png",
      clientName: "James N. Johnson",
      clientRole: "CEO & Founder",
    },
    {
      quoteIcon: "/assets/img/testimonial/quote2.png",
      ratingTitle: "Quality Services",
      rating: 5,
      text: "On the other hand we denounce with see righteous indignation and dislike men who arey beguiled and demoralized by leisure moments line desire",
      clientImage: "/assets/img/testimonial/client2.png",
      clientName: "David K. McKinney",
      clientRole: "Senior Manager",
    },
  ];
  return (
    <section
      className="testimonial-section-4 section-padding bg-cover"
      style={{ backgroundImage: 'url("assets/img/testimonial/bg.jpg")' }}
    >
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title text-white wow fadeInUp">
            <i className="far fa-heart" />
            Clients Testimonials
          </span>
          <h2 className="mt-char-animation text-white" data-wow-delay=".3s">
            The Heart Warming Testimonies <br />
            Of Excellence
          </h2>
        </div>
        <div className="single-testimonial-style-2">
          <Swiper
            {...sliderProps.testimonial1}
            className="swiper testimonial-swiper-3"
          >
            <div className="swiper-wrapper">
              {testimonials.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="single-testimonial-items-2">
                    <div className="ratting-items">
                      <div className="quote-icon">
                        <Image
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{ width: "58px", height: "auto" }}
                          src={item.quoteIcon}
                          alt="icon-img"
                        />
                      </div>
                      <div className="client-ratting">
                        <h5>{item.ratingTitle}</h5>
                        <ul>
                          {[...Array(item.rating)].map((_, i) => (
                            <li key={i}>
                              <i className="fas fa-star" />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p className="text">{item.text}</p>
                    <div className="client-info">
                      <div className="image">
                        <Image
                          width={65}
                          height={65}
                          sizes="100vw"
                          src={item.clientImage}
                          alt="client-img"
                        />
                      </div>
                      <div className="content">
                        <h3>{item.clientName}</h3>
                        <p>{item.clientRole}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </div>
            <div className="swiper-dot color-style-two border-style center pt-5">
              <div className="dot" />
            </div>
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export const Testimonial2 = () => {
  const testimonialsData: {
    stars: number;
    text: string;
    img: string;
    name: string;
    role: string;
  }[] = [
    {
      stars: 5,
      text: "It uses a dictionary of over 200 Latin words, combined with handful model tence structures, to generate Lorem Ipsum which lo reasonable. The gener Lorem Ipsum done.",
      img: "/assets/img/testimonial/client-1.png",
      name: "Shikhon Islam",
      role: "Web Designer",
    },
    {
      stars: 4,
      text: "It uses a dictionary of over 200 Latin words, combined with handful model tence structures, to generate Lorem Ipsum which lo reasonable. The gener Lorem Ipsum done.",
      img: "/assets/img/testimonial/client-2.png",
      name: "Albert Flores",
      role: "Founder",
    },
    {
      stars: 4,
      text: "It uses a dictionary of over 200 Latin words, combined with handful model tence structures, to generate Lorem Ipsum which lo reasonable. The gener Lorem Ipsum done.",
      img: "/assets/img/testimonial/client-3.png",
      name: "Guy Hawkins",
      role: "Founder",
    },
    {
      stars: 4,
      text: "It uses a dictionary of over 200 Latin words, combined with handful model tence structures, to generate Lorem Ipsum which lo reasonable. The gener Lorem Ipsum done.",
      img: "/assets/img/testimonial/client-2.png",
      name: "Albert Flores",
      role: "Founder",
    },
    {
      stars: 5,
      text: "It uses a dictionary of over 200 Latin words, combined with handful model tence structures, to generate Lorem Ipsum which lo reasonable. The gener Lorem Ipsum done.",
      img: "/assets/img/testimonial/client-1.png",
      name: "Shikhon Islam",
      role: "Web Designer",
    },
    {
      stars: 4,
      text: "It uses a dictionary of over 200 Latin words, combined with handful model tence structures, to generate Lorem Ipsum which lo reasonable. The gener Lorem Ipsum done.",
      img: "/assets/img/testimonial/client-2.png",
      name: "Albert Flores",
      role: "Founder",
    },
    {
      stars: 4,
      text: "It uses a dictionary of over 200 Latin words, combined with handful model tence structures, to generate Lorem Ipsum which lo reasonable. The gener Lorem Ipsum done.",
      img: "/assets/img/testimonial/client-3.png",
      name: "Guy Hawkins",
      role: "Founder",
    },
    {
      stars: 4,
      text: "It uses a dictionary of over 200 Latin words, combined with handful model tence structures, to generate Lorem Ipsum which lo reasonable. The gener Lorem Ipsum done.",
      img: "/assets/img/testimonial/client-2.png",
      name: "Albert Flores",
      role: "Founder",
    },
  ];
  return (
    <section className="testimonial-section fix section-bg section-padding">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title color-2 wow fadeInUp">
            Our testimonials
          </span>
          <h2 className="mt-char-animation">Our Clients Feedback</h2>
        </div>
      </div>
      <Swiper
        {...sliderProps.testimonial2}
        className="swiper testimonial-swiper-2"
      >
        <div className="swiper-wrapper">
          {testimonialsData.map((item, index) => (
            <SwiperSlide key={index} className="swiper-slide">
              <div className="testimonial-card-item">
                <div className="star">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={i < item.stars ? "fas fa-star" : "far fa-star"}
                    />
                  ))}
                </div>
                <p>{item.text}</p>
                <div className="client-info">
                  <div
                    className="client-img bg-cover"
                    style={{ backgroundImage: `url(${item.img})` }}
                  />
                  <div className="content">
                    <h4>{item.name}</h4>
                    <span>{item.role}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </div>
        <div className="swiper-dot center pt-5">
          <div className="dot" />
        </div>
      </Swiper>
    </section>
  );
};

export const Testimonial3 = () => {
  const testimonials: {
    name: string;
    role: string;
    image: string;
    rating: number; // out of 5
    text: string;
  }[] = [
    {
      name: "Shikhon Islam",
      role: "Web Designer",
      image: "/assets/img/testimonial/client-1.png",
      rating: 4,
      text: "It uses a dictionary of over 200 Latin words, combined with handful model tense structures, to generate Lorem Ipsum which looks reasonable. The gener Lorem Ipsum done",
    },
    {
      name: "Albert Flores",
      role: "Founder",
      image: "/assets/img/testimonial/client-2.png",
      rating: 4,
      text: "It uses a dictionary of over 200 Latin words, combined with handful model tense structures, to generate Lorem Ipsum which looks reasonable. The gener Lorem Ipsum done",
    },
    {
      name: "Guy Hawkins",
      role: "Founder",
      image: "/assets/img/testimonial/client-3.png",
      rating: 5,
      text: "It uses a dictionary of over 200 Latin words, combined with handful model tense structures, to generate Lorem Ipsum which looks reasonable. The gener Lorem Ipsum done",
    },
  ];

  return (
    <section className="testimonial-section fix section-bg section-padding">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title color-2 wow fadeInUp">
            Our testimonials
          </span>
          <h2 className="mt-char-animation">Our Clients Feedback</h2>
        </div>
        <div className="row g-4">
          <Swiper
            {...sliderProps.testimonial3}
            className="swiper testimonial-swiper"
          >
            <div className="swiper-wrapper">
              {testimonials.map((t, index) => (
                <SwiperSlide key={index} className="swiper-slide">
                  <div className="testimonial-card-item">
                    <div className="star">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={
                            i < t.rating ? "fas fa-star" : "far fa-star"
                          }
                        />
                      ))}
                    </div>
                    <p>{t.text}</p>
                    <div className="client-info">
                      <div
                        className="client-img bg-cover"
                        style={{ backgroundImage: `url(${t.image})` }}
                      />
                      <div className="content">
                        <h4>{t.name}</h4>
                        <span>{t.role}</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </div>

            <div className="swiper-dot center pt-5">
              <div className="dot" />
            </div>
          </Swiper>
        </div>
      </div>
    </section>
  );
};
