import { ArrowDown, ArrowUp, Plus, Settings2, X } from 'lucide-react';
import { useState } from 'react';
import { type Content, copy, type Kind } from '../../shared/types';
import { useStore } from '../context/Store';
import { buttonStyles } from '../ui/Button';
import { ContentEditor } from './editor/ContentEditor';

export function AddButton({ kind, onClick }: { kind: Kind; onClick: () => void }) {
  const { editing } = useStore();
  return editing ? (
    <button
      type="button"
      className={buttonStyles({ variant: 'secondary', size: 'sm' })}
      onClick={onClick}
    >
      <Plus size={15} />
      Add {kind}
    </button>
  ) : null;
}

export function ContentTools({ item }: { item: Content }) {
  const { editing, save, notice } = useStore();
  const [open, setOpen] = useState(false);
  return editing ? (
    <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-line py-3">
      <span
        className={
          item.published
            ? 'inline-block whitespace-nowrap rounded-full bg-lilac px-2.5 py-1 text-xs text-primary [&.draft]:bg-amber-100 [&.draft]:text-amber-800'
            : 'inline-block whitespace-nowrap rounded-full bg-lilac px-2.5 py-1 text-xs text-primary [&.draft]:bg-amber-100 [&.draft]:text-amber-800 draft'
        }
      >
        {item.published ? 'Published' : 'Draft · editor preview'}
      </span>
      <button
        type="button"
        className={buttonStyles({ variant: 'secondary', size: 'sm' })}
        onClick={() => setOpen(true)}
      >
        <Settings2 size={15} />
        Edit details & media
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-3 py-1.5 text-sm font-medium text-primary hover:text-accent"
        onClick={() =>
          save({ ...item, published: !item.published }).catch((e) => notice(e.message))
        }
      >
        {item.published ? 'Unpublish' : 'Publish'}
      </button>
      {open && <ContentEditor item={item} onClose={() => setOpen(false)} />}
    </div>
  ) : null;
}

export function OrderButtons({
  ids,
  index,
  onChange,
}: {
  ids: string[];
  index: number;
  onChange: (ids: string[]) => void;
}) {
  function move(delta: number) {
    const result = [...ids];
    [result[index], result[index + delta]] = [result[index + delta], result[index]];
    onChange(result);
  }
  return (
    <div className="flex items-center gap-2 [&_button]:size-7 [&_button]:rounded [&_button]:hover:bg-lilac">
      <button type="button" title="Move up" disabled={index === 0} onClick={() => move(-1)}>
        <ArrowUp size={14} />
      </button>
      <button
        type="button"
        title="Move down"
        disabled={index === ids.length - 1}
        onClick={() => move(1)}
      >
        <ArrowDown size={14} />
      </button>
      <button
        type="button"
        title="Remove association"
        onClick={() => onChange(ids.filter((_, i) => i !== index))}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function Relations({
  parent,
  field,
  childKind,
  onCreate,
}: {
  parent: Content;
  field: 'routeIds' | 'stopIds';
  childKind: Kind;
  onCreate: () => void;
}) {
  const { editing, content, lang, save, notice } = useStore();
  if (!editing) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 [&_select]:flex-1">
      <select
        aria-label={`Add existing ${childKind}`}
        value=""
        onChange={(e) =>
          save({ ...parent, [field]: [...(parent[field] || []), e.target.value] }).catch((e) =>
            notice(e.message),
          )
        }
      >
        <option value="">Add existing {childKind}…</option>
        {content
          .filter(
            (c) =>
              c.kind === childKind &&
              !(parent[field] || []).includes(c.id) &&
              c.destinationId === parent.destinationId,
          )
          .map((c) => (
            <option key={c.id} value={c.id}>
              {copy(c.title, lang)}
            </option>
          ))}
      </select>
      <button
        type="button"
        className={buttonStyles({ variant: 'secondary', size: 'sm' })}
        onClick={onCreate}
      >
        <Plus size={15} />
        Create {childKind}
      </button>
    </div>
  );
}
