/* SkillBridge AI – prototype interactions */
(function () {
  "use strict";

  const onReady = (fn) =>
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn)
      : fn();

  /* ---------------- Toast ---------------- */
  function initToast() {
    const toast = document.getElementById("toast");
    if (!toast) return;
    const message = toast.dataset.toast;
    if (message && message.trim()) {
      toast.classList.remove("hidden");
      toast.classList.add("flex");
      setTimeout(() => {
        toast.classList.add("opacity-0", "transition-opacity", "duration-300");
        setTimeout(() => toast.classList.add("hidden"), 350);
      }, 3200);
    }
  }

  /* ---------------- Sidebar ---------------- */
  function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (!sidebar) return;

    const open = () => {
      sidebar.classList.remove("-translate-x-full");
      backdrop?.classList.remove("hidden");
    };
    const close = () => {
      sidebar.classList.add("-translate-x-full");
      backdrop?.classList.add("hidden");
    };

    document.querySelectorAll("[data-sidebar-open]").forEach((b) => b.addEventListener("click", open));
    document.querySelectorAll("[data-sidebar-close]").forEach((b) => b.addEventListener("click", close));
  }

  /* ---------------- Dropdown menus ---------------- */
  function initMenus() {
    const triggers = document.querySelectorAll("[data-menu-trigger]");
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        const menu = document.getElementById(trigger.dataset.menuTrigger);
        if (!menu) return;
        document.querySelectorAll("[data-menu-trigger]").forEach((other) => {
          if (other !== trigger) {
            const otherMenu = document.getElementById(other.dataset.menuTrigger);
            otherMenu?.classList.add("hidden");
          }
        });
        menu.classList.toggle("hidden");
      });
    });
    document.addEventListener("click", () => {
      document.querySelectorAll("[data-menu-trigger]").forEach((trigger) => {
        document.getElementById(trigger.dataset.menuTrigger)?.classList.add("hidden");
      });
    });
  }

  /* ---------------- Chips / filters ---------------- */
  function initFilterGroups() {
    document.querySelectorAll("[data-filter-group]").forEach((group) => {
      const targetSelector = group.dataset.filterTarget;
      const targets = targetSelector ? document.querySelectorAll(targetSelector) : [];
      group.querySelectorAll("[data-filter]").forEach((button) => {
        button.addEventListener("click", () => {
          group.querySelectorAll("[data-filter]").forEach((b) => b.classList.remove("tab-pill-active"));
          button.classList.add("tab-pill-active");
          const value = button.dataset.filter;
          targets.forEach((item) => {
            const categories = (item.dataset.category || "").split(" ");
            const show = value === "all" || categories.includes(value);
            item.classList.toggle("hidden", !show);
          });
        });
      });
    });
  }

  /* ---------------- Search filtering ---------------- */
  function initSearchFilter() {
    document.querySelectorAll("[data-search-input]").forEach((input) => {
      const targetSelector = input.dataset.searchInput;
      if (!targetSelector) return;
      const targets = document.querySelectorAll(targetSelector);
      input.addEventListener("input", () => {
        const term = input.value.trim().toLowerCase();
        targets.forEach((item) => {
          const haystack = (item.textContent || "").toLowerCase();
          item.classList.toggle("hidden", term.length > 0 && !haystack.includes(term));
        });
      });
    });
  }

  /* ---------------- Toggle switches ---------------- */
  function initToggles() {
    document.querySelectorAll(".toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => toggle.classList.toggle("toggle-on"));
      toggle.addEventListener("keydown", (event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          toggle.classList.toggle("toggle-on");
        }
      });
    });
  }

  /* ---------------- Modals ---------------- */
  function initModals() {
    document.querySelectorAll("[data-modal-open]").forEach((button) => {
      button.addEventListener("click", () => {
        const modal = document.getElementById(button.dataset.modalOpen);
        if (!modal) return;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        document.body.style.overflow = "hidden";
      });
    });
    const close = (modal) => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.style.overflow = "";
    };
    document.querySelectorAll("[data-modal-close]").forEach((button) => {
      button.addEventListener("click", () => {
        const modal = button.closest("[data-modal]");
        if (modal) close(modal);
      });
    });
    document.querySelectorAll("[data-modal]").forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) close(modal);
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        document.querySelectorAll("[data-modal]").forEach((modal) => {
          if (!modal.classList.contains("hidden")) close(modal);
        });
      }
    });
  }

  /* ---------------- Password visibility ---------------- */
  function initPasswordToggles() {
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
      const input = button.parentElement?.querySelector("input");
      if (!input) return;
      button.addEventListener("click", () => {
        const reveal = input.type === "password";
        input.type = reveal ? "text" : "password";
        button.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
        const use = button.querySelector("use");
        if (use) use.setAttribute("href", reveal ? "#i-eye" : "#i-eye-off");
      });
    });
  }

  /* ---------------- Tabs ---------------- */
  function initPills() {
    document.querySelectorAll("[data-pill-group]").forEach((group) => {
      const pills = group.querySelectorAll("[data-pill]");
      pills.forEach((pill) => {
        pill.addEventListener("click", () => {
          pills.forEach((other) => other.classList.remove("is-active"));
          pill.classList.add("is-active");
        });
      });
    });
  }

  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach((group) => {
      const panels = document.querySelectorAll(group.dataset.tabs);
      group.querySelectorAll("[data-tab]").forEach((button) => {
        button.addEventListener("click", () => {
          group.querySelectorAll("[data-tab]").forEach((b) => b.classList.remove("tab-pill-active"));
          button.classList.add("tab-pill-active");
          panels.forEach((panel) => panel.classList.toggle("hidden", panel.dataset.panel !== button.dataset.tab));
        });
      });
    });
  }

  /* ---------------- Charts ---------------- */
  const NS = "http://www.w3.org/2000/svg";

  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    if (parent) parent.appendChild(node);
    return node;
  }

  function radarChart(root) {
    let data;
    try {
      data = JSON.parse(root.dataset.radar);
    } catch {
      return;
    }
    const size = 300;
    const cx = size / 2;
    const cy = size / 2 + 2;
    const radius = 128;
    const count = data.labels.length;
    const angle = (index) => (Math.PI * 2 * index) / count - Math.PI / 2;
    const point = (index, value) => [
      cx + Math.cos(angle(index)) * radius * (value / 100),
      cy + Math.sin(angle(index)) * radius * (value / 100),
    ];

    const svg = el("svg", { viewBox: `0 0 ${size} ${size}`, class: "h-full w-full overflow-visible" }, root);

    for (let ring = 4; ring >= 1; ring -= 1) {
      const pts = Array.from({ length: count }, (_, i) => point(i, (ring / 4) * 100).join(",")).join(" ");
      el("polygon", {
        points: pts,
        fill: ring === 4 ? "#FDFBF6" : "none",
        stroke: "#E3E7EE",
        "stroke-width": 1,
      }, svg);
    }

    for (let i = 0; i < count; i += 1) {
      const [x, y] = point(i, 100);
      el("line", { x1: cx, y1: cy, x2: x, y2: y, stroke: "#E3E7EE", "stroke-width": 1 }, svg);
    }

    const build = (values, fill, stroke, dash) =>
      el("polygon", {
        points: values.map((v, i) => point(i, v).join(",")).join(" "),
        fill,
        stroke,
        "stroke-width": 1.6,
        "stroke-dasharray": dash || "none",
        "stroke-linejoin": "round",
      }, svg);

    if (data.required) build(data.required, "none", "#9FB0C6", "4 4");
    build(data.you, "rgba(60,162,137,0.18)", "#3CA289");

    const labels = data.labels || [];
    labels.forEach((label, index) => {
      const [x, y] = point(index, 118);
      el("text", {
        x,
        y: y + 4,
        "text-anchor": Math.abs(x - cx) < 12 ? "middle" : x > cx ? "start" : "end",
        "font-size": 12,
        fill: "#5C6C80",
        "font-family": "DM Sans, sans-serif",
      }, svg).textContent = label;
    });
  }

  function lineChart(root) {
    let data;
    try {
      data = JSON.parse(root.dataset.lineChart);
    } catch {
      return;
    }
    const width = 520;
    const height = 250;
    const padding = { top: 14, right: 26, bottom: 28, left: 34 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const values = data.values || [];
    const labels = data.labels || [];
    const max = 100;
    const stepX = values.length > 1 ? innerW / (values.length - 1) : 0;
    const x = (i) => padding.left + i * stepX;
    const y = (v) => padding.top + innerH - (v / max) * innerH;

    const svg = el("svg", { viewBox: `0 0 ${width} ${height}`, class: "h-full w-full", preserveAspectRatio: "none" }, root);

    [0, 25, 50, 75, 100].forEach((tick) => {
      el("line", { x1: padding.left, y1: y(tick), x2: width - padding.right, y2: y(tick), stroke: "#EDEBE4", "stroke-width": 1 }, svg);
      el("text", {
        x: padding.left - 8,
        y: y(tick) + 4,
        "text-anchor": "end",
        "font-size": 9.5,
        fill: "#7B8A9C",
        "font-family": "DM Sans, sans-serif",
      }, svg).textContent = `${tick}%`;
    });

    const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
    const area = `${line} L${x(values.length - 1)},${padding.top + innerH} L${padding.left},${padding.top + innerH} Z`;
    el("path", { d: area, fill: "rgba(60,162,137,0.07)" }, svg);
    el("path", { d: line, fill: "none", stroke: "#3CA289", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);

    values.forEach((v, i) => {
      el("circle", { cx: x(i), cy: y(v), r: 3, fill: "#fff", stroke: "#3CA289", "stroke-width": 1.8 }, svg);
    });

    labels.forEach((label, i) => {
      el("text", {
        x: x(i),
        y: height - 8,
        "text-anchor": "middle",
        "font-size": 9.5,
        fill: "#7B8A9C",
        "font-family": "DM Sans, sans-serif",
      }, svg).textContent = label;
    });

    if (data.current !== undefined) {
      const i = values.length - 1;
      el("rect", {
        x: x(i) - 20,
        y: y(values[i]) - 26,
        width: 40,
        height: 18,
        rx: 5,
        fill: "#3CA289",
      }, svg);
      el("text", {
        x: x(i),
        y: y(values[i]) - 13,
        "text-anchor": "middle",
        "font-size": 9.5,
        fill: "#fff",
        "font-family": "DM Sans, sans-serif",
        "font-weight": 600,
      }, svg).textContent = `${values[i]}%`;
    }
  }

  function initCharts() {
    document.querySelectorAll("[data-radar]").forEach(radarChart);
    document.querySelectorAll("[data-line-chart]").forEach(lineChart);
  }

  /* ---------------- Progress bars ---------------- */
  function initProgress() {
    document.querySelectorAll("[data-progress]").forEach((bar) => {
      const value = Math.max(0, Math.min(100, Number(bar.dataset.progress) || 0));
      requestAnimationFrame(() => {
        bar.style.width = `${value}%`;
      });
    });
  }

  /* ---------------- Chat demo ---------------- */
  function initChat() {
    const form = document.querySelector("[data-chat-form]");
    if (!form) return;
    const log = document.querySelector("[data-chat-log]");
    const input = form.querySelector("input");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      const wrap = document.createElement("div");
      wrap.className = "flex justify-end";
      wrap.innerHTML = `<div class="max-w-[80%]"><div class="rounded-xl rounded-tr-sm bg-brand-soft px-4 py-2.5 text-[12.5px] text-ink">${text.replace(/</g, "&lt;")}</div><div class="mt-1 text-right text-[10.5px] text-muted">Just now</div></div>`;
      log.appendChild(wrap);
      input.value = "";
      log.scrollTop = log.scrollHeight;

      setTimeout(() => {
        const reply = document.createElement("div");
        reply.className = "flex items-start gap-2.5";
        reply.innerHTML = `<span class="icon-tile h-8 w-8 bg-lilac text-ink"><svg class="h-4 w-4"><use href="#i-bot"/></svg></span><div class="max-w-[78%]"><div class="rounded-xl rounded-tl-sm bg-white px-4 py-3 text-[12.5px] text-ink-2 ring-1 ring-line">Great question. Based on your Java &amp; SQL learning plan, I would start with the <span class="font-semibold text-ink">SQL Query Practice</span> module, then review the Java Foundations recap. Want me to add both to your plan?</div><div class="mt-1 text-[10.5px] text-muted">Just now</div></div>`;
        log.appendChild(reply);
        log.scrollTop = log.scrollHeight;
      }, 900);
    });
  }

  onReady(function () {
    initToast();
    initSidebar();
    initMenus();
    initFilterGroups();
    initSearchFilter();
    initToggles();
    initModals();
    initTabs();
    initPills();
    initPasswordToggles();
    initCharts();
    initProgress();
    initChat();
  });
})();
