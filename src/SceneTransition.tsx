import { useEffect, useState, type CSSProperties } from "react";
import { STEP_MS } from "./motion";
export const SCENE_TRANSITION_MS = STEP_MS;
export function sceneGust(direction: "in" | "out" = "in") {
  window.dispatchEvent(new CustomEvent("witchy-gust", { detail: direction }));
}
export default function SceneTransition() {
  const [scene, setScene] = useState<{ key: number; direction: string } | null>(
    null,
  );
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let sequence = 0;
    const on = (e: Event) => {
      clearTimeout(timer);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setScene(null);
        return;
      }
      setScene({
        key: ++sequence,
        direction: (e as CustomEvent).detail === "out" ? "out" : "in",
      });
      timer = setTimeout(() => setScene(null), STEP_MS);
    };
    window.addEventListener("witchy-gust", on);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("witchy-gust", on);
    };
  }, []);
  return scene ? (
    <div
      key={scene.key}
      className={"scene-gust unified-motion gust-" + scene.direction}
      aria-hidden="true"
      style={{ "--scene-duration": STEP_MS + "ms" } as CSSProperties}
    />
  ) : null;
}
