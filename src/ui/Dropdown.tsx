import { Check, ChevronDown } from 'lucide-react';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

export function Dropdown({
  label,
  value,
  options,
  onChange,
  leading,
  className = '',
  upward = false,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  leading?: ReactNode;
  className?: string;
  upward?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const current = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const focusItem = (index: number) =>
    items.current[(index + options.length) % options.length]?.focus();
  const openMenu = (index = current) => {
    setOpen(true);
    requestAnimationFrame(() => focusItem(index));
  };
  const closeMenu = (restore = false) => {
    setOpen(false);
    if (restore) trigger.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return (
    <div
      role="presentation"
      ref={root}
      className={`custom-dropdown relative font-sans ${upward ? '[&>div[role=listbox]]:top-auto [&>div[role=listbox]]:bottom-full [&>div[role=listbox]]:left-0 [&>div[role=listbox]]:right-auto [&>div[role=listbox]]:mb-3 [&>div[role=listbox]]:mt-0' : ''}  ${className}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          closeMenu(true);
        }
        if (event.key === 'Tab' && open) closeMenu();
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="dropdown-trigger h-12 min-w-32 justify-start gap-2.5 rounded-xl px-3 py-1.5 text-sm font-bold text-ink hover:bg-lilac aria-expanded:bg-lilac [&>span]:flex-1 [&>span]:whitespace-nowrap [&>span]:text-left [&>svg]:transition-transform aria-expanded:[&>svg]:rotate-180 max-sm:min-w-0"
        aria-label={`${label}: ${options.find((option) => option.value === value)?.label || value}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            openMenu(event.key === 'ArrowDown' ? current : current - 1);
          }
        }}
      >
        {leading}
        <span>{options.find((option) => option.value === value)?.label || label}</span>
        <ChevronDown size={16} className="" />
      </button>
      {open && (
        <div
          id={menuId}
          className="absolute right-0 top-full z-50 mt-2 min-w-44 rounded-2xl border border-line bg-white p-1.5 shadow-xl [&_button]:min-h-11 [&_button]:w-full [&_button]:justify-between [&_button]:gap-4 [&_button]:rounded-lg [&_button]:px-3 [&_button]:py-2.5 [&_button]:text-left [&_button]:text-sm [&_button]:font-semibold [&_button]:hover:bg-surface [&_button]:focus-visible:bg-surface [&_button[aria-selected=true]]:bg-lilac [&_button[aria-selected=true]]:text-primary"
          role="listbox"
          aria-label={label}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              ref={(element) => {
                items.current[index] = element;
              }}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                closeMenu(true);
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  focusItem(index + (event.key === 'ArrowDown' ? 1 : -1));
                } else if (event.key === 'Home' || event.key === 'End') {
                  event.preventDefault();
                  focusItem(event.key === 'Home' ? 0 : options.length - 1);
                }
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
