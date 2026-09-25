import { useRef } from 'react';
import { flushSync } from 'react-dom';

// Adapted from Magic UI's Animated Theme Toggler (circle reveal).
// https://magicui.design/docs/components/animated-theme-toggler
export function AnimatedThemeToggler({ dark, onThemeChange }: { dark: boolean; onThemeChange: (dark: boolean) => void }) {
  const button = useRef<HTMLButtonElement>(null);
  const transitioning = useRef(false);

  const toggle = () => {
    if (transitioning.current) return;
    const next = !dark;
    if (typeof document.startViewTransition !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onThemeChange(next);
      return;
    }

    const bounds = button.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const origin = `${x / width * 100}% ${y / height * 100}%`;
    const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
    const start = `circle(0% at ${origin})`;
    const end = `circle(${radius / (Math.hypot(width, height) / Math.SQRT2) * 100}% at ${origin})`;
    const root = document.documentElement;
    root.dataset.magicuiThemeVt = 'active';
    root.style.setProperty('--magicui-theme-vt-start', start);
    transitioning.current = true;

    const transition = document.startViewTransition(() => flushSync(() => onThemeChange(next)));
    transition.ready.then(() => {
      root.animate({ clipPath: [start, end] }, {
        duration: 400,
        easing: 'ease-in-out',
        fill: 'forwards',
        pseudoElement: '::view-transition-new(root)',
      });
    }).catch(() => {});
    transition.finished.finally(() => {
      transitioning.current = false;
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty('--magicui-theme-vt-start');
    }).catch(() => {});
  };

  return (
    <button ref={button} type="button" className="theme-toggle" onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={dark}>
      {dark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}
