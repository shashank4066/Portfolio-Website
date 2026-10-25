/* ═══════════════════════════════════════════════════════════
   SHASHANK — Portfolio interactions
   ═══════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ── Preloader ─────────────────────────────────────────── */

  const preloader = document.getElementById("preloader");

  const finishLoad = () => {
    if (!preloader || preloader.classList.contains("done")) return;
    preloader.classList.add("done");
    document.body.classList.remove("loading");
    document.body.classList.add("ready");
  };

  window.addEventListener("load", () => setTimeout(finishLoad, 450));
  setTimeout(finishLoad, 2600); // safety net

  /* ── Custom cursor ─────────────────────────────────────── */

  const cursor = document.getElementById("cursor");

  if (cursor && !isTouch) {
    document.body.classList.add("has-cursor");
    let cx = -100, cy = -100, tx = -100, ty = -100;

    window.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      cursor.style.opacity = "1";
    });

    document.addEventListener("mouseleave", () => { cursor.style.opacity = "0"; });

    (function loopCursor() {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loopCursor);
    })();

    const hoverables = "a, button, .pill, [data-toggle]";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add("hovering");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.remove("hovering");
    });
  }

  /* ── Magnetic buttons ──────────────────────────────────── */

  if (!isTouch && !prefersReduced) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ── Reveal on scroll ──────────────────────────────────── */

  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReduced) {
    revealEls.forEach((el) => el.classList.add("in-view"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        let i = 0;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${Math.min(i * 70, 350)}ms`;
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
            i++;
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ── Count-up stats ────────────────────────────────────── */

  const nums = document.querySelectorAll(".stat__num");

  const countUp = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const dur = 1500;
    const start = performance.now();

    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const statsIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          statsIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  nums.forEach((el) => statsIO.observe(el));

  /* ── Header: hide on scroll down, shade when scrolled ──── */

  const header = document.getElementById("header");
  let lastY = window.scrollY;

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      header.classList.toggle("scrolled", y > 60);
      if (y > lastY && y > 320 && !menu.classList.contains("open")) {
        header.classList.add("hidden");
      } else {
        header.classList.remove("hidden");
      }
      lastY = y;
    },
    { passive: true }
  );

  /* ── Active nav link ───────────────────────────────────── */

  const navLinks = document.querySelectorAll(".nav__link");
  const sections = [
    document.getElementById("hero"),
    ...[...navLinks].map((l) => document.querySelector(l.getAttribute("href"))),
  ].filter(Boolean);

  const sectionIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((l) =>
            l.classList.toggle("active", l.getAttribute("href") === `#${entry.target.id}`)
          );
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );
  sections.forEach((s) => sectionIO.observe(s));

  /* ── Mobile menu ───────────────────────────────────────── */

  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobileMenu");

  document.querySelectorAll(".menu__link").forEach((l, i) => l.setAttribute("data-i", i));

  const toggleMenu = (open) => {
    menu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  burger.addEventListener("click", () => toggleMenu(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ── Timeline expand/collapse ──────────────────────────── */

  document.querySelectorAll("[data-toggle]").forEach((head) => {
    const tl = head.closest(".tl");
    head.setAttribute("role", "button");
    head.setAttribute("tabindex", "0");
    head.setAttribute("aria-expanded", "false");

    const toggle = () => {
      tl.classList.toggle("open");
      head.setAttribute("aria-expanded", String(tl.classList.contains("open")));
    };

    head.addEventListener("click", toggle);
    head.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });

  /* ── IST clock ─────────────────────────────────────────── */

  const clocks = ["istClock", "istClock2"].map((id) => document.getElementById(id)).filter(Boolean);

  const tick = () => {
    const t = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    }).format(new Date());
    clocks.forEach((c) => { c.textContent = t; });
  };
  tick();
  setInterval(tick, 1000);

  /* ── Hero particle globe ───────────────────────────────── */

  const canvas = document.getElementById("globeCanvas");

  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, running = false, raf = null;

    // Fibonacci sphere points
    const N = 640;
    const points = [];
    for (let i = 0; i < N; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      points.push({
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi),
      });
    }

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const TILT = -0.35;

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.42;
      const rot = t * 0.00012;

      for (const p of points) {
        // rotate around Y, then tilt around X
        const x1 = p.x * Math.cos(rot) - p.z * Math.sin(rot);
        const z1 = p.x * Math.sin(rot) + p.z * Math.cos(rot);
        const y2 = p.y * Math.cos(TILT) - z1 * Math.sin(TILT);
        const z2 = p.y * Math.sin(TILT) + z1 * Math.cos(TILT);

        const depth = (z2 + 1) / 2; // 0 = back, 1 = front
        if (depth < 0.14) continue; // cull far side

        const sx = cx + x1 * R;
        const sy = cy + y2 * R;
        const size = 0.9 + depth * 1.9;
        const alpha = 0.09 + depth * 0.62;

        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        // front dots orange, back dots fade toward grey
        ctx.fillStyle =
          depth > 0.5
            ? `rgba(255, 110, 40, ${alpha})`
            : `rgba(255, 150, 100, ${alpha * 0.75})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    };

    resize();
    window.addEventListener("resize", resize);

    // Only animate while hero is on screen
    const globeIO = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
      { threshold: 0 }
    );
    globeIO.observe(canvas);

    start();
  }
})();
