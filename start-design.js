
(() => {
  "use strict";

  const root = document.documentElement;
  const themeButton = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const directionButton = document.getElementById("directionToggle");

  const form = document.getElementById("designForm");
  const formMessage = document.getElementById("formMessage");
  const successPanel = document.getElementById("successPanel");

  let enquiryText = "";

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
      // Continue without storage.
    }
  };

  // Dark / light mode
  const systemTheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );

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

    const meta = document.querySelector('meta[name="theme-color"]');

    if (meta) {
      meta.content = dark ? "#111111" : "#742C45";
    }
  }

  applyTheme(
    savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : systemTheme.matches ? "dark" : "light"
  );

  themeButton.addEventListener("click", () => {
    savedTheme = root.dataset.theme === "dark"
      ? "light"
      : "dark";

    applyTheme(savedTheme);
    writeStorage("vowelle-theme", savedTheme);
  });

  systemTheme.addEventListener("change", event => {
    if (!savedTheme) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  // RTL / LTR mode
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
    directionButton.title = rtl ? "RTL — switch to LTR" : "LTR";
  }

  applyDirection(
    readStorage("vowelle-direction") === "rtl"
      ? "rtl"
      : "ltr"
  );

  directionButton.addEventListener("click", () => {
    const next = root.dir === "rtl" ? "ltr" : "rtl";
    applyDirection(next);
    writeStorage("vowelle-direction", next);
  });

  // Event date
  const dateInput = document.getElementById("eventDate");
  const now = new Date();

  dateInput.min = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  ).toISOString().split("T")[0];

  // Build enquiry text
  function buildEnquiry() {
    const data = new FormData(form);

    const get = name =>
      String(data.get(name) || "Not specified").trim();

    return [
      "VOWELLE — DESIGN ENQUIRY",
      "Your Story, Beautifully Invited.",
      "--------------------------------",
      "",
      "PERSONAL DETAILS",
      `Name: ${get("fullName")}`,
      `Email: ${get("email")}`,
      `Phone: ${get("phone")}`,
      `Event Date: ${get("eventDate")}`,
      "",
      "DESIGN PREFERENCES",
      `Stationery: ${get("stationeryType")}`,
      `Style: ${get("designTheme")}`,
      `Quantity: ${get("quantity")}`,
      `Budget: ${get("budget")}`,
      "",
      "FINISHING DETAILS",
      `Colors: ${get("colors")}`,
      `Vision: ${get("message")}`,
      "",
      "Consent to contact: Yes",
      `Prepared: ${new Date().toLocaleString()}`
    ].join("\n");
  }

  // Validate and prepare enquiry
  form.addEventListener("submit", event => {
    event.preventDefault();
    formMessage.textContent = "";

    if (!form.checkValidity()) {
      const invalid = form.querySelector(":invalid");

      if (invalid && invalid.type === "radio") {
        formMessage.textContent =
          "Please select your preferred design style.";

        document.querySelector(
          ".style-option input"
        ).focus();
      } else if (invalid) {
        invalid.reportValidity();
      }

      return;
    }

    enquiryText = buildEnquiry();

    form.hidden = true;
    successPanel.hidden = false;

    successPanel.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });

  // Download enquiry
  document.getElementById("downloadBtn")
    .addEventListener("click", () => {
      const blob = new Blob([enquiryText], {
        type: "text/plain;charset=utf-8"
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "vowelle-design-enquiry.txt";

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

  // Copy enquiry
  document.getElementById("copyBtn")
    .addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(enquiryText);

        formMessage.textContent =
          "Your design details have been copied.";
      } catch {
        formMessage.textContent =
          "Clipboard unavailable. Please download the enquiry.";
      }
    });

  // Restart
  document.getElementById("restartBtn")
    .addEventListener("click", () => {
      form.reset();
      enquiryText = "";

      form.hidden = false;
      successPanel.hidden = true;
      formMessage.textContent = "";

      document.querySelector(".design-card").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
})();
