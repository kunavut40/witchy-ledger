import { useEffect } from "react";
import { menuSound } from "./fantasy/sound";
export default function InteractionFeedback({ muted }: { muted: boolean }) {
  useEffect(() => {
    const start = (e: PointerEvent) => {
      if ((e.target as Element).closest("button,input,select,textarea,label"))
        menuSound("select", muted);
    };
    const change = () => menuSound("select", muted);
    document.addEventListener("pointerdown", start);
    document.addEventListener("change", change);
    const zoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchmove", zoom, { passive: false });
    return () => {
      document.removeEventListener("pointerdown", start);
      document.removeEventListener("change", change);
      document.removeEventListener("touchmove", zoom);
    };
  }, [muted]);
  return null;
}
