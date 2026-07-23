import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageFade — renders a full-screen overlay that fades in then out on every
 * route change, giving smooth page transitions.
 *
 * We use a ref-based approach (instead of useState) so we never call
 * setState synchronously inside an effect, which would cause cascading renders.
 */
const PageFade = ({ duration = 350 }) => {
  const location = useLocation();
  const overlayRef = useRef(null);

  // Fade on initial mount and on route changes
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    // Show overlay
    el.style.opacity = '1';
    el.style.pointerEvents = 'all';
    // Then hide after duration
    const t = setTimeout(() => {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    }, duration);
    return () => clearTimeout(t);
  }, [location.pathname, duration]);

  // Expose a global fadeOut helper so AuthContext can trigger a logout fade.
  useEffect(() => {
    const fadeOut = (ms = duration) => new Promise((resolve) => {
      const el = overlayRef.current;
      if (el) {
        el.style.opacity = '1';
        el.style.pointerEvents = 'all';
      }
      setTimeout(resolve, ms);
    });
    window.pageFade = { fadeOut };
    return () => { delete window.pageFade; };
  }, [duration]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--color-canvas, #f5f7f5)',
        opacity: 1,
        pointerEvents: 'all',
        transition: `opacity ${duration}ms ease`,
      }}
    />
  );
};

export default PageFade;
