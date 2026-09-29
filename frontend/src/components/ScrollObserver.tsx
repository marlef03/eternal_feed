import React from "react";

function ScrollObserver({ handler }: { handler: (() => void) | undefined }) {
  const elemRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const ref = elemRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (handler) handler();
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
  }, [handler]);

  return <div ref={elemRef} style={{ height: "10px" }}></div>;
}

export default ScrollObserver;
