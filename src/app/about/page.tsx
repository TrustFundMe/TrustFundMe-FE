import { About1, About2 } from "@/components/About";
import { CounterSection1 } from "@/components/CounterSection";
import { Cta2, Cta5 } from "@/components/Cta";
import { Gallery1 } from "@/components/Gallery";
import { Team2 } from "@/components/Team";
import DanboxLayout from "@/layout/DanboxLayout";

const AboutPage = () => {
  return (
    <DanboxLayout header={4}>
      <Team2 />
      <About2 containerClass="section-padding pb-0" />
      <CounterSection1 />

    </DanboxLayout>
  );
};

export default AboutPage;
