import { BookOpen, Check, Compass, Hotel, MapPin, Plane, TrainFront, Utensils } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { copy } from '../../shared/types';
import { ContentEditor } from '../components/editor/ContentEditor';
import { InlineCopy } from '../components/editor/InlineCopy';
import { ListingCard } from '../components/ListingCard';
import { useStore } from '../context/Store';
import { useWords } from '../hooks/useWords';
import { api, send } from '../lib/api';
import { pathTo, sortOrder } from '../lib/content';
import { buttonStyles } from '../ui/Button';
import { Empty } from '../ui/Empty';
import { SectionHead } from '../ui/SectionHead';

export function Home() {
  const { content, lang, editing } = useStore();
  const words = useWords();
  const [editor, setEditor] = useState(false);
  const agency = content.find((c) => c.id === 'agency');
  if (!agency) return <Empty title={words('Content is unavailable.', 'Treść jest niedostępna.')} />;
  const allTours = content.filter((c) => c.kind === 'trip' && c.published);
  const preferred = ['peru-tour', 'lisbon-tour', 'rome-tour'];
  const tours = [...allTours]
    .sort(
      (a, b) =>
        (preferred.indexOf(a.id) < 0 ? 99 : preferred.indexOf(a.id)) -
          (preferred.indexOf(b.id) < 0 ? 99 : preferred.indexOf(b.id)) || sortOrder(a, b),
    )
    .slice(0, 3);
  return (
    <div className="bg-canvas">
      <section className="grid grid-cols-2 items-stretch gap-16 pb-18 pt-11 max-lg:gap-8 max-sm:flex max-sm:flex-col max-sm:gap-7 max-sm:pb-12 max-sm:pt-8 [&_h1]:max-w-xl [&_h1]:text-hero [&_h1]:leading-tight [&_h1]:tracking-tight max-sm:[&_h1]:text-5xl mx-auto w-full max-w-content px-6 md:px-9 xl:px-14">
        <div className="flex flex-col items-start justify-center py-7 max-sm:py-0">
          <InlineCopy item={agency} />
          <InlineCopy
            item={agency}
            field="description"
            as="div"
            rich
            className="mt-5 max-w-md text-base leading-loose text-muted [&_p]:m-0"
          />
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link className={buttonStyles({ className: 'min-h-14 px-6 py-4' })} to="/trips">
              {words('Browse tours', 'Zobacz wycieczki')}
            </Link>
            <Link
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-line px-5 text-sm font-bold text-primary transition-colors hover:border-accent hover:bg-lilac hover:text-primary-dark"
              to="/map"
            >
              {words('Explore the map', 'Otwórz mapę')}
            </Link>
          </div>
          <div className="mt-11 flex flex-wrap items-center gap-7 border-t border-line pt-6 text-xs font-semibold text-muted [&>div]:flex [&>div]:items-center [&>div]:gap-2 [&>div+div]:border-l [&>div+div]:border-line [&>div+div]:pl-7 [&_svg]:text-accent">
            <div>
              <MapPin size={18} />
              <span>{words('Based in Switzerland', 'Działamy w Szwajcarii')}</span>
            </div>
            {agency.foundedYear && (
              <div>
                <span className="font-display text-3xl font-bold leading-none text-accent">
                  {new Date().getFullYear() - agency.foundedYear}
                </span>
                <span>{words('years of experience', 'lat doświadczenia')}</span>
              </div>
            )}
            {editing && (
              <button
                type="button"
                className="inline-flex items-center gap-3 py-1.5 text-sm font-medium text-primary hover:text-accent"
                onClick={() => setEditor(true)}
              >
                Edit agency details
              </button>
            )}
          </div>
        </div>
        <div className="relative isolate min-h-collage max-lg:min-h-collage-tablet max-sm:min-h-collage-mobile before:absolute before:inset-6 before:-z-10 before:-rotate-3 before:rounded-3xl before:bg-lilac">
          {tours.map((tour, index) => {
            const _destination = content.find((c) => c.id === tour.destinationId);
            return (
              <Link
                key={tour.id}
                className={`group absolute block overflow-hidden rounded-2xl bg-lilac shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-xl [&_img]:absolute [&_img]:inset-0 [&_img]:size-full [&_img]:transition-transform [&_img]:duration-500 hover:[&_img]:scale-105 focus-visible:[&_img]:scale-105 [&.tile-0]:right-0 [&.tile-0]:top-0 [&.tile-0]:z-10 [&.tile-0]:h-full [&.tile-0]:w-2/3 [&.tile-1]:left-0 [&.tile-1]:top-collage [&.tile-1]:z-20 [&.tile-1]:h-2/5 [&.tile-1]:w-1/2 [&.tile-1]:border-4 [&.tile-1]:border-canvas [&.tile-2]:bottom-collage [&.tile-2]:left-0 [&.tile-2]:z-20 [&.tile-2]:h-2/5 [&.tile-2]:w-1/2 [&.tile-2]:border-4 [&.tile-2]:border-canvas tile-${index}`}
                to={pathTo(tour)}
              >
                <img src={tour.image} alt="" />
                <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/10 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 flex flex-col items-start gap-1 text-white [&_strong]:font-display [&_strong]:text-3xl [&_strong]:leading-tight [&_small]:text-xs [&_small]:font-semibold [&_small]:text-white group-[.tile-0]:items-end group-[.tile-0]:text-right group-[.tile-0]:[&_strong]:text-4xl max-lg:[&_strong]:text-2xl max-sm:inset-x-3 max-sm:bottom-3 max-sm:[&_strong]:text-xl">
                  <strong>{copy(tour.title, lang)}</strong>
                  {tour.duration && (
                    <small>
                      {tour.duration} {words('days', 'dni')}
                    </small>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="bg-surface py-16 max-sm:py-12">
        <div className="mx-auto w-full max-w-content px-6 md:px-9 xl:px-14">
          <SectionHead title={words('What we take care of.', 'Czym się zajmujemy.')} />
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-3xl bg-lilac p-7 sm:p-9">
              <Compass
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-8 rotate-12 text-primary/15"
                size={220}
                strokeWidth={1}
              />
              <div className="relative">
                <h3 className="mb-3 text-4xl leading-tight">
                  {words('The itinerary', 'Plan podróży')}
                </h3>
                <p className="max-w-md text-base leading-relaxed text-ink/80">
                  {words(
                    'We bring the details of your trip together, from getting there to where you stay and what you do.',
                    'Łączymy szczegóły podróży w całość — od dojazdu po noclegi i atrakcje.',
                  )}
                </p>
                <div className="relative mt-7 grid grid-cols-2 gap-x-8 gap-y-5 text-sm font-bold text-primary-dark">
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full text-primary/35"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 25 16 H 72 Q 92 16 92 32 Q 92 50 72 50 H 28 Q 8 50 8 67 Q 8 84 28 84 H 75"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <span className="relative justify-self-start inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
                    <Plane size={17} />
                    {words('Fly out', 'Lot na miejsce')}
                  </span>
                  <span className="relative justify-self-end inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
                    <Hotel size={17} />
                    {words('Check in', 'Zameldowanie')}
                  </span>
                  <span className="relative justify-self-start inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
                    <MapPin size={17} />
                    {words('Explore', 'Zwiedzanie')}
                  </span>
                  <span className="relative justify-self-end inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
                    <TrainFront size={17} />
                    {words('Transfer', 'Przejazd')}
                  </span>
                  <span className="relative justify-self-start inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
                    <Utensils size={17} />
                    {words('Local food', 'Lokalna kuchnia')}
                  </span>
                  <span className="relative justify-self-end inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
                    <Plane className="rotate-180" size={17} />
                    {words('Fly home', 'Lot powrotny')}
                  </span>
                </div>
              </div>
            </article>
            <div className="grid gap-4">
              <article className="relative overflow-hidden rounded-3xl bg-rose-100 p-7 sm:p-8">
                <MapPin
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-5 -top-6 rotate-12 text-rose-500/15"
                  size={150}
                  strokeWidth={1}
                />
                <div>
                  <h3 className="mb-2 text-3xl">{words('Places to stay', 'Noclegi')}</h3>
                  <p className="max-w-md text-sm leading-relaxed text-ink/80">
                    {words(
                      'Accommodation arranged for the trip, with the details included in your tour information.',
                      'Noclegi zorganizowane na czas wyjazdu, ze szczegółami w opisie wycieczki.',
                    )}
                  </p>
                </div>
              </article>
              <article className="relative overflow-hidden rounded-3xl bg-amber-100 p-7 sm:p-8">
                <BookOpen
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-5 -top-6 rotate-12 text-amber-700/15"
                  size={150}
                  strokeWidth={1}
                />
                <div>
                  <h3 className="mb-2 text-3xl">
                    {words('Information and support', 'Informacje i wsparcie')}
                  </h3>
                  <p className="max-w-md text-sm leading-relaxed text-ink/80">
                    {words(
                      'Practical information before departure and a team to contact when you need help.',
                      'Praktyczne informacje przed wyjazdem i zespół, z którym możesz się skontaktować.',
                    )}
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 max-sm:py-12 mx-auto w-full max-w-content px-6 md:px-9 xl:px-14">
        <SectionHead
          title={words('Explore our tours.', 'Poznaj nasze wycieczki.')}
          link={{ to: '/trips', label: words('All tours', 'Wszystkie wycieczki') }}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <ListingCard key={tour.id} item={tour} />
          ))}
        </div>
      </section>
      <Contact />
      {editor && <ContentEditor item={agency} onClose={() => setEditor(false)} />}
    </div>
  );
}

export function Contact() {
  const words = useWords();
  const { notice } = useStore();
  const [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false);
  return (
    <section className="border-t border-line bg-canvas py-16 max-sm:py-12">
      <div className="mx-auto w-full max-w-content px-6 md:px-9 xl:px-14 grid grid-cols-2 gap-24 max-lg:gap-9 max-sm:grid-cols-1 [&_h2]:text-4xl [&_p]:my-4 [&_p]:max-w-sm [&_p]:text-sm [&_p]:text-muted [&_form]:flex [&_form]:flex-col [&_form]:gap-5 [&_form>.button]:self-start">
        <div>
          <h2>{words('Contact us.', 'Kontakt.')}</h2>
          <p>
            {words(
              'Tell us where you would like to go, when you want to travel and what budget you have in mind. We can discuss the options before you make a booking.',
              'Powiedz nam, dokąd i kiedy chcesz pojechać oraz jaki masz budżet. Omówimy możliwości, zanim zdecydujesz się na rezerwację.',
            )}
          </p>
          <p>
            {words(
              'We can also help you understand visa requirements, local rules and other practical details for your trip.',
              'Pomożemy Ci także zorientować się w wymaganiach wizowych, lokalnych przepisach i innych praktycznych kwestiach związanych z podróżą.',
            )}
          </p>
        </div>
        {sent ? (
          <div className="self-center [&_h3]:mt-4" role="status">
            <Check size={32} />
            <h3>{words('Your note is ready.', 'Wiadomość gotowa.')}</h3>
            <p>
              {words(
                'Demo submission completed. No email was sent.',
                'Symulacja zakończona. E-mail nie został wysłany.',
              )}
            </p>
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-lilac hover:text-primary-dark"
              onClick={() => setSent(false)}
            >
              {words('Write another', 'Napisz kolejną')}
            </button>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              setBusy(true);
              try {
                await api('contact', send('POST', Object.fromEntries(form)));
                setSent(true);
              } catch (error) {
                notice((error as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="form-columns grid grid-cols-2 gap-4 max-sm:gap-3">
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
            <label>
              {words('Your message', 'Wiadomość')}
              <textarea
                name="message"
                required
                rows={3}
                placeholder={words('Where would you like to go?', 'Dokąd chcesz pojechać?')}
              />
            </label>
            <button type="submit" className={buttonStyles()} disabled={busy}>
              {busy ? words('Sending…', 'Wysyłanie…') : words('Send a note', 'Wyślij wiadomość')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
