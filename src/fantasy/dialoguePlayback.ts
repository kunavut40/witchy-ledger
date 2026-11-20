// One owner per displayed line; disposal cancels both typing and dismissal.
export const LETTER_MS = 27,
  DIALOGUE_DISMISS_MS = 1250;
export function dialoguePlayback(
  length: number,
  initial: number,
  motion: boolean,
  onCount: (count: number) => void,
  onDone: () => void,
) {
  let count = motion ? initial : length,
    disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const next = () => {
    if (disposed) return;
    if (count < length) {
      timer = setTimeout(() => {
        if (disposed) return;
        onCount(++count);
        next();
      }, LETTER_MS);
    } else
      timer = setTimeout(() => {
        if (!disposed) onDone();
      }, DIALOGUE_DISMISS_MS);
  };
  onCount(count);
  next();
  return () => {
    disposed = true;
    clearTimeout(timer);
  };
}
