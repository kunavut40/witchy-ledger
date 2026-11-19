import { sceneGust } from "./SceneTransition";
import { useRef, useState } from "react";
export function isBackSwipe(
  start: { x: number; y: number; time: number },
  end: { x: number; y: number; time: number },
) {
  return (
    start.x <= 28 &&
    end.x - start.x >= 85 &&
    Math.abs(end.y - start.y) < 45 &&
    end.time - start.time < 800
  );
}
export function usePageNavigation(initial = "dashboard") {
  const history = useRef<string[]>([]),
    current = useRef(initial);
  const [page, set] = useState(initial);
  const navigate = (next: string) => {
    if (next === current.current) return;
    sceneGust("in");
    history.current.push(current.current);
    current.current = next;
    set(next);
  };
  const back = () => {
    const prev = history.current.pop();
    if (prev === undefined) return false;
    sceneGust("out");
    window.dispatchEvent(new Event("witchy-back-sound"));
    current.current = prev;
    set(prev);
    return true;
  };
  return [page, navigate, back] as const;
}
