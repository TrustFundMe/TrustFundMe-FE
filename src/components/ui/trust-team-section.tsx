'use client';

import { ScrollAnimation, ScrollScale, ScrollTranslateX, ScrollTranslateY } from "@/components/ui/team-section";
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TeamMember {
  avatar: string;
  name: string;
  role: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    avatar: '/assets/img/volunter/01.jpg',
    name: 'Đan Trường',
    role: 'Founder & CEO',
  },
  {
    avatar: '/assets/img/volunter/02.jpg',
    name: 'Minh Anh',
    role: 'CTO',
  },
  {
    avatar: '/assets/img/volunter/03.jpg',
    name: 'Hoàng Long',
    role: 'Head of Operations',
  },
  {
    avatar: '/assets/img/volunter/04.jpg',
    name: 'Thu Hà',
    role: 'Community Manager',
  },
];

export function TeamCard({
  member,
  className,
  ...props
}: React.ComponentProps<'div'> & { member: TeamMember }) {
  return (
    <div className={cn('space-y-4 group', className)} {...props}>
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src={member.avatar}
          alt={member.name}
          width={400}
          height={400}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A685B]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="space-y-1 pb-4 px-2">
        <h3 className="text-xl font-bold text-[#202426] group-hover:text-[#000000] transition-colors">
          {member.name}
        </h3>
        <h4 className="text-gray-600">{member.role}</h4>
      </div>
    </div>
  );
}

export default function TrustTeamSection() {
  return (
    <ScrollAnimation className="overflow-hidden bg-white">
      <ScrollTranslateY className="min-h-svh flex flex-col justify-center items-center gap-8 py-20">
        <div className="w-full px-4">
          <ScrollTranslateX
            xRange={['-100%', '0%']}
            inputRange={[0.3, 0.8]}
            className="origin-bottom flex flex-nowrap gap-6"
          >
            {TEAM_MEMBERS.map((member, index) => (
              <TeamCard
                className="min-w-[70vw] sm:min-w-[45vw] md:min-w-[30vw] lg:min-w-[22vw] bg-white border-2 border-gray-100 rounded-3xl p-4 hover:border-[#F84D43] hover:shadow-2xl transition-all duration-300"
                key={index}
                member={member}
              />
            ))}
          </ScrollTranslateX>
        </div>

        <ScrollScale
          inputRange={[0, 0.5]}
          scaleRange={[1.3, 1]}
          className="w-11/12 md:w-10/12 flex flex-col justify-center text-center items-center mx-auto origin-center px-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#202426] mb-4">
            Meet our team of{' '}
            <span className="bg-gradient-to-r from-[#F84D43] to-[#FF6B6B] bg-clip-text text-transparent">
              changemakers
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mt-4">
            Dedicated professionals committed to bringing transparency and trust to charitable giving in Vietnam
          </p>
        </ScrollScale>

        <div className="w-full px-4">
          <ScrollTranslateX
            inputRange={[0.3, 0.8]}
            xRange={['50%', '-100%']}
            className="flex flex-nowrap gap-6"
          >
            {TEAM_MEMBERS.map((member, index) => (
              <TeamCard
                className="min-w-[70vw] sm:min-w-[45vw] md:min-w-[30vw] lg:min-w-[22vw] bg-white border-2 border-gray-100 rounded-3xl p-4 hover:border-[#F84D43] hover:shadow-2xl transition-all duration-300"
                key={index}
                member={member}
              />
            ))}
          </ScrollTranslateX>
        </div>
      </ScrollTranslateY>
    </ScrollAnimation>
  );
}
