import { type Content, copy } from '../../shared/types';
import { useStore } from '../context/Store';

export function ContentContext({ item, label }: { item: Content; label: string }) {
  const { lang } = useStore();
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-2xl bg-surface p-3">
      <img src={item.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted">{label}</p>
        <p className="mt-1 line-clamp-2 text-lg font-bold leading-tight text-ink">
          {copy(item.title, lang)}
        </p>
      </div>
    </div>
  );
}
