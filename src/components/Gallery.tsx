import Image from "next/image";

export const Gallery1 = () => {
  const galleryData: {
    img: string;
    delay: string;
  }[] = [
    {
      img: "/assets/img/gallery/gallery-6.jpg",
      delay: ".2s",
    },
    {
      img: "/assets/img/gallery/gallery-7.jpg",
      delay: ".4s",
    },
    {
      img: "/assets/img/gallery/gallery-8.jpg",
      delay: ".6s",
    },
    {
      img: "/assets/img/gallery/gallery-9.jpg",
      delay: ".8s",
    },
    {
      img: "/assets/img/gallery/gallery-10.jpg",
      delay: ".9s",
    },
  ];
  return (
    <div className="gallery-section fix section-padding pt-0">
      <div className="container-fluid">
        <div className="gallery-wrappper">
          {galleryData.map((item, index) => (
            <div
              key={index}
              className="gallery-image wow fadeInUp"
              data-wow-delay={item.delay}
            >
              <Image
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "300px", height: "auto" }}
                src={item.img}
                alt="img"
              />
              <div className="gallery-content">
                <a href={item.img} className="img-popup">
                  <i className="far fa-search text-white" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Gallery2 = () => {
  const galleryItems: {
    image: string;
    category: string;
    title: string;
  }[] = [
    {
      image: "/assets/img/gallery/gallery-1.jpg",
      category: "Charity",
      title: "Education",
    },
    {
      image: "/assets/img/gallery/gallery-2.jpg",
      category: "Charity",
      title: "Education",
    },
    {
      image: "/assets/img/gallery/gallery-3.jpg",
      category: "Charity",
      title: "Education",
    },
    {
      image: "/assets/img/gallery/gallery-4.jpg",
      category: "Charity",
      title: "Education",
    },
    {
      image: "/assets/img/gallery/gallery-5.jpg",
      category: "Charity",
      title: "Education",
    },
  ];

  return (
    <div className="gallery-section fix section-padding">
      <div className="container-fluid">
        <div className="gallery-wrappper">
          {galleryItems.map((item, index) => {
            const delay = (0.2 + index * 0.2).toFixed(1) + "s";
            return (
              <div
                key={index}
                className="gallery-image wow fadeInUp"
                data-wow-delay={delay}
              >
                <Image
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: "320px", height: "auto" }}
                  src={item.image}
                  alt="img"
                />

                <div className="gallery-content">
                  <p>{item.category}</p>
                  <h4>{item.title}</h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
