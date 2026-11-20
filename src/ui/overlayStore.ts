export type OverlayTop = { id: string; level: number; order: number };
const layers = new Map<string, OverlayTop>();
const listeners = new Set<() => void>();
let order = 0;
const empty: OverlayTop = { id: "", level: 0, order: 0 };
let top = empty;
function publish() {
  const next =
    [...layers.values()].sort(
      (a, b) => b.level - a.level || b.order - a.order,
    )[0] || empty;
  if (next !== top) {
    top = next;
    listeners.forEach((fn) => fn());
  }
}
export function registerOverlay(id: string, level: number) {
  const layer = { id, level, order: ++order };
  layers.set(id, layer);
  publish();
  return () => {
    if (layers.get(id) === layer) {
      layers.delete(id);
      publish();
    }
  };
}
export const overlaySnapshot = () => top;
export const subscribeOverlays = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
