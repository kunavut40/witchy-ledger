import { useEffect, useState } from "react";
export function sceneGust(direction: "in" | "out" = "in") {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("witchy-gust", { detail: direction }));
}
export default function SceneTransition() {
  const [scene, setScene] = useState<{ key: number; direction: string } | null>(
    null,
  );
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      clearTimeout(timer);
      setScene({
        key: Date.now(),
        direction: (e as CustomEvent).detail || "in",
      });
      timer = setTimeout(() => setScene(null), 700);
    };
    window.addEventListener("witchy-gust", on);
    return () => {
      window.removeEventListener("witchy-gust", on);
      clearTimeout(timer);
    };
  }, []);
  return scene ? (
    <div
      key={scene.key}
      className={"scene-gust gust-" + scene.direction}
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <i
          key={i}
          style={{ top: 12 + i * 16 + "%", animationDelay: i * 0.045 + "s" }}
        />
      ))}
    </div>
  ) : null;
}
