# AGENTS.md

Guidance for Codex when working in `svg-animate/`.

## Known pitfalls

- When simplifying away a `useState` setter, don't replace `useState(fn)` with `const x = fn()` — it turns a mount-once value into one that recomputes (and can change) on every re-render; keep `const [x] = useState(fn)`.
