import type { ReactNode } from 'react';

type Props = {
  className?: string;
  children: ReactNode;
};

export default function HudFrame({ className = '', children }: Props) {
  return <section className={`match-hud-frame ${className}`}>{children}</section>;
}
