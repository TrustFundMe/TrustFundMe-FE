"use client";
import useClickOutside from "@/utility/useClickOutside";
import { Fragment, useEffect, useState } from "react";
import ReactPlayer from "react-player";

const VideoPopup_ = ({
  close,
  videoID,
}: {
  close: (value: boolean) => void;
  videoID: string;
}) => {
  const domRef = useClickOutside(() => close(false));

  return (
    <Fragment>
      <div className="mfp-bg mfp-ready" onClick={() => close(false)} />
      <div
        className="mfp-wrap mfp-close-btn-in mfp-auto-cursor mfp-ready"
        tabIndex={-1}
        style={{ overflow: "hidden auto" }}
      >
        <div className="mfp-container mfp-s-ready mfp-iframe-holder">
          <div
            className="mfp-content video-popup-content"
            ref={domRef as React.RefObject<HTMLDivElement>}
          >
            <button
              title="Close (Esc)"
              type="button"
              className="mfp-close"
              onClick={() => close(false)}
            >
              ×
            </button>
            <ReactPlayer src={videoID} width="100%" height="100%" />
          </div>
          <div className="mfp-preloader">Loading...</div>
        </div>
      </div>
    </Fragment>
  );
};

const VideoPopup = () => {
  const [video, setVideo] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (link && link.href.includes("https://www.youtube.com/")) {
        e.preventDefault();
        setVideo(link.href);
      }
    };
    document
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", handler));

    return () => {
      document
        .querySelectorAll("a")
        .forEach((a) => a.removeEventListener("click", handler));
    };
  }, []);

  return video && <VideoPopup_ close={() => setVideo(null)} videoID={video} />;
};

export default VideoPopup;
