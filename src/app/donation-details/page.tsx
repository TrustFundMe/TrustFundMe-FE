import PageBanner from "@/components/PageBanner";
import DanboxLayout from "@/layout/DanboxLayout";
import Image from "next/image";

const CausesPage = () => {
  return (
    <DanboxLayout>
      <PageBanner pageName="Donation" pageTitle="Make Donation" />
      <div className="causes-details-wrapper fix section-padding">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-12">
              <div className="causes-details-items">
                <div className="details-image">
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    src="/assets/img/donation/donation_bg.jpg"
                    alt="img"
                  />
                </div>
                <div className="details-content style-2">
                  <span className="sub-text">
                    <i className="far fa-heart" /> water
                  </span>
                  <h2>Somalian People Need Pure Water</h2>
                  <div className="progress-items">
                    <div className="progress">
                      <div
                        className="progress-bar"
                        data-wow-duration=".9s"
                        role="progressbar"
                        style={{ width: "80%" }}
                        aria-valuenow={95}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <div className="cause-amount d-flex">
                      <div className="price-raised">
                        <i className="fal fa-donate" />
                        <span>70</span> Raised
                      </div>
                      <div className="price-goal">
                        <i className="far fa-analytics" />
                        <span>$7000</span> Goal
                      </div>
                    </div>
                  </div>
                  <form action="#" className="give-form">
                    <div className="donate-amount-buttons give-donation-amount">
                      <span>5</span>
                      <span>10</span>
                      <span>20</span>
                      <span>50</span>
                      <span>100</span>
                      <span>custom</span>
                    </div>
                    <div className="give-payment-mode-select">
                      <h3>Select Payment Method</h3>
                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          id="method1"
                          name="paymentmode"
                          className="custom-control-input"
                        />{" "}
                        <label
                          className="custom-control-label"
                          htmlFor="method1"
                        >
                          Test Donation
                        </label>
                      </div>
                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          id="method2"
                          name="paymentmode"
                          className="custom-control-input"
                        />{" "}
                        <label
                          className="custom-control-label"
                          htmlFor="method2"
                        >
                          Offline Donation
                        </label>
                      </div>
                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          id="method3"
                          name="paymentmode"
                          className="custom-control-input"
                        />{" "}
                        <label
                          className="custom-control-label"
                          htmlFor="method3"
                        >
                          Credit Card
                        </label>
                      </div>
                    </div>
                    <div className="give-purchase-form-wrap">
                      <div className="row g-4">
                        <div className="col-md-4 col-12">
                          <div className="single-personal-info">
                            <label>First Name</label>
                            <input
                              type="text"
                              className="give-input"
                              id="name"
                              placeholder="Enter Name"
                            />
                          </div>
                        </div>
                        <div className="col-md-4 col-12">
                          <div className="single-personal-info">
                            <label htmlFor="lname">Last Name</label>
                            <input
                              type="text"
                              className="give-input"
                              id="lname"
                              placeholder="Enter Name"
                            />
                          </div>
                        </div>
                        <div className="col-md-4 col-12">
                          <div className="single-personal-info">
                            <label htmlFor="lname">Last Name</label>
                            <input
                              type="text"
                              className="give-input"
                              id="lname1"
                              placeholder="Enter Name"
                            />
                          </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-12">
                          <div className="single-personal-info">
                            <label htmlFor="paddress">
                              Own Address <span>(Optional)</span>
                            </label>
                            <input
                              type="text"
                              className="give-input"
                              id="paddress"
                              placeholder="Your Address"
                            />
                          </div>
                        </div>
                        <div className="col-md-6 col-12">
                          <div className="single-personal-info">
                            <label htmlFor="email">Email Address</label>
                            <input
                              type="email"
                              className="give-input"
                              id="email"
                              placeholder="Enter Email"
                            />
                          </div>
                        </div>
                        <div className="col-md-12 col-12">
                          <div className="donate-total-amount">
                            <div className="give-donation-total-label">
                              Donation Total:
                            </div>
                            <div className="give-final-total-amount">
                              <span>$</span>10
                            </div>
                            <button
                              type="submit"
                              className="theme-btn mt-4 mt-md-0"
                            >
                              <i className="far fa-heart" />
                              Donate Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DanboxLayout>
  );
};

export default CausesPage;
