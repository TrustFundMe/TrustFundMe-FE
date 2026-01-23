import { About2 } from "@/components/About";
import { Causes2 } from "@/components/Causes";
import { CounterSection1 } from "@/components/CounterSection";
import { Cta2 } from "@/components/Cta";
import { Event2 } from "@/components/Event";
import { Faq2 } from "@/components/Faq";
import { Feature1 } from "@/components/Feature";
import { Gallery1 } from "@/components/Gallery";
import HeroSection9 from "@/components/HeroSection9";
import { News2 } from "@/components/News";
import { Projects1 } from "@/components/Projects";
import { Team2 } from "@/components/Team";
import { Testimonial2 } from "@/components/Testimonial";
import { TestimonialsNew } from "@/components/TestimonialsNew";
import DanboxLayout from "@/layout/DanboxLayout";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";

const Home = () => {
  return (
    <DanboxLayout header={2} footer={2}>
      <EmailVerificationBanner />
      <HeroSection9 />
      <About2 />
      <CounterSection1 />
      <Projects1 />
      <Feature1 />
      <Faq2 />
      {/* <Team2 /> */}
      <TestimonialsNew />

      <Cta2 />
    </DanboxLayout>
  );
};

export default Home;
