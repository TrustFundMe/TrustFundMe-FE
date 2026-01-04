import Link from "next/link";

export const Cta1 = () => {
  return (
    <section className="cta-banner fix">
      <div className="container">
        <div
          className="cta-banner-wrapper section-padding bg-cover"
          style={{ backgroundImage: 'url("assets/img/join-cat-bg.jpg")' }}
        >
          <div className="row">
            <div className="offset-xl-5 col-xl-6 col-lg-8 offset-lg-2 col-md-12">
              <div className="section-title">
                <span className="sub-title text-white wow fadeInUp">
                  <i className="far fa-heart" />
                  Life Changing Video
                </span>
                <h2 className="mt-char-animation text-white">
                  Joel Orphanage Of Ministry Uganda
                </h2>
              </div>
              <div className="button-items mt-4 mt-md-0">
                <Link
                  href="causes"
                  className="theme-btn wow fadeInUp"
                  data-wow-delay=".3s"
                >
                  <i className="fal fa-briefcase" />
                  Careers
                </Link>
                <Link
                  href="donation-details"
                  className="theme-btn transparent-btn wow fadeInUp"
                  data-wow-delay=".5s"
                >
                  <i className="fal fa-user" />
                  Internship
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Cta2 = () => {
  return (
    <section className="cta-banner-section-3 fix section-padding">
      <div className="container">
        <div className="cta-banner-wrapper-3">
          <div className="section-title mb-0">
            <span className="sub-title text-white wow fadeInUp">
              <i className="far fa-heart" /> Join With Us
            </span>
            <h2 className="mt-char-animation text-white">
              Let’s be a Part <br /> of us
            </h2>
          </div>
          <form
            action="#"
            id="contact-form"
            method="POST"
            className="newsletter-items"
          >
            <div className="form-clt wow fadeInUp" data-wow-delay=".7s">
              <input
                type="text"
                name="email"
                id="email"
                placeholder="Enter Your Email"
              />
              <button
                className="theme-btn wow fadeInUp"
                data-wow-delay=".9s"
                type="submit"
              >
                <span>
                  Join Now <i className="far fa-arrow-right" />
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export const Cta3 = () => {
  return (
    <section className="cta-subscribe-section fix theme-bg section-padding">
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-lg-5">
            <div className="section-title mb-0">
              <span className="sub-title color-3 wow fadeInUp">
                <i className="far fa-heart" />
                Call To Action
              </span>
              <h2 className="mt-char-animation text-white">
                Give Your Big Hand Forever
              </h2>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="cta-subscribe-form">
              <form action="#" id="contact-form" method="POST">
                <div className="row g-4">
                  <div className="col-lg-6 wow fadeInUp" data-wow-delay=".3s">
                    <div className="form-clt">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Enter your name"
                      />
                      <div className="icon">
                        <i className="fal fa-user" />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 wow fadeInUp" data-wow-delay=".5s">
                    <div className="form-clt">
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        placeholder="Enter phone number"
                      />
                      <div className="icon">
                        <i className="fal fa-phone" />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-5 wow fadeInUp" data-wow-delay=".3s">
                    <div className="form-clt">
                      <input
                        type="text"
                        name="location"
                        id="location"
                        placeholder="Enter address"
                      />
                      <div className="icon">
                        <i className="far fa-map-marker-alt" />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 wow fadeInUp" data-wow-delay=".5s">
                    <div className="form-clt">
                      <input
                        type="text"
                        name="code"
                        id="code"
                        placeholder="Zip Code"
                      />
                      <div className="icon">
                        <i className="fal fa-map" />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 wow fadeInUp" data-wow-delay=".7s">
                    <div className="form-clt">
                      <button className="theme-btn" type="submit">
                        Get Involed Today
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Cta4 = () => {
  return (
    <section className="cta-video-section fix section-padding theme-bg">
      <div className="container">
        <div className="cta-video-wrapper">
          <div className="section-title mb-0">
            <span className="sub-title wow color-3 fadeInUp">
              <i className="far fa-heart" />
              Life Changing Video
            </span>
            <h2 className="mt-char-animation text-white">
              Joel Orphanage Of <br />
              Ministry Uganda
            </h2>
          </div>
          <div className="video-play-btn wow fadeInUp" data-wow-delay=".5s">
            <a
              href="https://www.youtube.com/watch?v=Cn4G2lZ_g2I"
              className="video-btn ripple video-popup"
            >
              <i className="fas fa-play" />
            </a>
            <a
              href="https://www.youtube.com/watch?v=Cn4G2lZ_g2I"
              className="video-text video-popup wow fadeInUp"
              data-wow-delay=".5s"
            >
              Play Video
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Cta5 = () => {
  return (
    <section
      className="cta-video-section-2 fix section-padding bg-cover"
      style={{ backgroundImage: 'url("assets/img/cta-video.jpg")' }}
    >
      <div className="container">
        <div className="cta-video-wrapper d-block center">
          <div className="section-title">
            <span className="sub-title color-2 wow fadeInUp">
              <i className="far fa-heart" />
              Life Changing Video
            </span>
            <h2 className="mt-char-animation text-white">
              Joel Orphanage Of <br />
              Ministry Uganda
            </h2>
          </div>
          <div
            className="video-play-btn pt-4 mt-md-0 wow fadeInUp"
            data-wow-delay=".5s"
          >
            <a
              href="https://www.youtube.com/watch?v=Cn4G2lZ_g2I"
              className="video-btn ripple video-popup"
            >
              <i className="fas fa-play" />
            </a>
            <a
              href="https://www.youtube.com/watch?v=Cn4G2lZ_g2I"
              className="video-text video-popup wow fadeInUp"
              data-wow-delay=".5s"
            >
              Play Video
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
