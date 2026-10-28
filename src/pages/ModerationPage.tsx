import { Check } from 'lucide-react';
import { useState } from 'react';
import { canModerate, copy } from '../../shared/types';
import { MediaView } from '../components/Community';
import { useStore } from '../context/Store';
import { useSubmissions } from '../hooks/useSubmissions';
import { api, send } from '../lib/api';
import { buttonStyles } from '../ui/Button';
import { Empty } from '../ui/Empty';

export function Moderation() {
  const { user, notice, content, lang } = useStore();
  const [status, setStatus] = useState('pending');
  const { page, loading, refresh } = useSubmissions(undefined, status);
  const submissions = page.items;
  if (!canModerate(user.role)) return <Empty title="Moderator or Admin access required." />;
  return (
    <div className="mx-auto w-full max-w-content px-6 md:px-9 xl:px-14 min-h-screen pb-20 pt-14 [&>h1]:mb-10 [&>h1]:text-6xl [&>h2]:mb-5 [&>h2]:mt-10 [&>h2]:text-4xl">
      <div className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-muted">
        COMMUNITY CONTRIBUTIONS
      </div>
      <h1>Moderation.</h1>
      <div className="mb-8 flex gap-2 border-b border-line pb-4 [&_button]:gap-2 [&_button]:rounded-lg [&_button]:px-4 [&_button]:py-2 [&_button]:text-sm [&_button]:capitalize [&_button.selected]:bg-lilac [&_button.selected]:text-primary [&_span]:text-xs">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button
            type="button"
            key={s}
            className={status === s ? 'selected' : ''}
            onClick={() => setStatus(s)}
          >
            {s}
            <span>{page.counts[s] || 0}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {submissions
          .filter((s) => s.status === status)
          .map((s) => (
            <article
              className="overflow-hidden rounded-2xl border border-line [&>img]:h-52 [&>video]:h-52 [&>video]:w-full [&>video]:object-cover [&>div]:p-5 [&_h3]:mb-3 [&_h3]:text-2xl [&_p]:text-sm"
              key={s.id}
            >
              <div className="grid grid-cols-2 gap-2 p-3 [&_img]:h-40 [&_img]:w-full [&_video]:h-40 [&_video]:w-full">
                {s.media.map((file) => (
                  <MediaView key={file.url} url={file.url} mime={file.mime} />
                ))}
              </div>
              <div>
                <span className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-muted">
                  {s.name}
                </span>
                <h3>{s.caption}</h3>
                <p>{copy(content.find((c) => c.id === s.targetId)?.title, lang)}</p>
                <span className="text-muted">{new Date(s.createdAt).toLocaleString()}</span>
                <div className="owned-actions mt-5 flex flex-wrap items-center gap-2">
                  {s.status !== 'approved' && (
                    <button
                      type="button"
                      className={buttonStyles({ size: 'sm' })}
                      onClick={() =>
                        api(`submissions/${s.id}`, send('PATCH', { status: 'approved' }))
                          .then(() => refresh())
                          .catch((e) => notice(e.message))
                      }
                    >
                      <Check size={15} />
                      Approve
                    </button>
                  )}
                  {s.status !== 'rejected' && (
                    <button
                      type="button"
                      className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                      onClick={() =>
                        api(`submissions/${s.id}`, send('PATCH', { status: 'rejected' }))
                          .then(() => refresh())
                          .catch((e) => notice(e.message))
                      }
                    >
                      {s.status === 'approved' ? 'Remove from public gallery' : 'Reject'}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
      </div>
      {page.nextOffset !== null && (
        <button
          type="button"
          disabled={loading}
          className={buttonStyles({ variant: 'secondary', className: 'mt-6' })}
          onClick={() => void refresh(page.nextOffset!)}
        >
          Load more
        </button>
      )}
      {!loading && !submissions.some((s) => s.status === status) && (
        <Empty title="The queue is clear." />
      )}
    </div>
  );
}
