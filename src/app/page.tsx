import dynamic from "next/dynamic";
import DanboxLayout from "@/layout/DanboxLayout";

// Lazy-load heavy below-the-fold components — reduces initial JS bundle size
const EmailVerificationBanner = dynamic(
  () => import("@/components/EmailVerificationBanner").then(m => ({ default: m.EmailVerificationBanner }))
);
const HeroSection9 = dynamic(() => import("@/components/HeroSection9").then(m => ({ default: m.default })));
const About2 = dynamic(() => import("@/components/About").then(m => ({ default: m.About2 })));
const CounterSection1 = dynamic(() => import("@/components/CounterSection").then(m => ({ default: m.CounterSection1 })));
const Feature1 = dynamic(() => import("@/components/Feature").then(m => ({ default: m.Feature1 })));
const TestimonialsNew = dynamic(() => import("@/components/TestimonialsNew").then(m => ({ default: m.TestimonialsNew })));
const Cta2 = dynamic(() => import("@/components/Cta").then(m => ({ default: m.Cta2 })));

// REMOVED unused imports that were imported but never rendered:
// Causes2, Event2, Gallery1, News2, Team2, Testimonial2

const Home = () => {
  return (
    <DanboxLayout header={4} footer={2}>
      <EmailVerificationBanner />
      <HeroSection9 />
      <About2 />
      <CounterSection1 />
      <Feature1 />
      <TestimonialsNew />
      <Cta2 />
    </DanboxLayout>
  );
};

export default Home;
