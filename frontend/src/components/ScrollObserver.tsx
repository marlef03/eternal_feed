import React from "react";

function ScrollObserver({
  onEnter,
  onExit,
}: {
  onEnter?: (() => void) | undefined,
  onExit?: (() => void) | undefined,
}) {
  const elemRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const ref = elemRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (onEnter) onEnter();
        } else {
          if (onExit) onExit();
        }
      },
      { threshold: 1.0 },
    );

    if (ref) {
      observer.observe(ref);
    }

    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [onEnter, onExit]);

  return <div ref={elemRef} style={{ height: "1px" }}></div>;
}

export default ScrollObserver;
