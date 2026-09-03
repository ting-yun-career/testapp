import { useState } from "react";
import About from "./components/About";
import Ring from "./components/Ring";
import Wave from "./components/Wave";
import Atom from "./components/Atom";
import Cypher from "./components/Cypher";
import Gravity from "./components/Gravity";

const Widget = {
  ring: "ring",
  wave: "wave",
  atom: "atom",
  cypher: "cypher",
  gravity: "gravity",
  about: "about",
} as const;

type Widget = (typeof Widget)[keyof typeof Widget];

const NAV_ITEMS: { id: Widget; label: string }[] = [
  { id: Widget.ring, label: "Ring" },
  { id: Widget.wave, label: "Wave" },
  { id: Widget.atom, label: "Atom" },
  { id: Widget.cypher, label: "Cypher" },
  { id: Widget.gravity, label: "Gravity" },
  { id: Widget.about, label: "About" },
];

function App() {
  const [activeWidget, setActiveWidget] = useState<Widget | null>(Widget.ring);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      {/* public/background.jpg: Photo by Ernest Karchmit (https://unsplash.com/@ekarchmit) on Unsplash (https://unsplash.com/photos/a-black-and-white-photo-of-a-white-wall-KUGjpg-iXIQ) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/background.jpg')",
          opacity: "var(--paper-opacity)",
        }}
      />

      {activeWidget === Widget.ring && <Ring />}
      {activeWidget === Widget.wave && <Wave />}
      {activeWidget === Widget.atom && <Atom />}
      {activeWidget === Widget.cypher && <Cypher />}
      {activeWidget === Widget.gravity && <Gravity />}

      {/* z-30: header had no z-index (auto), so a descendant's z-index
          (however high) could never out-rank ConfigPanel's fixed z-20
          wrapper — a positive z-index sibling always beats an auto one,
          regardless of what's nested inside it. Needs to be set here. */}
      <header className="fixed inset-x-0 top-0 z-30 px-6 py-4 text-right sm:px-10">
        <div className="relative inline-block bg-[#f5f0e6]/90">
          {/* Full row — five items were too cramped on phone widths, so
              this only shows from the `nav` breakpoint up. */}
          <nav className="hidden font-syne-mono font-normal nav:block">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveWidget(item.id)}
                className={`cursor-pointer rounded pt-2.5 pb-2.5 text-base leading-none text-neutral-800 transition-colors hover:text-black ${
                  i === NAV_ITEMS.length - 1 ? "pl-2.5 pr-1" : "mr-1 px-3 sm:mr-2"
                } ${activeWidget === item.id ? "font-bold" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <svg
            className="absolute inset-x-0 bottom-2.75 hidden h-px w-full text-black/20 nav:block"
            viewBox="0 0 150 1"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="0.5"
              x2="150"
              y2="0.5"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Collapsed trigger — below the `nav` breakpoint only. */}
          <button
            type="button"
            onClick={() => setNavOpen((o) => !o)}
            className="cursor-pointer rounded px-3 pt-2.5 pb-2.5 font-syne-mono text-base leading-none text-neutral-800 nav:hidden"
          >
            {navOpen ? "Close" : "Menu"}
          </button>

          {navOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setNavOpen(false)}
                className="fixed inset-0 z-10 nav:hidden"
              />
              <nav className="relative z-20 flex flex-col items-end border-t border-black/10 font-syne-mono font-normal nav:hidden">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveWidget(item.id);
                      setNavOpen(false);
                    }}
                    className={`w-full cursor-pointer px-4 py-2.5 text-right text-base leading-none text-neutral-800 ${
                      activeWidget === item.id ? "font-bold" : ""
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </>
          )}
        </div>
      </header>

      <main className="min-h-dvh">
        {activeWidget === Widget.about && <About />}
      </main>

      <footer className="fixed inset-x-0 bottom-0 px-6 py-4 text-right sm:px-10">
        <p className="font-geo text-[10px] text-neutral-500 uppercase">
          CopyRight Ting Y 2026
        </p>
      </footer>
    </div>
  );
}

export default App;
