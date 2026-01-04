import Image from "next/image";
import Link from "next/link";

export const Promo1 = () => {
  const causeCategories: {
    image: string;
    title: string;
    delay: string;
    width: number;
  }[] = [
    {
      image: "/assets/img/icon/cat1.png",
      title: "Pure Water",
      delay: ".2s",
      width: 53,
    },
    {
      image: "/assets/img/icon/cat2.png",
      title: "Health Food",
      delay: ".4s",
      width: 59,
    },
    {
      image: "/assets/img/icon/cat3.png",
      title: "No Poverty",
      delay: ".6s",
      width: 60,
    },
    {
      image: "/assets/img/icon/cat4.png",
      title: "Good Health",
      delay: ".7s",
      width: 56,
    },
    {
      image: "/assets/img/icon/cat5.png",
      title: "Partnerships",
      delay: ".8s",
      width: 62,
    },
    {
      image: "/assets/img/icon/cat6.png",
      title: "Good Health",
      delay: ".9s",
      width: 64,
    },
  ];
  return (
    <section className="promo-section section-padding pt-0">
      <div className="container">
        <div className="promo-wrapper style-3">
          <div className="row g-4">
            {causeCategories.map((item, index) => (
              <div
                className="col-xxl-2 col-xl-3 col-lg-3 col-md-4 col-sm-6 wow fadeInUp"
                data-wow-delay={item.delay}
                key={index}
              >
                <div className="single-causes-cat">
                  <Link href="/causes-details">
                    <div className="icon">
                      <Image
                        width={59}
                        height={59}
                        sizes="100vw"
                        style={{ width: `${item.width}px`, height: "auto" }}
                        src={item.image}
                        alt={item.title}
                      />
                    </div>
                    <h6>{item.title}</h6>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Promo2 = () => {
  const promoData: {
    type: "support" | "checkout" | "subscribe";
    delay: string;
    bgImage?: string;
    icon?: string;
    label: string;
    title: string;
    link?: string;
    iconSize?: number;
    btnText?: string;
  }[] = [
    {
      type: "support",
      delay: ".3s",
      bgImage: "/assets/img/support-girl.jpg",
      label: "Trending Cause",
      title: "Make A Support",
      link: "/donation-details",
    },
    {
      type: "checkout",
      delay: ".5s",
      icon: "/assets/img/support-icon.png",
      iconSize: 85,
      label: "Support Us",
      title: "Explore Causes",
      link: "/causes",
      btnText: "Check It Out",
    },
    {
      type: "subscribe",
      delay: ".7s",
      icon: "/assets/img/envalope.png",
      iconSize: 106,
      label: "Subscribe",
      title: "Get Updates",
    },
  ];

  return (
    <section className="promo-section section-padding pt-0">
      <div className="container">
        <div className="promo-wrapper">
          <div className="row g-4">
            {promoData.map((item, index) => (
              <div
                key={index}
                className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp"
                data-wow-delay={item.delay}
              >
                {item.type === "support" && (
                  <div className="support-promo-box">
                    <div
                      className="promo-bg bg-cover"
                      style={{ backgroundImage: `url(${item.bgImage})` }}
                    />
                    <div className="promo-details">
                      <span>{item.label}</span>
                      <h3>
                        {item.link && (
                          <Link href={item.link}>{item.title}</Link>
                        )}
                      </h3>
                    </div>
                  </div>
                )}

                {item.type === "checkout" && (
                  <div className="checkout-promo-box">
                    {item.icon && (
                      <div className="icon">
                        <Image
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{
                            width: `${item.iconSize}px`,
                            height: "auto",
                          }}
                          src={item.icon}
                          alt="img"
                        />
                      </div>
                    )}
                    <div className="content">
                      <span>{item.label}</span>
                      <h3>{item.title}</h3>
                      {item.link && (
                        <Link href={item.link} className="theme-btn bg-black">
                          {item.btnText}
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {item.type === "subscribe" && (
                  <div className="subscribe-promo-box">
                    {item.icon && (
                      <div className="icon">
                        <Image
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{
                            width: `${item.iconSize}px`,
                            height: "auto",
                          }}
                          src={item.icon}
                          alt="img"
                        />
                      </div>
                    )}
                    <span>{item.label}</span>
                    <h3>{item.title}</h3>
                    <form action="#" className="mailchimp-form">
                      <input type="email" placeholder="Enter email address" />
                      <button type="submit">
                        <i className="fal fa-envelope" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Promo3 = () => {
  const promoItems: {
    title: string;
    description: string;
    icon: string;
    image: string;
    styleClass?: string;
    delay: string;
  }[] = [
    {
      title: "Make Donation",
      description:
        "The Spring is a passionate and determined group of monthly givers on a mission",
      icon: "/assets/img/hand.png",
      image: "/assets/img/support-girl.jpg",
      delay: ".3s",
    },
    {
      title: "Foundries For Grow",
      description:
        "The Spring is a passionate and determined group of monthly givers on a mission",
      icon: "/assets/img/world.png",
      image: "/assets/img/waterboy.jpg",
      styleClass: "style-2",
      delay: ".5s",
    },
  ];

  return (
    <section className="promo-section section-padding pt-0">
      <div className="container">
        <div className="promo-wrapper promo-style-2">
          <div className="row g-0">
            {promoItems.map((item, index) => (
              <div
                key={index}
                className="col-xl-6 col-lg-6 col-md-6 wow fadeInUp"
                data-wow-delay={item.delay}
              >
                <div
                  className={`single-promo-box-items ${
                    item.styleClass || ""
                  } bg-cover`}
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  <div className="icon">
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: "80px", height: "auto" }}
                      src={item.icon}
                      alt="img"
                    />
                  </div>
                  <div className="content">
                    <h3>
                      <Link href="/donation-details">{item.title}</Link>
                    </h3>
                    <p>{item.description}</p>
                    <Link href="/donation-details" className="link-btn">
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
