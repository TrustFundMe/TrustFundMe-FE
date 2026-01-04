"use client";
import { useEffect, useState } from "react";

const Preloader = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    const handleLoad = () => {
      setIsLoaded(true);
      setTimeout(() => {
        setShouldHide(true);
      }, 900);
    };
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  if (shouldHide) return null;

  return (
    <div
      id="preloader"
      className={`preloader ${isLoaded ? "loaded" : ""}`}
      style={{
        opacity: isLoaded ? 0 : 1,
        transition: "opacity 600ms ease-in-out",
      }}
    >
      <div className="animation-preloader">
        <div className="spinner"></div>
        <div className="txt-loading">
          {["D", "A", "N", "B", "O", "X"].map((letter, index) => (
            <span
              key={index}
              data-text-preloader={letter}
              className="letters-loading"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
        <p className="text-center">Loading</p>
      </div>
      <div className="loader">
        <div className="row">
          <div className="col-3 loader-section section-left">
            <div className="bg" />
          </div>
          <div className="col-3 loader-section section-left">
            <div className="bg" />
          </div>
          <div className="col-3 loader-section section-right">
            <div className="bg" />
          </div>
          <div className="col-3 loader-section section-right">
            <div className="bg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
