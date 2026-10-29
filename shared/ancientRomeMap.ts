import geometry from './ancientRomePaths.json';
import type { Copy, MapCoordinate, RouteDayMap, RouteMapPath, RouteMapPoint } from './types';

const t = (en: string, pl: string): Copy => ({ en, pl });
const colosseo: RouteMapPoint = {
  id: 'colosseo-metro', kind: 'metro', title: t('Colosseo · Metro B', 'Colosseo · Metro B'),
  coordinates: [12.4913087, 41.8912684],
  description: t('Arrival station for the Colosseum. From Termini, take Metro B towards Laurentina. Follow signs to the Colosseum exit.', 'Stacja przy Koloseum. Z Termini jedź metrem B w stronę Laurentina. Kieruj się oznaczeniami wyjścia do Koloseum.'),
};

function legs(ids: string[], coordinates: number[][][]): RouteMapPath[] {
  return coordinates.map((line, index) => ({
    from: ids[index], to: ids[index + 1], coordinates: line as MapCoordinate[],
  }));
}

// Street-following walking geometry from FOSSGIS OSRM / OpenStreetMap, retrieved
// 2026-10-29. Stored with the plan so opening a map does not call a routing service.
export const ancientRomeMaps: Record<string, RouteDayMap> = {
  'arena-and-palaces': {
    points: [
      colosseo,
      {
        id: 'park-lunch', stepId: 'park-lunch', kind: 'meal',
        coordinates: [12.4868, 41.8909], title: t('Packed lunch · park area', 'Prowiant · teren parku'),
        description: t('An approximate area for your lunch break, not a restaurant. Stay inside the archaeological park, follow signs and eat only where permitted.', 'Orientacyjna okolica przerwy, nie restauracja. Zostań w parku archeologicznym, stosuj się do oznaczeń i jedz tylko w dozwolonych miejscach.'),
      },
      {
        id: 'cavour-metro', kind: 'metro', coordinates: [12.4933395, 41.8947564],
        title: t('Cavour · Metro B', 'Cavour · Metro B'),
        description: t('Return station near Monti. Take Metro B towards Rebibbia or Jonio for Termini. The walk from the park depends on the exit you use.', 'Stacja powrotna przy Monti. Do Termini jedź metrem B w stronę Rebibbia lub Jonio. Długość przejścia z parku zależy od wybranego wyjścia.'),
      },
    ],
    paths: legs(['colosseo-metro', 'colosseum', 'forum', 'park-lunch', 'palatine', 'cavour-metro'], geometry.one),
  },
  'collections-and-baths': {
    points: [
      colosseo,
      {
        id: 'aventino-lunch', stepId: 'aventino-lunch', kind: 'meal',
        coordinates: [12.482, 41.8889], title: t('Lunch · Via della Greca', 'Lunch · Via della Greca'),
        description: t('An area to look for a café or trattoria before Circus Maximus. Choose a place and check its menu and opening hours on the day; no table is reserved.', 'Okolica, w której możesz poszukać kawiarni lub trattorii przed Circus Maximus. Sprawdź menu i godziny wybranego lokalu; stolik nie jest zarezerwowany.'),
      },
      {
        id: 'circo-massimo-metro', kind: 'metro', coordinates: [12.4881187, 41.8834265],
        title: t('Circo Massimo · Metro B', 'Circo Massimo · Metro B'),
        description: t('Return station for Circus Maximus and the Baths of Caracalla. Take Metro B towards Rebibbia or Jonio for Termini.', 'Stacja powrotna przy Circus Maximus i Termach Karakalli. Do Termini jedź metrem B w stronę Rebibbia lub Jonio.'),
      },
    ],
    paths: [
      ...legs(['colosseo-metro', 'capitoline', 'campidoglio', 'aventino-lunch', 'circus', 'caracalla', 'circo-massimo-metro'], geometry.two),
      { from: 'circus', to: 'circo-massimo-metro', coordinates: geometry.shortcut[0] as MapCoordinate[], whenSkipped: 'caracalla' },
    ],
  },
};
