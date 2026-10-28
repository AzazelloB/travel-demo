import { useCallback, useEffect, useState } from 'react';
import { copy, type Identity, roles } from '../../shared/types';
import { useStore } from '../context/Store';
import { api, send } from '../lib/api';
import { money } from '../lib/content';
import { Empty } from '../ui/Empty';

export function Admin() {
  const { user, purchases, refresh, notice, content, lang } = useStore();
  const [users, setUsers] = useState<Identity[]>([]);
  const load = useCallback(
    () =>
      api<Identity[]>('users')
        .then(setUsers)
        .catch((e) => notice(e.message)),
    [notice],
  );
  useEffect(() => {
    if (user.role === 'Admin') load();
  }, [user.role, load]);
  if (user.role !== 'Admin') return <Empty title="Admin access required." />;
  return (
    <div className="mx-auto w-full max-w-content px-6 md:px-9 xl:px-14 min-h-screen pb-20 pt-14 [&>h1]:mb-10 [&>h1]:text-6xl [&>h2]:mb-5 [&>h2]:mt-10 [&>h2]:text-4xl">
      <div className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-muted">
        DEMO ADMINISTRATION
      </div>
      <h1>Administration.</h1>
      <h2>Demo identities</h2>
      <p className="text-muted">
        Role switching is intentionally unrestricted. Assigned permissions are enforced by the API.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 max-sm:grid-cols-1 [&>label]:flex-row [&>label]:items-center [&>label]:justify-between [&>label]:rounded-xl [&>label]:border [&>label]:border-line [&>label]:p-4">
        {users.map((u) => (
          <label key={u.id}>
            <span>
              {u.name}
              <small>{u.id}</small>
            </span>
            <select
              aria-label={`Role for ${u.name}`}
              value={u.role}
              disabled={u.id === user.id}
              onChange={(e) =>
                api(`users/${u.id}`, send('PATCH', { role: e.target.value }))
                  .then(load)
                  .catch((e) => notice(e.message))
              }
            >
              {roles
                .filter((r) => r !== 'Guest')
                .map((r) => (
                  <option key={r}>{r}</option>
                ))}
            </select>
          </label>
        ))}
      </div>
      <h2>Purchase records</h2>
      <div className="overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_table]:text-sm [&_td]:border-b [&_td]:border-line [&_td]:p-3 [&_th]:border-b [&_th]:border-line [&_th]:p-3 [&_th]:font-semibold">
        <table>
          <thead>
            <tr>
              <th>Tour / date</th>
              <th>Identity</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id}>
                <td>
                  {copy(content.find((c) => c.id === p.tripId)?.title, lang)}
                  <small>{new Date(p.createdAt).toLocaleString()}</small>
                </td>
                <td>{p.userId}</td>
                <td>{money(p.amount)}</td>
                <td>{p.method}</td>
                <td>
                  <span
                    className={`inline-block whitespace-nowrap rounded-full bg-lilac px-2.5 py-1 text-xs text-primary [&.draft]:bg-amber-100 [&.draft]:text-amber-800 ${p.status === 'success' ? '' : 'draft'}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td>
                  {p.status === 'success' && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-3 py-1.5 text-sm font-medium text-primary hover:text-accent text-red-700"
                      onClick={() =>
                        api(`purchases/${p.id}`, send('PATCH'))
                          .then(refresh)
                          .catch((e) => notice(e.message))
                      }
                    >
                      Refund / revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!purchases.length && <p className="text-muted">No simulated purchases yet.</p>}
      </div>
    </div>
  );
}
