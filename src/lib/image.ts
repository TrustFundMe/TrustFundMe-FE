export const normalizeImageSrc = (src: string | number | null | undefined): string | null => {
  if (src === null || src === undefined) return null;
  const s = String(src).trim();
  if (!s) return null;

  // If it's just a number (like an ID), it's not a valid src
  if (/^\d+$/.test(s)) return null;

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
