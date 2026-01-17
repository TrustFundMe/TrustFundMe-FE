import Image from "next/image";
import Link from "next/link";

export default function CampaignsListBanner({
  categoryTitle,
  heading,
  description,
  image,
  backHref = "/campaigns",
  backLabel = "Quay lại",
}: {
  categoryTitle: string;
  heading: string;
  description: string;
  image: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#F84D43]">
          {categoryTitle}
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
          {heading}
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-xl">{description}</p>

        <div className="mt-6">
          <Link
            href={backHref}
            className="inline-flex items-center justify-center rounded-full bg-[#1A685B] px-6 py-3 text-sm font-bold text-white hover:bg-[#F84D43] transition-colors"
          >
            {backLabel}
          </Link>
        </div>
      </div>

      <div className="flex md:justify-end">
        <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-slate-200">
          <div className="relative aspect-[4/3]">
            <Image
              src={image}
              alt={categoryTitle}
              fill
              className="object-cover"
              priority={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
