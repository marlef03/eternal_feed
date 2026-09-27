import { useEffect, useRef, useState } from 'react';
import type { TransitionProps } from '../interfaces/TransitionProps';

function Transition({
  appear,
  onAppearStyle,
  onDisappearStyle,
  delay = 0,
  duration,
  children,
}: TransitionProps) {
  const [ exists, setExists ] = useState(false);
  const [ init, setInit ] = useState(true);
  const appearTimeoutId = useRef<number>(null);
  const disappearTimeoutId = useRef<number>(null);
  
  useEffect(() => {
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

    return () => {
      if (appearTimeoutId.current != null) clearTimeout(appearTimeoutId.current);
      if (disappearTimeoutId.current != null) clearTimeout(disappearTimeoutId.current);
    }
  }, [appear, duration, delay]);

  return (
    <div
      className="w-full h-full"
      style={{
        ...(
        init ? 
          onDisappearStyle
        :
          appear ? 
            onAppearStyle
          :
            onDisappearStyle
        ),
        transitionDuration: duration + 'ms',
      }}
    >
      { exists && children }
    </div>
  );
}

export default Transition;