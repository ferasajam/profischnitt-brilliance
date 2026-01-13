import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch {}
    }
  }, []);

  useEffect(() => {
    const scrollTop = () => {
      // Window
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
        window.scrollTo(0, 0);
      }
      // Document (Safari/iOS compatibility)
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      // Common app container
      const main = document.querySelector("main");
      if (main instanceof HTMLElement) main.scrollTop = 0;
    };

    // Immediately and next frame to catch mobile layout timing
    scrollTop();
    requestAnimationFrame(scrollTop);
  }, [pathname]);

  return null;
};
