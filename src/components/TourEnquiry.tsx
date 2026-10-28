import { Check } from 'lucide-react';
import { useState } from 'react';
import { type Content, copy } from '../../shared/types';
import { useStore } from '../context/Store';
import { useWords } from '../hooks/useWords';
import { api, send } from '../lib/api';
import { buttonStyles } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ContentContext } from './ContentContext';

export function TourEnquiry({ trip, onClose }: { trip: Content; onClose: () => void }) {
  const { lang } = useStore();
  const words = useWords();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  return (
    <Modal
      title={words('Enquire about this tour', 'Zapytaj o wycieczkę')}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      {sent ? (
        <div role="status" className="py-3">
          <div className="grid size-12 place-items-center rounded-full bg-lilac text-primary">
            <Check size={24} />
          </div>
          <h3 className="mt-4 text-2xl">{words('Enquiry submitted', 'Zapytanie wysłane')}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {words(
              'This is a demo: your enquiry was not sent to an agency.',
              'To wersja demonstracyjna: zapytanie nie zostało wysłane do biura podróży.',
            )}
          </p>
          <button type="button" className={buttonStyles({ className: 'mt-6' })} onClick={onClose}>
            {words('Done', 'Gotowe')}
          </button>
        </div>
      ) : (
        <form
          className="flex flex-col gap-3 [&_label]:gap-1.5 [&_input]:py-3 [&_textarea]:py-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const name = String(form.get('name') || '');
            const email = String(form.get('email') || '');
            const message = `Tour: ${copy(trip.title, lang)}\nPreferred dates: ${form.get('dates') || 'Flexible'}\nTravellers: ${form.get('travellers')}\n${form.get('message') || ''}`;
            setBusy(true);
            setError('');
            try {
              await api('contact', send('POST', { name, email, message }));
              setSent(true);
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <ContentContext item={trip} label={words('Your tour', 'Twoja wycieczka')} />
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <label>
              {words('Your name', 'Imię')}
              <input name="name" required autoComplete="name" placeholder="Alex" />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="alex@example.com"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <label>
              {words('Preferred dates', 'Preferowany termin')}
              <input
                name="dates"
                placeholder={words('e.g. September, flexible', 'np. wrzesień, elastycznie')}
              />
            </label>
            <label>
              {words('Travellers', 'Liczba podróżnych')}
              <input name="travellers" type="number" min="1" max="30" defaultValue="1" required />
            </label>
          </div>
          <label>
            {words('Anything else?', 'Coś jeszcze?')}
            <textarea
              name="message"
              rows={2}
              placeholder={words(
                'Tell us about your budget or what you’d like to do.',
                'Napisz o swoim budżecie lub planach.',
              )}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className={buttonStyles({ className: 'self-end' })}>
            {busy ? words('Sending…', 'Wysyłanie…') : words('Send enquiry', 'Wyślij zapytanie')}
          </button>
        </form>
      )}
    </Modal>
  );
}
