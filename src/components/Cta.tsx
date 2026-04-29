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
                  Join Our Platform
                </span>
                <h2 className="mt-char-animation text-white">
                  Be Part of the Transparency Revolution
                </h2>
              </div>
              <div className="button-items mt-4 mt-md-0">
                <Link
                  href="causes"
                  className="theme-btn wow fadeInUp"
                  data-wow-delay=".3s"
                >
                  <i className="fal fa-heart" />
                  Start Donating
                </Link>
                <Link
                  href="donation-details"
                  className="theme-btn transparent-btn wow fadeInUp"
                  data-wow-delay=".5s"
                >
                  <i className="fal fa-hand-holding-heart" />
                  Create Campaign
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
    <section className="cta-banner-section-3 fix py-14 md:py-18 lg:py-20">
      <div className="container">
        <div
          className="rounded-[2rem] border border-white/20 px-6 py-8 md:px-10 md:py-10"
          style={{
            background: "linear-gradient(135deg, #f84d43 0%, #ff6a1f 55%, #ff7b3a 100%)",
          }}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-end">
            <div>
              <span className="inline-flex items-center rounded-full bg-white/18 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                Tham gia TrustFundMe
            </span>
              <h2 className="mt-3 text-white font-black leading-[1.08] text-3xl md:text-[44px] tracking-tight">
                Bắt đầu tạo ra khác biệt ngay hôm nay
              </h2>
              <p className="mt-3 max-w-[56ch] text-sm md:text-base text-white/85">
                Theo dõi minh bạch từng khoản đóng góp, từng đợt chi tiêu và tác động thực tế của cộng đồng.
              </p>
            </div>

            <form action="#" id="contact-form" method="POST" className="w-full">
              <label htmlFor="email" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/90">
                Nhận cập nhật qua email
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Nhập email của bạn"
                  className="h-12 w-full rounded-full border border-white/35 bg-white/95 px-4 text-sm font-semibold text-[#1f2937] outline-none placeholder:text-slate-400"
                />
                <button
                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-[#1a685b] px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#145246]"
                  type="submit"
                >
                  Bắt đầu ngay
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="ml-2 h-4 w-4"
                  >
                    <path
                      d="M4 10h12M10 4l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
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
                Join Our Community
              </span>
              <h2 className="mt-char-animation text-white">
                Make Every Donation Count
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
                        Get Involved Today
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
              Platform Demo
            </span>
            <h2 className="mt-char-animation text-white">
              See Transparency <br />
              in Action
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
              Watch Demo
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
      style={{ backgroundImage: 'url("https://placehold.co/1920x1080?text=Transparency+in+Action")' }}
    >
      <div className="container">
        <div className="cta-video-wrapper d-block center">
          <div className="section-title">
            <span className="sub-title color-2 wow fadeInUp">
              <i className="far fa-heart" />
              See How It Works
            </span>
            <h2 className="mt-char-animation text-white">
              Transparency in <br />
              Every Transaction
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
              Watch Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
