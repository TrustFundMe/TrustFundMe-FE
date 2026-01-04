import PageBanner from "@/components/PageBanner";
import DanboxLayout from "@/layout/DanboxLayout";
import Image from "next/image";

const CausesPage = () => {
  return (
    <DanboxLayout>
      <PageBanner pageName="Volunteer Details" />
      <section className="team-details-section fix section-padding">
        <div className="container">
          <div className="team-details-wrapper">
            <div className="row g-4 align-items-center">
              <div className="col-lg-5">
                <div className="team-details-image">
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ height: "auto", width: "100%" }}
                    src="/assets/img/volunter/details.jpg"
                    alt="team-img"
                  />
                </div>
              </div>
              <div className="col-lg-7">
                <div className="team-details-content">
                  <div className="details-info">
                    <h3>Shikhon Haque</h3>
                    <span>Software Engineer</span>
                  </div>
                  <p className="mt-3">
                    Mauris sapien neque, placerat ut dolor nec, egestas
                    tincidunt felis. Sed in ornare quam, finibus dui aliquam
                    justo duis eros quam, semper at libero sed, vehicula the
                    consequat arcu. In ornare, enim at egestas bibendum, ligula
                    ante congue arcu, sed ornare sem nulla is nec magna. Morbi
                    faucibus.
                  </p>
                  <div className="progress-area mt-4">
                    <div className="progress-wrap">
                      <div className="pro-items">
                        <div className="pro-head">
                          <h6 className="title">Quick Fundraiser</h6>
                          <span className="point">90%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            data-wow-duration=".9s"
                            role="progressbar"
                            style={{ width: "90%" }}
                            aria-valuenow={95}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <div className="pro-items">
                        <div className="pro-head">
                          <h6 className="title">Donation</h6>
                          <span className="point">95%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            data-wow-duration=".9s"
                            role="progressbar"
                            style={{ width: "85%" }}
                            aria-valuenow={95}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="social-icon">
                    <span>Social Media:</span>
                    <a href="#">
                      <i className="fab fa-facebook-f" />
                    </a>
                    <a href="#">
                      <i className="fab fa-twitter" />
                    </a>
                    <a href="#">
                      <i className="fab fa-linkedin-in" />
                    </a>
                    <a href="#">
                      <i className="fab fa-pinterest-p" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="team-single-history pt-5">
              <div className="title">
                <h3>Education Background</h3>
              </div>
              <h5 className="pt-5">
                Diploma in Web Design <span>2012 - 2014</span>
              </h5>
              <p className="mt-3">
                Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's in the ou standard
                dummy text ever since the 1500s, when an unknown printer
                took.Ipsum is simply dummy text of the printing and type setting
                industry. Lorem Ipsum has been the industry's in the abouti
                standard dummy
              </p>
              <h5 className="pt-5">
                Degree in UI/UX Design <span>2015 - 2016 </span>
              </h5>
              <p className="mt-3">
                Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's in the ou standard
                dummy text ever since the 1500s, when an unknown printer
                took.Ipsum is simply dummy text of the printing and type setting
                industry. Lorem Ipsum has been the industry's in the abouti
                standard dummy
              </p>
            </div>
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
};

export default CausesPage;
