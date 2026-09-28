import type { ReactNode } from 'react';

export interface TransitionProps {
  appear: boolean;
  onAppearStyle: React.CSSProperties;
  onDisappearStyle: React.CSSProperties;
  delay?: number;
  duration: number;
  ignoreOnInit?: boolean;
  className?: string;
  children: ReactNode;
}
