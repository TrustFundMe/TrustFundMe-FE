"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";

const Footer = ({ footer }: { footer: number }) => {
  switch (footer) {
    case 1:
      return <Footer1 />;
    case 2:
      return <Footer2 />;
    case 3:
      return <Footer3 />;
    case 4:
      return <Footer4 />;
    default:
      return <Footer3 />;
  }
};

export default Footer;
const Footer1 = () => {
  return (
    <footer className="footer-section footer-bg">
      <div className="container">
        <div className="footer-widgets-wrapper style-2">
          <div className="row">
            <FooterLogoContainer />
            <div
              className="col-xl-3 col-lg-4 col-md-6 ps-lg-5  wow fadeInUp"
              data-wow-delay=".4s"
            >
              <LinksCol heading="Useful Link" links={usefulLink} />
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6 ps-lg-5  wow fadeInUp"
              data-wow-delay=".6s"
            >
              <LinksCol heading="Legal" links={legalLink} />
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6   wow fadeInUp"
              data-wow-delay=".8s"
            >
              <div className="single-footer-widget">
                <div className="widget-head">
                  <h4 className="text-white">Contact Us</h4>
                </div>
                <div className="popularspost-area">
                  <div className="single-post-items">
                    <div
                      className="post-img bg-cover"
                      style={{ backgroundImage: 'url("assets/img/post1.jpg")' }}
                    />
                    <div className="post-content">
                      <span>
                        <i className="fal fa-calendar-alt" />
                        24th November 2024
                      </span>
                      <h5>
                        <Link href="/news-details">
                          Everyone Deserves 100% Clean Water
                        </Link>
                      </h5>
                    </div>
                  </div>
                  <div className="single-post-items">
                    <div
                      className="post-img bg-cover"
                      style={{ backgroundImage: 'url("assets/img/post2.jpg")' }}
                    />
                    <div className="post-content">
                      <span>
                        <i className="fal fa-calendar-alt" />
                        24th November 2024
                      </span>
                      <h5>
                        <Link href="/news-details">
                          Little Help That Goes a Long Way
                        </Link>
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bor-top-1">
        <div className="container">
          <div className="footer-contact-wrap">
            <div className="contact-box wow fadeInUp" data-wow-delay=".3s">
              <div className="icon">
                <i className="fal fa-map-marker-alt" />
              </div>
              <div className="content">
                <h3>Location</h3>
                <p>
                  66 Broklyant, New <br /> York India
                </p>
              </div>
            </div>
            <div className="contact-box wow fadeInUp" data-wow-delay=".5s">
              <div className="icon">
                <i className="far fa-clock" />
              </div>
              <div className="content">
                <h3>Working Hours</h3>
                <p>
                  Monday - 10:00 AM <br /> Friday - 08:00 PM
                </p>
              </div>
            </div>
            <div className="contact-box wow fadeInUp" data-wow-delay=".7s">
              <div className="icon">
                <i className="far fa-phone-alt" />
              </div>
              <div className="content">
                <h3>Contact Us</h3>
                <p>
                  <a href="mailto:info@example.com">info@example.com</a>
                  <a href="tel:98098709809">980-987-098-09</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom color-style">
        <div className="container">
          <div className="footer-wrapper">
            <p className="wow fadeInUp text-center" data-wow-delay=".3s">
              © <Link href="/">TrustFundMe</Link> Charity Trust - 2026. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
const Footer2 = () => {
  return (
    <footer className="footer-section footer-bg relative overflow-hidden pb-0">
      <div className="container relative z-10">
        <div className="footer-widgets-wrapper style-2">
          <div className="row">
            <FooterLogoContainer />
            <div
              className="col-xl-3 col-lg-4 col-md-6 ps-lg-5  wow fadeInUp"
              data-wow-delay=".3s"
            >
              <LinksCol heading="Useful Link" links={usefulLink} />
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6 ps-lg-5  wow fadeInUp"
              data-wow-delay=".3s"
            >
              <LinksCol heading="Legal" links={legalLink} />
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6 ps-lg-5  wow fadeInUp"
              data-wow-delay=".3s"
            >
              <div className="single-footer-widget">
                <div className="widget-head">
                  <h4 className="text-white">Contact Us</h4>
                </div>
                <div className="footer-content">
                  <div className="contact-info-area">
                    <div className="contact-items">
                      <div className="icon" style={{ backgroundColor: '#ff5e14' }}>
                        <i className="fal fa-phone" />
                      </div>
                      <div className="content">
                        <h6>
                          <a href="tel:00012345688">+000 (123) 456 88</a>
                          <a href="tel:00012345688">+000 (123) 456 88</a>
                        </h6>
                      </div>
                    </div>
                    <div className="contact-items">
                      <div className="icon" style={{ backgroundColor: '#ff5e14' }}>
                        <i className="fal fa-envelope" />
                      </div>
                      <div className="content">
                        <h6>
                          <a href="mailto:info@example.com" className="link">
                            info@example.com
                          </a>
                          <a href="mailto:jobs@example.com" className="link">
                            jobs@example.com
                          </a>
                        </h6>
                      </div>
                    </div>
                    <div className="contact-items">
                      <div className="icon" style={{ backgroundColor: '#ff5e14' }}>
                        <i className="fal fa-map-marker-alt" />
                      </div>
                      <div className="content">
                        <h6>
                          55 Main Street, 2nd block <br />
                          Malborne, Australia
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom-3" style={{ backgroundColor: 'transparent', borderTop: 'none' }}>
        <div className="container">
          <div className="footer-bottom-wrapper d-flex align-items-center justify-content-center">
            <p className="wow fadeInUp text-center" data-wow-delay=".3s">
              © 2026 <Link href="/">TrustFundMe</Link>. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
const Footer3 = () => {
  return (
    <footer className="footer-section footer-bg-color section-bg">
      <div className="container">
        <div className="footer-widgets-wrapper">
          <div className="row">
            <div
              className="col-md-6 col-xl-4 col-12 wow fadeInUp"
              data-wow-delay=".3s"
            >
              <div className="single-footer-widget">
                <div className="widget-head">
                  <h4 className="text-white">Get In Touch</h4>
                </div>
                <div className="footer-content">
                  <div className="contact-info-area">
                    <div className="contact-items">
                      <div className="icon">
                        <i className="fal fa-phone" />
                      </div>
                      <div className="content">
                        <h6>
                          <a href="tel:+11002345909">+1 100 234 5909</a>
                          <a href="tel:+11002345910">+1 100 234 5910</a>
                        </h6>
                      </div>
                    </div>
                    <div className="contact-items">
                      <div className="icon color-2">
                        <i className="fal fa-envelope" />
                      </div>
                      <div className="content">
                        <h6>
                          <a href="mailto:trustfundme@co.vn" className="link">
                            trustfundme@co.vn
                          </a>
                          <a href="mailto:support@trustfundme.co.vn" className="link">
                            support@trustfundme.co.vn
                          </a>
                        </h6>
                      </div>
                    </div>
                    <div className="contact-items">
                      <div className="icon color-3">
                        <i className="fal fa-map-marker-alt" />
                      </div>
                      <div className="content">
                        <h6>
                          FPT University, Long Thạnh Mỹ <br />
                          Thủ Đức, Hồ Chí Minh, Vietnam
                        </h6>
                      </div>
                    </div>
                  </div>
                  <div className="social-icon d-flex align-items-center">
                    <a href="#">
                      <i className="fab fa-facebook-f" />
                    </a>
                    <a href="#">
                      <i className="fab fa-twitter" />
                    </a>
                    <a href="#">
                      <i className="fab fa-linkedin-in" />
                    </a>
                    <a href="#">
                      <i className="fab fa-youtube" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-md-6 col-xl-4 offset-xl-1 col-12 wow fadeInUp"
              data-wow-delay=".5s"
            >
              <LinksCol
                heading="About Us"
                links={aboutLink}
                links2={specialLink}
                layout={3}
              />
            </div>
            <div
              className="col-md-6 col-xl-3 col-12 wow fadeInUp"
              data-wow-delay=".7s"
            >
              <LinksCol
                heading="Popular Causes"
                links={popularlLink}
                layout={2}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-wrapper">
            <p className="wow fadeInUp text-center" data-wow-delay=".3s">
              © <Link href="/">TrustFundMe</Link> Charity Trust - 2026. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
const Footer4 = () => {
  return (
    <Fragment>
      <div className="footer-contact-section">
        <div className="container">
          <div className="footer-contact-wrapper">
            <div className="row g-4 justify-content-between">
              <div
                className="col-xl-3 col-lg-3 wow fadeInUp"
                data-wow-delay=".3s"
              >
                <div className="footer-logo">
                  <Link href="/">
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: "178px", height: "54px" }}
                      src="/assets/img/logo/white-logo.png"
                      alt="img"
                    />
                  </Link>
                </div>
              </div>
              <div
                className="col-xl-5 col-lg-4 wow fadeInUp"
                data-wow-delay=".5s"
              >
                <div className="contact-us-items">
                  <div className="single-info">
                    <div className="icon">
                      {" "}
                      <i className="fal fa-envelope" />{" "}
                    </div>
                    <div className="contact">
                      <h4>Email Address</h4>
                      <p>
                        <a href="mailto:info@example.com">info@example.com</a>
                      </p>
                    </div>
                  </div>
                  <div className="single-info">
                    <div className="icon">
                      {" "}
                      <i className="fal fa-phone" />
                    </div>
                    <div className="contact">
                      <h4>Phone Number</h4>
                      <p>
                        <a href="tel:98098709809">980-987-098-09</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-xl-3 col-lg-4 wow fadeInUp"
                data-wow-delay=".7s"
              >
                <div className="social-icon d-flex align-items-center">
                  <a href="#">
                    <i className="fab fa-facebook-f" />
                  </a>
                  <a href="#">
                    <i className="fab fa-twitter" />
                  </a>
                  <a href="#">
                    <i className="fab fa-vimeo-v" />
                  </a>
                  <a href="#">
                    <i className="fab fa-pinterest-p" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer-section section-bg">
        <div className="container">
          <div className="footer-widgets-wrapper">
            <div className="row justify-content-between">
              <div
                className="col-md-6 col-xl-4 col-12 wow fadeInUp"
                data-wow-delay=".3s"
              >
                <LinksCol
                  heading="About Us"
                  links={aboutLink}
                  links2={specialLink}
                  layout={3}
                />
              </div>
              <div
                className="col-md-6 col-xl-3 col-12 wow fadeInUp"
                data-wow-delay=".5s"
              >
                <LinksCol
                  heading="Popular Causes"
                  links={popularlLink}
                  layout={2}
                />
              </div>
              <div
                className="col-xl-4 col-md-6 col-12 wow fadeInUp"
                data-wow-delay=".5s"
              >
                <div className="single-footer-widget">
                  <div className="widget-head">
                    <h4>News Feeds</h4>
                  </div>
                  <div className="popularspost-area">
                    <div className="single-post-items">
                      <div
                        className="post-img bg-cover"
                        style={{
                          backgroundImage: 'url("assets/img/post1.jpg")',
                        }}
                      />
                      <div className="post-content">
                        <span>
                          <i className="fal fa-calendar-alt" />
                          24th November 2024
                        </span>
                        <h5>
                          <Link href="/news-details">
                            Everyone Deserves 100% Clean Water
                          </Link>
                        </h5>
                      </div>
                    </div>
                    <div className="single-post-items">
                      <div
                        className="post-img bg-cover"
                        style={{
                          backgroundImage: 'url("assets/img/post2.jpg")',
                        }}
                      />
                      <div className="post-content">
                        <span>
                          <i className="fal fa-calendar-alt" />
                          24th November 2024
                        </span>
                        <h5>
                          <Link href="/news-details">
                            Lorem ipsum dolor sit amet, nsectetur
                          </Link>
                        </h5>
                      </div>
                    </div>
                    <div className="single-post-items">
                      <div
                        className="post-img bg-cover"
                        style={{
                          backgroundImage: 'url("assets/img/post1.jpg")',
                        }}
                      />
                      <div className="post-content">
                        <span>
                          <i className="fal fa-calendar-alt" />
                          24th November 2024
                        </span>
                        <h5>
                          <Link href="/news-details">
                            A true story about great two sisters
                          </Link>
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <div className="footer-wrapper">
              <p className="wow fadeInUp text-center" data-wow-delay=".3s">
                © <Link href="/">Danbox</Link> Charity Trust - 2024. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </Fragment>
  );
};
const FooterLogoContainer = () => (
  <div
    className="col-xl-3 col-lg-4 col-md-6  wow fadeInUp"
    data-wow-delay=".2s"
  >
    <div className="single-footer-widget">
      <div className="widget-head">
        <Link href="/" className="text-white text-3xl font-extrabold tracking-tight hover:text-primary transition-colors" style={{ fontFamily: "'Inter', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          TrustFundMe
        </Link>
      </div>
      <div className="footer-content">
        <p>
          Empowering communities through transparent fundraising. Together, we create lasting change and build a better future for those in need.
        </p>
        <div className="social-icon d-flex align-items-center">
          <a href="#">
            <i className="fab fa-facebook-f" />
          </a>
          <a href="#">
            <i className="fab fa-twitter" />
          </a>
          <a href="#">
            <i className="fab fa-vimeo-v" />
          </a>
          <a href="#">
            <i className="fab fa-pinterest-p" />
          </a>
        </div>
      </div>
    </div>
  </div>
);

type LinkItem = { link: string; text: string };
type LinkItem2 = { link: string; text: string };
const LinksCol = ({
  heading,
  links = [],
  links2 = [],
  layout = 1,
}: {
  heading?: string;
  layout?: number;
  links?: LinkItem[];
  links2?: LinkItem2[];
}) => (
  <div className="single-footer-widget">
    {heading && (
      <div className="widget-head">
        <h4 className={layout == 1 ? "text-white" : ""}>{heading}</h4>
      </div>
    )}
    {layout == 3 ? (
      <Fragment>
        <div className="special-menu">
          <ul>
            {links.map((e, i) => (
              <li key={i}>
                <a href={e.link}>{e.text}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="special-menu">
          <ul>
            {links2.map((e, i) => (
              <li key={i}>
                <a href={e.link}>{e.text}</a>
              </li>
            ))}
          </ul>
        </div>
      </Fragment>
    ) : (
      <ul className="list-area">
        {links.map((e, i) => (
          <li key={i}>
            <a href={e.link}>
              {layout == 1 && <i className="far fa-chevron-double-right" />}
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const usefulLink = [
  { link: "about", text: "About Us" },
  { link: "causes", text: "Popular Causes" },
  { link: "events", text: "Upcoming Event" },
  { link: "team", text: "Our Volunteers" },
  { link: "news", text: "Latest News" },
];
const legalLink = [
  { link: "terms", text: "Terms of Use" },
  { link: "privacy", text: "Privacy Policy" },
  { link: "report", text: "Report Violation" },
  { link: "cookies", text: "Cookies" },
];
const aboutLink = [
  { link: "/", text: "Home" },
  { link: "/about", text: "About" },
  { link: "/causes", text: "Our Causes" },
  { link: "/events", text: "Our Events" },
  { link: "/contact", text: "Contact" },
  { link: "/team", text: "Team" },
];
const specialLink = [
  { link: "/faq", text: "FAQ" },
  { link: "/news", text: "News" },
  { link: "/account/impact", text: "Your Impact" },
  { link: "/sign-in", text: "Sign In" },
];
const popularlLink = [
  { link: "/causes-details", text: "Water Purify" },
  { link: "/causes-details", text: "Food Collection" },
  { link: "/causes-details", text: "Healthcare" },
  { link: "/causes-details", text: "Education" },
  { link: "/donation-details", text: "Make Donation" },
];
