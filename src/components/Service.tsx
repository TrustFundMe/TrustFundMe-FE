import Image from "next/image";
import Link from "next/link";

export const Service1 = () => {
  const serviceData: {
    img: string;
    title: string;
    description: string;
    delay: string;
  }[] = [
    {
      img: "/assets/img/service/01.jpg",
      title: "Fund Poor Treatment",
      description:
        "There are only a few times in each of our lives that we get to witness a truly historic global compliment.",
      delay: ".3s",
    },
    {
      img: "/assets/img/service/02.jpg",
      title: "Money This Treatment",
      description:
        "There are only a few times in each of our lives that we get to witness a truly historic global compliment.",
      delay: ".5s",
    },
    {
      img: "/assets/img/service/03.jpg",
      title: "Fund Hand Children",
      description:
        "There are only a few times in each of our lives that we get to witness a truly historic global compliment.",
      delay: ".7s",
    },
    {
      img: "/assets/img/service/04.jpg",
      title: "Inspire Help Raised",
      description:
        "There are only a few times in each of our lives that we get to witness a truly historic global compliment.",
      delay: ".3s",
    },
    {
      img: "/assets/img/service/05.jpg",
      title: "Donation Help Raised",
      description:
        "There are only a few times in each of our lives that we get to witness a truly historic global compliment.",
      delay: ".5s",
    },
    {
      img: "/assets/img/service/06.jpg",
      title: "Child Education Raised",
      description:
        "There are only a few times in each of our lives that we get to witness a truly historic global compliment.",
      delay: ".7s",
    },
  ];
  return (
    <section className="service-section fix section-bg section-padding">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title color-2 wow fadeInUp">
            <i className="far fa-heart" />
            Our Best Services
          </span>
          <h2 className="mt-char-animation">
            We Help Poor This Life <br />
            Service Now
          </h2>
        </div>
        <div className="row">
          {serviceData.map((item, i) => (
            <div
              key={i}
              className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp"
              data-wow-delay={item.delay}
            >
              <div className="service-card-items">
                <div className="service-image">
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    src={item.img}
                    alt={item.title}
                  />
                </div>
                <div className="service-content">
                  <h3>
                    <Link href="/about">{item.title}</Link>
                  </h3>
                  <p>{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
