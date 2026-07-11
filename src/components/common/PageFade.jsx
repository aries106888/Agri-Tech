import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageFade = ({ duration = 350 }) => {
  const [visible, setVisible] = useState(true);
  const location = useLocation();

  // Fade on initial mount and on route changes
  useEffect(() => {
    // show overlay briefly then hide
    setVisible(true);
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [location.pathname, duration]);

  // Expose a global fadeOut helper so other modules can trigger a logout fade.
  useEffect(() => {
    const fadeOut = (ms = duration) => new Promise((resolve) => {
      setVisible(true);
      setTimeout(() => resolve(), ms);
    });
    // attach to window for global use
    try {
      // eslint-disable-next-line no-undef
      window.pageFade = { fadeOut };
    } catch (e) {}
    return () => {
      try { delete window.pageFade; } catch (e) {}
    };
  }, [duration]);

  return (
    <div
      className={`page-fade-overlay ${visible ? 'visible' : 'hidden'}`}
      style={{ transitionDuration: `${duration}ms` }}
      aria-hidden="true"
    />
  );
};

export default PageFade;
