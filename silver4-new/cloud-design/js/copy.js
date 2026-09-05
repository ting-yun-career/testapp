/* ==========================================================================
   copy.js — copy-to-clipboard buttons in the footer contact block.
   Each button carries the text to copy in [data-copy]; on click it copies
   and swaps its icon to a checkmark briefly to confirm.
   ========================================================================== */

export function init() {
  const buttons = document.querySelectorAll("[data-copy]");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy");
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        return;
      }
      const icon = button.querySelector(".material-symbols-outlined");
      if (!icon) return;
      const original = icon.textContent;
      icon.textContent = "check";
      button.setAttribute("data-copied", "true");
      window.setTimeout(() => {
        icon.textContent = original;
        button.removeAttribute("data-copied");
      }, 1500);
    });
  });
}
