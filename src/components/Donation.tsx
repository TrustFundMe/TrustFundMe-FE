import Image from "next/image";
import Link from "next/link";

export const Donation1 = () => {
  const donationItems: {
    title: string;
    description: string;
    icon: string;
    iconWidth: string;
    delay: string;
  }[] = [
    {
      title: "Healthy Foods",
      description:
        "There are only a few times in each of our lives that we get to witness a truly historic global accomplishment: Ending smallpox, tearing",
      icon: "/assets/img/donation/icon-1.png",
      iconWidth: "81",
      delay: ".3s",
    },
    {
      title: "Pure Water",
      description:
        "There are only a few times in each of our lives that we get to witness a truly historic global accomplishment: Ending smallpox, tearing",
      icon: "/assets/img/donation/icon-2.png",
      iconWidth: "84",
      delay: ".5s",
    },
    {
      title: "Medical Facilities",
      description:
        "There are only a few times in each of our lives that we get to witness a truly historic global accomplishment: Ending smallpox, tearing",
      icon: "/assets/img/donation/icon-3.png",
      iconWidth: "70",
      delay: ".7s",
    },
  ];

  return (
    <section className="donation-section fix section-padding pt-0">
      <div className="container">
        <div className="row g-4">
          {donationItems.map((item, index) => (
            <div
              key={index}
              className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp"
              data-wow-delay={item.delay}
            >
              <div className="donation-card-items">
                <div className="icon">
                  <Image
                    width={81}
                    height={70}
                    sizes="100vw"
                    style={{ width: `${item.iconWidth}px`, height: "auto" }}
                    src={item.icon}
                    alt="img"
                  />
                </div>
                <div className="content">
                  <h3>
                    <Link href="/donation-details">{item.title}</Link>
                  </h3>
                  <p>{item.description}</p>
                  <Link href="/donation-details" className="donation-btn">
                    <i className="fal fa-plus" /> read more
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Donation2 = () => {
  return (
    <section
      className="donation-section-2 fix section-padding bg-cover"
      style={{ backgroundImage: "url()" }}
    >
      <div className="donation-image">
        <Image
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          src="/assets/img/donate-img.jpg"
          alt="img"
        />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-lg-5" />
          <div className="col-lg-7">
            <div className="donation-content-area">
              <div className="section-title">
                <span className="sub-title color-2 wow fadeInUp">
                  JOIN US NOW{" "}
                </span>
                <h2 className="mt-char-animation text-white">
                  Support Kids By Raising Valuable Donations
                </h2>
              </div>
              <div
                className="donate-amount mt-4 wow fadeInUp"
                data-wow-delay=".5s"
              >
                <button className="active amount-btn">$10</button>
                <button className="amount-btn">$30</button>
                <button className="amount-btn">$50</button>
                <button className="amount-btn">$100</button>
                <button className="amount-btn">$200</button>
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
