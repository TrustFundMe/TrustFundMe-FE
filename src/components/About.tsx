import Image from "next/image";
import Link from "next/link";
import Counter from "./Counter";
import { ShieldCheck } from "lucide-react";

export const About1 = () => {
  return (
    <section className="about-section-3 fix section-padding">
      <div className="container">
        <div className="about-wrapper-3">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="about-image-items-2">
                <div className="row g-4 align-items-center">
                  <div className="col-lg-7 wow fadeInUp" data-wow-delay=".3s">
                    <div className="about-image">
                      <Image
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: "100%", height: "100%" }}
                        src="https://placehold.co/600x800?text=Transparent+Charity"
                        alt="Transparent Charity"
                      />
                    </div>
                  </div>
                  <div className="col-lg-5 wow fadeInUp" data-wow-delay=".5s">
                    <div className="about-experience">
                      <h2>
                        <span className="count">100</span>%
                      </h2>
                      <h6>Financial Transparency</h6>
                      <div className="thumb flex items-center justify-center">
                        <ShieldCheck className="w-16 h-16 text-green-500" strokeWidth={2} />
                      </div>
                      <h6>AI-Verified Expenses</h6>
                    </div>
                    <div className="about-img">
                      <Image
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: "100%", height: "auto" }}
                        src="https://placehold.co/400x500?text=Community+Impact"
                        alt="Community Impact"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-content">
                <div className="section-title">
                  <span className="sub-title color-2 wow fadeInUp">
                    <i className="far fa-heart" />
                    About TrustFundMe
                  </span>
                  <h2 className="mt-char-animation">
                    Vietnam's First{" "}
                    <span className="color-2">AI-Powered</span> Charity Platform
                  </h2>
                </div>
                <p className="mt-3 mt-md-0 wow fadeInUp" data-wow-delay=".5s">
                  We're revolutionizing charitable giving through radical transparency. 
                  Every donation is tracked in real-time, every expense is AI-verified, 
                  and every donor has a voice in how funds are used. Together, we're building 
                  trust back into charitable giving.
                </p>
                <div className="d-flex align-items-center flex-wrap mb-5">
                  <ul
                    className="checked-list wow fadeInUp"
                    data-wow-delay=".3s"
                  >
                    <li>
                      <i className="far fa-check" /> 100% Financial Disclosure
                    </li>
                    <li>
                      <i className="far fa-check" />
                      AI-Powered Invoice Verification
                    </li>
                  </ul>
                  <ul
                    className="checked-list wow fadeInUp"
                    data-wow-delay=".5s"
                  >
                    <li>
                      <i className="far fa-check" /> Real-time Fund Tracking
                    </li>
                    <li>
                      <i className="far fa-check" />
                      Community-Driven Governance
                    </li>
                  </ul>
                </div>
                <Link
                  href="causes"
                  className="theme-btn wow fadeInUp"
                  data-wow-delay=".7s"
                >
                  Explore Campaigns
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const About2 = ({ containerClass }: { containerClass?: string }) => {
  const aboutImages: {
    img: string;
    delay: string;
    hideOnMobile?: boolean;
    tabletOnly?: boolean;
  }[] = [
    {
      img: "/assets/img/about/05.jpg",
      delay: ".3s",
      hideOnMobile: true, // Hide on mobile
    },
    {
      img: "/assets/img/about/06.jpg",
      delay: ".5s",
      hideOnMobile: true, // Hide on mobile
    },
    {
      img: "/assets/img/about/07.jpg",
      delay: ".7s",
      hideOnMobile: true, // Hide on mobile
    },
    {
      img: "/assets/img/about/05.jpg",
      delay: ".9s",
      tabletOnly: false, // Show on tablet and mobile
    },
  ];
  return (
    <section className={`about-section-2 fix ${containerClass}`}>
      <div className="container">
        <div className="section-title text-center" style={{ display: 'none' }}>
          <span className="sub-title color-2 wow fadeInUp">
            <i className="far fa-heart" />
            Life Changing Video
          </span>
          <h2 className="mt-char-animation">
            Access to clean water <span className="color-2">changed the</span>{" "}
            <br />
            <span>lives</span> of Hadjara, Umu, Natalia
          </h2>
        </div>
        <div className="row">
          {aboutImages.map((item, index) => (
            <div
              key={index}
              className={`col-xl-4 col-lg-6 col-md-6 wow fadeInUp ${
                item.hideOnMobile ? 'd-none d-md-block' : 'd-block d-xl-none'
              }`}
              data-wow-delay={item.delay}
            >
              <div className="about-image-items overflow-hidden rounded-lg group cursor-pointer">
                <Image
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: "100%", height: "auto" }}
                  src={item.img}
                  alt="img"
                  className="rounded-lg transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-110"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const About3 = () => {
  return (
    <section className="about-section section-padding pt-0">
      <div className="container">
        <div className="about-wrapper">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="about-image-items">
                <div
                  className="about-image-1 wow fadeInUp"
                  data-wow-delay=".3s"
                >
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    src="https://placehold.co/600x800?text=Our+Mission"
                    alt="Our Mission"
                  />
                  <div
                    className="about-image-2 wow fadeInUp"
                    data-wow-delay=".5s"
                  >
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: "100%", height: "auto" }}
                      src="https://placehold.co/400x500?text=Our+Vision"
                      alt="Our Vision"
                    />
                  </div>
                </div>
                <div className="counter-box wow fadeInUp" data-wow-delay=".6s">
                  <h2>
                    <span className="count">
                      <Counter end={100} />
                    </span>
                    %
                  </h2>
                  <p>Transparent Operations</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-content">
                <div className="section-title">
                  <span className="sub-title color-2 wow fadeInUp">
                    <i className="far fa-heart" />
                    Our Mission
                  </span>
                  <h2 className="mt-char-animation">
                    Restoring Trust in{" "}
                    <span className="color-2">Charitable Giving</span>
                  </h2>
                </div>
                <p className="mt-3 mt-md-0 wow fadeInUp" data-wow-delay=".5s">
                  To restore public trust in charitable activities by providing a 
                  professional digital solution for small-scale volunteer groups and 
                  large-scale relief efforts alike.
                </p>
                <ul className="checked-list wow fadeInUp" data-wow-delay=".3s">
                  <li>Real-time tracking of every donation</li>
                  <li>AI-powered verification of all expenses</li>
                  <li>Community voting on fund allocation</li>
                  <li>
                    Complete transparency with
                    <br />
                    public audit trails
                  </li>
                </ul>
                <div className="about-button wow fadeInUp" data-wow-delay=".5s">
                  <Link href="about" className="theme-btn transparent-btn-2">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const About4 = () => {
  return (
    <section className="about-section section-padding pt-0">
      <div className="container">
        <div className="about-wrapper-2">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="about-image-items">
                <div className="video-box">
                  <a
                    href="https://www.youtube.com/watch?v=Cn4G2lZ_g2I"
                    className="video-buttton ripple video-popup"
                  >
                    <i className="fas fa-play" />
                  </a>
                </div>
                <div className="row g-4 align-items-center">
                  <div
                    className="col-lg-6 col-md-6 wow fadeInUp"
                    data-wow-delay=".3s"
                  >
                    <div className="about-image-1">
                      <Image
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: "100%", height: "auto" }}
                        src="https://placehold.co/400x500?text=Technology"
                        alt="Technology"
                      />
                    </div>
                  </div>
                  <div
                    className="col-lg-6 col-md-6 wow fadeInUp"
                    data-wow-delay=".5s"
                  >
                    <div className="about-image-2">
                      <Image
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: "100%", height: "auto" }}
                        src="https://placehold.co/400x500?text=Innovation"
                        alt="Innovation"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-content">
                <div className="section-title">
                  <span className="sub-title color-2 wow fadeInUp">
                    <i className="far fa-heart" />
                    Why Choose Us
                  </span>
                  <h2 className="mt-char-animation">
                    Technology Meets{" "}
                    <span className="color-2">Compassion</span>
                  </h2>
                </div>
                <p className="mt-3 mt-md-0 wow fadeInUp" data-wow-delay=".5s">
                  We combine cutting-edge AI technology with a passion for social good. 
                  Every feature is designed to give donors peace of mind and maximize impact.
                </p>
                <div className="list-area">
                  <div className="list-items">
                    <i className="fas fa-check" />
                    <div className="content">
                      <h5>Real-time Transparency</h5>
                      <p>Track every donation and expense in real-time with our public dashboard</p>
                    </div>
                  </div>
                  <div className="list-items">
                    <i className="fas fa-check" />
                    <div className="content">
                      <h5>AI-Powered Verification</h5>
                      <p>Every invoice is automatically verified using advanced OCR and fraud detection</p>
                    </div>
                  </div>
                </div>
                <div className="about-button wow fadeInUp" data-wow-delay=".5s">
                  <Link href="/causes" className="theme-btn transparent-btn-2">
                    Start Donating
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
