/* ==========================================================================
   Haneen's Art Space — shared interactions
   --------------------------------------------------------------------------
   ✳️  CONTACT_EMAIL: replace this placeholder with your real email address.
   ✳️  Artwork dates and tool lists live in the data-* attributes of each
       .art-card in index.html / en.html — edit them there whenever you like.
   ========================================================================== */

const CONTACT_EMAIL = "haneen.art@example.com";

(function () {
  "use strict";

  const root = document.documentElement;
  const lang = root.lang === "en" ? "en" : "ar";
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const pick = (ar, en) => (lang === "ar" ? ar : en);

  const ui = {
    ar: {
      date: "تاريخ الإنجاز",
      tools: "الأدوات المستخدمة",
      description: "وصف العمل",
      inspiration: "الفكرة والإلهام",
      prev: "السابق",
      next: "التالي",
      imageAlt: "تفاصيل العمل الفني",
      close: "إغلاق النافذة",
      filterLabel: "تصفية الأعمال",
      menuOpen: "فتح القائمة",
      menuClose: "إغلاق القائمة",
      themeLight: "تفعيل الوضع النهاري",
      themeDark: "تفعيل الوضع الليلي",
      formOk: "تم فتح برنامج البريد لديك لإرسال الرسالة ✨",
      formError: "يرجى تعبئة الاسم والبريد والرسالة أولاً.",
      mailSubject: "رسالة من معرض حنين الفني",
      copied: "تم نسخ الرسالة إلى الحافظة.",
    },
    en: {
      date: "Date completed",
      tools: "Tools used",
      description: "About this piece",
      inspiration: "Idea & inspiration",
      prev: "Previous",
      next: "Next",
      imageAlt: "Artwork detail",
      close: "Close artwork details",
      filterLabel: "Filter artworks",
      menuOpen: "Open menu",
      menuClose: "Close menu",
      themeLight: "Switch to light mode",
      themeDark: "Switch to dark mode",
      formOk: "Your email app has been opened with the message ✨",
      formError: "Please fill in your name, email and message first.",
      mailSubject: "Message from Haneen's Art Gallery",
      copied: "Message copied to clipboard.",
    },
  };
  const t = ui[lang];

  /* ---------------- Theme ---------------- */
  const themeToggle = $("#theme-toggle");
  function syncThemeButton() {
    if (!themeToggle) return;
    const isDark = root.dataset.theme === "dark";
    themeToggle.setAttribute("aria-label", isDark ? t.themeLight : t.themeDark);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.title = isDark ? t.themeLight : t.themeDark;
  }
  syncThemeButton();

  themeToggle?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("has-theme", next); } catch (_) { /* storage disabled */ }
    syncThemeButton();
  });

  /* ---------------- Mobile menu ---------------- */
  const nav = $("#primary-nav");
  const menuToggle = $("#menu-toggle");
  menuToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? t.menuClose : t.menuOpen);
  });
  $$('a', nav || document.createElement("div")).forEach((link) =>
    link.addEventListener("click", () => {
      nav?.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    })
  );
  document.addEventListener("click", (event) => {
    if (!nav?.classList.contains("is-open")) return;
    if (!event.target.closest(".site-header")) {
      nav.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------------- Header / back to top / active link ---------------- */
  const header = $(".site-header");
  const toTop = $("#to-top");
  function onScroll() {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
    toTop?.classList.toggle("is-visible", window.scrollY > 420);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const navLinks = $$('#primary-nav a[href^="#"]');
  const sections = navLinks
    .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) =>
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`)
          );
        });
      },
      { rootMargin: "-35% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((section) => activeObserver.observe(section));
  }

  /* ---------------- Reveal on scroll ---------------- */
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------------- Gallery filters ---------------- */
  const cards = $$(".art-card");
  const filterButtons = $$(".filter-btn");

  function applyFilter(value) {
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === value;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    cards.forEach((card) => {
      const visible = value === "all" || card.dataset.group === value;
      card.classList.toggle("is-hidden", !visible);
    });
  }
  filterButtons.forEach((button) =>
    button.addEventListener("click", () => applyFilter(button.dataset.filter))
  );

  /* ---------------- Artwork dialog ---------------- */
  const dialog = $("#art-dialog");
  const dialogImage = $("#dialog-image");
  const dialogCategory = $("#dialog-category");
  const dialogTitle = $("#dialog-title");
  const dialogDate = $("#dialog-date");
  const dialogTools = $("#dialog-tools");
  const dialogDesc = $("#dialog-desc");
  const dialogInsp = $("#dialog-insp");
  const dialogCounter = $("#dialog-counter");
  const dialogClose = $("#dialog-close");
  const prevBtn = $("#prev-art");
  const nextBtn = $("#next-art");
  const labelEls = {
    date: $("#label-date"),
    tools: $("#label-tools"),
    description: $("#label-description"),
    inspiration: $("#label-inspiration"),
  };
  Object.entries(labelEls).forEach(([key, el]) => { if (el) el.textContent = t[key]; });
  if (prevBtn) prevBtn.querySelector("span").textContent = t.prev;
  if (nextBtn) nextBtn.querySelector("span").textContent = t.next;

  let currentIndex = 0;
  let visibleCards = [];

  function visibleList() {
    return cards.filter((card) => !card.classList.contains("is-hidden"));
  }

  function renderArtwork(index) {
    const list = visibleList();
    if (!list.length || !dialog) return;
    currentIndex = (index + list.length) % list.length;
    const card = list[currentIndex];
    const data = card.dataset;

    dialogTitle.textContent = pick(data.titleAr, data.titleEn);
    dialogCategory.textContent = pick(data.categoryAr, data.categoryEn);
    dialogDate.textContent = pick(data.dateAr, data.dateEn);
    dialogDesc.textContent = pick(data.descAr, data.descEn);
    dialogInsp.textContent = pick(data.inspAr, data.inspEn);

    dialogImage.src = data.image;
    dialogImage.alt = pick(data.titleAr, data.titleEn) + " — " + t.imageAlt;

    dialogTools.replaceChildren();
    const tools = pick(data.toolsAr, data.toolsEn).split(lang === "ar" ? /،/ : /,/);
    tools.map((tool) => tool.trim()).filter(Boolean).forEach((tool) => {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = tool;
      dialogTools.appendChild(chip);
    });

    dialogCounter.textContent = `${currentIndex + 1} / ${list.length}`;
  }

  function openArtwork(card) {
    visibleCards = visibleList();
    const index = visibleCards.indexOf(card);
    if (index < 0) return;
    renderArtwork(index);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.body.classList.add("no-scroll");
    dialogClose?.focus();
  }

  function closeArtwork() {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
    document.body.classList.remove("no-scroll");
  }

  $$(".card-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => openArtwork(trigger.closest(".art-card")));
  });

  dialogClose?.addEventListener("click", closeArtwork);
  prevBtn?.addEventListener("click", () => renderArtwork(currentIndex - 1));
  nextBtn?.addEventListener("click", () => renderArtwork(currentIndex + 1));

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeArtwork();
  });
  dialog?.addEventListener("close", () => document.body.classList.remove("no-scroll"));
  document.addEventListener("keydown", (event) => {
    if (!dialog?.open) {
      if (event.key === "Escape" && nav?.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        menuToggle?.setAttribute("aria-expanded", "false");
      }
      return;
    }
    if (event.key === "Escape") closeArtwork();
    if (event.key === "ArrowLeft") renderArtwork(currentIndex + (root.dir === "rtl" ? 1 : -1));
    if (event.key === "ArrowRight") renderArtwork(currentIndex + (root.dir === "rtl" ? -1 : 1));
  });

  /* ---------------- Contact form → email client ---------------- */
  const form = $("#contact-form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = $("#form-status");
    const name = $("#field-name")?.value.trim() || "";
    const email = $("#field-email")?.value.trim() || "";
    const message = $("#field-message")?.value.trim() || "";

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailLooksValid || !message) {
      status.textContent = t.formError;
      status.classList.add("is-error");
      return;
    }
    status.classList.remove("is-error");
    status.textContent = t.formOk;

    const body = `${message}\n\n— ${name}\n${email}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.mailSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(body).catch(() => {});
    }
    form.reset();
  });

  /* ---------------- Footer year ---------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------- Init ---------------- */
  applyFilter("all");
})();
