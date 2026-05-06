(function () {
  const SITE = window.LEMONS_SITE || {};
  const pages = SITE.pages || {};

  function getPageConfig() {
    const key = document.body.dataset.page || "index";
    return pages[key] || {};
  }

  function createActionLink(item) {
    const link = document.createElement("a");
    link.className = "glass-action";
    link.href = item.href;

    const iconWrap = document.createElement("span");
    iconWrap.className = "action-icon";
    const icon = document.createElement("i");
    icon.className = item.icon;
    icon.setAttribute("aria-hidden", "true");
    iconWrap.appendChild(icon);

    const copy = document.createElement("span");
    copy.className = "action-copy";
    const title = document.createElement("strong");
    title.textContent = item.label;
    copy.appendChild(title);
    if (item.hint) {
      const hint = document.createElement("span");
      hint.className = "action-hint";
      hint.textContent = item.hint;
      copy.appendChild(hint);
    }

    const arrow = document.createElement("span");
    arrow.className = "action-arrow";
    arrow.textContent = "→";

    link.appendChild(iconWrap);
    link.appendChild(copy);
    link.appendChild(arrow);
    return link;
  }

  function createRailLink(item) {
    const link = document.createElement("a");
    link.className = "glass-rail-action";
    link.href = item.href;
    link.setAttribute("aria-label", item.label);
    link.setAttribute("title", item.label);
    link.dataset.tooltip = item.label;
    const currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if ((item.href || "").toLowerCase() === currentPage) {
      link.setAttribute("aria-current", "page");
    }

    const iconWrap = document.createElement("span");
    iconWrap.className = "rail-action-icon";
    const icon = document.createElement("i");
    icon.className = item.icon;
    icon.setAttribute("aria-hidden", "true");
    iconWrap.appendChild(icon);

    link.appendChild(iconWrap);
    return link;
  }

  function renderActionList(selector, items) {
    document.querySelectorAll(selector).forEach((container) => {
      container.innerHTML = "";
      items.forEach((item) => container.appendChild(createActionLink(item)));
    });
  }

  function renderRailList(selector, items) {
    document.querySelectorAll(selector).forEach((container) => {
      container.innerHTML = "";
      items.forEach((item) => container.appendChild(createRailLink(item)));
    });
  }

  function renderPageHero() {
    const page = getPageConfig();
    const hero = page.hero;
    if (!hero) return;

    document.querySelectorAll("[data-shell-page-hero]").forEach((container) => {
      container.innerHTML = `
        <div class="page-hero-mark">
          <i class="${hero.icon || 'fa-solid fa-lemon'}" aria-hidden="true"></i>
        </div>
        <p class="eyebrow">${hero.eyebrow || ''}</p>
        <h1 class="title">${hero.title || document.title || ''}</h1>
        <p class="subtitle">${hero.subtitle || ''}</p>
      `;
    });
  }

  function ensureGlobalRail() {
    if (document.body.dataset.page === "dashboard") {
      return;
    }

    let rail = document.querySelector("[data-shell-global-rail]");
    if (!rail) {
      rail = document.createElement("aside");
      rail.className = "dashboard-rail glass-panel";
      rail.setAttribute("aria-label", "Main navigation");
      rail.dataset.shellGlobalRail = "";
      document.body.insertBefore(rail, document.body.firstChild);
    }

    document.body.classList.add("has-global-rail");
    renderRailList("[data-shell-global-rail]", SITE.dashboardMenu || []);
  }

  function createNavButton({ href, id, label, text, icon, type = "button" }) {
    const button = document.createElement("button");
    button.type = "button";
    if (id) button.id = id;
    button.setAttribute("aria-label", label);
    const labelText = text || label || "";
    if (icon) {
      button.innerHTML = `
        <span class="nav-button-icon" aria-hidden="true"><i class="${icon}"></i></span>
        <span class="nav-button-label">${labelText}</span>
      `;
    } else {
      button.textContent = labelText;
    }
    button.addEventListener("click", () => {
      if (type === "link") {
        window.location.href = href;
      }
    });
    return button;
  }

  function renderNavBars() {
    const page = getPageConfig();

    document.querySelectorAll(".nav-bar[data-shell-nav]").forEach((nav) => {
      const prevHref = nav.dataset.prev || page.prev;
      const nextHref = nav.dataset.next || page.next;
      const downloadEnabled = nav.dataset.download !== undefined || page.download;
      const clearCacheEnabled = nav.dataset.clearCache !== undefined || page.clearCache;
      const downloadId = nav.dataset.downloadId || page.downloadId || "downloadReport";
      const downloadLabel = nav.dataset.downloadLabel || page.downloadLabel || "Download";
      const nextId = nav.dataset.nextId || page.nextId || "";
      const clearCacheId = nav.dataset.clearCacheId || page.clearCacheId || "clearCacheBtn";
      const clearCacheLabel = nav.dataset.clearCacheLabel || page.clearCacheLabel || "Clear Cache";

      nav.innerHTML = "";

      if (prevHref) {
        nav.appendChild(
        createNavButton({
          href: prevHref,
          label: "Back",
          text: "Back",
          icon: "fa-solid fa-chevron-left",
          type: "link"
        })
      );
      }

      if (downloadEnabled) {
        const downloadButton = createNavButton({
          id: downloadId,
          label: downloadLabel,
          text: downloadLabel,
          icon: "fa-solid fa-download"
        });
        if ((nav.dataset.downloadAction || page.downloadAction) === "print") {
          downloadButton.addEventListener("click", () => window.print());
        }
        nav.appendChild(downloadButton);
      }

      if (clearCacheEnabled) {
        nav.appendChild(
          createNavButton({
            id: clearCacheId,
            label: clearCacheLabel,
            text: clearCacheLabel,
            icon: "fa-solid fa-trash-can",
            type: "button"
          })
        );
        const clearButton = nav.querySelector(`[id="${clearCacheId}"]`);
        if (clearButton) {
          clearButton.addEventListener("click", () => {
            localStorage.clear();
            if ("caches" in window) {
              caches.keys().then((keys) => {
                Promise.all(keys.map((key) => caches.delete(key))).then(() => {
                  window.location.href = "certificate.html";
                });
              });
            } else {
              window.location.href = "certificate.html";
            }
          });
        }
      }

      if (nextHref) {
        nav.appendChild(
        createNavButton({
          href: nextHref,
          id: nextId,
          label: "Next",
          text: "Next",
          icon: "fa-solid fa-chevron-right",
          type: "link"
        })
      );
      }
    });
  }

  function initShell() {
    renderActionList("[data-shell-home-actions]", SITE.homeActions || []);
    renderRailList("[data-shell-dashboard-rail]", SITE.dashboardMenu || []);
    ensureGlobalRail();
    renderPageHero();
    renderNavBars();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShell);
  } else {
    initShell();
  }
})();
