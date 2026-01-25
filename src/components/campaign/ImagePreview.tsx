'use client';

import { useEffect, useMemo, useState } from 'react';

export default function ImagePreview({ file }: { file: File | null }) {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    if (!file) {
      setUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!file || !url) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={file.name} className="h-40 w-full object-cover" />
    </div>
  );
}
