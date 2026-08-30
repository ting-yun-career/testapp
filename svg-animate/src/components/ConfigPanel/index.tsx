import { useEffect } from "react";
import "./style.css";

type ConfigPanelProps = {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

function ConfigPanel({ title, open, onOpenChange, children }: ConfigPanelProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close configuration panel"
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-10"
        />
      )}

      <aside
        className="config-panel fixed top-1/2 right-0 z-20 w-64 border-l border-black/20 bg-[#f5f0e6] px-6 py-5 font-geo select-none"
        data-open={open || undefined}
        onClick={() => {
          if (!open) onOpenChange(true);
        }}
      >
        {!open && (
          <button
            type="button"
            aria-label="Open configuration panel"
            onClick={() => onOpenChange(true)}
            className="absolute top-0 right-full bottom-0 w-[50px]"
          />
        )}

        <p className="mb-4 text-xs text-neutral-500">{title}</p>
        <div className="space-y-5">{children}</div>
      </aside>
    </>
  );
}

export default ConfigPanel;
