/* Vowelle — standalone Home 2 JavaScript */
(() => {
  "use strict";

  const root = document.documentElement;
  const header = document.getElementById("siteHeader");
  const themeButton = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const directionButton = document.getElementById("directionToggle");
  const menuButton = document.getElementById("menuToggle");
  const navigation = document.getElementById("navigation");
  const homeButton = document.getElementById("homeToggle");
  const homeDropdown = document.getElementById("homeDropdown");
  const homeGroup = homeButton.closest(".home-group");

  /* Safe preference storage */
  const readStorage = key => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const writeStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Controls continue to work when storage is unavailable.
    }
  };

  /* Light / dark mode */
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  let savedTheme = readStorage("vowelle-theme");

  if (savedTheme !== "light" && savedTheme !== "dark") {
    savedTheme = null;
  }

  function applyTheme(theme) {
    const dark = theme === "dark";

    root.dataset.theme = dark ? "dark" : "light";
    root.style.colorScheme = dark ? "dark" : "light";

    themeIcon.setAttribute("href", dark ? "#sun" : "#moon");
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode"
    );

    document.querySelector('meta[name="theme-color"]')
      .setAttribute("content", dark ? "#111111" : "#742C45");
  }

  applyTheme(
    savedTheme || (systemTheme.matches ? "dark" : "light")
  );

  themeButton.addEventListener("click", () => {
    savedTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(savedTheme);
    writeStorage("vowelle-theme", savedTheme);
  });

  systemTheme.addEventListener("change", event => {
    if (!savedTheme) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  /* RTL / LTR */
  function applyDirection(direction) {
    const rtl = direction === "rtl";

    root.dir = rtl ? "rtl" : "ltr";

    directionButton.setAttribute("aria-pressed", String(rtl));
    directionButton.setAttribute(
      "aria-label",
      rtl
        ? "Switch to left-to-right layout"
        : "Switch to right-to-left layout"
    );

    directionButton.title = rtl
      ? "RTL — switch to LTR"
      : "LTR — switch to RTL";
  }

  applyDirection(
    readStorage("vowelle-direction") === "rtl" ? "rtl" : "ltr"
  );

  directionButton.addEventListener("click", () => {
    const direction = root.dir === "rtl" ? "ltr" : "rtl";
    applyDirection(direction);
    writeStorage("vowelle-direction", direction);
  });

  /* Actual header height keeps hero aligned with the viewport */
  function measureHeader() {
    root.style.setProperty(
      "--header-height",
      `${header.offsetHeight}px`
    );
  }

  measureHeader();

  if ("ResizeObserver" in window) {
    const headerObserver = new ResizeObserver(measureHeader);
    headerObserver.observe(header);
  } else {
    window.addEventListener("resize", measureHeader);
  }

  if (document.fonts) {
    document.fonts.ready.then(measureHeader);
  }

  /* Home dropdown */
  function setDropdown(open, returnFocus = false) {
    homeDropdown.hidden = !open;
    homeButton.setAttribute("aria-expanded", String(open));
    homeButton.setAttribute(
      "aria-label",
      open ? "Close Home pages" : "Open Home pages"
    );

    if (returnFocus) homeButton.focus();
  }

  homeButton.addEventListener("click", () => {
    setDropdown(homeDropdown.hidden);
  });

  homeButton.addEventListener("keydown", event => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setDropdown(true);
      homeDropdown.querySelector("a").focus();
    }
  });

  homeDropdown.addEventListener("keydown", event => {
    const links = [...homeDropdown.querySelectorAll("a")];
    const index = links.indexOf(document.activeElement);

    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      const offset = event.key === "ArrowDown" ? 1 : -1;
      const next = (index + offset + links.length) % links.length;

      links[next].focus();
    }
  });

  homeGroup.addEventListener("focusout", event => {
    if (!homeGroup.contains(event.relatedTarget)) {
      setDropdown(false);
    }
  });

  /* Mobile navigation */
  function setMenu(open, returnFocus = false) {
    navigation.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );

    if (!open) setDropdown(false);
    if (returnFocus) menuButton.focus();
  }

  menuButton.addEventListener("click", () => {
    setMenu(!navigation.classList.contains("is-open"));
  });

  navigation.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("click", event => {
    if (!homeGroup.contains(event.target)) {
      setDropdown(false);
    }

    if (
      navigation.classList.contains("is-open") &&
      !navigation.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      setMenu(false);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (!homeDropdown.hidden) {
      setDropdown(false, true);
    } else if (navigation.classList.contains("is-open")) {
      setMenu(false, true);
    }
  });

  const mobileQuery = window.matchMedia("(max-width: 1120px)");

  mobileQuery.addEventListener("change", () => {
    setMenu(false);
  });

  /* Interactive stationery suite */
  const stationery = {
    invitations: {
      number: "01 / THE FIRST IMPRESSION",
      title: "Wedding Invitations",
      description:
        "Introduce your celebration with meaningful wording, considered typography and a design that captures your wedding style.",
      features: [
        "Personal names and invitation wording",
        "Coordinated colors and typography",
        "Envelope and finishing direction"
      ],
      category: "invitations"
    },

    "save-the-date": {
      number: "02 / THE BEAUTIFUL ANNOUNCEMENT",
      title: "Save-the-Date Cards",
      description:
        "Give your guests a beautiful first glimpse of your plans, with a date announcement that connects to your invitation design.",
      features: [
        "Names, date and location details",
        "A coordinated visual introduction",
        "Print or digital design direction"
      ],
      category: "save-the-date"
    },

    rsvp: {
      number: "03 / THE THOUGHTFUL REPLY",
      title: "RSVP Cards",
      description:
        "Make replying feel simple and considered, with response cards designed as part of your complete wedding suite.",
      features: [
        "Clear response wording",
        "Space for your requested guest details",
        "A layout matched to your invitations"
      ],
      category: "rsvp"
    },

    menus: {
      number: "04 / AT YOUR CELEBRATION TABLE",
      title: "Wedding Menus",
      description:
        "Carry your wedding style onto every table with beautifully arranged menu designs that complement the rest of your stationery.",
      features: [
        "Personalized menu wording",
        "Considered type and spacing",
        "A design coordinated with your suite"
      ],
      category: "menus"
    },

    "place-cards": {
      number: "05 / A PERSONAL WELCOME",
      title: "Place Cards",
      description:
        "Welcome each guest with a personal paper detail, thoughtfully designed to belong at your celebration.",
      features: [
        "Guest name layout",
        "Coordinated typography and color",
        "Flat or folded format direction"
      ],
      category: "place-cards"
    },

    "thank-you": {
      number: "06 / THE LASTING THANK YOU",
      title: "Thank-You Cards",
      description:
        "Close your wedding story with a warm expression of gratitude, designed to feel connected to your beautiful beginning.",
      features: [
        "Personal thank-you wording",
        "Space for a handwritten message",
        "A coordinated closing chapter"
      ],
      category: "thank-you"
    }
  };

  const suiteButtons = [...document.querySelectorAll(".suite-tab")];
  const suitePanel = document.getElementById("suitePanel");
  const pieceNumber = document.getElementById("pieceNumber");
  const pieceTitle = document.getElementById("pieceTitle");
  const pieceDescription = document.getElementById("pieceDescription");
  const pieceFeatures = document.getElementById("pieceFeatures");
  const pieceLink = document.getElementById("pieceLink");

  suiteButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selected = stationery[button.dataset.piece];
      if (!selected) return;

      suiteButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      pieceNumber.textContent = selected.number;
      pieceTitle.textContent = selected.title;
      pieceDescription.textContent = selected.description;
      pieceLink.href = `products.html?category=${selected.category}`;

      const items = selected.features.map(feature => {
        const item = document.createElement("li");
        item.textContent = feature;
        return item;
      });

      pieceFeatures.replaceChildren(...items);

      suitePanel.classList.remove("panel-changing");
      void suitePanel.offsetWidth;
      suitePanel.classList.add("panel-changing");
    });
  });

  /* Scroll reveals */
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (
    "IntersectionObserver" in window &&
    !reducedMotion.matches
  ) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.08
    });

    const staggerParents = [
      ".collection-gallery",
      ".journey-grid",
      ".premium-testimonials"
    ];

    staggerParents.forEach(selector => {
      const parent = document.querySelector(selector);
      if (!parent) return;

      [...parent.children].forEach((element, index) => {
        element.style.transitionDelay = `${(index % 4) * 70}ms`;
      });
    });

    document.querySelectorAll(".reveal").forEach(element => {
      element.classList.add("reveal-ready");
      revealObserver.observe(element);
    });

    reducedMotion.addEventListener("change", event => {
      if (!event.matches) return;

      document.querySelectorAll(".reveal-ready").forEach(element => {
        element.classList.add("is-visible");
      });

      revealObserver.disconnect();
    });
  }

  /* Online image fallback */
  function imageFallback(image) {
    const wrapper = image.closest(".image-wrap");

    if (
      !wrapper ||
      wrapper.classList.contains("image-failed")
    ) {
      return;
    }

    wrapper.classList.add("image-failed");
    image.hidden = true;

    if (
      wrapper.classList.contains("hero-background") ||
      wrapper.classList.contains("final-background")
    ) {
      return;
    }

    const fallback = document.createElement("span");
    fallback.className = "image-fallback";
    fallback.textContent =
      `${image.alt}. Image temporarily unavailable.`;

    wrapper.append(fallback);
  }

  document.querySelectorAll("img").forEach(image => {
    image.addEventListener("error", () => imageFallback(image));

    if (
      image.complete &&
      image.naturalWidth === 0
    ) {
      imageFallback(image);
    }
  });

  /* Editable social destinations */
  const socialNotice = document.getElementById("socialNotice");

  document.querySelectorAll(".social-link").forEach(link => {
    const destination = link.dataset.url.trim();
    let valid = false;

    if (destination) {
      try {
        const url = new URL(destination);
        valid = url.protocol === "https:";
      } catch {
        valid = false;
      }
    }

    if (valid) {
      link.href = destination;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", link.dataset.name);
    } else {
      link.addEventListener("click", event => {
        event.preventDefault();

        if (socialNotice) {
          socialNotice.textContent =
            `${link.dataset.name} destination is a placeholder. Add your studio URL in data-url.`;
        }
      });
    }
  });

  document.getElementById("year").textContent =
    new Date().getFullYear();
})();