import Image from "next/image";
import Link from "next/link";

export type CampaignCardItem = {
  id: string;
  title: string;
  location: string;
  raised: number;
  goal: number;
  image: string;
};

export default function CampaignCard({ item }: { item: CampaignCardItem }) {
  const progress = Math.min(100, Math.round((item.raised / item.goal) * 100));

  return (
    <Link
      href="/campaigns-details"
      className="group relative block w-full overflow-hidden rounded-xl bg-slate-200 shadow-sm ring-1 ring-slate-200"
    >
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover"
          priority={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-2.5">
        <div className="flex flex-col gap-1">
          <div>
            <h3 className="text-sm font-bold leading-snug text-white line-clamp-2">
              {item.title}
            </h3>
            <p className="mt-0.5 text-xs text-white/90 line-clamp-1">
              {item.location}
            </p>
          </div>

          <div>
            <div className="h-1 w-full rounded-full bg-white/60 overflow-hidden">
              <div
                className="h-full bg-[#F84D43]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs font-semibold text-white">
              <span>{item.raised.toLocaleString()} USD</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
