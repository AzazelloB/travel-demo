import type { Content, Copy } from './types';
const t = (en: string, pl: string): Copy => ({ en, pl });
const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=85`;
export const images = {
  tatra: photo('photo-1626468391668-6780596a4190'),
  lake: photo('photo-1626468391668-6780596a4190'),
  krakow: photo('photo-1722504413792-b7ddaa94df95'),
  coast: photo('photo-1697133076392-ceaa769e02fe'),
  bieszczady: photo('photo-1637603932817-4d7737f99876'),
  forest: photo('photo-1448375240586-882707db888b'),
  town: photo('photo-1513622470522-26c3c8a854bc'),
};
function base(id: string, kind: Content['kind'], en: string, pl: string, description: Copy, image: string, order = 0): Content {
  return { id, kind, slug: id, title: t(en, pl), description, image, gallery: [image], published: true, featured: true, order };
}
export const seed: Content[] = [
  { ...base('home', 'page', 'Travel guides\nto Poland.', 'Przewodniki\npo Polsce.', t('Explore destinations and follow practical itineraries. Download your purchased guides for offline access.', 'Odkrywaj kierunki i korzystaj z gotowych tras. Pobierz zakupione przewodniki, aby mieć do nich dostęp offline.'), images.tatra), gallery: [images.tatra, images.lake, images.forest] },
  base('about', 'page', 'About the guides.', 'O przewodnikach.', t('<p>Roam is a collection of independent guides to Poland. Each trip includes daily routes, places to visit, and estimates of time and cost.</p><p>Purchased guides stay in My Guides. Download them before leaving to save the itinerary, descriptions, images, and illustrated maps on your device.</p>', '<p>Roam to kolekcja niezależnych przewodników po Polsce. Każda podróż zawiera codzienne trasy, miejsca do odwiedzenia oraz szacunki czasu i kosztów.</p><p>Zakupione przewodniki znajdziesz w Moich przewodnikach. Pobierz je przed wyjazdem, aby zapisać plan podróży, opisy, zdjęcia i mapy na urządzeniu.</p>'), images.forest),
];
export const agencyPage: Content = {
  ...base('agency', 'page', 'We organise your trip.', 'Organizujemy Twoją podróż.', t('<p>We plan tours, arrange accommodation and provide support before and during your trip.</p>', '<p>Planujemy wycieczki, organizujemy noclegi i zapewniamy wsparcie przed podróżą oraz w jej trakcie.</p>'), photo('photo-1687178151530-883e1495b4aa')),
  foundedYear: 2014,
};
seed.push(agencyPage);
const destinations = [
  { id: 'tatras', en: 'The Tatra Mountains', pl: 'Tatry', region: 'Southern Poland', lat: 49.26, lng: 19.98, image: images.tatra, desc: t('Alpine lakes, limestone peaks, and trails above the clouds.', 'Alpejskie jeziora, wapienne szczyty i szlaki ponad chmurami.'), trip: ['A long weekend in the Tatras', 'Długi weekend w Tatrach'], days: 3, budget: 680, price: 1290 },
  { id: 'krakow', en: 'Kraków', pl: 'Kraków', region: 'Southern Poland', lat: 50.06, lng: 19.94, image: images.krakow, desc: t('Courtyard cafés, a riverside castle, and centuries of stories.', 'Kawiarnie na dziedzińcach, zamek nad rzeką i wieki historii.'), trip: ['Kraków, at your own pace', 'Kraków w Twoim tempie'], days: 2, budget: 450, price: 890 },
  { id: 'baltic', en: 'The Baltic Coast', pl: 'Wybrzeże Bałtyku', region: 'Northern Poland', lat: 54.40, lng: 18.58, image: images.coast, desc: t('Dune paths, fishing harbours, and a little more sea air.', 'Ścieżki po wydmach, rybackie porty i więcej morskiego powietrza.'), trip: ['Between Gdańsk and the sea', 'Między Gdańskiem a morzem'], days: 3, budget: 590, price: 1190 },
  { id: 'bieszczady', en: 'Bieszczady', pl: 'Bieszczady', region: 'Eastern Poland', lat: 49.18, lng: 22.57, image: images.bieszczady, desc: t('Open ridgelines, beech forests, and quiet village roads.', 'Otwarte grzbiety, bukowe lasy i spokojne wiejskie drogi.'), trip: ['The quieter side of the mountains', 'Spokojniejsza strona gór'], days: 2, budget: 420, price: 990 },
];
export const europeDestinations: Content[] = [
  ['lisbon', 'Lisbon', 'Lizbona', 'Portugal', 38.72, -9.14, 'photo-1744580162134-b9b64645f7c8'],
  ['barcelona', 'Barcelona', 'Barcelona', 'Spain', 41.39, 2.17, 'photo-1583422409516-2895a77efded'],
  ['rome', 'Rome', 'Rzym', 'Italy', 41.90, 12.50, 'photo-1552832230-c0197dd311b5'],
  ['prague', 'Prague', 'Praga', 'Czechia', 50.08, 14.44, 'photo-1541849546-216549ae216d'],
  ['vienna', 'Vienna', 'Wiedeń', 'Austria', 48.21, 16.37, 'photo-1516550893923-42d28e5677af'],
  ['paris', 'Paris', 'Paryż', 'France', 48.86, 2.35, 'photo-1502602898657-3e91760cbb34'],
  ['amsterdam', 'Amsterdam', 'Amsterdam', 'Netherlands', 52.37, 4.90, 'photo-1534351590666-13e3e96b5017'],
  ['athens', 'Athens', 'Ateny', 'Greece', 37.98, 23.73, 'photo-1555993539-1732b0258235'],
].map(([id, en, pl, country, lat, lng, image], i) => ({ ...base(id as string, 'destination', en as string, pl as string, t(`Explore ${en}, ${country}.`, `Odkryj ${pl}, ${country}.`), photo(image as string), 10 + i), region: country as string, lat: lat as number, lng: lng as number }));
seed.push(...europeDestinations);
const countryNamesPl = ['Portugalia', 'Hiszpania', 'Włochy', 'Czechy', 'Austria', 'Francja', 'Niderlandy', 'Grecja'];
export const europeTours: Content[] = europeDestinations.map((d, i) => ({
  ...base(`${d.id}-tour`, 'trip', d.region!, countryNamesPl[i], t(`<p>A sample tour itinerary in ${d.title.en}. Tour dates and inclusions are not yet configured.</p>`, `<p>Przykładowy plan wycieczki: ${d.title.pl}. Terminy i szczegóły wycieczki nie zostały jeszcze ustalone.</p>`), d.image, 10 + i),
  destinationId: d.id, duration: 3, budget: 500, price: 1490 + i * 100, routeIds: [],
}));
seed.push(...europeTours);
const peruImage = photo('photo-1526392060635-9d6019884377');
export const peruContent: Content[] = [
  { ...base('peru', 'destination', 'Peru', 'Peru', t('Explore the Andes, Cusco and the Sacred Valley.', 'Poznaj Andy, Cusco i Świętą Dolinę.'), peruImage), region: 'Peru', lat: -13.52, lng: -71.97 },
  { ...base('peru-tour', 'trip', 'Peru', 'Peru', t('<p>A sample tour through Cusco, the Sacred Valley and Machu Picchu. Dates and inclusions are not yet configured.</p>', '<p>Przykładowa wycieczka przez Cusco, Świętą Dolinę i Machu Picchu. Terminy i szczegóły nie zostały jeszcze ustalone.</p>'), peruImage), destinationId: 'peru', duration: 7, budget: 1200, price: 6900, routeIds: ['peru-route'] },
  { ...base('peru-route', 'route', 'Cusco and the Sacred Valley', 'Cusco i Święta Dolina', t('<p>A sample route connecting a place to stay with sights around Cusco and the Sacred Valley. Check the tour details for confirmed accommodation and travel arrangements.</p>', '<p>Przykładowa trasa łącząca nocleg z atrakcjami Cusco i Świętej Doliny. Potwierdzone noclegi i szczegóły przejazdów znajdziesz w opisie wycieczki.</p>'), peruImage), tripId: 'peru-tour', destinationId: 'peru', duration: 48, budget: 450, transport: 'driving', stopIds: ['peru-hotel', 'peru-cusco', 'peru-machu-picchu'] },
  { ...base('peru-hotel', 'place', 'Cusco accommodation', 'Nocleg w Cusco', t('<p>Example accommodation stop. The hotel is confirmed in the tour details.</p>', '<p>Przykładowy przystanek noclegowy. Hotel zostanie potwierdzony w szczegółach wycieczki.</p>'), peruImage), destinationId: 'peru', lat: -13.518, lng: -71.978, category: 'accommodation', duration: 60, budget: 0 },
  { ...base('peru-cusco', 'place', 'Cusco', 'Cusco', t('<p>Explore the historic centre of Cusco.</p>', '<p>Poznaj historyczne centrum Cusco.</p>'), peruImage), destinationId: 'peru', lat: -13.516, lng: -71.978, category: 'city', duration: 120, budget: 0 },
  { ...base('peru-machu-picchu', 'place', 'Machu Picchu', 'Machu Picchu', t('<p>Visit the archaeological site. Check the current admission and access arrangements before travel.</p>', '<p>Odwiedź stanowisko archeologiczne. Przed podróżą sprawdź aktualne zasady wstępu.</p>'), peruImage), destinationId: 'peru', lat: -13.163, lng: -72.545, category: 'museum', duration: 180, budget: 200 },
];
seed.push(...peruContent);
const stops: Record<string, [string, string, number, number, string, number, number][][]> = {
  tatras: [
    [['Palenica Białczańska', 'Palenica Białczańska', 49.255, 20.103, 'nature', 20, 40], ['Wodogrzmoty Mickiewicza', 'Wodogrzmoty Mickiewicza', 49.234, 20.086, 'nature', 30, 0], ['Morskie Oko', 'Morskie Oko', 49.197, 20.071, 'nature', 90, 0]],
    [['Kuźnice', 'Kuźnice', 49.270, 19.981, 'city', 30, 0], ['Hala Gąsienicowa', 'Hala Gąsienicowa', 49.243, 20.006, 'nature', 60, 0], ['Czarny Staw Gąsienicowy', 'Czarny Staw Gąsienicowy', 49.231, 20.014, 'nature', 60, 0]],
    [['Dolina Kościeliska', 'Dolina Kościeliska', 49.271, 19.868, 'nature', 90, 10], ['Schronisko Ornak', 'Schronisko Ornak', 49.229, 19.859, 'food', 60, 45], ['Smreczyński Staw', 'Smreczyński Staw', 49.220, 19.865, 'nature', 45, 0]],
  ],
  krakow: [
    [['Rynek Główny', 'Rynek Główny', 50.061, 19.937, 'city', 60, 0], ['Sukiennice Gallery', 'Galeria w Sukiennicach', 50.060, 19.937, 'museum', 90, 35], ['Wawel Hill', 'Wzgórze Wawelskie', 50.054, 19.935, 'museum', 120, 45]],
    [['Kazimierz', 'Kazimierz', 50.051, 19.946, 'city', 90, 0], ['Plac Nowy', 'Plac Nowy', 50.052, 19.945, 'food', 45, 35], ['Vistula river path', 'Bulwary Wiślane', 50.046, 19.940, 'nature', 60, 0]],
  ],
  baltic: [
    [['Long Market', 'Długi Targ', 54.348, 18.653, 'city', 60, 0], ['European Solidarity Centre', 'Europejskie Centrum Solidarności', 54.361, 18.650, 'museum', 120, 35], ['Motława riverfront', 'Nabrzeże Motławy', 54.350, 18.659, 'city', 60, 0]],
    [['Sopot Pier', 'Molo w Sopocie', 54.447, 18.577, 'city', 45, 10], ['Orłowo Cliff', 'Klif Orłowski', 54.484, 18.565, 'nature', 90, 0], ['Orłowo fishing harbour', 'Przystań rybacka Orłowo', 54.480, 18.566, 'food', 60, 55]],
    [['Brzeźno Beach', 'Plaża Brzeźno', 54.412, 18.635, 'nature', 90, 0], ['Jelitkowo', 'Jelitkowo', 54.423, 18.603, 'nature', 60, 0], ['Oliwa Park', 'Park Oliwski', 54.411, 18.560, 'nature', 60, 0]],
  ],
  bieszczady: [
    [['Wyżna Pass', 'Przełęcz Wyżna', 49.142, 22.548, 'nature', 20, 10], ['Połonina Wetlińska', 'Połonina Wetlińska', 49.154, 22.583, 'nature', 120, 0], ['Chatka Puchatka', 'Chatka Puchatka', 49.154, 22.580, 'food', 45, 30]],
    [['Wołosate', 'Wołosate', 49.066, 22.681, 'city', 30, 0], ['Tarnica', 'Tarnica', 49.074, 22.726, 'nature', 150, 10], ['Ustrzyki Górne', 'Ustrzyki Górne', 49.108, 22.650, 'food', 60, 45]],
  ],
};
destinations.forEach((d, i) => {
  seed.push({ ...base(d.id, 'destination', d.en, d.pl, d.desc, d.image, i), region: d.region, lat: d.lat, lng: d.lng });
  const tripId = `${d.id}-weekend`;
  const routeIds = stops[d.id].map((_, r) => `${d.id}-day-${r + 1}`);
  seed.push({ ...base(tripId, 'trip', d.trip[0], d.trip[1], t(`<p>${d.desc.en} This ${d.days}-day itinerary connects practical daily routes with independent stops. Budgets are estimates per person, excluding travel to the destination.</p>`, `<p>${d.desc.pl} Plan na ${d.days} dni łączy codzienne trasy z ciekawymi przystankami. Budżet jest szacunkiem na osobę, bez dojazdu.</p>`), d.image, i), destinationId: d.id, duration: d.days, budget: d.budget, price: d.price, routeIds });
  stops[d.id].forEach((day, r) => {
    const routeId = routeIds[r];
    const stopIds = day.map((_, s) => `${d.id}-stop-${r}-${s}`);
    seed.push({ ...base(routeId, 'route', `${day[0][0]} to ${day[2][0]}`, `${day[0][1]} – ${day[2][1]}`, t('<p>Start early and follow the stops in order. Allow extra time for breaks, check local opening hours, and check trail conditions before setting out. Carry water and a weatherproof layer.</p>', '<p>Wyrusz wcześnie i odwiedzaj przystanki po kolei. Zaplanuj czas na przerwy, sprawdź godziny otwarcia i warunki na szlaku. Zabierz wodę i kurtkę przeciwdeszczową.</p>'), d.image, r), tripId, destinationId: d.id, duration: d.id === 'tatras' ? 6 : 4, budget: day.reduce((n, s) => n + s[6], 0), transport: 'walking', stopIds });
    day.forEach((s, n) => seed.push({ ...base(stopIds[n], 'place', s[0], s[1], t(`<p>${s[0]} is a stop on our ${d.en} itinerary. Take time to explore the surrounding area. The suggested visit is ${s[5]} minutes; admission and opening times can change, so confirm locally before visiting.</p>`, `<p>${s[1]} to przystanek na trasie ${d.pl}. Poświęć chwilę na poznanie okolicy. Sugerowany czas wizyty to ${s[5]} minut. Sprawdź aktualne ceny i godziny otwarcia na miejscu.</p>`), d.id === 'tatras' && n === 2 ? images.lake : d.image, n), destinationId: d.id, lat: s[2], lng: s[3], category: s[4], duration: s[5], budget: s[6] }));
  });
});
