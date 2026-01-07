export const CounterSection1 = () => {
  // NOTE: Removed icons + animated counters per requirement (no icons, simple UI).
  // NOTE: Values are placeholders to be replaced when real-time data is available.

  const counterData: {
    label: string;
    value: string;
    delay: string;
  }[] = [
    {
      label: "Total Funds Raised",
      value: "$XX,XXX,XXX VND",
      delay: ".2s",
    },
    {
      label: "Total Disbursed",
      value: "$XX,XXX,XXX VND",
      delay: ".4s",
    },
    {
      label: "Verified Expenses",
      value: "XXXX Invoices",
      delay: ".6s",
    },
    {
      label: "Active Donors",
      value: "XXX Users",
      delay: ".8s",
    },
  ];
  return (
    <section className="counter-section section-padding">
      <div className="container">
        <div className="counter-wrapper">
          {counterData.map((item, index) => (
            <div
              key={index}
              className="counter-items wow fadeInUp"
              data-wow-delay={item.delay}
            >
              <div className="content">
                <h2>
                  <span className="count">{item.value}</span>
                </h2>
                <p>{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
