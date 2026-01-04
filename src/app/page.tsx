import { About1 } from "@/components/About";
import { Causes1 } from "@/components/Causes";
import { Contact1 } from "@/components/Contact";
import { Donate1 } from "@/components/Donate";
import { Event1 } from "@/components/Event";
import { Faq1 } from "@/components/Faq";
import { HeroSlider1 } from "@/components/HeroSlider";
import { News1 } from "@/components/News";
import { Service1 } from "@/components/Service";
import { Team1 } from "@/components/Team";
import { Testimonial1 } from "@/components/Testimonial";
import DanboxLayout from "@layout/DanboxLayout";

const page = () => {
  return (
    <DanboxLayout header={1} footer={1}>
      <HeroSlider1 />
      <About1 />
      <Service1 />
      <Faq1 />
      <Causes1 />
      <Donate1 />
      <Event1 />
      <Testimonial1 />
      <Team1 />
      <News1 />
      <Contact1 />
    </DanboxLayout>
  );
};

export default page;
