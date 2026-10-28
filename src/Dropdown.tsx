import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export function Dropdown({ label, value, options, onChange, leading, className = '', upward = false }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void;
  leading?: ReactNode; className?: string; upward?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const current = Math.max(0, options.findIndex(option => option.value === value));
  const focusItem = (index: number) => items.current[(index + options.length) % options.length]?.focus();
  const openMenu = (index = current) => { setOpen(true); requestAnimationFrame(() => focusItem(index)); };
  const closeMenu = (restore = false) => { setOpen(false); if (restore) trigger.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) closeMenu(); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return <div ref={root} className={`custom-dropdown ${upward ? 'opens-up' : ''} ${className}`} onKeyDown={event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); closeMenu(true); }
    if (event.key === 'Tab' && open) closeMenu();
  }}>
    <button ref={trigger} type="button" className="dropdown-trigger" aria-label={`${label}: ${options.find(option => option.value === value)?.label || value}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={() => open ? closeMenu() : openMenu()} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); openMenu(event.key === 'ArrowDown' ? current : current - 1); }
    }}>{leading}<span>{options.find(option => option.value === value)?.label || label}</span><ChevronDown size={16} className="dropdown-chevron"/></button>
    {open && <div id={menuId} className="dropdown-menu" role="listbox" aria-label={label}>{options.map((option, index) => <button key={option.value} type="button" ref={element => { items.current[index] = element; }} role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); closeMenu(true); }} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); focusItem(index + (event.key === 'ArrowDown' ? 1 : -1)); }
      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); focusItem(event.key === 'Home' ? 0 : options.length - 1); }
    }}><span>{option.label}</span>{option.value === value && <Check size={16}/>}</button>)}</div>}
  </div>;
}
