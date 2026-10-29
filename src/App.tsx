import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useStore } from './context/Store';
import { Admin } from './pages/AdminPage';
import { Detail } from './pages/ContentPage';
import { GuidePage } from './pages/GuidePage';
import { Home } from './pages/HomePage';
import { Legal } from './pages/LegalPage';
import { Moderation } from './pages/ModerationPage';
import { NotFound } from './pages/NotFoundPage';
import { QuotesPage } from './pages/QuotesPage';
import { MyRoutes } from './pages/RoutesPage';
import { Listing } from './pages/ToursPage';

const RouteDetail = lazy(() =>
  import('./pages/RoutePage').then((module) => ({ default: module.RouteDetail })),
);

const WorldMap = lazy(() =>
  import('./pages/MapPage').then((module) => ({ default: module.WorldMap })),
);

export function App() {
  const { loading } = useStore();
  return (
    <Layout>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center gap-3 text-sm text-muted">
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-line border-t-primary" />
          Finding our bearings…
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Listing kind="destination" />} />
          <Route path="/trips" element={<Listing kind="trip" />} />
          <Route path="/destinations/:slug" element={<Detail kind="destination" />} />
          <Route path="/trips/:slug" element={<Detail kind="trip" />} />
          <Route
            path="/routes/:slug"
            element={
              <Suspense fallback={null}>
                <RouteDetail />
              </Suspense>
            }
          />
          <Route
            path="/map"
            element={
              <Suspense fallback={null}>
                <WorldMap />
              </Suspense>
            }
          />
          <Route path="/routes" element={<MyRoutes />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/guides" element={<MyRoutes />} />
          <Route path="/guides/:id" element={<GuidePage />} />
          <Route path="/moderation" element={<Moderation />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/legal/:page" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </Layout>
  );
}
export default App;
