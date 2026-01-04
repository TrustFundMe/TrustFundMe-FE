import Image from "next/image";
import Link from "next/link";
import Counter from "./Counter";

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
                        src="/assets/img/about/08.jpg"
                        alt="img"
                      />
                    </div>
                  </div>
                  <div className="col-lg-5 wow fadeInUp" data-wow-delay=".5s">
                    <div className="about-experience">
                      <h2>
                        <span className="count">25</span>+
                      </h2>
                      <h6>Years Of Experience</h6>
                      <div className="thumb">
                        <Image
                          width={135}
                          height={55}
                          sizes="100vw"
                          src="/assets/img/client.png"
                          alt="img"
                        />
                      </div>
                      <h6>Globally Clients</h6>
                    </div>
                    <div className="about-img">
                      <Image
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: "100%", height: "auto" }}
                        src="/assets/img/about/09.jpg"
                        alt="img"
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
                    About Us
                  </span>
                  <h2 className="mt-char-animation">
                    We’ve Funded{" "}
                    <span className="count">
                      <Counter end={44} />
                    </span>
                    <span>k</span> Dollars Over
                  </h2>
                </div>
                <p className="mt-3 mt-md-0 wow fadeInUp" data-wow-delay=".5s">
                  There are only a few times in each of our lives that we get to
                  witness a truly historic global ccomplishment: Ending
                  smallpox, tearing.Your $40.00 monthly donation can give 12
                  people.
                </p>
                <div className="d-flex align-items-center flex-wrap mb-5">
                  <ul
                    className="checked-list wow fadeInUp"
                    data-wow-delay=".3s"
                  >
                    <li>
                      <i className="far fa-check" /> A place in history
                    </li>
                    <li>
                      <i className="far fa-check" />
                      It’s about impact, goodness
                    </li>
                  </ul>
                  <ul
                    className="checked-list wow fadeInUp"
                    data-wow-delay=".5s"
                  >
                    <li>
                      <i className="far fa-check" /> A place in history
                    </li>
                    <li>
                      <i className="far fa-check" />
                      It’s about impact, goodness
                    </li>
                  </ul>
                </div>
                <Link
                  href="causes"
                  className="theme-btn wow fadeInUp"
                  data-wow-delay=".7s"
                >
                  Learn More
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
  }[] = [
    {
      img: "/assets/img/about/05.jpg",
      delay: ".3s",
    },
    {
      img: "/assets/img/about/06.jpg",
      delay: ".5s",
    },
    {
      img: "/assets/img/about/07.jpg",
      delay: ".7s",
    },
  ];
  return (
    <section className={`about-section-2 fix ${containerClass}`}>
      <div className="container">
        <div className="org-logo-wrap text-center">
          <div className="org-logo wow fadeInUp" data-wow-delay=".3s">
            <Image
              width={99}
              height={108}
              sizes="100vw"
              style={{ width: "auto", height: "auto" }}
              src="/assets/img/about-logo.png"
              alt="img"
            />
          </div>
        </div>
        <div className="section-title text-center">
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
              className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp"
              data-wow-delay={item.delay}
            >
              <div className="about-image-items">
                <Image
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: "100%", height: "auto" }}
                  src={item.img}
                  alt="img"
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
                    src="/assets/img/about/01.jpg"
                    alt="img"
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
                      src="/assets/img/about/02.jpg"
                      alt="img"
                    />
                  </div>
                </div>
                <div className="counter-box wow fadeInUp" data-wow-delay=".6s">
                  <h2>
                    <span className="count">
                      <Counter end={32} />
                    </span>
                    +
                  </h2>
                  <p>Years Of Experience</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-content">
                <div className="section-title">
                  <span className="sub-title color-2 wow fadeInUp">
                    <i className="far fa-heart" />
                    About Us
                  </span>
                  <h2 className="mt-char-animation">
                    We’ve Funded{" "}
                    <span className="count">
                      <Counter end={44} />
                    </span>
                    <span>k </span>
                    Dollars Over
                  </h2>
                </div>
                <p className="mt-3 mt-md-0 wow fadeInUp" data-wow-delay=".5s">
                  Your $40.00 monthly donation can give 12 people clean water
                  every <br /> year. 100% funds water projects.
                </p>
                <ul className="checked-list wow fadeInUp" data-wow-delay=".3s">
                  <li>A place in history</li>
                  <li>It’s about impact, goodness</li>
                  <li>More goodness in the world</li>
                  <li>
                    The world we live in right now
                    <br />
                    can be hard
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
                        src="/assets/img/about/03.jpg"
                        alt="img"
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
                        src="/assets/img/about/04.jpg"
                        alt="img"
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
                    About Us
                  </span>
                  <h2 className="mt-char-animation">
                    We’ve Funded{" "}
                    <span className="count">
                      <Counter end={44} />
                    </span>
                    <span>k </span>
                    Dollars Over
                  </h2>
                </div>
                <p className="mt-3 mt-md-0 wow fadeInUp" data-wow-delay=".5s">
                  Your $40.00 monthly donation can give 12 people clean water
                  every <br /> year. 100% funds water projects.
                </p>
                <div className="list-area">
                  <div className="list-items">
                    <i className="fas fa-check" />
                    <div className="content">
                      <h5>Quick Fundraising</h5>
                      <p>Charity Navigator's Giving you support multiple</p>
                    </div>
                  </div>
                  <div className="list-items">
                    <i className="fas fa-check" />
                    <div className="content">
                      <h5>Join Our Team</h5>
                      <p>Charity Navigator's Giving you support multiple</p>
                    </div>
                  </div>
                </div>
                <div className="about-button wow fadeInUp" data-wow-delay=".5s">
                  <Link href="/about" className="theme-btn transparent-btn-2">
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
