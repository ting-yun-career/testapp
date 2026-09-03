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

      <aside
        className="config-panel fixed top-1/2 right-0 z-20 max-h-[80dvh] w-64 overflow-y-auto border-l border-black/20 bg-[#f5f0e6] px-6 py-5 font-geo select-none"
        data-open={open || undefined}
        onClick={() => {
          if (!open) setOpen(true);
        }}
      >
        {/* Visible pull tab — the panel's own edge is only a thin sliver
            when closed (easy to miss on a touchscreen), so this sticks out
            further and is always shown, in both states. */}
        <button
          type="button"
          aria-label={open ? "Close configuration panel" : "Open configuration panel"}
          onClick={() => setOpen((o) => !o)}
          className="absolute top-1/2 right-full flex h-20 w-8 -translate-y-1/2 cursor-pointer items-center justify-center border border-r-0 border-black/20 bg-[#f5f0e6] font-geo text-[10px] tracking-widest text-neutral-600 uppercase transition-colors hover:text-neutral-800 [writing-mode:vertical-rl]"
        >
          Config
        </button>

        <div className="space-y-5">{children}</div>
      </aside>
    </>
  );
}

export default ConfigPanel;
