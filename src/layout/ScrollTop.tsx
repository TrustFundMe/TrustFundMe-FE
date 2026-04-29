"use client";
import { useScrollTop } from "@/utility";
import { ChevronUpIcon } from "@radix-ui/react-icons";
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
      <span className="scroll-up-icon" aria-hidden>
        <ChevronUpIcon />
      </span>
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
