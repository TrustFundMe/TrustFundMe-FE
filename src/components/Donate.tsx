export const Donate1 = () => {
  return (
    <section className="donate-now-section text-white section-padding">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-xl-12 text-center">
            <div className="section-title">
              <span className="sub-title text-white wow fadeInUp">
                <i className="far fa-heart" />
                Make Donation
              </span>
              <h2 className="mt-char-animation text-white" data-wow-delay=".3s">
                Miranda Halim Charity Fund
              </h2>
            </div>
          </div>
          <div className="col-xl-12 mt-3 mt-md-5 text-center">
            <div className="give-donate-form-wrap mt-4 mt-xl-0">
              <form action="#" className="row">
                <div className="col-12 wow fadeInUp" data-wow-delay=".5s">
                  {" "}
                  <button
                    type="button"
                    data-price-id={0}
                    className="give-donation-level-btn give-btn"
                    value={5}
                    data-default={0}
                  >
                    {" "}
                    $5{" "}
                  </button>
                  <button
                    type="button"
                    data-price-id={0}
                    className="give-donation-level-btn give-btn"
                    value={10}
                    data-default={0}
                  >
                    {" "}
                    $10{" "}
                  </button>{" "}
                  <button
                    type="button"
                    data-price-id={0}
                    className="give-donation-level-btn give-btn"
                    value={100}
                    data-default={0}
                  >
                    {" "}
                    $100
                  </button>{" "}
                  <button
                    type="button"
                    data-price-id="custom"
                    className="give-donation-level-btn give-btn give-btn-level-custom"
                    value="custom"
                  >
                    Custom{" "}
                  </button>
                </div>
                <div className="col-12 wow fadeInUp" data-wow-delay=".7s">
                  <button
                    type="button"
                    className="give-btn give-btn-modal theme-btn mt-3"
                  >
                    {" "}
                    <i className="far fa-heart me-2" />
                    Donate Now{" "}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
