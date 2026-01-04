import Image from "next/image";
export const Brand = () => {
  const brands: {
    image: string;
    active?: boolean;
  }[] = [
    { image: "/assets/img/brand/1.png" },
    { image: "/assets/img/brand/2.png" },
    { image: "/assets/img/brand/3.png" },
    { image: "/assets/img/brand/4.png" },
    { image: "/assets/img/brand/5.png" },
    { image: "/assets/img/brand/6.png", active: true },
    { image: "/assets/img/brand/7.png" },
  ];

  return (
    <div
      className="brand-section bg-cover section-padding"
      style={{ backgroundImage: 'url("assets/img/brand/brand-bg.png")' }}
    >
      <div className="container">
        <div className="title-wrap wow fadeInUp" data-wow-delay=".3s">
          <p>Our Sponsors</p>
        </div>
        <div className="row g-4 align-items-center justify-content-center">
          {brands.map((brand, index) => {
            const delay = (0.2 + index * 0.2).toFixed(1) + "s";
            return (
              <div
                key={index}
                className="col-12 col-md-6 col-lg-4 col-xl-3 wow fadeInUp"
                data-wow-delay={delay}
              >
                <div className={`brand-image ${brand.active ? "active" : ""}`}>
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    src={brand.image}
                    alt="brand"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
