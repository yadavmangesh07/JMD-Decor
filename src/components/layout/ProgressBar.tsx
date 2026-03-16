import { useEffect } from "react";
import nProgress from "nprogress";
import "nprogress/nprogress.css";

// Injecting custom styles to match your slaty/black theme
const GlobalProgressStyles = () => (
  <style>{`
    #nprogress {
      pointer-events: none;
    }
    #nprogress .bar {
      background: #0f172a !important; /* Slate-900 */
      position: fixed;
      z-index: 99999 !important; /* Forces it above Sidebar/Header */
      top: 0;
      left: 0;
      width: 100%;
      height: 4px !important; /* Slightly thicker for testing */
      box-shadow: 0 0 10px rgba(15, 23, 42, 0.7);
    }
    /* Optional: Style the trickle 'peg' at the end of the bar */
    #nprogress .peg {
      display: block;
      position: absolute;
      right: 0px;
      width: 100px;
      height: 100%;
      box-shadow: 0 0 10px #0f172a, 0 0 5px #0f172a;
      opacity: 1.0;
      transform: rotate(3deg) translate(0px, -4px);
    }
  `}</style>
);

export const ProgressBar = () => {
  useEffect(() => {
    nProgress.start();
    return () => {
      nProgress.done();
    };
  }, []);

  return <GlobalProgressStyles />;
};