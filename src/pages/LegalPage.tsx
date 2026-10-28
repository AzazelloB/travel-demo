import { useParams } from 'react-router-dom';

export function Legal() {
  const { page } = useParams();
  return (
    <div className="mx-auto w-full max-w-content px-6 md:px-9 xl:px-14 max-w-4xl pb-20 pt-14 [&_h1]:mb-8 [&_h1]:text-6xl">
      <div className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-muted">
        ROAM DEMO
      </div>
      <h1>{page === 'privacy' ? 'Privacy.' : 'Terms.'}</h1>
      <div className="text-sm leading-loose text-muted [&_p]:mb-4 [&_h2]:my-5 [&_h2]:text-ink [&_h3]:my-4 [&_h3]:text-ink [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:rounded [&_a]:bg-lilac/60 [&_a]:px-1 [&_a]:font-semibold [&_a:hover]:bg-lilac [&_strong]:text-ink">
        {page === 'privacy' ? (
          <>
            <p>
              This demonstration uses a session cookie to remember your chosen demo identity, local
              storage for language and public content, and IndexedDB and browser caches for
              downloaded routes. No analytics or advertising trackers are included.
            </p>
            <p>
              Demo content, uploads, purchases and moderation records are stored in the connected
              Cloudflare D1 database and R2 bucket. Do not submit personal or sensitive information.
              The contact form simulates a submission and does not deliver messages.
            </p>
            <p>
              Remove downloaded routes in Routes or clear your browser’s site data to delete local
              copies. Switch to Guest to end the current session.
            </p>
          </>
        ) : (
          <>
            <p>
              Roam is a portfolio demonstration. All payments, purchases and refunds are simulated.
              No money is charged, and no payment details are collected. Demo accounts are shared
              identities and are freely selectable.
            </p>
            <p>
              Travel times and budgets are illustrative estimates. Maps are simplified regional
              illustrations, not navigation tools. Check current access, weather, opening hours and
              local advice independently.
            </p>
            <p>
              Uploaded photos and videos are reviewed before public display. Only submit media you
              have permission to share. Offline routes remain on the device until removed; routes
              are free to access.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
