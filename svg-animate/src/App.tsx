import { useState } from "react";
import About from "./components/About";
import Orbit from "./components/Orbit";
import Wave from "./components/Wave";
import Atom from "./components/Atom";
import Cypher from "./components/Cypher";

const Widget = {
  orbit: "orbit",
  wave: "wave",
  atom: "atom",
  cypher: "cypher",
  about: "about",
} as const;

type Widget = (typeof Widget)[keyof typeof Widget];

const NAV_ITEMS: { id: Widget; label: string }[] = [
  { id: Widget.orbit, label: "Orbit" },
  { id: Widget.wave, label: "Wave" },
  { id: Widget.atom, label: "Atom" },
  { id: Widget.cypher, label: "Cypher" },
  { id: Widget.about, label: "About" },
];

function App() {
  const [activeWidget, setActiveWidget] = useState<Widget | null>(Widget.orbit);

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

      {activeWidget === Widget.orbit && <Orbit />}
      {activeWidget === Widget.wave && <Wave />}
      {activeWidget === Widget.atom && <Atom />}
      {activeWidget === Widget.cypher && <Cypher />}

      <header className="fixed inset-x-0 top-0 px-6 py-4 text-right sm:px-10">
        <div className="inline-block bg-[#f5f0e6]/80">
          <nav className="font-syne-mono font-normal">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveWidget(item.id)}
                className={`cursor-pointer rounded pt-2.5 text-base leading-none text-neutral-800 transition-colors hover:text-black ${
                  i === NAV_ITEMS.length - 1 ? "pl-2.5 pr-1" : "mr-1 px-3 sm:mr-2"
                } ${activeWidget === item.id ? "font-bold" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <svg
            className="mt-[-7px] h-px w-full text-black/20"
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
