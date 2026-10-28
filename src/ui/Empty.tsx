import { Compass } from 'lucide-react';
import type { ReactNode } from 'react';

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-90 flex-col items-center justify-center gap-5 px-6 py-16 text-center [&>svg]:text-muted [&_h2]:text-4xl [&_p]:max-w-md [&_p]:text-sm [&_p]:text-muted">
      <Compass size={35} strokeWidth={1.2} />
      <h2>{title}</h2>
      {children}
    </div>
  );
}
