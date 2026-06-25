/* ============================================================
   ExploreZA (Non-profit, multi-page) — shared script
   Loaded on every page. Each block runs only if its
   elements exist on the current page.
   ============================================================ */
(function () {
  "use strict";

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* page -> file map (for in-content buttons that use data-page) */
  const FILES = {
    home: "index.html", programmes: "programmes.html", impact: "impact.html",
    about: "about.html", donate: "donate.html", contact: "contact.html",
    signin: "signin.html", terms: "terms.html", privacy: "privacy.html"
  };

  /* ---------- in-content navigation (buttons with data-page) ---------- */
  document.addEventListener("click", function (e) {
    const nav = e.target.closest("[data-page]");
    if (nav) {
      e.preventDefault();
      const file = FILES[nav.dataset.page] || "index.html";
      location.href = file + (nav.dataset.section ? "#" + nav.dataset.section : "");
      return;
    }
    const social = e.target.closest("[data-social]");
    if (social) { toast("Follow us on " + social.dataset.social + " (demo link)."); return; }

    const filterPill = e.target.closest("#progFilters .pill");
    if (filterPill) { syncProgFilter(filterPill.dataset.filter); renderProgrammes(filterPill.dataset.filter); }
  });

  /* ---------- active nav highlight ---------- */
  (function setActiveNav() {
    const page = document.body.getAttribute("data-active-page");
    $$(".nav__link[data-nav]").forEach(l => l.classList.toggle("is-active", l.dataset.nav === page));
  })();

  /* ---------- THEME (persists across pages) ---------- */
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
  const themeBtn = $("#themeToggle");
  if (themeBtn) themeBtn.addEventListener("click", () =>
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark"));

  /* ---------- MOBILE MENU ---------- */
  const burger = $("#navBurger");
  if (burger) burger.addEventListener("click", function () {
    const open = $("#navMobile").classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  /* ---------- SIGNED-IN STATE (persists across pages) ---------- */
  const USER_KEY = "exploreza-user";
  function showAccount(name) {
    const acct = $("#navAccount"), si = $(".nav__signin");
    if ($("#navHi")) $("#navHi").textContent = "Hi, " + name;
    if ($("#navAvatar")) $("#navAvatar").textContent = (name[0] || "U").toUpperCase();
    if (si) si.style.display = "none";
    if (acct) acct.hidden = false;
  }
  (function initAccount() {
    let user = null;
    try { user = localStorage.getItem(USER_KEY); } catch (e) {}
    if (user) showAccount(user);
  })();
  const signout = $("#navSignout");
  if (signout) signout.addEventListener("click", function () {
    try { localStorage.removeItem(USER_KEY); } catch (e) {}
    location.href = "signin.html";
  });

  /* ---------- TOAST ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); if (!t) return;
    t.textContent = msg; t.hidden = false;
    requestAnimationFrame(() => t.classList.add("is-show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.remove("is-show"); setTimeout(() => { t.hidden = true; }, 250); }, 2600);
  }

  /* ---------- PROGRAMMES (home preview + programmes page) ---------- */
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
            <a class="btn btn--primary btn--sm" href="donate.html">Sponsor this trip ›</a>
          </div>
        </div>
      </article>`;
  }
  function renderProgrammes(filter, target) {
    const el = $(target || "#programmeGrid"); if (!el) return;
    const list = (!filter || filter === "all") ? PROGRAMMES : PROGRAMMES.filter(p => p.cat === filter);
    el.innerHTML = list.length ? list.map(progCard).join("") : `<p class="muted">No programmes in this category yet.</p>`;
  }
  function syncProgFilter(filter) {
    $$("#progFilters .pill").forEach(p => p.classList.toggle("pill--active", p.dataset.filter === filter));
  }
  if ($("#homeProgrammes")) renderProgrammes("all", "#homeProgrammes");
  if ($("#programmeGrid")) renderProgrammes("all", "#programmeGrid");

  /* ---------- DONATE (donate.html) ---------- */
  let donateFreq = "once", donateAmount = 150;
  function impactFor(a) {
    if (a >= 2500) return { learners: Math.max(1, Math.round(a / 150)), label: "a whole class day-trip" };
    if (a >= 500)  return { learners: Math.max(1, Math.round(a / 150)), label: "gear & a trip for a small group" };
    if (a >= 150)  return { learners: 1, label: "a full day adventure" };
    return { learners: 1, label: "a meal & transport" };
  }
  function updateDonate() {
    if (!$("#donateBtn")) return;
    const info = impactFor(donateAmount);
    const amtTxt = "R" + donateAmount.toLocaleString("en-ZA").replace(/,/g, " ");
    $("#donateBtn").textContent = "Donate " + amtTxt + (donateFreq === "monthly" ? " / month" : "");
    if ($("#impactLine")) $("#impactLine").innerHTML = amtTxt + " funds " + info.label + " for <strong>" +
      info.learners + (info.learners === 1 ? " learner" : " learners") + "</strong>" + (donateFreq === "monthly" ? ", every month." : ".");
    if ($("#impactFill")) $("#impactFill").style.width = Math.max(12, Math.min(100, Math.round((donateAmount / 2500) * 100))) + "%";
  }
  const tiers = $("#tiers");
  if (tiers) {
    tiers.addEventListener("click", function (e) {
      const tier = e.target.closest(".tier"); if (!tier) return;
      $$(".tier", tiers).forEach(t => t.classList.remove("tier--active"));
      tier.classList.add("tier--active");
      donateAmount = parseInt(tier.dataset.amount, 10);
      if ($("#customAmt")) $("#customAmt").value = "";
      updateDonate();
    });
  }
  if ($("#customAmt")) $("#customAmt").addEventListener("input", function () {
    const v = parseInt(this.value, 10);
    if (!isNaN(v) && v > 0) { donateAmount = v; $$(".tier", tiers).forEach(t => t.classList.remove("tier--active")); updateDonate(); }
  });
  if ($("#donateFreq")) $("#donateFreq").addEventListener("click", function (e) {
    const f = e.target.closest(".freq"); if (!f) return;
    $$(".freq", this).forEach(b => b.classList.remove("freq--active"));
    f.classList.add("freq--active"); donateFreq = f.dataset.freq; updateDonate();
  });
  const donateForm = $("#donateForm");
  if (donateForm) {
    updateDonate();
    donateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = $("#dName").value.trim(), email = $("#dEmail").value.trim();
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, ok = $("#donateSuccess");
      if (!name || !re.test(email)) { ok.textContent = "Please enter your name and a valid email."; ok.style.color = "var(--red)"; ok.hidden = false; return; }
      const amtTxt = "R" + donateAmount.toLocaleString("en-ZA").replace(/,/g, " ");
      ok.style.color = "";
      ok.textContent = "✓ Thank you, " + name.split(" ")[0] + "! Your " + (donateFreq === "monthly" ? "monthly " : "") + amtTxt + " donation will help send a child exploring.";
      ok.hidden = false; donateForm.reset();
      setTimeout(() => { ok.hidden = true; }, 6000);
    });
  }

  /* ---------- PARTNER FORM (donate.html) ---------- */
  const partnerForm = $("#partnerForm");
  if (partnerForm) partnerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const company = $("#pCompany").value.trim(), name = $("#pName").value.trim(), email = $("#pEmail").value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, ok = $("#partnerSuccess");
    if (!company || !name || !re.test(email)) { ok.textContent = "Please complete company, contact, and a valid work email."; ok.style.color = "var(--red)"; ok.hidden = false; return; }
    ok.style.color = ""; ok.textContent = "✓ Thank you — our partnerships team will be in touch."; ok.hidden = false; partnerForm.reset();
    setTimeout(() => { ok.hidden = true; }, 6000);
  });

  /* ---------- CONTACT FORM (contact.html) ---------- */
  const contactForm = $("#contactForm");
  if (contactForm) contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const fn = $("#cFn").value.trim(), ln = $("#cLn").value.trim(), email = $("#cEmail2").value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, ok = $("#contactSuccess");
    if (!fn || !ln || !re.test(email)) { ok.textContent = "Please enter your name and a valid email."; ok.style.color = "var(--red)"; ok.hidden = false; return; }
    ok.style.color = ""; ok.textContent = "✓ Thanks — your message has been sent. We'll be in touch soon."; ok.hidden = false; contactForm.reset();
    setTimeout(() => { ok.hidden = true; }, 5000);
  });

  /* ---------- SIGN IN (signin.html, accepts any login) ---------- */
  const authForm = $("#authForm"), authMsg = $("#authMsg");
  function flashAuth(text, ok) {
    if (!authMsg) return;
    authMsg.textContent = text; authMsg.className = "auth__msg " + (ok ? "auth__msg--ok" : "auth__msg--error"); authMsg.hidden = false;
  }
  function setAuthMode(mode) {
    const isCreate = mode === "create";
    $$(".auth__tab").forEach(t => t.classList.toggle("auth__tab--active", t.dataset.auth === mode));
    if ($("#authTitle")) $("#authTitle").textContent = isCreate ? "Create your account" : "Welcome back";
    if ($("#authSub")) $("#authSub").textContent = isCreate ? "Join ExploreZA as a volunteer or partner." : "Sign in to your ExploreZA account";
    if ($("#authSubmit")) $("#authSubmit").textContent = isCreate ? "Create Account →" : "Sign In →";
    const nameField = $(".field--create"); if (nameField) nameField.hidden = !isCreate;
    if (authMsg) authMsg.hidden = true;
  }
  $$(".auth__tab").forEach(tab => tab.addEventListener("click", () => setAuthMode(tab.dataset.auth)));
  if ($("#togglePass")) $("#togglePass").addEventListener("click", function () {
    const p = $("#auth-pass"); p.type = p.type === "password" ? "text" : "password";
  });
  if (authForm) authForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const user = $("#auth-email").value.trim(), pass = $("#auth-pass").value;
    const isCreate = $(".auth__tab--active").dataset.auth === "create";
    let name;
    if (isCreate) {
      name = $("#auth-name").value.trim();
      if (!name || !user || !pass) { flashAuth("Fill in your name, email, and a password.", false); return; }
      name = name.split(" ")[0];
      flashAuth("✓ Account created — signing you in…", true);
    } else {
      if (!user || !pass) { flashAuth("Enter any username and password to continue.", false); return; }
      name = user.split("@")[0];
      flashAuth("✓ Success! Signing you in…", true);
    }
    try { localStorage.setItem(USER_KEY, name); } catch (err) {}
    setTimeout(() => { location.href = "index.html"; }, 600);
  });

})();