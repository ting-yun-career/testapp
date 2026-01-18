import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const AnimatedFrame = () => {
  useEffect(() => {
    gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          const progressBar = document.getElementById('progress-bar');
          console.log(progressBar);
          console.log(self.progress);
          if (progressBar) {
            progressBar.style.width = (self.progress * 100) + '%';
          }
        }
      }
    });
  }, []);

  return (
    <div>
      <div id="scroll-container" className="h-[2000px] relative">
        <div id="progress-bar" className="fixed top-0 left-0 h-1 bg-black w-0 z-[100]"></div>
        <div id="fixed-viewport" className="fixed top-0 left-0 w-full h-screen pointer-events-none fixed-viewport">
        </div>
      </div>
    </div>
  );
};
