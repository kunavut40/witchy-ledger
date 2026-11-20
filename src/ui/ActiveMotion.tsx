import { useEffect } from "react";
import { overlaySnapshot, subscribeOverlays } from "./overlayStore";
// CSS owns motion; observers only enable visible artwork in the current surface.
export default function ActiveMotion({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      root = document.getElementById("root")!;
    let frame = 0;
    const visible = new Map<Element, boolean>(),
      marked = new Set<Element>(),
      stars = new Set<Element>();
    const inScope = (el: Element) => {
      if (document.hidden || media.matches) return false;
      const box = el.getBoundingClientRect();
      if (
        !box.width ||
        !box.height ||
        box.bottom < 0 ||
        box.top > innerHeight ||
        getComputedStyle(el).visibility === "hidden"
      )
        return false;
      const overlay = el.closest(
        ".modal-overlay,.radial-scrim,.more-menu-overlay,.category-orbit-overlay,.magic-calendar-overlay,.period-manager-overlay,.month-name-overlay",
      );
      const top = overlaySnapshot().level;
      return top > 0
        ? !!overlay && Number(getComputedStyle(overlay).zIndex) === top
        : !overlay &&
            !!el.closest(
              ".content,.refreshed-nav button.active,.sidebar button.active,.topbar .profile-button",
            );
    };
    const refresh = () => {
      frame = 0;
      const shell = root.querySelector<HTMLElement>(".app-shell");
      if (shell)
        shell.dataset.activeSurface =
          document.hidden || media.matches
            ? "paused"
            : overlaySnapshot().level
              ? "overlay"
              : "page";
      const icons = new Set(
        root.querySelectorAll(
          ".pixel-art-icon,.pixel-vector-icon,.rank-sprite,.spinning-ring",
        ),
      );
      visible.forEach((_, el) => {
        if (!icons.has(el)) {
          io.unobserve(el);
          visible.delete(el);
        }
      });
      icons.forEach((el) => {
        if (!visible.has(el)) {
          visible.set(el, true);
          io.observe(el);
        }
        const on = inScope(el) && visible.get(el) !== false;
        if (on) {
          el.setAttribute("data-live-icon", "true");
          marked.add(el);
        } else {
          el.removeAttribute("data-live-icon");
          marked.delete(el);
        }
      });
      const selected = new Set(
        Array.from(
          root.querySelectorAll(
            "button.selected,button.active,button[aria-pressed=true],button[data-held-visual=true]",
          ),
        ).filter((el) => inScope(el)),
      );
      stars.forEach((el) => {
        if (!selected.has(el)) {
          el.querySelector(":scope > .interaction-stars")?.remove();
          stars.delete(el);
        }
      });
      selected.forEach((el) => {
        if (stars.has(el)) return;
        const layer = document.createElement("span");
        layer.className = "interaction-stars";
        layer.setAttribute("aria-hidden", "true");
        for (let i = 0; i < 8; i++) {
          const star = document.createElement("i");
          star.textContent = i % 2 ? "✧" : "✦";
          star.style.setProperty("--star-i", String(i));
          layer.append(star);
        }
        el.append(layer);
        stars.add(el);
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(refresh);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => visible.set(e.target, e.isIntersecting));
      schedule();
    });
    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "aria-pressed", "data-held-visual"],
    });
    const unsubscribe = subscribeOverlays(schedule);
    document.addEventListener("visibilitychange", schedule);
    media.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      io.disconnect();
      unsubscribe();
      document.removeEventListener("visibilitychange", schedule);
      media.removeEventListener("change", schedule);
      marked.forEach((el) => el.removeAttribute("data-live-icon"));
      root.querySelector(".app-shell")?.removeAttribute("data-active-surface");
      stars.forEach((el) =>
        el.querySelector(":scope > .interaction-stars")?.remove(),
      );
    };
  }, [enabled]);
  return null;
}
