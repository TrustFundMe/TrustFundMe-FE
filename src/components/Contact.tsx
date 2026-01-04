export const Contact1 = () => {
  return (
    <section className="contact-section fix section-padding">
      <div className="container">
        <div className="contact-wrapper-4">
          <div className="row align-items-center">
            <div className="col-xl-6 col-lg-6" />
            <div className="col-xl-6 col-lg-6">
              <div className="contact-section">
                <div className="section-title">
                  <span className="sub-title color-2 wow fadeInUp">
                    <i className="far fa-heart" />
                    get a quote
                  </span>
                  <h2 className="mt-char-animation">Contact Us</h2>
                </div>
                <div className="contact-right mt-4 mt-md-0">
                  <form action="#" id="contact-form" method="POST">
                    <div className="row g-4">
                      <div
                        className="col-lg-6 wow fadeInUp"
                        data-wow-delay=".2"
                      >
                        <div className="form-clt">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Your Name"
                          />
                        </div>
                      </div>
                      <div
                        className="col-lg-6 wow fadeInUp"
                        data-wow-delay=".4"
                      >
                        <div className="form-clt">
                          <input
                            type="text"
                            name="email"
                            id="email"
                            placeholder="Email Address"
                          />
                        </div>
                      </div>
                      <div
                        className="col-lg-6 wow fadeInUp"
                        data-wow-delay=".6"
                      >
                        <div className="form-clt">
                          <input
                            type="text"
                            name="phone"
                            id="phone"
                            placeholder="Phone Number"
                          />
                        </div>
                      </div>
                      <div
                        className="col-lg-6 wow fadeInUp"
                        data-wow-delay=".7"
                      >
                        <div className="form-clt">
                          <div className="nice-select" tabIndex={0}>
                            <span className="current">Subject</span>
                            <ul className="list">
                              <li data-value={1} className="option selected">
                                Volunteer
                              </li>
                              <li data-value={1} className="option">
                                Donations
                              </li>
                              <li data-value={1} className="option">
                                Foods Support
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div
                        className="col-lg-12 wow fadeInUp"
                        data-wow-delay=".8"
                      >
                        <div className="form-clt-big form-clt">
                          <textarea
                            name="message"
                            id="message"
                            placeholder="Write a Message"
                            defaultValue={""}
                          />
                        </div>
                      </div>
                      <div
                        className="col-lg-6 wow fadeInUp"
                        data-wow-delay=".9"
                      >
                        <button type="submit" className="theme-btn">
                          Get A Quote <i className="far fa-long-arrow-right" />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="map-item">
        <div className="google-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6678.7619084840835!2d144.9618311901502!3d-37.81450084255415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642b4758afc1d%3A0x3119cc820fdfc62e!2sEnvato!5e0!3m2!1sen!2sbd!4v1641984054261!5m2!1sen!2sbd"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};
