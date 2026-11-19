import { useEffect, useRef, useState } from "react";
import { menuSound } from "./fantasy/sound";
export const OPEN_MS = 240,
  STEP_MS = OPEN_MS * 2;
export function motionDuration(ms = OPEN_MS) {
  return typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : ms;
}
export function useExitMotion(done: () => void, muted = false) {
  const [leaving, setLeaving] = useState(false);
  const pending = useRef(false),
    latest = useRef(done),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  latest.current = done;
  useEffect(() => () => clearTimeout(timer.current), []);
  const dismiss = () => {
    if (pending.current) return;
    pending.current = true;
    setLeaving(true);
    menuSound("back", muted);
    timer.current = setTimeout(() => {
      pending.current = false;
      setLeaving(false);
      latest.current();
    }, motionDuration());
  };
  return { leaving, dismiss };
}
