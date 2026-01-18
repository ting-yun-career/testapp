import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const AnimatedFrame = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          const progressBar = document.getElementById('progress-bar');
          if (progressBar) {
            progressBar.style.width = (self.progress * 100) + '%';
          }
        }
      }
    });

    return tl;
  }, {
    dependencies: [],
    scope: containerRef,
    revertOnUpdate: false
  });

  return (
    <div ref={containerRef}>
      <div id="scroll-container" className="h-[2000px] relative">
        <div id="progress-bar" className="fixed top-0 left-0 h-1 bg-black w-0 z-[100]"></div>
        <div id="fixed-viewport" className="fixed top-0 left-0 w-full h-screen pointer-events-none fixed-viewport">
        </div>
      </div>
    </div>
  );
};
