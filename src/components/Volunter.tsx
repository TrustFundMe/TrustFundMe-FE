import Image from "next/image";
import Link from "next/link";

export const Volunter = () => {
  const volunteers: {
    name: string;
    role: string;
    image: string;
    social: { icon: string; link: string }[];
  }[] = [
    {
      name: "Shikhon Islam",
      role: "Volunteer",
      image: "/assets/img/volunter/01.jpg",
      social: [
        { icon: "fab fa-facebook-f", link: "#" },
        { icon: "fab fa-twitter", link: "#" },
        { icon: "fab fa-vimeo-v", link: "#" },
        { icon: "fab fa-pinterest-p", link: "#" },
      ],
    },
    {
      name: "Amelia Maeve",
      role: "Volunteer",
      image: "/assets/img/volunter/02.jpg",
      social: [
        { icon: "fab fa-facebook-f", link: "#" },
        { icon: "fab fa-twitter", link: "#" },
        { icon: "fab fa-vimeo-v", link: "#" },
        { icon: "fab fa-pinterest-p", link: "#" },
      ],
    },
    {
      name: "Salman Islam",
      role: "Volunteer",
      image: "/assets/img/volunter/03.jpg",
      social: [
        { icon: "fab fa-facebook-f", link: "#" },
        { icon: "fab fa-twitter", link: "#" },
        { icon: "fab fa-vimeo-v", link: "#" },
        { icon: "fab fa-pinterest-p", link: "#" },
      ],
    },
  ];

  return (
    <section className="volunter-section fix section-padding">
      <div className="container">
        <div className="section-title text-center">
          <span className="sub-title color-2 wow fadeInUp">
            <i className="far fa-heart" />
            OUR VOLUNTEERS
          </span>
          <h2 className="mt-char-animation">Our Volunteers</h2>
        </div>
        <div className="row">
          {volunteers.map((volunteer, index) => (
            <div key={index} className="col-xl-4 col-lg-6 col-md-6">
              <div className="volunter-items">
                <div className="volunter-image">
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    src={volunteer.image}
                    alt={volunteer.name}
                  />
                  <div className="volunter-content text-center">
                    <h3>
                      <Link href="/team-details">{volunteer.name}</Link>
                    </h3>
                    <p>{volunteer.role}</p>
                  </div>
                  <div className="social-icon d-flex align-items-center">
                    {volunteer.social.map((s, i) => (
                      <a key={i} href={s.link}>
                        <i className={s.icon} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const VolunteersPage = () => {
  const volunteers: {
    name: string;
    role: string;
    image: string;
    socialLinks: { platform: string; link: string; iconClass: string }[];
    delay: string;
  }[] = [
    {
      name: "Shikhon Islam",
      role: "Volunteer",
      image: "/assets/img/volunter/01.jpg",
      delay: ".3s",
      socialLinks: [
        { platform: "facebook", link: "#", iconClass: "fab fa-facebook-f" },
        { platform: "twitter", link: "#", iconClass: "fab fa-twitter" },
        { platform: "vimeo", link: "#", iconClass: "fab fa-vimeo-v" },
        { platform: "pinterest", link: "#", iconClass: "fab fa-pinterest-p" },
      ],
    },
    {
      name: "Amelia Maeve",
      role: "Volunteer",
      image: "/assets/img/volunter/02.jpg",
      delay: ".5s",
      socialLinks: [
        { platform: "facebook", link: "#", iconClass: "fab fa-facebook-f" },
        { platform: "twitter", link: "#", iconClass: "fab fa-twitter" },
        { platform: "vimeo", link: "#", iconClass: "fab fa-vimeo-v" },
        { platform: "pinterest", link: "#", iconClass: "fab fa-pinterest-p" },
      ],
    },
    {
      name: "Salman Islam",
      role: "Volunteer",
      image: "/assets/img/volunter/03.jpg",
      delay: ".7s",
      socialLinks: [
        { platform: "facebook", link: "#", iconClass: "fab fa-facebook-f" },
        { platform: "twitter", link: "#", iconClass: "fab fa-twitter" },
        { platform: "vimeo", link: "#", iconClass: "fab fa-vimeo-v" },
        { platform: "pinterest", link: "#", iconClass: "fab fa-pinterest-p" },
      ],
    },
    {
      name: "Samia Jultana",
      role: "Volunteer",
      image: "/assets/img/volunter/09.jpg",
      delay: ".3s",
      socialLinks: [
        { platform: "facebook", link: "#", iconClass: "fab fa-facebook-f" },
        { platform: "twitter", link: "#", iconClass: "fab fa-twitter" },
        { platform: "vimeo", link: "#", iconClass: "fab fa-vimeo-v" },
        { platform: "pinterest", link: "#", iconClass: "fab fa-pinterest-p" },
      ],
    },
    {
      name: "Shikhon Islam",
      role: "Volunteer",
      image: "/assets/img/volunter/08.jpg",
      delay: ".5s",
      socialLinks: [
        { platform: "facebook", link: "#", iconClass: "fab fa-facebook-f" },
        { platform: "twitter", link: "#", iconClass: "fab fa-twitter" },
        { platform: "vimeo", link: "#", iconClass: "fab fa-vimeo-v" },
        { platform: "pinterest", link: "#", iconClass: "fab fa-pinterest-p" },
      ],
    },
    {
      name: "Amelia Maeve",
      role: "Volunteer",
      image: "/assets/img/volunter/02.jpg",
      delay: ".7s",
      socialLinks: [
        { platform: "facebook", link: "#", iconClass: "fab fa-facebook-f" },
        { platform: "twitter", link: "#", iconClass: "fab fa-twitter" },
        { platform: "vimeo", link: "#", iconClass: "fab fa-vimeo-v" },
        { platform: "pinterest", link: "#", iconClass: "fab fa-pinterest-p" },
      ],
    },
  ];
  return (
    <section className="volunter-section fix section-padding">
      <div className="container">
        <div className="row g-4">
          {volunteers.map((vol, idx) => (
            <div
              key={idx}
              className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp"
              data-wow-delay={vol.delay}
            >
              <div className="volunter-items mt-0">
                <div className="volunter-image">
                  <img src={vol.image} alt={vol.name} />
                  <div className="volunter-content text-center">
                    <h3>
                      <Link href="/team-details">{vol.name}</Link>
                    </h3>
                    <p>{vol.role}</p>
                  </div>
                  <div className="social-icon d-flex align-items-center">
                    {vol.socialLinks.map((social, i) => (
                      <a key={i} href={social.link}>
                        <i className={social.iconClass} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
