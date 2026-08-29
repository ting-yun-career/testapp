import OrbitRing from './components/OrbitRing'

function App() {
  return (
    <div className="min-h-dvh">
      <OrbitRing />

      <header className="fixed inset-x-0 top-0 px-6 py-4 text-right sm:px-10">
        <div className="inline-block">
          <nav>
            <a
              href="#demo"
              className="mr-1 rounded px-3 pt-2.5 text-base leading-none font-medium text-neutral-800 no-underline transition-colors hover:text-black sm:mr-2"
            >
              Demo
            </a>
            <a
              href="#about"
              className="rounded pl-2.5 pr-1 pt-2.5 text-base leading-none font-medium text-neutral-800 no-underline transition-colors hover:text-black"
            >
              About
            </a>
          </nav>
          <svg
            className="mt-[-6px] h-px w-full text-black/20"
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

      <main className="min-h-dvh" />

      <footer className="fixed inset-x-0 bottom-0 px-6 py-4 text-right sm:px-10">
        <p className="text-xs text-neutral-500">© Ting 2026</p>
      </footer>
    </div>
  );
}

export default App;
