import type { CSSProperties } from 'react';
type IconName = 'spark' | 'arrow' | 'close' | 'clear' | 'clock' | 'play' | 'chevron' | 'check';
const paths: Record<IconName, string> = {
  spark: 'M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3z',
  arrow: 'M12 19V5M5 12l7-7 7 7',
  close: 'M6 6l12 12M18 6L6 18',
  clear: 'M3 7h18M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5',
  clock: 'M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  play: 'M9 5l11 7-11 7V5z',
  chevron: 'M9 5l7 7-7 7',
  check: 'M5 12l4 4L19 6',
};
export function Icon({name, size=18, style}: {name: IconName; size?: number; style?: CSSProperties}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]}/></svg>;
}
