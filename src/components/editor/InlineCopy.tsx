import { Bold, Check, Italic, Link as LinkIcon, List } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cleanHtml } from '../../../shared/html';
import { type Content, copy } from '../../../shared/types';
import { useStore } from '../../context/Store';
export function Toolbar({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const command = (name: string, value?: string) => {
    target.current?.focus();
    document.execCommand(name, false, value);
    target.current?.dispatchEvent(new Event('input', { bubbles: true }));
  };
  return (
    <div
      className="mb-4 flex w-max items-center gap-1 rounded-lg border border-line bg-surface p-1 [&_button]:h-7 [&_button]:w-8 [&_button]:rounded [&_button]:hover:bg-lilac"
      onMouseDown={(e) => e.preventDefault()}
    >
      <button type="button" title="Bold" onClick={() => command('bold')}>
        <Bold size={15} />
      </button>
      <button type="button" title="Italic" onClick={() => command('italic')}>
        <Italic size={15} />
      </button>
      <button type="button" title="Heading" onClick={() => command('formatBlock', 'h3')}>
        H
      </button>
      <button type="button" title="Paragraph" onClick={() => command('formatBlock', 'p')}>
        P
      </button>
      <button type="button" title="List" onClick={() => command('insertUnorderedList')}>
        <List size={15} />
      </button>
      <button
        type="button"
        title="Add link"
        onClick={() => {
          const url = window.prompt('Link URL (https://…)');
          if (url && /^https:\/\//.test(url)) command('createLink', url);
        }}
      >
        <LinkIcon size={15} />
      </button>
    </div>
  );
}

export function InlineCopy({
  item,
  field = 'title',
  rich = false,
  as = 'h1',
  className = '',
}: {
  item: Content;
  field?: 'title' | 'description';
  rich?: boolean;
  as?: 'h1' | 'h2' | 'p' | 'div';
  className?: string;
}) {
  const { editing, lang, save, notice } = useStore();
  const [active, setActive] = useState(false),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const Tag = as;
  useEffect(() => {
    if (!editing) {
      setActive(false);
      setDirty(false);
    }
  }, [editing]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const value = copy(item[field], lang);
  return (
    <div
      className={`relative [&.editable]:mb-6 [&.editable]:w-full [&.editable>h1]:cursor-text [&.editable>h1]:outline [&.editable>h1]:outline-dashed [&.editable>h1]:outline-accent [&.editable>h1]:outline-offset-4 [&.is-editing]:z-10 [&_[contenteditable=true]]:outline-2 [&_[contenteditable=true]]:outline-accent [&_[contenteditable=true]]:outline-offset-4 ${editing ? 'editable' : ''}  ${active ? 'is-editing' : ''}`}
    >
      {active && rich && <Toolbar target={ref} />}
      <Tag
        ref={ref as never}
        className={className}
        contentEditable={active}
        suppressContentEditableWarning
        onInput={() => setDirty(true)}
        onClick={() => {
          if (editing && !active) {
            setActive(true);
            setTimeout(() => ref.current?.focus(), 0);
          }
        }}
        dangerouslySetInnerHTML={{
          __html: rich
            ? cleanHtml(value)
            : value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br/>'),
        }}
      />
      {editing && !active && (
        <span className="mt-2 block text-xs text-muted">
          Click to edit{!item[field][lang] ? ' · missing translation' : ''}
        </span>
      )}
      {active && (
        <div className="mt-3 flex max-w-md items-center gap-2 rounded-lg bg-surface p-2 text-xs shadow-sm [&>span]:mr-auto [&_button]:rounded-md [&_button]:border [&_button]:border-line [&_button]:px-2 [&_button]:py-1">
          <span>{dirty ? 'Unsaved changes' : lang.toUpperCase()}</span>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const text = rich
                  ? cleanHtml(ref.current?.innerHTML || '')
                  : ref.current?.textContent || '';
                await save({ ...item, [field]: { ...item[field], [lang]: text } });
                setActive(false);
                setDirty(false);
                notice('Changes saved.');
              } catch (e) {
                notice((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Check size={14} />
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setActive(false);
              setDirty(false);
              if (ref.current) {
                if (rich) ref.current.innerHTML = cleanHtml(value);
                else ref.current.textContent = value;
              }
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
