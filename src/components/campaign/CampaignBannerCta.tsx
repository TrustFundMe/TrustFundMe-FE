'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContextProxy';

type Props = {
  label: string;
  className?: string;
  toWhenAuthed: string;
  toWhenGuest: string;
  returnTo?: string;
};

import ShapeBlur from '@/components/ui/ShapeBlur';

export default function CampaignBannerCta({ label, className, toWhenAuthed, toWhenGuest, returnTo }: Props) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        if (isAuthenticated) {
          router.push(toWhenAuthed);
          return;
        }

        const href = returnTo
          ? `${toWhenGuest}?returnTo=${encodeURIComponent(returnTo)}`
          : toWhenGuest;
        router.push(href);
      }}
      className={`relative overflow-hidden group ${className}`}
    >
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150">
        <ShapeBlur
          variation={0}
          pixelRatioProp={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
          shapeSize={1.5}
          roundness={0.5}
          borderSize={0.05}
          circleSize={0.3}
          circleEdge={0.5}
        />
      </div>
      <span className="relative z-10">{label}</span>
    </button>
  );
}
