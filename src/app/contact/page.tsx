import PageBanner from "@/components/PageBanner";
import DanboxLayout from "@/layout/DanboxLayout";

const ContactPage = () => {
  return (
    <DanboxLayout>
      <PageBanner pageName="Contact Us" />
      <section className="contact-page-wrap section-padding">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <div
              className="col-lg-4 col-md-6 col-12 wow fadeInUp"
              data-wow-delay=".3s"
            >
              <div className="single-contact-card card1 h-100 d-flex flex-column">
                <div className="top-part">
                  <div className="icon">
                    <i className="fal fa-envelope" />
                  </div>
                  <div className="title">
                    <h4>Email Address</h4>
                    <span>Send us an email anytime</span>
                  </div>
                </div>
                <div className="bottom-part mt-auto">
                  <div className="info">
                    <p>support@trustfundme.vn</p>
                    <p>contact@trustfundme.vn</p>
                  </div>
                  <div className="icon">
                    <i className="fal fa-arrow-right" />
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-lg-4 col-md-6 col-12 wow fadeInUp"
              data-wow-delay=".5s"
            >
              <div className="single-contact-card card2 h-100 d-flex flex-column">
                <div className="top-part">
                  <div className="icon">
                    <i className="fal fa-phone" />
                  </div>
                  <div className="title">
                    <h4>Phone Number</h4>
                    <span>Call us during business hours</span>
                  </div>
                </div>
                <div className="bottom-part mt-auto">
                  <div className="info">
                    <p>+84 (028) 7300 5588</p>
                    <p>+84 (024) 7300 1866</p>
                  </div>
                  <div className="icon">
                    <i className="fal fa-arrow-right" />
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-lg-4 col-md-6 col-12 wow fadeInUp"
              data-wow-delay=".7s"
            >
              <div className="single-contact-card card3 h-100 d-flex flex-column">
                <div className="top-part">
                  <div className="icon">
                    <i className="fal fa-map-marker-alt" />
                  </div>
                  <div className="title">
                    <h4>Office Address</h4>
                    <span>Visit us at FPT University</span>
                  </div>
                </div>
                <div className="bottom-part mt-auto">
                  <div className="info">
                    <p>FPT University HCMC</p>
                    <p>Thủ Đức City, Ho Chi Minh</p>
                  </div>
                  <div className="icon">
                    <i className="fal fa-arrow-right" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="office-google-map-wrapper wow fadeInUp">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4544374621546!2d106.80730807480588!3d10.84127258931176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527587469f64d%3A0xf15f5aad773c112b!2sFPT%20University%20HCMC!5e0!3m2!1sen!2s!4v1705234567890!5m2!1sen!2s"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
            />
          </div>
        </div>
      </section>
      <section className="contact-section-2 fix section-padding pt-0">
        <div className="container">
          <div className="main-contact-form-items">
            <div className="section-title text-center">
              <span className="sub-title color-2 wow fadeInUp">
                <i className="fal fa-pen" />
                Get In Touch
              </span>
              <h2 className="mt-char-animation">Send Us a Message</h2>
              <p className="mt-3">
                Have questions about our platform? Want to start a campaign or make a donation?
                <br />
                We&apos;re here to help you make a difference.
              </p>
            </div>
            <form
              action="#"
              id="contact-form"
              method="POST"
              className="mt-4 mt-md-0"
            >
              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="form-clt">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Your Full Name*"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-clt">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Your Email Address*"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-clt">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      placeholder="Phone Number*"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-clt">
                    <select
                      name="subject"
                      id="subject"
                      className="form-select"
                      required
                      style={{
                        width: '100%',
                        padding: '15px 20px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '5px',
                        fontSize: '15px',
                        color: '#6b6b6b',
                        backgroundColor: '#fff',
                      }}
                    >
                      <option value="">Select Subject*</option>
                      <option value="general">General Inquiry</option>
                      <option value="donation">Donation Support</option>
                      <option value="campaign">Start a Campaign</option>
                      <option value="technical">Technical Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="report">Report an Issue</option>
                    </select>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="form-clt">
                    <textarea
                      name="message"
                      id="message"
                      placeholder="Write Your Message*"
                      rows={6}
                      required
                      defaultValue={""}
                    />
                  </div>
                </div>
                <div className="col-lg-12">
                  <button type="submit" className="theme-btn center d-block">
                    Send Message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
};

export default ContactPage;
