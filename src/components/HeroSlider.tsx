"use client";
import { sliderProps } from "@/utility/sliderProps";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";

export const HeroSlider1 = () => {
  const slides: {
    img: string;
    mission: string;
    h1: string;
    video: string;
    delays: {
      h5: string;
      h1: string;
      buttons: string;
      video: string;
    };
  }[] = [
    {
      img: "assets/img/hero/hero-5.jpg",
      mission: "Food, Education, Medicine",
      h1: "We’re On A Mission \n To Change World",
      video: "https://www.youtube.com/watch?v=Cn4G2lZ_g2I",
      delays: { h5: "1.3s", h1: "1.5s", buttons: "1.7s", video: "1.5s" },
    },
    {
      img: "assets/img/hero/hero-6.jpg",
      mission: "Food, Education, Medicine",
      h1: "We’re On A Mission \n To Change World",
      video: "https://www.youtube.com/watch?v=Cn4G2lZ_g2I",
      delays: { h5: "1.3s", h1: "1.5s", buttons: "1.7s", video: "1.5s" },
    },
    {
      img: "assets/img/hero/hero-7.jpg",
      mission: "Food, Education, Medicine",
      h1: "We’re On A Mission \n To Change World",
      video: "https://www.youtube.com/watch?v=Cn4G2lZ_g2I",
      delays: { h5: "1.3s", h1: "1.5s", buttons: "1.7s", video: "1.5s" },
    },
  ];

  return (
    <section className="hero-section hero-4">
      <Swiper {...sliderProps.heroSlider1} className="swiper hero-slider-2">
        {slides.map((slide, i) => (
          <SwiperSlide className="swiper-slide" key={i}>
            <div
              className="hero-image bg-cover"
              style={{ backgroundImage: `url(${slide.img})` }}
            >
              <div className="container">
                <div className="row g-4 align-items-center justify-content-between">
                  <div className="col-lg-9">
                    <div className="hero-content">
                      <h5
                        data-animation="fadeInUp"
                        data-delay={slide.delays.h5}
                        className="mb-2"
                      >
                        <i className="far fa-heart" /> {slide.mission}
                      </h5>
                      <h1
                        data-animation="fadeInUp"
                        data-delay={slide.delays.h1}
                      >
                        {slide.h1}
                      </h1>
                      <div className="hero-button">
                        <Link
                          href="/causes"
                          data-animation="fadeInUp"
                          data-delay={slide.delays.buttons}
                          className="theme-btn"
                        >
                          View Causes
                        </Link>
                        <Link
                          href="/donation-details"
                          data-animation="fadeInUp"
                          data-delay={slide.delays.buttons}
                          className="theme-btn transparent-btn"
                        >
                          Donate Now
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2">
                    <div className="video-box">
                      <a
                        href={slide.video}
                        data-animation="fadeInUp"
                        data-delay={slide.delays.video}
                        className="video-buttton ripple video-popup"
                      >
                        <i className="fas fa-play" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <div className="swiper-dot text-center">
          <div className="dot" />
        </div>
      </Swiper>
    </section>
  );
};

export const HeroSlider3 = () => {
  const slides: {
    img: string;
    mission: string;
    h1: string;
    video?: string;
    delays: {
      h5: string;
      h1: string;
      buttons: string;
      video?: string;
    };
    links: {
      causes: string;
      donate: string;
    };
  }[] = [
    {
      img: "assets/img/hero/hero-1.jpg",
      mission: "Food, Education, Medicine",
      h1: "We’re On A Mission To Change That",
      delays: { h5: "1.3s", h1: "1.5s", buttons: "1.7s" },
      links: { causes: "causes", donate: "donation-details" },
    },
    {
      img: "assets/img/hero/hero-2.jpg",
      mission: "Food, Education, Medicine",
      h1: "We’re On A Mission To Change That",
      delays: { h5: "1.3s", h1: "1.5s", buttons: "1.7s" },
      links: { causes: "causes", donate: "donation-details" },
    },
  ];

  return (
    <section className="hero-section hero-1">
      <div className="array-button">
        <button className="array-prev">
          <i className="fas fa-long-arrow-left" />
        </button>
        <button className="array-next">
          <i className="fas fa-long-arrow-right" />
        </button>
      </div>
      <Swiper {...sliderProps.heroSlider2} className="swiper hero-slider">
        <div className="swiper-wrapper">
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="swiper-slide">
              <div
                className="hero-image bg-cover"
                style={{ backgroundImage: `url("${slide.img}")` }}
              />
              <div className="container">
                <div className="row">
                  <div className="col-xl-6">
                    <div className="hero-content">
                      <h5
                        data-animation="wow fadeInUp"
                        data-delay={slide.delays.h5}
                      >
                        <i className="far fa-heart" /> Our Mission:{" "}
                        {slide.mission}
                      </h5>
                      <h1
                        data-animation="wow fadeInUp"
                        data-delay={slide.delays.h1}
                      >
                        {slide.h1}
                      </h1>
                      <div className="hero-button">
                        <Link
                          href={slide.links.causes}
                          data-animation="wow fadeInUp"
                          data-delay={slide.delays.buttons}
                          className="theme-btn"
                        >
                          View Causes
                        </Link>
                        <Link
                          href={slide.links.donate}
                          data-animation="wow fadeInUp"
                          data-delay={slide.delays.buttons}
                          className="theme-btn transparent-btn"
                        >
                          Donate Now
                        </Link>
                      </div>
                    </div>
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

export const HeroSlider4 = () => {
  const slides: {
    img: string;
    mission: string;
    h1: string;
    video?: string;
    delays: {
      h5: string;
      h1: string;
      buttons: string;
      video?: string;
    };
    links: {
      causes: string;
      donate: string;
    };
  }[] = [
    {
      img: "assets/img/hero/hero-3.jpg",
      mission: "Food, Education, Medicine",
      h1: "More charity. Make More \n better life.",
      delays: { h5: "1.3s", h1: "1.5s", buttons: "1.7s" },
      links: { causes: "causes", donate: "donation-details" },
    },
    {
      img: "assets/img/hero/hero-4.jpg",
      mission: "Food, Education, Medicine",
      h1: "More charity. Make More \n better life.",
      delays: { h5: "1.3s", h1: "1.5s", buttons: "1.7s" },
      links: { causes: "causes", donate: "donation-details" },
    },
  ];
  return (
    <section className="hero-section hero-1 style-hero-2">
      <div className="array-button">
        <button className="array-prev">
          <i className="fas fa-long-arrow-left" />
        </button>
        <button className="array-next">
          <i className="fas fa-long-arrow-right" />
        </button>
      </div>
      <Swiper {...sliderProps.heroSlider2} className="swiper hero-slider">
        <div className="swiper-wrapper">
          {slides.map((slide, i) => (
            <SwiperSlide key={i} className="swiper-slide">
              <div
                className="hero-image bg-cover"
                style={{ backgroundImage: `url("${slide.img}")` }}
              />
              <div className="container">
                <div className="row">
                  <div className={`col-xl-12`}>
                    <div className={`hero-content text-center`}>
                      <h5
                        data-animation="fadeInUp"
                        data-delay={slide.delays.h5}
                      >
                        Our Mission: {slide.mission}
                      </h5>
                      <h1
                        data-animation="fadeInUp"
                        data-delay={slide.delays.h1}
                      >
                        {slide.h1}
                      </h1>
                      <div className="hero-button">
                        <Link
                          href={slide.links.causes}
                          data-animation="fadeInUp"
                          data-delay={slide.delays.buttons}
                          className="theme-btn"
                        >
                          View Causes
                        </Link>
                        <Link
                          href={slide.links.donate}
                          data-animation="fadeInUp"
                          data-delay={slide.delays.buttons}
                          className="theme-btn transparent-btn"
                        >
                          Donate Now
                        </Link>
                      </div>
                    </div>
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
