import { X } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const stack: HTMLElement[] = [];
const previousInert = new Map<HTMLElement, boolean>();
let previousOverflow = '';
function syncBackground() {
  const top = stack.at(-1);
  for (const child of document.body.children) {
    if (!(child instanceof HTMLElement)) continue;
    if (top) {
      if (!previousInert.has(child)) previousInert.set(child, child.inert);
      child.inert = child !== top;
    }
  }
  if (!top) {
    for (const [element, inert] of previousInert) element.inert = inert;
    previousInert.clear();
  }
}

function tabbable(root: HTMLElement) {
  return [
    ...root.querySelectorAll<HTMLElement>(
      'button,a[href],input,select,textarea,[contenteditable="true"],[tabindex]',
    ),
  ].filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      !element.closest('[inert],[hidden],[aria-hidden="true"]') &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== 'hidden',
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prior = document.activeElement as HTMLElement;
    if (!stack.length) previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const layer = overlay.current!;
    stack.push(layer);
    syncBackground();
    const observer = new MutationObserver(syncBackground);
    observer.observe(document.body, { childList: true });
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (stack.at(-1) !== layer) return;
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab') {
        const items = ref.current ? tabbable(ref.current) : [];
        const first = items[0],
          last = items.at(-1);
        if (!items.length) {
          e.preventDefault();
          ref.current?.focus();
          return;
        }
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        }
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    const containFocus = (event: FocusEvent) => {
      if (stack.at(-1) === layer && !ref.current?.contains(event.target as Node))
        ref.current?.focus();
    };
    document.addEventListener('keydown', key);
    document.addEventListener('focusin', containFocus);
    return () => {
      observer.disconnect();
      stack.splice(stack.indexOf(layer), 1);
      syncBackground();
      document.body.style.overflow = stack.length ? 'hidden' : previousOverflow;
      document.removeEventListener('keydown', key);
      document.removeEventListener('focusin', containFocus);
      if (prior?.isConnected && !prior.closest('[inert]')) prior.focus();
    };
  }, []);
  return createPortal(
    <div
      ref={overlay}
      className="fixed inset-0 z-80 flex items-center justify-center bg-ink/60 p-7 backdrop-blur-sm max-sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-dialog w-full overflow-y-auto rounded-2xl bg-canvas p-7 shadow-2xl max-sm:p-5 ${wide ? 'max-w-4xl' : 'max-w-dialog'}`}
      >
        <div className="mb-6 flex items-center justify-between gap-5 [&_h2]:text-3xl">
          <h2>{title}</h2>
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-primary transition-colors hover:bg-lilac"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
