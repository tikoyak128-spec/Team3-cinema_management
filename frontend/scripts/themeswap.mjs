// Theme swap: converts context-free dark-only utilities to --app-* tokens.
// Run from frontend/:  node scripts/themeswap.mjs
import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join, extname } from "path";

const SRC = new URL("../src", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
if (process.platform === "win32" && !SRC.includes(":")) process.exit(0);

const replacements = [
  // --- Page / band backgrounds ---
  ["bg-[#050505]", "bg-[var(--app-page)]"],
  ["bg-[#0a0a0a]", "bg-[var(--app-deep)]"],
  // --- Card panels ---
  ["bg-[#0d0d0d]", "bg-[var(--app-panel)]"],
  ["bg-[#0e0e0e]", "bg-[var(--app-panel)]"],
  ["bg-[#101010]", "bg-[var(--app-panel)]"],
  ["bg-[#111111]", "bg-[var(--app-panel)]"],
  ["bg-[#111]", "bg-[var(--app-panel)]"],
  ["bg-[#121212]", "bg-[var(--app-panel2)]"],
  ["bg-[#131313]", "bg-[var(--app-panel2)]"],
  ["bg-[#141414]", "bg-[var(--app-panel2)]"],
  ["bg-[#161616]", "bg-[var(--app-panel2)]"],
  ["bg-[#181818]", "bg-[var(--app-panel2)]"],
  ["bg-[#1a1a1a]", "bg-[var(--app-panel2)]"],
  ["bg-[#1c1c1c]", "bg-[var(--app-panel2)]"],
  ["bg-[#1e1e1e]", "bg-[var(--app-panel2)]"],
  ["bg-[#222]", "bg-[var(--app-panel2)]"],
  ["bg-[#262626]", "bg-[var(--app-edge2)]"],
  // --- Dark panel gradients ---
  ["bg-[linear-gradient(135deg,#141414,#101010)]", "bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))]"],
  ["bg-[linear-gradient(135deg,#141414,#0e0e0e)]", "bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))]"],
  ["bg-[linear-gradient(135deg,#141414,#0d0d0d)]", "bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))]"],
  ["bg-[linear-gradient(135deg,#16161a,#0e0e10)]", "bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))]"],
  ["bg-[linear-gradient(135deg,#1a0a0c,#101010)_60%]", "bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))_60%]"],
  ["bg-[linear-gradient(135deg,#1a0a0d,#0d0d0d)]", "bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))]"],
  // --- Borders ---
  ["border-[#1f1f1f]", "border-[var(--app-edge)]"],
  ["border-[#1a1a1a]", "border-[var(--app-edge)]"],
  ["border-[#222]", "border-[var(--app-edge2)]"],
  ["border-[#262626]", "border-[var(--app-edge2)]"],
  ["border-[#282828]", "border-[var(--app-edge2)]"],
  ["border-[#2a2a2a]", "border-[var(--app-edge2)]"],
  ["border-[#333]", "border-[var(--app-edge2)]"],
  ["hover:border-[#3a3a3a]", "hover:border-[var(--app-edge2)]"],
  ["hover:border-[#2a2a2a]", "hover:border-[var(--app-edge2)]"],
  ["hover:border-[#262626]", "hover:border-[var(--app-edge2)]"],
  // --- Muted text ---
  ["text-[#555555]", "text-[var(--app-ink2)]"],
  ["text-[#555]", "text-[var(--app-ink2)]"],
  ["text-[#666666]", "text-[var(--app-mute)]"],
  ["text-[#777777]", "text-[var(--app-mute)]"],
  ["text-[#888888]", "text-[var(--app-mute)]"],
  ["text-[#8a8a8a]", "text-[var(--app-mute)]"],
  ["text-[#999999]", "text-[var(--app-mute)]"],
  ["text-[#9a9a9a]", "text-[var(--app-mute)]"],
  ["text-[#aaaaaa]", "text-[var(--app-mute)]"],
  ["text-[#a0a0a0]", "text-[var(--app-mute)]"],
  ["text-[#c0c0c0]", "text-[var(--app-ink2)]"],
  ["text-[#d0d0d0]", "text-[var(--app-ink2)]"],
  // --- Translucent sticky bars / headers ---
  ["bg-[rgba(5,5,5,0.85)]", "bg-[var(--app-header)]"],
  ["bg-[rgba(5,5,5,0.8)]", "bg-[var(--app-header)]"],
  ["bg-[rgba(17,17,17,0.95)]", "bg-[var(--app-bar)]"],
  ["bg-[rgba(11,11,11,0.95)]", "bg-[var(--app-bar)]"],
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      walk(full, out);
    } else if (extname(full) === ".jsx" || extname(full) === ".tsx") {
      out.push(full);
    }
  }
  return out;
}

let changedFiles = 0;
let total = 0;
for (const file of walk(SRC)) {
  let content = readFileSync(file, "utf8");
  const before = content;
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  if (content !== before) {
    writeFileSync(file, content);
    changedFiles++;
    const count = [...content.matchAll(/var\(--app-/g)].length - [...before.matchAll(/var\(--app-/g)].length;
    total += count;
  }
}
console.log(`Converted ${changedFiles} files, ~${total} token substitutions.`);