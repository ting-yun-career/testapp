import { useEffect, useState } from "react";
import "./style.css";

type ConfigPanelProps = {
  children: React.ReactNode;
};

function ConfigPanel({ children }: ConfigPanelProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close configuration panel"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-10"
        />
      )}

      {/* Fixed positioning + the open/closed slide transform live on this
          wrapper, not on the scrolling <aside> below it — overflow-y-auto
          there implicitly forces overflow-x to clip too (CSS won't let one
          axis scroll while the other stays visible), which was silently
          hiding the pull tab, since it intentionally sits outside the
          aside's own box via right-full. */}
      <div className="config-panel fixed top-1/2 right-0 z-20" data-open={open || undefined}>
        {/* Visible pull tab — the panel's own edge is only a thin sliver
            when closed (easy to miss on a touchscreen), so this sticks out
            further and is always shown, in both states, and spans the
            panel's full (content-dependent) height so its points touch the
            panel's top/bottom edges. Width meets the ~44px minimum
            touch-target guideline; the chevron flips to show which way it
            moves. The SVG stretches non-uniformly (preserveAspectRatio
            "none") to reach that height exactly, so the chevron is a plain
            centred element instead of SVG text — text inside the SVG would
            get stretched right along with the shape. */}
        <button
          type="button"
          aria-label={open ? "Close configuration panel" : "Open configuration panel"}
          onClick={() => setOpen((o) => !o)}
          className="group absolute top-0 right-full bottom-0 flex w-11 cursor-pointer items-center justify-center"
        >
          <svg
            viewBox="0 0 44 80"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {/* Fill and stroke are split so only the two angled edges get
                stroked — the base (right) edge sits flush against the
                aside's own left border, so stroking it too doubled the
                line up. */}
            <polygon points="44,0 1,40 44,80" className="fill-[#f5f0e6]" />
            <path
              d="M 44,0 L 1,40 L 44,80"
              fill="none"
              className="stroke-black/20"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className="relative font-geo text-base text-neutral-600 transition-colors group-hover:text-neutral-800">
            {open ? "›" : "‹"}
          </span>
        </button>

        <aside
          className="max-h-[80dvh] w-64 overflow-y-auto bg-[#f5f0e6] px-6 py-5 font-geo select-none"
          onClick={() => {
            if (!open) setOpen(true);
          }}
        >
          <div className="space-y-5">{children}</div>
        </aside>
      </div>
    </>
  );
}

export default ConfigPanel;
