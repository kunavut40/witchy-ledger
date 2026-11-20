import { useEffect } from "react";
export default function InteractionController({
  enabled,
}: {
  enabled: boolean;
}) {
  useEffect(() => {
    const visibility = () =>
      (document.documentElement.dataset.appVisible = String(!document.hidden));
    visibility();
    document.addEventListener("visibilitychange", visibility);
    if (!enabled)
      return () => document.removeEventListener("visibilitychange", visibility);
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const active = new Map<Element, Animation>();
    const pressed = new Map<
      number,
      { element: Element; timer: ReturnType<typeof setTimeout> }
    >();
    const stop = (id: number) => {
      const p = pressed.get(id);
      if (!p) return;
      clearTimeout(p.timer);
      pressed.delete(id);
      const animation = active.get(p.element);
      if (animation?.effect?.getTiming().iterations === Infinity) {
        animation.cancel();
        active.delete(p.element);
      }
    };
    const stopAll = () => {
      pressed.forEach((_, id) => stop(id));
      active.forEach((a) => a.cancel());
      active.clear();
    };
    const animate = (element: Element, held = false) => {
      if (media.matches || document.hidden || !element.isConnected) return;
      active.get(element)?.cancel();
      const animation = element.animate(
        [
          { transform: "translateY(0) scale(1)" },
          { transform: "translateY(-2px) scale(1.06)" },
          { transform: "translateY(0) scale(1)" },
        ],
        {
          duration: held ? 750 : 180,
          iterations: held ? Infinity : 1,
          easing: "ease-out",
        },
      );
      active.set(element, animation);
      animation.onfinish = () => {
        if (active.get(element) === animation) active.delete(element);
      };
    };
    const down = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest("button,a,[role=button],label");
      if (!button || button.matches(":disabled")) return;
      stop(event.pointerId);
      const element = button.querySelector(".pixel-art-icon,svg") || button;
      animate(element);
      const timer = setTimeout(() => animate(element, true), 350);
      pressed.set(event.pointerId, { element, timer });
    };
    const up = (event: PointerEvent) => stop(event.pointerId);
    const move = () => {
      pressed.forEach((p, id) => {
        if (!p.element.isConnected) stop(id);
      });
    };
    const detached = new MutationObserver(() => {
      if (!pressed.size && !active.size) return;
      move();
      active.forEach((animation, element) => {
        if (!element.isConnected) {
          animation.cancel();
          active.delete(element);
        }
      });
    });
    detached.observe(document.getElementById("root") || document.body, {
      childList: true,
      subtree: true,
    });
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("pointerup", up, true);
    document.addEventListener("pointercancel", up, true);
    document.addEventListener("pointermove", move, true);
    document.addEventListener("visibilitychange", stopAll);
    media.addEventListener("change", stopAll);
    window.addEventListener("blur", stopAll);
    return () => {
      detached.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      stopAll();
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("pointerup", up, true);
      document.removeEventListener("pointercancel", up, true);
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("visibilitychange", stopAll);
      media.removeEventListener("change", stopAll);
      window.removeEventListener("blur", stopAll);
    };
  }, [enabled]);
  return null;
}
