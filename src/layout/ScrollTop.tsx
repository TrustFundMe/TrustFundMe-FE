"use client";
import { useScrollTop } from "@/utility";
const ScrollTop = () => {
  useScrollTop();
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <div className="scroll-up" onClick={handleClick}>
      <svg
        className="scroll-circle svg-content"
        width="100%"
        height="100%"
        viewBox="-1 -1 102 102"
      >
        <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
      </svg>
    </div>
  );
};

export default ScrollTop;
