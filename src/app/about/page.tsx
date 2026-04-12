"use client";

import { About2 } from "@/components/About";
import { CounterSection1 } from "@/components/CounterSection";
import { Team2 } from "@/components/Team";
import DanboxLayout from "@/layout/DanboxLayout";
import Particles from "@/components/ui/Particles";
import { motion } from "framer-motion";

const AboutPage = () => {
  return (
    <DanboxLayout header={4}>
      <div className="relative min-h-screen bg-white overflow-hidden">
        {/* Full Page Background Particles - Covers entire page with fixed positioning */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
          <Particles
            particleColors={["#1A685B", "#22C55E", "#4ADE80"]}
            particleCount={300}
            particleSpread={20}
            speed={0.15}
            particleBaseSize={180}
            moveParticlesOnHover={true}
            particleHoverFactor={1.5}
            alphaParticles={true}
            disableRotation={false}
            pixelRatio={1}
          />
        </div>
        
        <div className="relative z-10 pt-24">
          {/* Minimalist Hero Section without solid BG */}
          <section className="container mx-auto px-4 text-center py-20">
            <motion.span 
              className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold mb-6 tracking-wider uppercase border border-emerald-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Tâm huyết & Minh bạch
            </motion.span>
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Về Chúng Tôi
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed border-l-4 border-emerald-500 pl-6 text-left py-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              TrustFundMe được xây dựng với sứ mệnh kết nối những tấm lòng thiện nguyện, 
              đảm bảo mỗi đóng góp đều mang lại giá trị thực thi thông qua công nghệ minh bạch nhất.
            </motion.p>
          </section>

          {/* Team Section with custom styling to show particles */}
          <section className="py-24 relative">
            <div className="container mx-auto px-4 text-center mb-20">
              <motion.h2 
                className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tighter"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                KẾT NỐI VỚI NHỮNG NGƯỜI NHƯ BẠN
              </motion.h2>
              <motion.p 
                className="text-zinc-500 italic max-w-3xl mx-auto text-lg leading-relaxed bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-zinc-100 shadow-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                "Tìm kiếm và đồng hành cùng những người dẫn đầu đầy tâm huyết. Chúng tôi ở đây để giúp bạn kết nối với những chủ quỹ uy tín nhất, đảm bảo mọi sự đóng góp của bạn đều đi đúng hướng và tạo ra thay đổi thực sự."
              </motion.p>
            </div>
            
            {/* Team cards wrapper with semi-transparency */}
            <div className="relative z-10">
              <Team2 />
            </div>
          </section>

          {/* Other Sections with semi-transparency */}
          <section className="relative z-10 space-y-20 pb-20">
            <div className="bg-white/40 backdrop-blur-md border-y border-zinc-100">
               <About2 containerClass="section-padding pb-0" />
            </div>
            <div className="container mx-auto">
               <CounterSection1 />
            </div>
          </section>
        </div>
      </div>
    </DanboxLayout>
  );
};

export default AboutPage;
