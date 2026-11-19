import { useEffect } from "react";
import { OPEN_MS, motionDuration } from "./motion";
export const SCENE_TRANSITION_MS = OPEN_MS;
export function sceneGust(direction: "in" | "out" = "in") {
  window.dispatchEvent(new CustomEvent("witchy-gust", { detail: direction }));
}
// Animate the selected surface without stacking another translucent full-screen wash.
export default function SceneTransition() {
  useEffect(() => {
    let animation: Animation | undefined;
    const on = (event: Event) => {
      animation?.cancel();
      const duration = motionDuration();
      if (!duration) return;
      const surface =
        document.querySelector<HTMLElement>(".entry-categories") ||
        document.querySelector<HTMLElement>(".modal") ||
        document.querySelector<HTMLElement>(".content");
      if (!surface) return;
      const frames = [
        { opacity: 0, transform: "translateY(10px) scale(.97)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ];
      animation = surface.animate(
        (event as CustomEvent).detail === "out"
          ? [...frames].reverse()
          : frames,
        { duration, easing: "ease-out" },
      );
    };
    window.addEventListener("witchy-gust", on);
    return () => {
      animation?.cancel();
      window.removeEventListener("witchy-gust", on);
    };
  }, []);
  return null;
}
