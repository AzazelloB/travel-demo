import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function SectionHead({
  eyebrow,
  title,
  link,
  children,
}: {
  eyebrow?: string;
  title: string;
  link?: { to: string; label: string };
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5 max-sm:items-start [&_h2]:text-4xl">
      <div>
        {eyebrow && (
          <div className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-muted">
            {eyebrow}
          </div>
        )}
        <h2>{title}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {children}
        {link && (
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-lilac hover:text-primary-dark"
            to={link.to}
          >
            {link.label}
            <ChevronRight size={17} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
