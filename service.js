(() => {
  "use strict";

  const root = document.documentElement;
  const $ = id => document.getElementById(id);

  const read = key => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const save = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Controls work even when browser storage is unavailable.
    }
  };

  /* THEME */

  const system = matchMedia("(prefers-color-scheme: dark)");
  let saved = read("vowelle-theme");

  function theme(value) {
    const dark = value === "dark";

    root.dataset.theme = dark ? "dark" : "light";
    root.style.colorScheme = root.dataset.theme;

    $("themeIcon")?.setAttribute("href", dark ? "#sun" : "#moon");

    $("themeToggle")?.setAttribute(
      "aria-pressed",
      String(dark)
    );

    $("themeToggle")?.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode"
    );

    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#111111" : "#742C45");
  }

  if (!["light", "dark"].includes(saved)) {
    saved = null;
  }

  theme(saved || (system.matches ? "dark" : "light"));

  $("themeToggle")?.addEventListener("click", () => {
    saved = root.dataset.theme === "dark" ? "light" : "dark";
    theme(saved);
    save("vowelle-theme", saved);
  });

  system.addEventListener("change", event => {
    if (!saved) {
      theme(event.matches ? "dark" : "light");
    }
  });

  /* DIRECTION */

  function direction(value) {
    root.dir = value;

    $("directionToggle")?.setAttribute(
      "aria-pressed",
      String(value === "rtl")
    );

    $("directionToggle")?.setAttribute(
      "aria-label",
      value === "rtl"
        ? "Switch to left-to-right layout"
        : "Switch to right-to-left layout"
    );

    if ($("directionToggle")) {
      $("directionToggle").title =
        value.toUpperCase() + " — switch direction";
    }
  }

  direction(
    read("vowelle-direction") === "rtl" ? "rtl" : "ltr"
  );

  $("directionToggle")?.addEventListener("click", () => {
    direction(root.dir === "rtl" ? "ltr" : "rtl");
    save("vowelle-direction", root.dir);
  });

  /* HEADER HEIGHT */

  const header = $("siteHeader");
  const nav = $("navigation");
  const menu = $("menuToggle");
  const home = $("homeToggle");
  const drop = $("homeDropdown");
  const group = home?.closest(".home-group");

  const measure = () => {
    if (header) {
      root.style.setProperty(
        "--header-height",
        header.offsetHeight + "px"
      );
    }
  };

  measure();

  if (header && "ResizeObserver" in window) {
    new ResizeObserver(measure).observe(header);
  } else {
    addEventListener("resize", measure);
  }

  /* HOME DROPDOWN */

  function dropdown(open, focus = false) {
    if (!drop || !home) return;

    drop.hidden = !open;

    home.setAttribute("aria-expanded", String(open));
    home.setAttribute(
      "aria-label",
      open ? "Close Home pages" : "Open Home pages"
    );

    if (focus) home.focus();
  }

  /* MOBILE NAVIGATION */

  function navigation(open, focus = false) {
    nav?.classList.toggle("is-open", open);

    menu?.setAttribute("aria-expanded", String(open));
    menu?.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );

    if (!open) dropdown(false);
    if (focus) menu?.focus();
  }

  home?.addEventListener("click", () => {
    if (drop) dropdown(drop.hidden);
  });

  home?.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" && drop) {
      event.preventDefault();
      dropdown(true);
      drop.querySelector("a")?.focus();
    }
  });

  drop?.addEventListener("keydown", event => {
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const links = [...drop.querySelectorAll("a")];
    if (!links.length) return;

    const index = links.indexOf(document.activeElement);
    const step = event.key === "ArrowDown" ? 1 : -1;

    links[
      (index + step + links.length) % links.length
    ]?.focus();
  });

  group?.addEventListener("focusout", event => {
    if (!group.contains(event.relatedTarget)) {
      dropdown(false);
    }
  });

  menu?.addEventListener("click", () => {
    if (nav) {
      navigation(!nav.classList.contains("is-open"));
    }
  });

  nav?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navigation(false);
    });
  });

  document.addEventListener("click", event => {
    if (!group?.contains(event.target)) {
      dropdown(false);
    }

    if (
      nav?.classList.contains("is-open") &&
      !nav.contains(event.target) &&
      !menu?.contains(event.target)
    ) {
      navigation(false);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (drop && !drop.hidden) {
      dropdown(false, true);
    } else if (nav?.classList.contains("is-open")) {
      navigation(false, true);
    }
  });

  matchMedia("(max-width:1120px)")
    .addEventListener("change", () => {
      navigation(false);
    });

  /* SOCIAL LINKS */

  document.querySelectorAll(".social-link").forEach(link => {
    let valid = false;

    try {
      valid = new URL(link.dataset.url || "").protocol === "https:";
    } catch {
      valid = false;
    }

    if (valid) {
      link.href = link.dataset.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", link.dataset.name);
    } else {
      link.addEventListener("click", event => {
        event.preventDefault();

        if ($("socialNotice")) {
          $("socialNotice").textContent =
            link.dataset.name +
            " profile is pending. Add your studio URL in data-url.";
        }
      });
    }
  });

  if ($("year")) {
    $("year").textContent = new Date().getFullYear();
  }
})();

/* SECTION REVEALS AND IMAGE FALLBACKS */

(() => {
  "use strict";

  const reduced = matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (
    "IntersectionObserver" in window &&
    !reduced.matches
  ) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: .08 }
    );

    document.querySelectorAll(".reveal").forEach(element => {
      element.classList.add("reveal-ready");
      observer.observe(element);
    });

    reduced.addEventListener("change", event => {
      if (event.matches) {
        document.querySelectorAll(".reveal-ready")
          .forEach(element => {
            element.classList.add("is-visible");
          });

        observer.disconnect();
      }
    });
  }

  document.querySelectorAll("img").forEach(image => {
    const fallback = () => {
      const wrapper = image.closest(".image-wrap");

      if (
        !wrapper ||
        wrapper.classList.contains("image-failed")
      ) {
        return;
      }

      wrapper.classList.add("image-failed");
      image.hidden = true;

      const note = document.createElement("span");
      note.className = "image-fallback";
      note.textContent =
        image.alt + ". Image temporarily unavailable.";

      wrapper.append(note);
    };

    image.addEventListener("error", fallback);

    if (image.complete && !image.naturalWidth) {
      fallback();
    }
  });
})();