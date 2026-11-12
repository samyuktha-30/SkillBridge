const fs = require("fs");
const path = require("path");

const names = [
  "house","chart-no-axes-column","chart-no-axes-column-increasing","clipboard-list","sparkles","book-open",
  "trending-up","bot","bell","settings","log-out","layout-dashboard","users","file-text","user","search",
  "chevron-down","chevron-right","chevron-left","chevron-up","arrow-right","arrow-left","arrow-up-right",
  "calendar","clock","trophy","target","circle-check","circle-check-big","info","lightbulb","shield-check",
  "mail","lock","building-2","eye","eye-off","play","download","filter","briefcase","graduation-cap","rocket",
  "star","code-xml","refresh-cw","circle-alert","phone","map-pin","globe","sun","moon","pencil","trash-2",
  "plus","external-link","check","message-circle","send","paperclip","award","gift","flag","list-checks",
  "wrench","palette","sliders-horizontal","languages","database","upload","chart-line","chart-bar","activity",
  "compass","clipboard-check","book-marked","brain","cpu","circle-help","menu","x","key-round","envelope",
  "trending-down","minus","ellipsis","zap","layers","medal","percent","calendar-days","log-in","user-plus",
  "user-round","loader","dot","timer","sparkle","wand-sparkles","file-chart-column","panel-left","badge-check"
];

const iconDir = path.join(process.cwd(), "node_modules/lucide-static/icons");
const symbols = [];
const missing = [];
const seen = new Set();
for (const name of names) {
  const file = path.join(iconDir, name + ".svg");
  if (!fs.existsSync(file)) { missing.push(name); continue; }
  let svg = fs.readFileSync(file, "utf8");
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>[\s\S]*$/, "").trim();
  const id = "i-" + name;
  if (seen.has(id)) continue;
  seen.add(id);
  symbols.push(`<symbol id="${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</symbol>`);
}
const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${symbols.join("")}</svg>`;
fs.mkdirSync("Views/Shared", { recursive: true });
fs.writeFileSync("Views/Shared/_Icons.cshtml", `@* Auto-generated icon sprite (lucide) *@\n${sprite}\n`);
fs.writeFileSync("wwwroot/icons/sprite.svg", sprite);
console.log("icons:", symbols.length, "missing:", missing.join(", "));
