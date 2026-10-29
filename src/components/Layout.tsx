import { Facebook, Instagram, Menu, Mountain, Settings2, WifiOff, X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { canEdit, canModerate, type Identity, roles } from '../../shared/types';
import { useStore } from '../context/Store';
import { useWords } from '../hooks/useWords';
import { Dropdown } from '../ui/Dropdown';

export function Layout({ children }: { children: ReactNode }) {
  const { user, lang, setLang, editing, setEditing, switchRole, notice, online } = useStore();
  const [menu, setMenu] = useState(false);
  const words = useWords();
  const location = useLocation();
  // Navigation closes the mobile menu and resets scroll on every route change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the intentional navigation trigger.
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <a
        className="fixed -top-24 left-4 z-150 rounded-lg bg-primary p-4 text-white focus:top-4"
        href="#main"
      >
        Skip to content
      </a>
      <header className="relative z-30 mx-auto flex h-header max-w-screen-2xl items-center justify-between gap-6 bg-canvas px-6 max-md:h-header-mobile max-sm:px-4 xl:px-14">
        <Link
          className="relative flex items-center gap-2 font-logo text-4xl font-semibold tracking-tighter text-primary [&>span:not(.demo-logo-label)]:self-start [&>span:not(.demo-logo-label)]:mt-2 [&>span:not(.demo-logo-label)]:font-sans [&>span:not(.demo-logo-label)]:text-xs [&>span:not(.demo-logo-label)]:tracking-normal max-sm:text-3xl"
          to="/"
          aria-label="Roam home, demo website"
        >
          <span className="demo-logo-label pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 -rotate-16 whitespace-nowrap border-2 border-stamp px-2 py-1 font-sans text-xs font-extrabold uppercase tracking-wide text-stamp-ink paint-order-stroke stroke-stamp max-sm:text-2xs">
            not a real website
          </span>
          <Mountain size={29} strokeWidth={1.6} />
          roam<span>®</span>
        </Link>
        <nav
          data-open={menu}
          className="flex h-full items-center gap-2 text-base font-bold max-lg:absolute max-lg:inset-x-0 max-lg:top-full max-lg:hidden max-lg:h-auto max-lg:flex-col max-lg:items-start max-lg:gap-0 max-lg:border-y max-lg:border-line max-lg:bg-canvas max-lg:px-6 max-lg:py-3 max-lg:shadow-lg max-lg:data-[open=true]:flex"
          aria-label="Main navigation"
        >
          <NavLink
            className="flex min-h-11 items-center whitespace-nowrap rounded-xl px-4 py-2 transition-colors hover:bg-surface hover:text-primary aria-[current=page]:bg-lilac aria-[current=page]:text-primary-dark max-lg:w-full"
            to="/"
            end
          >
            {words('Home', 'Start')}
          </NavLink>
          <NavLink
            className="flex min-h-11 items-center whitespace-nowrap rounded-xl px-4 py-2 transition-colors hover:bg-surface hover:text-primary aria-[current=page]:bg-lilac aria-[current=page]:text-primary-dark max-lg:w-full"
            to="/trips"
          >
            {words('Tours', 'Wycieczki')}
          </NavLink>
          <NavLink
            className="flex min-h-11 items-center whitespace-nowrap rounded-xl px-4 py-2 transition-colors hover:bg-surface hover:text-primary aria-[current=page]:bg-lilac aria-[current=page]:text-primary-dark max-lg:w-full"
            to="/map"
          >
            {words('Map', 'Mapa')}
          </NavLink>
          <NavLink
            className="flex min-h-11 items-center whitespace-nowrap rounded-xl px-4 py-2 transition-colors hover:bg-surface hover:text-primary aria-[current=page]:bg-lilac aria-[current=page]:text-primary-dark max-lg:w-full"
            to="/routes"
          >
            {words('Routes', 'Trasy')}
          </NavLink>
          {user.role !== 'Guest' && (
            <NavLink
              className="flex min-h-11 items-center whitespace-nowrap rounded-xl px-4 py-2 transition-colors hover:bg-surface hover:text-primary aria-[current=page]:bg-lilac aria-[current=page]:text-primary-dark max-lg:w-full"
              to="/quotes"
            >
              {words('My quotes', 'Moje wyceny')}
            </NavLink>
          )}
          {canModerate(user.role) && (
            <NavLink
              className="flex min-h-11 items-center whitespace-nowrap rounded-xl px-4 py-2 transition-colors hover:bg-surface hover:text-primary aria-[current=page]:bg-lilac aria-[current=page]:text-primary-dark max-lg:w-full"
              to="/moderation"
            >
              {words('Moderation', 'Moderacja')}
            </NavLink>
          )}
          {user.role === 'Admin' && (
            <NavLink
              className="flex min-h-11 items-center whitespace-nowrap rounded-xl px-4 py-2 transition-colors hover:bg-surface hover:text-primary aria-[current=page]:bg-lilac aria-[current=page]:text-primary-dark max-lg:w-full"
              to="/admin"
            >
              Admin
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-4 max-sm:gap-1">
          <fieldset
            aria-label="Language"
            className="flex items-center gap-0.5 rounded-xl bg-surface p-1"
          >
            {(['en', 'pl'] as const).map((language) => (
              <button
                key={language}
                type="button"
                aria-pressed={lang === language}
                onClick={() => setLang(language)}
                className="size-9 rounded-lg text-xs font-bold text-muted hover:text-primary aria-pressed:bg-white aria-pressed:text-primary aria-pressed:shadow-sm max-sm:h-8 max-sm:w-7"
              >
                {language.toUpperCase()}
              </button>
            ))}
          </fieldset>
          <Dropdown
            className="max-sm:[&_button]:px-1 max-sm:[&_button]:text-xs max-xs:[&_button>span:not(.avatar)]:hidden"
            label="Demo account"
            value={
              user.id === 'guest'
                ? 'Guest'
                : roles.find((r) => `demo-${r.toLowerCase()}` === user.id) || user.role
            }
            options={roles.map((role) => ({ value: role, label: role }))}
            leading={
              <span className="avatar grid size-9 shrink-0 place-items-center rounded-full bg-lilac text-sm font-bold text-primary max-sm:size-8">
                {user.role.slice(0, 1)}
              </span>
            }
            onChange={(role) =>
              switchRole(role as Identity['role']).catch((e) => notice(e.message))
            }
          />
          <button
            type="button"
            className="hidden max-lg:flex size-9 shrink-0 items-center justify-center rounded-xl text-primary transition-colors hover:bg-lilac"
            aria-label="Toggle navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {canEdit(user.role) && (
        <div className="flex items-center justify-between gap-4 border-t border-line bg-lilac px-6 py-2.5 text-xs [&>div]:flex [&>div]:items-center [&>div]:gap-2 [&>button]:rounded-lg [&>button]:bg-primary [&>button]:px-3 [&>button]:py-2 [&>button]:text-white max-md:[&>div>span:last-child]:hidden xl:px-14">
          <div>
            <span className="size-1.5 rounded-full bg-accent" />
            <strong>{user.role}</strong>
            <span>
              {editing
                ? words(
                    'Click text, images, or map markers to edit.',
                    'Kliknij tekst, zdjęcia lub znaczniki mapy, aby edytować.',
                  )
                : words(
                    'You can edit content directly on these pages.',
                    'Możesz edytować treść bezpośrednio na stronach.',
                  )}
            </span>
          </div>
          <button type="button" onClick={() => setEditing(!editing)}>
            <Settings2 size={14} />
            {editing
              ? words('Finish editing', 'Zakończ edycję')
              : words('Edit this page', 'Edytuj stronę')}
          </button>
        </div>
      )}
      {!online && (
        <div className="flex items-center justify-center gap-2 bg-amber-100 p-3 text-xs text-amber-900">
          <WifiOff size={14} />
          {words(
            'You’re offline. Your downloaded routes are available in Routes.',
            'Jesteś offline. Pobrane trasy znajdziesz w sekcji Trasy.',
          )}
        </div>
      )}
      <main
        id="main"
        className={location.pathname === '/map' ? 'h-map min-h-100 max-md:h-map-mobile' : ''}
      >
        {children}
      </main>
      {location.pathname !== '/map' && (
        <footer>
          <div className="flex flex-wrap items-center gap-7 border-b border-line pb-8 [&>span]:text-xs [&>span]:text-muted [&>a:last-child]:ml-auto [&>a:last-child]:text-sm max-md:[&>span]:hidden">
            <Link
              className="relative flex items-center gap-2 font-logo text-4xl font-semibold tracking-tighter text-primary [&>span:not(.demo-logo-label)]:self-start [&>span:not(.demo-logo-label)]:mt-2 [&>span:not(.demo-logo-label)]:font-sans [&>span:not(.demo-logo-label)]:text-xs [&>span:not(.demo-logo-label)]:tracking-normal max-sm:text-3xl"
              to="/"
            >
              <Mountain size={28} />
              roam<span>®</span>
            </Link>
            <div className="ml-auto flex flex-wrap items-center gap-5 text-sm font-semibold text-primary">
              <a className="transition-colors hover:text-accent" href="mailto:contact@roam.com">
                contact@roam.com
              </a>
              <div className="flex items-center">
                <a
                  className="rounded-lg p-2 transition-colors hover:bg-lilac hover:text-accent"
                  href="https://www.instagram.com/"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  className="rounded-lg p-2 transition-colors hover:bg-lilac hover:text-accent"
                  href="https://www.facebook.com/"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-5 pt-6 text-xs text-muted [&>div]:flex [&>div]:gap-5 max-sm:flex-col">
            <span>© {new Date().getFullYear()} Roam. All rights reserved.</span>
            <div>
              <Link to="/legal/privacy">{words('Privacy', 'Prywatność')}</Link>
              <Link to="/legal/terms">{words('Terms', 'Regulamin')}</Link>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
