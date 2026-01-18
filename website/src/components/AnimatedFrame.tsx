import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const AnimatedFrame = () => {
  return (
    <div>
      <div className="fixed top-0 left-0 h-1 bg-white w-0 z-[100] progress-bar"></div>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-[100] scroll-position-indicator"></div>
      
      <div className="h-[2000px] relative scroll-container">
        <div className="fixed top-0 left-0 w-full h-screen pointer-events-none fixed-viewport">
          <h1 className="fixed top-1/2 left-[10%] -translate-y-1/2 text-6xl text-black opacity-0 [text-shadow:2px_2px_20px_rgba(0,0,0,0.3)] font-bold max-w-[80%]">Beautiful Scroll Animation</h1>
        </div>
      </div>

      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 text-black text-sm opacity-70 text-center scroll-indicator">
        <div>Scroll to see the magic ✨</div>
        <div id="scroll-position">Scroll: 0px</div>
      </div>
    </div>
  );
};
