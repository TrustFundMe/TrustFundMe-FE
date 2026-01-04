import { useEffect, useRef } from "react";

const useClickOutside = (handler: () => void) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [handler]);

  return ref;
};

export default useClickOutside;
