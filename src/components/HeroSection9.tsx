'use client';

import HeroSection from '@/components/ui/hero-section-9';
// import { BackgroundDotsMasked } from '@/components/ui/background-dots-masked'; // Sóng đơn giản
import { BackgroundDotsWave } from '@/components/ui/background-dots-wave'; // Sóng phức tạp (ripple)

const HeroSection9 = () => {
  const heroData = {
    title: (
      <>
        Radical Transparency <br /> in Every Donation
      </>
    ),
    subtitle: 'Track your impact in real-time with Vietnam\'s first AI-powered charity management platform. 100% financial disclosure, no exceptions.',
    actions: [
      {
        text: 'Donate Now',
        onClick: () => window.location.href = '/donation-details',
        variant: 'default' as const,
        className: 'bg-[#F84D43] hover:bg-[#1A685B] text-white border-none shadow-none transition-all duration-300 text-lg px-10 py-6 font-bold rounded-lg',
      },
      {
        text: 'View Communication',
        onClick: () => window.location.href = '/post',
        variant: 'outline' as const,
        className: 'border-2 border-[#1A685B] text-[#1A685B] hover:bg-[#1A685B] hover:text-white shadow-none transition-all duration-300 text-lg px-10 py-6 font-bold rounded-lg',
      },
      {
        text: 'Start a Campaign',
        onClick: () => window.location.href = '/causes',
        variant: 'outline' as const,
        className: 'border-2 border-[#1A685B] text-[#1A685B] hover:bg-[#1A685B] hover:text-white shadow-none transition-all duration-300 text-lg px-10 py-6 font-bold rounded-lg',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop',
    ],
  };

  return (
    <div className="w-full bg-white relative">
      <BackgroundDotsWave />
      <HeroSection
        title={heroData.title}
        subtitle={heroData.subtitle}
        actions={heroData.actions}
        images={heroData.images}
      />
    </div>
  );
};

export default HeroSection9;
