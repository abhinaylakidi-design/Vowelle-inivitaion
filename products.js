/* Vowelle Products — standalone JavaScript */
(() => {
    "use strict";
    const init = () => {
        const root = document.documentElement;
        const $ = id => document.getElementById(id);
        const header = $("siteHeader"), theme = $("themeToggle"), direction = $("directionToggle");
        const menu = $("menuToggle"), nav = $("navigation"), home = $("homeToggle"), dropdown = $("homeDropdown");
        const group = home.closest(".home-group");
        const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
        const write = (key, value) => { try { localStorage.setItem(key, value); } catch { } };
        const system = matchMedia("(prefers-color-scheme: dark)");
        let preference = read("vowelle-theme");
        if (!["light", "dark"].includes(preference)) preference = null;
        const applyTheme = value => {
            const dark = value === "dark";
            root.dataset.theme = value; root.style.colorScheme = value;
            $("themeIcon").setAttribute("href", dark ? "#sun" : "#moon");
            theme.setAttribute("aria-pressed", String(dark));
            theme.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
            document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#111111" : "#742C45");
        };
        applyTheme(preference || (system.matches ? "dark" : "light"));
        theme.addEventListener("click", () => { preference = root.dataset.theme === "dark" ? "light" : "dark"; applyTheme(preference); write("vowelle-theme", preference); });
        system.addEventListener("change", e => { if (!preference) applyTheme(e.matches ? "dark" : "light"); });
        const applyDirection = value => {
            root.dir = value; const rtl = value === "rtl";
            direction.setAttribute("aria-pressed", String(rtl));
            direction.setAttribute("aria-label", rtl ? "Switch to left-to-right layout" : "Switch to right-to-left layout");
            direction.title = rtl ? "RTL — switch to LTR" : "LTR — switch to RTL";
        };
        applyDirection(read("vowelle-direction") === "rtl" ? "rtl" : "ltr");
        direction.addEventListener("click", () => { const value = root.dir === "rtl" ? "ltr" : "rtl"; applyDirection(value); write("vowelle-direction", value); });
        const measure = () => root.style.setProperty("--header-height", `${header.offsetHeight}px`);
        measure(); if ("ResizeObserver" in window) new ResizeObserver(measure).observe(header); else window.addEventListener("resize", measure);
        const setDropdown = (open, focus = false) => {
            dropdown.hidden = !open; home.setAttribute("aria-expanded", String(open));
            home.setAttribute("aria-label", open ? "Close Home pages" : "Open Home pages");
            if (focus) home.focus();
        };
        const setMenu = (open, focus = false) => {
            nav.classList.toggle("is-open", open); menu.setAttribute("aria-expanded", String(open));
            menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
            if (!open) setDropdown(false); if (focus) menu.focus();
        };
        home.addEventListener("click", () => setDropdown(dropdown.hidden));
        home.addEventListener("keydown", e => { if (e.key === "ArrowDown") { e.preventDefault(); setDropdown(true); dropdown.querySelector("a")?.focus(); } });
        dropdown.addEventListener("keydown", e => {
            if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
            e.preventDefault(); const links = [...dropdown.querySelectorAll("a")];
            links[(links.indexOf(document.activeElement) + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length]?.focus();
        });
        group.addEventListener("focusout", e => { if (!group.contains(e.relatedTarget)) setDropdown(false); });
        menu.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
        nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
        document.addEventListener("click", e => { if (!group.contains(e.target)) setDropdown(false); if (nav.classList.contains("is-open") && !nav.contains(e.target) && !menu.contains(e.target)) setMenu(false); });
        document.addEventListener("keydown", e => { if (e.key !== "Escape") return; if (!dropdown.hidden) setDropdown(false, true); else if (nav.classList.contains("is-open")) setMenu(false, true); });
        matchMedia("(max-width: 1120px)").addEventListener("change", () => setMenu(false));
        const motion = matchMedia("(prefers-reduced-motion: reduce)");
        if ("IntersectionObserver" in window && !motion.matches) {
            const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }); }, { threshold: .08 });
            document.querySelectorAll(".reveal").forEach(el => { el.classList.add("reveal-ready"); observer.observe(el); });
            motion.addEventListener("change", e => { if (e.matches) { document.querySelectorAll(".reveal-ready").forEach(el => el.classList.add("is-visible")); observer.disconnect(); } });
        }
        const fallback = image => {
            const wrapper = image.closest(".image-wrap"); if (!wrapper || wrapper.classList.contains("image-failed")) return;
            wrapper.classList.add("image-failed"); image.hidden = true;
            const label = document.createElement("span"); label.className = "image-fallback"; label.textContent = `${image.alt}. Image temporarily unavailable.`; wrapper.append(label);
        };
        document.querySelectorAll("img").forEach(image => { image.addEventListener("error", () => fallback(image)); if (image.complete && !image.naturalWidth) fallback(image); });
        document.querySelectorAll(".social-link").forEach(link => {
            const destination = (link.dataset.url || "").trim(); let valid = false;
            try { valid = new URL(destination).protocol === "https:"; } catch { }
            if (valid) { link.href = destination; link.target = "_blank"; link.rel = "noopener noreferrer"; link.setAttribute("aria-label", link.dataset.name); }
            else link.addEventListener("click", e => { e.preventDefault(); const socialNotice = $("socialNotice"); if (socialNotice) socialNotice.textContent = `${link.dataset.name} destination is a placeholder. Add your studio URL in data-url.`; });
        });
        const filters = [...document.querySelectorAll('.filter')];
        const cards = [...document.querySelectorAll('.catalogue-card')];
        const applyFilter = selected => {
            if (!filters.some(button => button.dataset.filter === selected)) selected = 'all';
            const activeButton = filters.find(button => button.dataset.filter === selected);
            filters.forEach(button => { const active = button === activeButton; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
            let count = 0;
            cards.forEach(card => { const visible = selected === 'all' || (card.dataset.themes || '').split(' ').includes(selected); card.hidden = !visible; if (visible) { count++; card.classList.add('is-visible'); } });
            $('filterStatus').textContent = `${count} stationery categories shown. Theme: ${activeButton.textContent.trim()}.`;
            $('emptyState').hidden = count !== 0;
        };
        filters.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
        document.querySelectorAll('[data-theme-select]').forEach(link => link.addEventListener('click', () => applyFilter(link.dataset.themeSelect)));
        const params = new URLSearchParams(location.search);
        if (params.has('theme')) applyFilter(params.get('theme'));
        const category = params.get('category');
        const target = cards.find(card => card.id === category);
        if (target) { applyFilter('all'); requestAnimationFrame(() => target.scrollIntoView({ block: 'center', behavior: motion.matches ? 'auto' : 'smooth' })); }

        $("year").textContent = new Date().getFullYear();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})();
