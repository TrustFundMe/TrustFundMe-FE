import Image from "next/image";
import Link from "next/link";
import TrustBentoCards from "./ui/trust-bento-cards";

export const Feature1 = () => {
  return <TrustBentoCards />;
};

export const Feature2 = () => {
  const features: {
    icon: string;
    title: string;
    description: string;
    delay: string;
  }[] = [
    {
      icon: "/assets/img/feature-icon-1.png",
      title: "50 Milion Volunteers",
      description:
        "Many of us have no idea what it's like to be thirsty. We have plenty of water to drink even the water in our toilets is clean!",
      delay: ".3s",
    },
    {
      icon: "/assets/img/feature-icon-2.png",
      title: "5130+ Milion Rises",
      description:
        "Many of us have no idea what it's like to be thirsty. We have plenty of water to drink even the water in our toilets is clean!",
      delay: ".5s",
    },
  ];

  return (
    <section className="feature-section fix section-padding">
      <div className="container">
        <div className="feature-wrapper">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6 wow fadeInUp" data-wow-delay=".3s">
              <div className="feature-image">
                <Image
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: "100%", height: "auto" }}
                  src="/assets/img/feature.jpg"
                  alt="img"
                />
              </div>
            </div>
            <div className="col-lg-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="feature-icon-area wow fadeInUp"
                  data-wow-delay={feature.delay}
                >
                  <div className="icon-items">
                    <div className="icon">
                      <Image
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: "49px", height: "auto" }}
                        src={feature.icon}
                        alt="img"
                      />
                    </div>
                    <div className="content">
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href="/causes"
                className="theme-btn wow fadeInUp"
                data-wow-delay=".7s"
              >
                See Causes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
