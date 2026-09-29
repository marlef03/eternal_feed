import React from "react";

export default function useOutsideClick(
  ref: React.RefObject<Element | null>,
  callback: () => void,
) {
  React.useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Element)) {
        callback();
      }
    };

    window.addEventListener("mousedown", listener);

    return () => {
      window.removeEventListener("mousedown", listener);
    };
  }, [ref, callback]);
}
