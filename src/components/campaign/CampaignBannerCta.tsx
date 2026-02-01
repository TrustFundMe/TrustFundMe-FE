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
      className={className}
    >
      {label}
    </button>
  );
}
