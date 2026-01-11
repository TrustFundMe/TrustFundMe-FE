'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const members = [
  {
    name: 'Tấn Thép',
    role: 'Founder & CEO',
    avatar: '/assets/img/volunter/01.jpg',
    link: '#',
  },
  {
    name: 'Hồng Hạnh',
    role: 'Founder & CEO',
    avatar: '/assets/img/volunter/02.jpg',
    link: '#',
  },
  {
    name: 'Đoan Trinh',
    role: 'Founder & CEO',
    avatar: '/assets/img/volunter/03.jpg',
    link: '#',
  },
  {
    name: 'Thắng Hùng',
    role: 'Founder & CEO',
    avatar: '/assets/img/volunter/04.jpg',
    link: '#',
  },
];

export default function SimpleTeamSection() {
  return (
    <section className="bg-gray-50 py-20 md:py-32 dark:bg-transparent">
      <div className="mx-auto max-w-6xl border-t px-6">
        <span className="-ml-6 -mt-3.5 block w-max bg-gray-50 px-6 text-sm text-gray-600 dark:bg-gray-950">
          Team
        </span>
        
        <motion.div 
          className="mt-12 gap-8 sm:grid sm:grid-cols-2 md:mt-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="sm:w-4/5">
            <h2 className="text-3xl font-bold text-[#202426] sm:text-4xl lg:text-5xl">
              Meet our team
            </h2>
          </div>
          <div className="mt-6 sm:mt-0">
            <p className="text-gray-600 leading-relaxed">
              Dedicated professionals committed to bringing transparency and trust to charitable giving in Vietnam. Together, we're building a platform that ensures every donation makes a real impact.
            </p>
          </div>
        </motion.div>

        <div className="mt-12 md:mt-24">
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member, index) => (
              <motion.div
                key={index}
                className="relative group bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Image Container - 1:1 aspect ratio, expands on hover */}
                <div className="w-full aspect-square rounded-t-xl overflow-hidden transition-all duration-500 ease-in-out">
                  <Image
                    className="h-full w-full scale-105 group-hover:scale-100 grayscale group-hover:grayscale-0 object-cover object-center transition-all duration-500 ease-in-out"
                    src={member.avatar}
                    alt={member.name}
                    width={400}
                    height={400}
                  />
                </div>
                
                {/* Info Section - fixed height with visible overflow for debugging */}
                <article className="relative overflow-hidden h-24 bg-white dark:bg-black">
                  {/* Default Info - slides up on hover */}
                  <div className="absolute inset-0 p-4 translate-y-0 group-hover:-translate-y-full transition-transform duration-500 ease-in-out">
                    <p className="text-lg font-semibold text-[#202426] dark:text-white">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {member.role}
                    </p>
                  </div>
                  
                  {/* Hover Text - slides up from bottom */}
                  <div className="absolute inset-0 p-4 flex items-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out">
                    <p className="text-2xl font-bold text-[#202426] dark:text-white">
                      {member.role}
                    </p>
                  </div>
                </article>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
