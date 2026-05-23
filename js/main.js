$(function () {
  const $nav = $("[data-nav]");
  const $links = $(".main-menu .nav-link, .site-header .btn[href]");
  const currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const canAnimateInteractively = !prefersReducedMotion && supportsHover;
  const progressBar = document.createElement("div");
  let isTicking = false;

  progressBar.className = "page-progress";
  progressBar.setAttribute("aria-hidden", "true");
  document.body.prepend(progressBar);

  function updateNavbar() {
    $nav.toggleClass("is-scrolled", window.scrollY > 18);
  }

  function updateScrollProgress() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;

    progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
  }

  function queueViewportUpdate() {
    if (isTicking) {
      return;
    }

    isTicking = true;

    window.requestAnimationFrame(function () {
      updateNavbar();
      updateScrollProgress();
      isTicking = false;
    });
  }

  function closeNavbar() {
    const collapseElement = document.querySelector(".navbar-collapse.show");

    if (!collapseElement) {
      return;
    }

    if (window.bootstrap && window.bootstrap.Collapse) {
      window.bootstrap.Collapse.getOrCreateInstance(collapseElement).hide();
    } else {
      collapseElement.classList.remove("show");
    }
  }

  $links.each(function () {
    const hrefPage = ((this.getAttribute("href") || "").split("#")[0].split("/").pop() || "index.html").toLowerCase();

    if (hrefPage === currentPage) {
      this.classList.add("active");
    }
  });

  $("a[href^='#']").on("click", function (event) {
    const targetId = this.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const $target = $(targetId);

    if ($target.length) {
      event.preventDefault();
      $("html, body").animate(
        {
          scrollTop: $target.offset().top - 72
        },
        900
      );
      closeNavbar();
    }
  });

  $(".filter-btn").on("click", function () {
    const filter = $(this).data("filter");

    $(".filter-btn").removeClass("active");
    $(this).addClass("active");

    $(".portfolio-item").each(function () {
      const isVisible = filter === "all" || $(this).data("category") === filter;

      if (isVisible) {
        $(this).stop(true, true).fadeIn(220);
      } else {
        $(this).stop(true, true).fadeOut(220);
      }
    });
  });

  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  revealItems.forEach(function (item, index) {
    item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  function resetSpotlight(section) {
    const defaultY = section.matches(".hero-section, .page-hero") ? "30%" : "35%";

    section.style.setProperty("--pointer-x", "50%");
    section.style.setProperty("--pointer-y", defaultY);
  }

  document
    .querySelectorAll(".hero-section, .page-hero, .summary-section, .detail-section.soft, .blue-band, .blue-section")
    .forEach(function (section) {
      resetSpotlight(section);

      if (!canAnimateInteractively) {
        return;
      }

      section.addEventListener("pointermove", function (event) {
        if (event.pointerType === "touch") {
          return;
        }

        const rect = section.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        section.style.setProperty("--pointer-x", `${x.toFixed(2)}%`);
        section.style.setProperty("--pointer-y", `${y.toFixed(2)}%`);
      });

      section.addEventListener("pointerleave", function () {
        resetSpotlight(section);
      });
    });

  function resetSurface(surface) {
    surface.style.setProperty("--surface-shift-x", "0px");
    surface.style.setProperty("--surface-shift-y", "0px");
    surface.style.setProperty("--surface-rotate-x", "0deg");
    surface.style.setProperty("--surface-rotate-y", "0deg");
  }

  document
    .querySelectorAll(".video-frame, .media-panel, .summary-card, .detail-card, .process-card, .service-card, .about-panel, .metric-card, .case-card, .social-tile, .event-carousel")
    .forEach(function (surface) {
      surface.classList.add("interactive-surface");
      resetSurface(surface);

      if (!canAnimateInteractively) {
        return;
      }

      surface.addEventListener("pointermove", function (event) {
        if (event.pointerType === "touch") {
          return;
        }

        const rect = surface.getBoundingClientRect();
        const offsetX = (event.clientX - rect.left) / rect.width;
        const offsetY = (event.clientY - rect.top) / rect.height;
        const rotateY = (offsetX - 0.5) * 7;
        const rotateX = (0.5 - offsetY) * 7;
        const shiftX = (offsetX - 0.5) * 10;
        const shiftY = (offsetY - 0.5) * 8;

        surface.style.setProperty("--surface-rotate-x", `${rotateX.toFixed(2)}deg`);
        surface.style.setProperty("--surface-rotate-y", `${rotateY.toFixed(2)}deg`);
        surface.style.setProperty("--surface-shift-x", `${shiftX.toFixed(2)}px`);
        surface.style.setProperty("--surface-shift-y", `${shiftY.toFixed(2)}px`);
      });

      surface.addEventListener("pointerleave", function () {
        resetSurface(surface);
      });

      surface.addEventListener("pointercancel", function () {
        resetSurface(surface);
      });
    });

  updateNavbar();
  updateScrollProgress();

  window.addEventListener("scroll", queueViewportUpdate, { passive: true });
  window.addEventListener("resize", queueViewportUpdate);
  window.addEventListener("load", queueViewportUpdate);
});
