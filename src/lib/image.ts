export const normalizeImageSrc = (src: string | null | undefined): string | null => {
  if (!src) return null;
  const s = String(src).trim();
  if (!s) return null;

  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return s;

  return null;
};

export const withFallbackImage = (
  src: string | null | undefined,
  fallback: string,
): string => {
  return normalizeImageSrc(src) ?? fallback;
};
