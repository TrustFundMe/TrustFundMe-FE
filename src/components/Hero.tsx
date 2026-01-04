import Link from "next/link";

export const Hero2 = () => {
  return (
    <section className="hero-section hero-1 style-hero-3">
      <div
        className="hero-image bg-cover"
        style={{ backgroundImage: 'url("assets/img/hero/hero-8.jpg")' }}
      />
      <div className="container">
        <div className="row g-4 align-items-center justify-content-between">
          <div className="col-xl-7 col-lg-6">
            <div className="hero-content">
              <h5 className="wow fadeInUp">
                Our Mission: Food, Education, Medicine
              </h5>
              <h1 className="wow fadeInUp" data-wow-delay=".3s">
                We’re On A Mission To Change That
              </h1>
              <div className="hero-button">
                <Link
                  href="/causes"
                  className="theme-btn wow fadeInUp"
                  data-wow-delay=".5s"
                >
                  View Causes
                </Link>
                <Link
                  href="/donation-details"
                  className="theme-btn transparent-btn wow fadeInUp"
                  data-wow-delay=".7s"
                >
                  Donate Now
                </Link>
              </div>
            </div>
          </div>
          <div className="col-xl-5 col-lg-6 wow fadeInUp" data-wow-delay=".4s">
            <div className="hero-form">
              <div className="hero-title">
                <h6>We're Near to Our</h6>
                <h2>Donate Today</h2>
                <p>
                  Lorem ipsum dolor sit amet con sed do eiusmod tempor
                  incididunt The long journey to end poverty begins with a
                  child.
                </p>
              </div>
              <div className="progress-items">
                <div className="progress-goals">
                  <span>
                    Raised <b> $4,407</b>
                  </span>
                  <span>
                    Goal <b> $10.000</b>
                  </span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar"
                    data-wow-duration=".9s"
                    role="progressbar"
                    style={{ width: "80%" }}
                    aria-valuenow={95}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
              <div
                className="donate-amount mt-4 wow fadeInUp"
                data-wow-delay=".5s"
              >
                <button className="active amount-btn">$10</button>
                <button className="amount-btn">$50</button>
                <button className="amount-btn">$100</button>
              </div>
              <div
                className="donate-amount mt-4 wow fadeInUp"
                data-wow-delay=".5s"
              >
                <button className="amount-btn">$100</button>
                <button className="amount-btn">$200</button>
                <button className="amount-btn">$300</button>
              </div>
              <div
                className="donate-now mt-4 wow fadeInUp"
                data-wow-delay=".7s"
              >
                <input
                  type="text"
                  className="addAmount-value"
                  placeholder="$ Costume Amount"
                />
                <div className="btn-one">
                  <span className="btn-circle"></span>
                  <a href="#" className="theme-btn">
                    <span className="btn-text">DONATE NOW</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
