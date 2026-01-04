"use client";
import useClickOutside from "@/utility/useClickOutside";
import { useEffect, useState } from "react";
const ImgViews = ({
  close,
  src,
}: {
  close: (value: boolean) => void;
  src: string;
}) => {
  const ref = useClickOutside(() => close(false));
  return (
    <>
      <div className="mfp-bg mfp-ready" onClick={() => close(false)} />
      <div
        className="mfp-wrap mfp-close-btn-in mfp-auto-cursor mfp-ready"
        tabIndex={-1}
        style={{ overflow: "hidden auto" }}
      >
        <div className="mfp-container mfp-s-ready mfp-iframe-holder mfp-img-container">
          <div
            className="mfp-content"
            ref={ref as React.RefObject<HTMLDivElement>}
          >
            <div className="mfp-iframe-scaler">
              <img className="mfp-img" src={src} alt="Preview" />
            </div>
          </div>
          <div className="mfp-preloader">Loading...</div>
        </div>
      </div>
    </>
  );
};

const ImageView = () => {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (a && a.href.includes("img") && !a.hasAttribute("download")) {
        e.preventDefault();
        setSrc(a.href);
      }
    };
    const links = document.querySelectorAll("a");
    setTimeout(
      () => links.forEach((a) => a.addEventListener("click", handler)),
      1500
    );
    return () => links.forEach((a) => a.removeEventListener("click", handler));
  }, []);
  return src && <ImgViews src={src} close={() => setSrc(null)} />;
};
export default ImageView;
