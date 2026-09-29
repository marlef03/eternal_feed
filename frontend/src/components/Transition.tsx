import { useEffect, useRef, useState } from "react";
import type { TransitionProps } from "../interfaces/TransitionProps";

function Transition({
  appear,
  onAppearStyle,
  onDisappearStyle,
  delay = 0,
  duration,
  ignoreOnInit = false,
  className = "",
  children,
}: TransitionProps) {
  const [exists, setExists] = useState(appear ? ignoreOnInit : false);
  const [init, setInit] = useState(!ignoreOnInit);
  const appearTimeoutId = useRef<number>(null);
  const disappearTimeoutId = useRef<number>(null);
  const ignore = useRef<boolean>(ignoreOnInit);

  useEffect(() => {
    if (!ignore.current) {
      if (appear) {
        if (disappearTimeoutId.current != null) {
          clearTimeout(disappearTimeoutId.current);
          disappearTimeoutId.current = null;

          setExists(false);
          setInit(true);
        }
        setTimeout(() => {
          setExists(true);
          setTimeout(() => setInit(false), 0);
        }, delay);
      } else {
        if (appearTimeoutId.current != null) {
          clearTimeout(appearTimeoutId.current);
          appearTimeoutId.current = null;

          setExists(true);
          setTimeout(() => setInit(false), 0);
        }
        disappearTimeoutId.current = setTimeout(() => {
          setExists(false);
          setInit(true);
        }, duration);
      }
    } else {
      ignore.current = false;
    }

    return () => {
      if (appearTimeoutId.current != null)
        clearTimeout(appearTimeoutId.current);
      if (disappearTimeoutId.current != null)
        clearTimeout(disappearTimeoutId.current);
    };
  }, [appear, duration, delay]);

  return (
    <div
      className={className}
      style={
        ignore.current
          ? {
              ...(appear ? onAppearStyle : onDisappearStyle),
              transition: "none",
            }
          : {
              ...(init
                ? onDisappearStyle
                : appear
                  ? onAppearStyle
                  : onDisappearStyle),
              transitionDuration: `${duration}ms`,
            }
      }
    >
      {exists && children}
    </div>
  );
}

export default Transition;
