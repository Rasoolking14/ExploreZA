/* ============================================================
   ExploreZA (Non-profit) — Interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- DATA ---------------- */
  const PROGRAMMES = [
    { title: "Drakensberg Youth Hike", loc: "KwaZulu-Natal", cat: "outdoors", tag: "Outdoors", badge: "hard",
      impact: "A 2-day hike & camp for learners who've never left their township.",
      img: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=700&q=75" },
    { title: "Kruger Wildlife Day", loc: "Limpopo", cat: "wildlife", tag: "Wildlife", badge: "easy",
      impact: "A first-ever safari for learners from rural schools.",
      img: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=700&q=75" },
    { title: "Cape Coast Marine Day", loc: "Western Cape", cat: "coastal", tag: "Coastal", badge: "moderate",
      impact: "Tide pools, beaches and marine science for inland learners.",
      img: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=700&q=75" },
    { title: "City Science Expedition", loc: "Gauteng", cat: "educational", tag: "Educational", badge: "easy",
      impact: "Museums, a planetarium and a hands-on STEM day out.",
      img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&q=75" },
    { title: "Table Mountain Climb", loc: "Cape Town", cat: "outdoors", tag: "Outdoors", badge: "moderate",
      impact: "A summit day that builds confidence and teamwork.",
      img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=700&q=75" },
    { title: "Wetlands Eco Camp", loc: "KwaZulu-Natal", cat: "conservation", tag: "Conservation", badge: "easy",
      impact: "A conservation and life-skills camp in protected wetlands.",
      img: "https://images.unsplash.com/photo-1437209484568-e63b90a34f8b?w=700&q=75" }
  ];

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------------- RENDER PROGRAMMES ---------------- */
  function progCard(p) {
    return `
      <article class="adv-card" data-cat="${p.cat}">
        <div class="adv-card__media" style="--img:url('${p.img}')">
          <span class="badge badge--${p.badge}">${p.tag}</span>
          <span class="adv-card__spots">Fully funded</span>
        </div>
        <div class="adv-card__body">
          <div class="adv-card__top"><h3>${p.title}</h3></div>
          <div class="adv-card__meta">◍ ${p.loc}</div>
          <p class="prog-impact">${p.impact}</p>
          <div class="prog-foot">
            <button class="btn btn--primary btn--sm" data-page="donate">Sponsor this trip ›</button>
          </div>
        </div>
      </article>`;
  }
  function renderProgrammes(filter, target) {
    const el = $(target || "#programmeGrid"); if (!el) return;
    const list = (!filter || filter === "all") ? PROGRAMMES : PROGRAMMES.filter(p => p.cat === filter);
    el.innerHTML = list.length ? list.map(progCard).join("")
      : `<p class="muted">No programmes in this category yet — check back soon.</p>`;
  }

  /* ---------------- ROUTING ---------------- */
  const PAGES = ["home", "programmes", "impact", "about", "donate", "contact", "signin", "terms", "privacy"];

  function showPage(name, opts) {
    opts = opts || {};
    if (PAGES.indexOf(name) === -1) name = "home";
    $$(".page").forEach(p => p.classList.remove("page--active"));
    const target = $("#page-" + name);
    if (target) target.classList.add("page--active");

    const navName = (name === "terms" || name === "privacy") ? "" : name;
    $$(".nav__link").forEach(l => l.classList.toggle("is-active", l.dataset.page === navName));

    const footer = $("#footer");
    if (footer) footer.style.display = (name === "signin") ? "none" : "";

    if (name === "programmes") { renderProgrammes("all"); syncProgFilter("all"); }
    if (name === "signin") setAuthMode(opts.authmode || "signin");

    closeMobile();

    // optional scroll to a section (e.g. donate -> partner)
    if (opts.section) {
      const sec = $("#" + opts.section);
      if (sec) { requestAnimationFrame(() => sec.scrollIntoView({ behavior: "smooth", block: "start" })); }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    try { history.replaceState(null, "", "#" + name); } catch (e) {}
  }

  function syncProgFilter(filter) {
    $$("#progFilters .pill").forEach(p => p.classList.toggle("pill--active", p.dataset.filter === filter));
  }
  function closeMobile() {
    $("#navMobile").classList.remove("is-open");
    $("#navBurger").classList.remove("is-open");
    $("#navBurger").setAttribute("aria-expanded", "false");
  }

  /* ---------------- THEME ---------------- */
  const root = document.documentElement;
  const THEME_KEY = "exploreza-theme";
  function setTheme(mode) {
    root.setAttribute("data-theme", mode);
    const btn = $("#themeToggle");
    if (btn) btn.title = mode === "dark" ? "Switch to light mode" : "Switch to dark mode";
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
  }
  (function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved) return setTheme(saved);
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(prefersLight ? "light" : "dark");
  })();
  $("#themeToggle").addEventListener("click", function () {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* ---------------- MOBILE MENU ---------------- */
  const burger = $("#navBurger");
  burger.addEventListener("click", function () {
    const open = $("#navMobile").classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  /* ---------------- TOAST ---------------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); if (!t) return;
    t.textContent = msg; t.hidden = false;
    requestAnimationFrame(() => t.classList.add("is-show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.remove("is-show"); setTimeout(() => { t.hidden = true; }, 250); }, 2600);
  }

  /* ---------------- CLICK DELEGATION ---------------- */
  document.addEventListener("click", function (e) {
    const pageBtn = e.target.closest("[data-page]");
    if (pageBtn) {
      e.preventDefault();
      showPage(pageBtn.dataset.page, { section: pageBtn.dataset.section, authmode: pageBtn.dataset.authmode });
      return;
    }
    const social = e.target.closest("[data-social]");
    if (social) { toast("Follow us on " + social.dataset.social + " (demo link)."); return; }

    const filterPill = e.target.closest("#progFilters .pill");
    if (filterPill) { syncProgFilter(filterPill.dataset.filter); renderProgrammes(filterPill.dataset.filter); return; }
  });

  /* ---------------- DONATE LOGIC ---------------- */
  let donateFreq = "once";
  let donateAmount = 150;

  function impactFor(amount) {
    if (amount >= 2500) return { learners: Math.max(1, Math.round(amount / 150)), label: "a whole class day-trip" };
    if (amount >= 500)  return { learners: Math.max(1, Math.round(amount / 150)), label: "gear & a trip for a small group" };
    if (amount >= 150)  return { learners: 1, label: "a full day adventure" };
    return { learners: 1, label: "a meal & transport" };
  }
  function updateDonate() {
    const info = impactFor(donateAmount);
    const amtTxt = "R" + donateAmount.toLocaleString("en-ZA").replace(/,/g, " ");
    const btn = $("#donateBtn");
    if (btn) btn.textContent = "Donate " + amtTxt + (donateFreq === "monthly" ? " / month" : "");
    const line = $("#impactLine");
    if (line) line.innerHTML = amtTxt + " funds " + info.label + " for <strong>" +
      info.learners + (info.learners === 1 ? " learner" : " learners") + "</strong>" + (donateFreq === "monthly" ? ", every month." : ".");
    const fill = $("#impactFill");
    if (fill) { const pct = Math.max(12, Math.min(100, Math.round((donateAmount / 2500) * 100))); fill.style.width = pct + "%"; }
  }

  const tiers = $("#tiers");
  if (tiers) {
    tiers.addEventListener("click", function (e) {
      const tier = e.target.closest(".tier"); if (!tier) return;
      $$(".tier", tiers).forEach(t => t.classList.remove("tier--active"));
      tier.classList.add("tier--active");
      donateAmount = parseInt(tier.dataset.amount, 10);
      const custom = $("#customAmt"); if (custom) custom.value = "";
      updateDonate();
    });
  }
  const customAmt = $("#customAmt");
  if (customAmt) {
    customAmt.addEventListener("input", function () {
      const v = parseInt(customAmt.value, 10);
      if (!isNaN(v) && v > 0) {
        donateAmount = v;
        $$(".tier", tiers).forEach(t => t.classList.remove("tier--active"));
        updateDonate();
      }
    });
  }
  const freqWrap = $("#donateFreq");
  if (freqWrap) {
    freqWrap.addEventListener("click", function (e) {
      const f = e.target.closest(".freq"); if (!f) return;
      $$(".freq", freqWrap).forEach(b => b.classList.remove("freq--active"));
      f.classList.add("freq--active");
      donateFreq = f.dataset.freq;
      updateDonate();
    });
  }
  const donateForm = $("#donateForm");
  if (donateForm) {
    donateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = $("#dName").value.trim();
      const email = $("#dEmail").value.trim();
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const ok = $("#donateSuccess");
      if (!name || !re.test(email)) {
        ok.textContent = "Please enter your name and a valid email.";
        ok.style.color = "var(--red)"; ok.hidden = false;
        return;
      }
      const amtTxt = "R" + donateAmount.toLocaleString("en-ZA").replace(/,/g, " ");
      ok.style.color = "";
      ok.textContent = "✓ Thank you, " + name.split(" ")[0] + "! Your " +
        (donateFreq === "monthly" ? "monthly " : "") + amtTxt + " donation will help send a child exploring.";
      ok.hidden = false;
      donateForm.reset();
      setTimeout(() => { ok.hidden = true; }, 6000);
    });
  }

  /* ---------------- PARTNER FORM ---------------- */
  const partnerForm = $("#partnerForm");
  if (partnerForm) {
    partnerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const company = $("#pCompany").value.trim();
      const name = $("#pName").value.trim();
      const email = $("#pEmail").value.trim();
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const ok = $("#partnerSuccess");
      if (!company || !name || !re.test(email)) {
        ok.textContent = "Please complete company, contact, and a valid work email.";
        ok.style.color = "var(--red)"; ok.hidden = false; return;
      }
      ok.style.color = ""; ok.textContent = "✓ Thank you — our partnerships team will be in touch.";
      ok.hidden = false; partnerForm.reset();
      setTimeout(() => { ok.hidden = true; }, 6000);
    });
  }

  /* ---------------- CONTACT FORM ---------------- */
  const contactForm = $("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const fn = $("#cFn").value.trim();
      const ln = $("#cLn").value.trim();
      const email = $("#cEmail2").value.trim();
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const ok = $("#contactSuccess");
      if (!fn || !ln || !re.test(email)) {
        ok.textContent = "Please enter your name and a valid email.";
        ok.style.color = "var(--red)"; ok.hidden = false; return;
      }
      ok.style.color = ""; ok.textContent = "✓ Thanks — your message has been sent. We'll be in touch soon.";
      ok.hidden = false; contactForm.reset();
      setTimeout(() => { ok.hidden = true; }, 5000);
    });
  }

  /* ---------------- SIGN IN (accepts any login) ---------------- */
  const authForm = $("#authForm");
  const authMsg = $("#authMsg");
  function flashAuth(text, ok) {
    if (!authMsg) return;
    authMsg.textContent = text;
    authMsg.className = "auth__msg " + (ok ? "auth__msg--ok" : "auth__msg--error");
    authMsg.hidden = false;
  }
  function setSignedIn(name) {
    $("#navHi").textContent = "Hi, " + name;
    $("#navAvatar").textContent = (name[0] || "U").toUpperCase();
    const si = $(".nav__signin"); if (si) si.hidden = true;
    const acct = $("#navAccount"); if (acct) acct.hidden = false;
  }
  function setAuthMode(mode) {
    const isCreate = mode === "create";
    $$(".auth__tab").forEach(t => t.classList.toggle("auth__tab--active", t.dataset.auth === mode));
    $("#authTitle").textContent = isCreate ? "Create your account" : "Welcome back";
    $("#authSub").textContent = isCreate ? "Join ExploreZA as a volunteer or partner." : "Sign in to your ExploreZA account";
    $("#authSubmit").textContent = isCreate ? "Create Account →" : "Sign In →";
    const nameField = $(".field--create"); if (nameField) nameField.hidden = !isCreate;
    if (authMsg) authMsg.hidden = true;
  }
  $$(".auth__tab").forEach(tab => tab.addEventListener("click", () => setAuthMode(tab.dataset.auth)));

  const togglePass = $("#togglePass");
  if (togglePass) togglePass.addEventListener("click", function () {
    const p = $("#auth-pass"); p.type = p.type === "password" ? "text" : "password";
  });

  if (authForm) {
    authForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const user = $("#auth-email").value.trim();
      const pass = $("#auth-pass").value;
      const isCreate = $(".auth__tab--active").dataset.auth === "create";
      if (isCreate) {
        const nm = $("#auth-name").value.trim();
        if (!nm || !user || !pass) { flashAuth("Fill in your name, email, and a password.", false); return; }
        flashAuth("✓ Account created — signing you in…", true);
        setSignedIn(nm.split(" ")[0]);
      } else {
        if (!user || !pass) { flashAuth("Enter any username and password to continue.", false); return; }
        flashAuth("✓ Success! Signing you in…", true);
        setSignedIn(user.split("@")[0]);
      }
      setTimeout(function () { if (authMsg) authMsg.hidden = true; authForm.reset(); showPage("home"); }, 600);
    });
  }

  const signout = $("#navSignout");
  if (signout) signout.addEventListener("click", function () {
    $("#navAccount").hidden = true;
    const si = $(".nav__signin"); if (si) si.hidden = false;
    setAuthMode("signin");
    showPage("signin");
    toast("You've been signed out.");
  });

  /* ---------------- BOOT ---------------- */
  renderProgrammes("all", "#homeProgrammes");
  renderProgrammes("all", "#programmeGrid");
  updateDonate();

  const hash = (location.hash || "").replace("#", "");
  showPage(PAGES.indexOf(hash) !== -1 ? hash : "home");
})();