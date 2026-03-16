"use client";

import { useEffect, useRef, useState } from "react";
import { TestimonialsColumn } from "./ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "Nền tảng này giúp gây quỹ dễ hơn rất nhiều! Tôi đã gây quỹ được 15.000$ cho chi phí điều trị chỉ trong 3 tuần. Đội ngũ hỗ trợ cực kỳ tận tâm.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    name: "Nguyễn Thu Trang",
    role: "Chiến dịch y tế",
  },
  {
    text: "Chúng tôi đã gây quỹ thành công để sửa lại nhà sinh hoạt cộng đồng. Phí nền tảng minh bạch và quy trình rút tiền đơn giản giúp mọi thứ rất trơn tru.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    name: "Lê Hoàng Minh",
    role: "Dự án cộng đồng",
  },
  {
    text: "Trải nghiệm tuyệt vời! Nền tảng giúp chiến dịch tiếp cận được người ủng hộ khắp nơi. Chúng tôi vượt mục tiêu hơn 150%.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    name: "Phạm Hà My",
    role: "Quỹ giáo dục",
  },
  {
    text: "Tạo chiến dịch gây quỹ cực kỳ đơn giản. Chỉ sau vài giờ đã có những khoản ủng hộ đầu tiên. Tính năng chia sẻ mạng xã hội giúp lan tỏa rất nhanh.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    name: "Trần Quang Huy",
    role: "Cứu trợ khẩn cấp",
  },
  {
    text: "Sự uy tín của nền tảng giúp chúng tôi tạo được niềm tin với nhà hảo tâm. Chỉ trong 2 tháng, trạm cứu hộ động vật đã gây quỹ được 50.000$. ",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    name: "Vũ Thảo Nhi",
    role: "Bảo vệ động vật",
  },
  {
    text: "Nền tảng tuyệt vời! Ứng dụng di động giúp chúng tôi cập nhật cho người ủng hộ mọi lúc. Chiến dịch lan tỏa mạnh hơn cả mong đợi.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    name: "Đinh Quốc Bảo",
    role: "Hỗ trợ thiên tai",
  },
  {
    text: "Ban đầu tôi còn phân vân, nhưng nền tảng này thực sự là lựa chọn tốt nhất: phí minh bạch, giải ngân nhanh, đội ngũ hỗ trợ nhiệt tình.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    name: "Lâm Anh Thư",
    role: "Hộ kinh doanh nhỏ",
  },
  {
    text: "Tổ chức phi lợi nhuận của chúng tôi đã gây quỹ hơn 100.000$ nhờ nền tảng này. Bảng thống kê giúp tối ưu chiến lược truyền thông rất hiệu quả.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    name: "Ngô Đức Khánh",
    role: "Giám đốc tổ chức phi lợi nhuận",
  },
  {
    text: "Nền tảng gây quỹ tốt nhất mà tôi từng dùng! Dễ sử dụng, nhiều tính năng hữu ích và đội ngũ thực sự quan tâm đến thành công của chiến dịch.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    name: "Bùi Minh Ngọc",
    role: "Chiến dịch cá nhân",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const TestimonialsNew = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <section ref={sectionRef} className="bg-background section-padding relative" suppressHydrationWarning>
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <h2 
            className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-center transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Cộng đồng nói gì về TrustFundMe
          </h2>
          <p 
            className={`text-center mt-5 opacity-75 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-75 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Những câu chuyện có thật từ các chiến dịch đã gây quỹ thành công và tạo ra thay đổi tích cực thông qua nền tảng TrustFundMe.
          </p>
        </motion.div>

        <div 
          className={`flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};
