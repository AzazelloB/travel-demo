import { Check, ChevronRight, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/Store';
import { useWords } from '../hooks/useWords';
import { pathTo } from '../lib/content';
import { buttonStyles } from '../ui/Button';

export function QuotesPage() {
  const { user, content } = useStore();
  const tour = content.find((item) => item.id === 'rome-tour');
  const words = useWords();
  const key = `roam-example-deposit-${user.id}`;
  const [paid, setPaid] = useState(() => localStorage.getItem(key) === 'paid');
  return (
    <div className="mx-auto w-full max-w-4xl px-6 pb-20 pt-12 max-sm:px-4">
      <h1 className="text-5xl max-sm:text-4xl">{words('Your quotes', 'Twoje wyceny')}</h1>
      {user.role === 'Guest' ? (
        <p className="mt-6 text-muted">
          {words(
            'Choose a demo account in the header to view an example quote.',
            'Wybierz konto demo w nagłówku, aby zobaczyć przykładową wycenę.',
          )}
        </p>
      ) : (
        <article className="mt-8 overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
          <div className="bg-lilac p-7 max-sm:p-5">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary">
              {words('Example quote', 'Przykładowa wycena')}
            </span>
            <h2 className="mt-4 text-3xl">{words('Three days in Rome', 'Trzy dni w Rzymie')}</h2>
            <p className="mt-2 text-sm text-muted">
              {words(
                '3 days · 2 travellers · 12–14 June 2027',
                '3 dni · 2 podróżnych · 12–14 czerwca 2027',
              )}
            </p>
          </div>
          <div className="grid gap-8 p-7 md:grid-cols-2 max-sm:p-5">
            <div>
              <h3 className="text-2xl">{words('Your trip', 'Twoja podróż')}</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink/80">
                <li className="flex gap-2">
                  <Check size={17} className="shrink-0 text-accent" />
                  {words('Two nights in a central hotel', 'Dwa noclegi w hotelu w centrum')}
                </li>
                <li className="flex gap-2">
                  <Check size={17} className="shrink-0 text-accent" />
                  {words(
                    'Airport transfers and local transport',
                    'Transfery z lotniska i transport lokalny',
                  )}
                </li>
                <li className="flex gap-2">
                  <Check size={17} className="shrink-0 text-accent" />
                  {words(
                    'Guided Colosseum visit and planned activities',
                    'Zwiedzanie Koloseum z przewodnikiem i zaplanowane atrakcje',
                  )}
                </li>
              </ul>
              <p className="mt-5 text-sm leading-relaxed text-muted">
                {words(
                  'Flights, meals and personal expenses are not included in this example.',
                  'Loty, posiłki i wydatki osobiste nie są uwzględnione w tym przykładzie.',
                )}
              </p>
              {tour && (
                <Link
                  to={pathTo(tour)}
                  className="mt-4 inline-flex items-center gap-1 rounded-lg py-2 text-sm font-semibold text-primary hover:text-accent"
                >
                  {words('View tour', 'Zobacz wycieczkę')} <ChevronRight size={16} />
                </Link>
              )}
            </div>
            <div className="rounded-2xl bg-surface p-5">
              <h3 className="text-2xl">{words('Payment schedule', 'Harmonogram płatności')}</h3>
              <div className="mt-5 flex justify-between gap-4 text-sm">
                <span>{words('Total for 2', 'Łącznie za 2 osoby')}</span>
                <strong>5,200 zł</strong>
              </div>
              <div className="mt-3 flex justify-between gap-4 text-sm">
                <span>{words('Deposit', 'Zaliczka')}</span>
                <strong className="text-accent">1,300 zł</strong>
              </div>
              <div className="mt-3 flex justify-between gap-4 text-sm">
                <span>{words('Remaining balance', 'Pozostała kwota')}</span>
                <strong>3,900 zł</strong>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                {words(
                  'Example terms: balance due 30 days before departure; cancellation terms would be agreed in the final quote.',
                  'Przykładowe warunki: pozostała kwota płatna 30 dni przed wyjazdem; warunki anulowania zostaną ustalone w ostatecznej wycenie.',
                )}
              </p>
              {paid ? (
                <p
                  role="status"
                  className="mt-5 rounded-xl bg-lilac p-3 text-sm font-bold text-primary"
                >
                  {words('Deposit simulated', 'Zaliczka zasymulowana')}
                </p>
              ) : (
                <button
                  type="button"
                  className={buttonStyles({ fullWidth: true, className: 'mt-5' })}
                  onClick={() => {
                    localStorage.setItem(key, 'paid');
                    setPaid(true);
                  }}
                >
                  <CreditCard size={17} />
                  {words('Simulate deposit', 'Symuluj zaliczkę')}
                </button>
              )}
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {words(
                  'Illustration only. No payment processor is connected and no money is charged.',
                  'Tylko przykład. Nie podłączono operatora płatności i żadne środki nie są pobierane.',
                )}
              </p>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
