import { useSyncExternalStore } from "react";
type Request = { message: string; resolve: (value: boolean) => void };
let pending: Request | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());
export function askConfirm(message: string) {
  return new Promise<boolean>((resolve) => {
    if (pending) pending.resolve(false);
    pending = { message, resolve };
    notify();
  });
}
export default function Confirm() {
  const request = useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => pending,
  );
  if (!request) return null;
  function settle(value: boolean) {
    pending = null;
    notify();
    request!.resolve(value);
  }
  return (
    <div className="modal-overlay confirmation">
      <section
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <header>
          <h2 id="confirm-title">ตรวจสอบก่อนดำเนินการ</h2>
        </header>
        <p
          id="confirm-message"
          style={{ padding: "24px 28px", whiteSpace: "pre-line" }}
        >
          {request.message}
        </p>
        <footer>
          <button
            autoFocus
            className="soft-button"
            onClick={() => settle(false)}
          >
            ยกเลิก
          </button>
          <button className="primary" onClick={() => settle(true)}>
            ยืนยันดำเนินการ
          </button>
        </footer>
      </section>
    </div>
  );
}
