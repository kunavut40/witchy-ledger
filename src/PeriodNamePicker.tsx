import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MONTHS } from "./monthPresets";
import { overlayHost, useOverlay } from "./ui/SharedBackdrop";
export default function PeriodNamePicker({
  initial = "",
}: {
  initial?: string;
}) {
  const [value, setValue] = useState(initial),
    [open, setOpen] = useState(false),
    [manual, setManual] = useState(!!initial && !MONTHS.includes(initial));
  const input = useRef<HTMLInputElement>(null);
  useOverlay(open, 550);
  useEffect(() => {
    if (!open) return;
    const back = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") back(e);
    };
    document.addEventListener("witchy-overlay-back", back);
    window.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("witchy-overlay-back", back);
      window.removeEventListener("keydown", key, true);
    };
  }, [open]);
  return (
    <div className="period-name-picker">
      <input name="name" type="hidden" value={value} />
      <button
        type="button"
        aria-label="เลือกชื่อรอบบัญชี"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {value || "เลือกเดือน หรือระบุชื่อเอง"} ▾
      </button>
      {manual && (
        <input
          ref={input}
          aria-label="ระบุชื่อรอบบัญชี"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="ชื่อรอบบัญชี"
        />
      )}
      {open &&
        createPortal(
          <div className="month-name-overlay" onClick={() => setOpen(false)}>
            <section
              className="period-manager"
              role="dialog"
              aria-modal="true"
              aria-label="พรีเซตชื่อรอบบัญชี"
              onClick={(e) => e.stopPropagation()}
            >
              <header>
                <h2>✦ ชื่อรอบบัญชี</h2>
                <button
                  type="button"
                  aria-label="ปิดพรีเซตชื่อ"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </header>
              <div className="month-preset-grid">
                {MONTHS.map((m, i) => (
                  <button
                    type="button"
                    key={m}
                    aria-pressed={value === m}
                    style={{ animationDelay: i * 15 + "ms" }}
                    onClick={() => {
                      setValue(m);
                      setManual(false);
                      setOpen(false);
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="manual-period-name"
                onClick={() => {
                  setManual(true);
                  setOpen(false);
                  setTimeout(() => input.current?.focus(), 0);
                }}
              >
                ✎ ระบุชื่อเอง
              </button>
            </section>
          </div>,
          overlayHost(),
        )}
    </div>
  );
}
