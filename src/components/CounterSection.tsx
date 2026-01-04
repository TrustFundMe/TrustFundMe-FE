import Image from "next/image";
import Counter from "./Counter";

export const CounterSection1 = () => {
  const counterData: {
    icon: string;
    count: number;
    suffix?: string;
    unit?: string;
    title: string;
    delay: string;
    iconWidth: number;
  }[] = [
    {
      icon: "/assets/img/icon/c-1.png",
      iconWidth: 34,
      count: 5,
      suffix: "M",
      unit: "+",
      title: "Projects Done",
      delay: ".2s",
    },
    {
      icon: "/assets/img/icon/c-2.png",
      iconWidth: 50,
      count: 1,
      suffix: "M",
      unit: "+",
      title: "Hopeless Child",
      delay: ".4s",
    },
    {
      icon: "/assets/img/icon/c-3.png",
      iconWidth: 42,
      count: 99,
      unit: "+",
      title: "Team Member",
      delay: ".6s",
    },
    {
      icon: "/assets/img/icon/c-4.png",
      iconWidth: 42,
      count: 10,
      unit: "+",
      title: "Get Reards",
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
              <div className="icon">
                <Image
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: `${item.iconWidth}px`, height: "auto" }}
                  src={item.icon}
                  alt="img"
                />
              </div>
              <div className="content">
                <h2>
                  <span className="count">
                    <Counter end={item.count} />
                  </span>
                  {item.suffix && <span>{item.suffix}</span>}
                  {item.unit && <span>{item.unit}</span>}
                </h2>
                <p>{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
