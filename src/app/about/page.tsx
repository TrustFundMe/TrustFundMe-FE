import { About1, About2 } from "@/components/About";
import { CounterSection1 } from "@/components/CounterSection";
import { Cta2, Cta5 } from "@/components/Cta";
import { Gallery1 } from "@/components/Gallery";
import PageBanner from "@/components/PageBanner";
import { Team2 } from "@/components/Team";
import DanboxLayout from "@/layout/DanboxLayout";

const AboutPage = () => {
  return (
    <DanboxLayout>
      <PageBanner pageName="About Us" />
      <About1 />
      <Cta5 />
      <About2 containerClass="section-padding pb-0" />
      <CounterSection1 />
      <Team2 />
      <Gallery1 />
      <Cta2 />
    </DanboxLayout>
  );
};

export default AboutPage;
