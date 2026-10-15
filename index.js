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
      // Controls work even when storage is unavailable.
    }
  };

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  let savedTheme = readStorage("vowelle-theme");

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
    savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : systemTheme.matches ? "dark" : "light"
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

  // Measure the header so the hero fills the remaining viewport.
  function measureHeader() {
    root.style.setProperty(
      "--header-height",
      `${header.offsetHeight}px`
    );
  }

  measureHeader();

  if ("ResizeObserver" in window) {
    new ResizeObserver(measureHeader).observe(header);
  } else {
    window.addEventListener("resize", measureHeader);
  }

  function setDropdown(open, returnFocus = false) {
    homeDropdown.hidden = !open;

    homeButton.setAttribute("aria-expanded", String(open));
    homeButton.setAttribute(
      "aria-label",
      open ? "Close Home pages" : "Open Home pages"
    );

    if (returnFocus) {
      homeButton.focus();
    }
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

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      const offset = event.key === "ArrowDown" ? 1 : -1;
      links[(index + offset + links.length) % links.length].focus();
    }
  });

  homeGroup.addEventListener("focusout", event => {
    if (!homeGroup.contains(event.relatedTarget)) {
      setDropdown(false);
    }
  });

  function setMenu(open, returnFocus = false) {
    navigation.classList.toggle("is-open", open);

    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );

    if (!open) {
      setDropdown(false);
    }

    if (returnFocus) {
      menuButton.focus();
    }
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
    if (event.key !== "Escape") {
      return;
    }

    if (!homeDropdown.hidden) {
      setDropdown(false, true);
    } else if (navigation.classList.contains("is-open")) {
      setMenu(false, true);
    }
  });

  const mobileQuery = window.matchMedia("(max-width: 1120px)");
  mobileQuery.addEventListener("change", () => setMenu(false));

  // Product theme filters.
  const filterButtons = [...document.querySelectorAll(".filter")];
  const productCards = [...document.querySelectorAll(".product-card")];
  const filterStatus = document.getElementById("filterStatus");
  const emptyState = document.getElementById("emptyState");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;
      let count = 0;

      filterButtons.forEach(item => {
        const active = item === button;

        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      productCards.forEach(card => {
        const matches =
          selected === "all" ||
          card.dataset.themes.split(" ").includes(selected);

        card.hidden = !matches;

        if (matches) {
          count++;
          card.classList.add("is-visible");
        }
      });

      emptyState.hidden = count !== 0;
      filterStatus.textContent =
        `${count} stationery categories shown. Theme: ${button.textContent.trim()}.`;
    });
  });

  // Reveal animations with a reduced-motion fallback.
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08
    });

    document.querySelectorAll(".reveal").forEach(element => {
      element.classList.add("reveal-ready");

      if (element.parentElement.classList.contains("grid")) {
        const siblings = [...element.parentElement.children];

        element.style.transitionDelay =
          `${(siblings.indexOf(element) % 4) * 65}ms`;
      }

      observer.observe(element);
    });

    reducedMotion.addEventListener("change", event => {
      if (event.matches) {
        document.querySelectorAll(".reveal-ready")
          .forEach(element => element.classList.add("is-visible"));

        observer.disconnect();
      }
    });
  }

  // Failed online images retain their layout and descriptive text.
  function imageFallback(image) {
    const wrapper = image.closest(".image-wrap");

    if (!wrapper || wrapper.classList.contains("image-failed")) {
      return;
    }

    wrapper.classList.add("image-failed");
    image.hidden = true;

    const fallback = document.createElement("span");
    fallback.className = "image-fallback";
    fallback.textContent =
      `${image.alt}. Image temporarily unavailable.`;

    wrapper.append(fallback);
  }

  document.querySelectorAll("img").forEach(image => {
    image.addEventListener("error", () => imageFallback(image));

    if (image.complete && image.naturalWidth === 0) {
      imageFallback(image);
    }
  });

  // Add your social profile links in each icon's data-url attribute.
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