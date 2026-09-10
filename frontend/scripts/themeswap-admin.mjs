// Theme swap pass #2: admin pages — light-gray text/borders used on solid surfaces.
// Run from frontend/:  node scripts/themeswap-admin.mjs
import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join, extname } from "path";

let SRC = new URL("../src/pages/admin", import.meta.url).pathname;
if (process.platform === "win32") SRC = SRC.replace(/^\//, "");

const replacements = [
  // --- light-gray text on solid surfaces ---
  ["hover:text-[#f5f5f5]", "hover:text-[var(--app-ink)]"],
  ["text-[#f5f5f5]", "text-[var(--app-ink)]"],
  ["text-[#e0e0e0]", "text-[var(--app-ink2)]"],
  ["text-[#f0f0f0]", "text-[var(--app-ink2)]"],
  ["text-[#707070]", "text-[var(--app-mute)]"],
  ["text-[#7a7a7a]", "text-[var(--app-mute)]"],
  ["placeholder:text-[#a0a0a0]", "placeholder:text-[var(--app-mute)]"],
  ["text-[#a0a0a0]", "text-[var(--app-mute)]"],
  // --- borders on solid surfaces ---
  ["hover:border-[#272727]", "hover:border-[var(--app-edge2)]"],
  ["focus:border-[#272727]", "focus:border-brand"],
  ["border-[#272727]", "border-[var(--app-edge)]"],
  ["border-[#232323]", "border-[var(--app-edge)]"],
  ["border-[#242424]", "border-[var(--app-edge)]"],
  ["border-[#1c1c1c]", "border-[var(--app-edge)]"],
  ["border-[#2a2a2a]", "border-[var(--app-edge2)]"],
  ["border-[#222]", "border-[var(--app-edge2)]"],
  ["divide-[#272727]", "divide-[var(--app-edge)]"],
  ["bg-[#1c1c1c]", "bg-[var(--app-panel2)]"],
  ["bg-[#242424]", "bg-[var(--app-panel2)]"],
  // --- translucent whites on solid surfaces ---
  ["bg-white/[0.02]", "bg-[var(--app-fill)]"],
  ["bg-white/[0.03]", "bg-[var(--app-fill)]"],
  ["bg-white/[0.06]", "bg-[var(--app-fill)]"],
  ["bg-white/[0.05]", "bg-[var(--app-fill)]"],
  ["hover:bg-white/[0.05]", "hover:bg-[var(--app-fill)]"],
  ["hover:bg-white/[0.06]", "hover:bg-[var(--app-fill)]"],
  ["hover:bg-[rgba(255,255,255,0.06)]", "hover:bg-[var(--app-fill)]"],
  ["hover:bg-[rgba(255,255,255,0.05)]", "hover:bg-[var(--app-fill)]"],
  ["hover:text-white", "hover:text-[var(--app-ink)]"],
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (extname(full) === ".jsx") out.push(full);
  }
  return out;
}

let changed = 0;
let total = 0;
for (const file of walk(SRC)) {
  let content = readFileSync(file, "utf8");
  const before = content;
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  if (content !== before) {
    writeFileSync(file, content);
    changed++;
    total += (content.match(/var\(--app-/g) || []).length - (before.match(/var\(--app-/g) || []).length;
  }
}
console.log(`Admin pass #2: ${changed} files, ~${total} substitutions.`);