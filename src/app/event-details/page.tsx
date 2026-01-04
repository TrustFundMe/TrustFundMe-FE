import PageBanner from "@/components/PageBanner";
import DanboxLayout from "@/layout/DanboxLayout";
import Link from "next/link";

const CausesPage = () => {
  return (
    <DanboxLayout>
      <PageBanner pageName="Events Details" />
      <section className="event-details-section fix section-padding">
        <div className="container">
          <div className="event-details-wrapper">
            <div className="row g-5">
              <div className="col-12 col-lg-12">
                <div className="event-fetaured-thumb">
                  <img
                    src="assets/img/event/event-details.jpg"
                    alt="event details"
                  />
                </div>
              </div>
              <div className="col-12 col-lg-7 col-xl-8">
                <div className="event-details-contents">
                  <p>
                    t This website is part of Mitsubishi Power's continuous
                    efforts to improve communications with existing and
                    potential customers and other interested parties globally.
                    Aligned with that business purpose and for most effective
                    utilization.
                  </p>
                  <p>
                    The language, at its very core, emphasised extensively on
                    code readability. With its concise and expressive syntax, it
                    allowed developers to express ideas and concepts without
                    writing tons of lines code (as would be the case in
                    lower-level languages like C or Java). Its simplicity a
                    given, Python seamlessly integrates with other programming
                    languages (like offloading CPU-intensive tasks to C/C++),
                    making it an added bonus to polyglot developers.
                  </p>
                  <blockquote className="wp-block-quote">
                    <h3>
                      One of the main driving points behind Python’s meteoric
                      growth.
                    </h3>
                    <span>
                      Miranda H. <span>-Founder</span>
                    </span>
                  </blockquote>
                  <p>
                    Among the major reasons why Python is “slow”, it really
                    boils down to 2 — Python is interpreted as opposed to
                    compiled, ultimately leading to slower execution times; and
                    the fact that it is dynamically typed (data types of
                    variables are automatically inferred by Python during
                    execution). Take, for example, TensorFlow, a Machine
                    Learning library available in Python. These libraries were
                    actually written in C++ and made available in Python, sort
                    of forming a Python “wrapper” around the C++ implementation.
                    The same goes for Numpy and, to an extent, even Caer. One of
                    the major reasons for Python’s slowness is the presence of
                    GIL (Global Interpreter Lock) which allows only one thread
                    to execute at a time. While this boosts the performance of
                    single threading, it places a limitation on parallelism
                    where developers have to implement multiprocessing programs
                    as opposed to multi-threaded ones, to improve speeds.
                  </p>
                  <div className="row">
                    <div className="col-md-6 col-12">
                      <img src="assets/img/event/eventd1.jpg" alt="img" />
                    </div>
                    <div className="col-md-6 col-12">
                      <img src="assets/img/event/eventd2.jpg" alt="img" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-5 col-xl-4">
                <div className="event-details-sidebar">
                  <div
                    className="single-event-sidebar wow fadeInUp"
                    style={{ visibility: "visible", animationName: "fadeInUp" }}
                  >
                    <div className="sidebar-title">
                      <h3>Event Details</h3>
                    </div>
                    <div className="event-address-info">
                      <div className="single-address-info">
                        <div className="icon icon1">
                          <i className="fal fa-map-marker-alt" />
                        </div>
                        <div className="address">
                          <p>12/A, Miranda Halim City Town Hall, NYC</p>
                        </div>
                      </div>
                      <div className="single-address-info">
                        <div className="icon icon2">
                          <i className="fal fa-envelope" />
                        </div>
                        <div className="address">
                          <p>info@webmail.com</p>
                        </div>
                      </div>
                      <div className="single-address-info">
                        <div className="icon icon3">
                          <i className="fal fa-phone" />
                        </div>
                        <div className="address">
                          <p>908-098-098-09</p>
                        </div>
                      </div>
                      <Link
                        href="/event-details"
                        className="theme-btn transparent-btn-2"
                      >
                        Book Your Seat
                      </Link>
                    </div>
                  </div>
                  <div className="single-event-sidebar wow fadeInUp">
                    <div className="sidebar-title">
                      <h3>Special Guest</h3>
                    </div>
                    <div className="special-guest-list">
                      <div className="single-guest-info">
                        <div
                          className="profile-img"
                          style={{
                            backgroundImage:
                              'url("assets/img/event/guest1.jpg")',
                          }}
                        />
                        <div className="guest-bio">
                          <h5>Kinlon K. Karlo</h5>
                          <span>Speaker</span>
                        </div>
                      </div>
                      <div className="single-guest-info">
                        <div
                          className="profile-img"
                          style={{
                            backgroundImage:
                              'url("assets/img/event/guest2.jpg")',
                          }}
                        />
                        <div className="guest-bio">
                          <h5>Salman Khan</h5>
                          <span>Actor</span>
                        </div>
                      </div>
                      <div className="single-guest-info">
                        <div
                          className="profile-img"
                          style={{
                            backgroundImage:
                              'url("assets/img/event/guest3.jpg")',
                          }}
                        />
                        <div className="guest-bio">
                          <h5>Joy Roy</h5>
                          <span>Speaker</span>
                        </div>
                      </div>
                      <div className="single-guest-info">
                        <div
                          className="profile-img"
                          style={{
                            backgroundImage:
                              'url("assets/img/event/guest4.jpg")',
                          }}
                        />
                        <div className="guest-bio">
                          <h5>Ismail IRF</h5>
                          <span>Actor</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="event-map-wrap wow fadeInUp"
                    style={{ visibility: "visible", animationName: "fadeInUp" }}
                  >
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6678.7619084840835!2d144.9618311901502!3d-37.81450084255415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642b4758afc1d%3A0x3119cc820fdfc62e!2sEnvato!5e0!3m2!1sen!2sbd!4v1641984054261!5m2!1sen!2sbd"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
};

export default CausesPage;
