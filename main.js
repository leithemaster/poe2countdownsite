// Launch: Friday 11 December 2026, 1:00 PM PST = 3:00 PM CST in Texas (21:00 UTC).
// GGG has confirmed the date; the hour follows their usual 1 PM Pacific launch slot. Change it here if they announce otherwise.
const LAUNCH = Date.parse("2026-12-11T21:00:00Z");

const pad = (n) => String(n).padStart(2, "0");

function startCountdown() {
  const root = document.querySelector("[data-countdown]");
  if (!root) return;
  const cells = {
    d: root.querySelector('[data-unit="d"]'),
    h: root.querySelector('[data-unit="h"]'),
    m: root.querySelector('[data-unit="m"]'),
    s: root.querySelector('[data-unit="s"]'),
  };
  const when = root.querySelector("[data-local]");
  if (when) {
    try {
      // Hamza is in Texas (Central Time); show that first, and the viewer's own time if it differs.
      const fmt = (tz) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short", ...(tz && { timeZone: tz }) }).format(LAUNCH);
      const texas = fmt("America/Chicago");
      const here = fmt();
      when.textContent = here === texas
        ? `Friday 11 December, ${texas} in Texas.`
        : `Friday 11 December, ${texas} in Texas (${here} where you are).`;
    } catch (_) { /* keep the static fallback */ }
  }
  const tick = () => {
    const left = Math.max(0, LAUNCH - Date.now());
    cells.d.textContent = String(Math.floor(left / 864e5));
    cells.h.textContent = pad(Math.floor(left / 36e5) % 24);
    cells.m.textContent = pad(Math.floor(left / 6e4) % 60);
    cells.s.textContent = pad(Math.floor(left / 1e3) % 60);
    if (left === 0) {
      root.classList.add("is-live");
      if (when) when.textContent = "It's live, Hamza. Log in.";
      return;
    }
    setTimeout(tick, 1000 - (Date.now() % 1000));
  };
  tick();
}

function calendarFile() {
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hamza countdown//PoE2//EN",
    "BEGIN:VEVENT",
    "UID:poe2-1-0-launch-20261211@hamza-countdown",
    "DTSTAMP:20261109T000000Z",
    "DTSTART:20261211T210000Z",
    "DTEND:20261212T030000Z",
    "SUMMARY:Path of Exile 2 1.0 launch",
    "DESCRIPTION:Path of Exile 2 leaves early access and goes free to play. Clear the afternoon\\, Hamza: 3 PM Texas time.",
    "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:PoE2 launches in 30 minutes", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
}

function wireCalendar() {
  document.querySelectorAll("[data-ics]").forEach((a) => {
    a.addEventListener("click", () => { a.href = calendarFile(); });
  });
}

function wireAppbar() {
  const bar = document.querySelector(".appbar");
  if (!bar) return;
  const update = () => bar.classList.toggle("is-scrolled", window.scrollY > 24);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function wireMoment() {
  const el = document.querySelector(".moment");
  if (!el || !("IntersectionObserver" in window)) { el && el.classList.add("is-in"); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } });
  }, { threshold: 0.45 });
  io.observe(el);
}

function wireFilters() {
  const chips = [...document.querySelectorAll(".chip[data-filter]")];
  if (!chips.length) return;
  const cards = [...document.querySelectorAll(".work[data-cat]")];
  chips.forEach((chip) => {
    const f = chip.dataset.filter;
    const n = f === "all" ? cards.length : cards.filter((c) => c.dataset.cat === f).length;
    const badge = chip.querySelector(".n");
    if (badge) badge.textContent = n;
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      cards.forEach((c) => { c.hidden = !(f === "all" || c.dataset.cat === f); });
      document.querySelector(".works")?.classList.toggle("is-filtered", f !== "all");
    });
  });
}

startCountdown();
wireCalendar();
wireAppbar();
wireMoment();
wireFilters();
