import type { Content, Copy } from './types';
import { ancientRomePlan } from './ancientRomePlan';

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
function base(
  id: string,
  kind: Content['kind'],
  en: string,
  pl: string,
  description: Copy,
  image: string,
  order = 0,
): Content {
  return {
    id,
    kind,
    slug: id,
    title: t(en, pl),
    description,
    image,
    gallery: [image],
    published: true,
    featured: true,
    order,
  };
}
export const seed: Content[] = [
  {
    ...base(
      'home',
      'page',
      'Travel guides\nto Poland.',
      'Przewodniki\npo Polsce.',
      t(
        'Explore destinations and follow practical itineraries. Download your purchased guides for offline access.',
        'Odkrywaj kierunki i korzystaj z gotowych tras. Pobierz zakupione przewodniki, aby mieć do nich dostęp offline.',
      ),
      images.tatra,
    ),
    gallery: [images.tatra, images.lake, images.forest],
  },
  base(
    'about',
    'page',
    'About the guides.',
    'O przewodnikach.',
    t(
      '<p>Roam is a collection of independent guides to Poland. Each trip includes daily routes, places to visit, and estimates of time and cost.</p><p>Purchased guides stay in My Guides. Download them before leaving to save the itinerary, descriptions, images, and illustrated maps on your device.</p>',
      '<p>Roam to kolekcja niezależnych przewodników po Polsce. Każda podróż zawiera codzienne trasy, miejsca do odwiedzenia oraz szacunki czasu i kosztów.</p><p>Zakupione przewodniki znajdziesz w Moich przewodnikach. Pobierz je przed wyjazdem, aby zapisać plan podróży, opisy, zdjęcia i mapy na urządzeniu.</p>',
    ),
    images.forest,
  ),
];
export const agencyPage: Content = {
  ...base(
    'agency',
    'page',
    'We organise your trip.',
    'Organizujemy Twoją podróż.',
    t(
      '<p>We plan tours, arrange accommodation and provide support before and during your trip.</p>',
      '<p>Planujemy wycieczki, organizujemy noclegi i zapewniamy wsparcie przed podróżą oraz w jej trakcie.</p>',
    ),
    photo('photo-1687178151530-883e1495b4aa'),
  ),
  foundedYear: 2014,
};
seed.push(agencyPage);
const destinations = [
  {
    id: 'tatras',
    en: 'The Tatra Mountains',
    pl: 'Tatry',
    region: 'Southern Poland',
    lat: 49.26,
    lng: 19.98,
    image: images.tatra,
    desc: t(
      'Alpine lakes, limestone peaks, and trails above the clouds.',
      'Alpejskie jeziora, wapienne szczyty i szlaki ponad chmurami.',
    ),
    trip: ['A long weekend in the Tatras', 'Długi weekend w Tatrach'],
    days: 3,
    budget: 680,
    price: 1290,
  },
  {
    id: 'krakow',
    en: 'Kraków',
    pl: 'Kraków',
    region: 'Southern Poland',
    lat: 50.06,
    lng: 19.94,
    image: images.krakow,
    desc: t(
      'Courtyard cafés, a riverside castle, and centuries of stories.',
      'Kawiarnie na dziedzińcach, zamek nad rzeką i wieki historii.',
    ),
    trip: ['Kraków, at your own pace', 'Kraków w Twoim tempie'],
    days: 2,
    budget: 450,
    price: 890,
  },
  {
    id: 'baltic',
    en: 'The Baltic Coast',
    pl: 'Wybrzeże Bałtyku',
    region: 'Northern Poland',
    lat: 54.4,
    lng: 18.58,
    image: images.coast,
    desc: t(
      'Dune paths, fishing harbours, and a little more sea air.',
      'Ścieżki po wydmach, rybackie porty i więcej morskiego powietrza.',
    ),
    trip: ['Between Gdańsk and the sea', 'Między Gdańskiem a morzem'],
    days: 3,
    budget: 590,
    price: 1190,
  },
  {
    id: 'bieszczady',
    en: 'Bieszczady',
    pl: 'Bieszczady',
    region: 'Eastern Poland',
    lat: 49.18,
    lng: 22.57,
    image: images.bieszczady,
    desc: t(
      'Open ridgelines, beech forests, and quiet village roads.',
      'Otwarte grzbiety, bukowe lasy i spokojne wiejskie drogi.',
    ),
    trip: ['The quieter side of the mountains', 'Spokojniejsza strona gór'],
    days: 2,
    budget: 420,
    price: 990,
  },
];
export const europeDestinations: Content[] = [
  ['lisbon', 'Lisbon', 'Lizbona', 'Portugal', 38.72, -9.14, 'photo-1744580162134-b9b64645f7c8'],
  ['barcelona', 'Barcelona', 'Barcelona', 'Spain', 41.39, 2.17, 'photo-1583422409516-2895a77efded'],
  ['rome', 'Rome', 'Rzym', 'Italy', 41.9, 12.5, 'photo-1552832230-c0197dd311b5'],
  ['prague', 'Prague', 'Praga', 'Czechia', 50.08, 14.44, 'photo-1541849546-216549ae216d'],
  ['vienna', 'Vienna', 'Wiedeń', 'Austria', 48.21, 16.37, 'photo-1516550893923-42d28e5677af'],
  ['paris', 'Paris', 'Paryż', 'France', 48.86, 2.35, 'photo-1502602898657-3e91760cbb34'],
  [
    'amsterdam',
    'Amsterdam',
    'Amsterdam',
    'Netherlands',
    52.37,
    4.9,
    'photo-1534351590666-13e3e96b5017',
  ],
  ['athens', 'Athens', 'Ateny', 'Greece', 37.98, 23.73, 'photo-1555993539-1732b0258235'],
].map(([id, en, pl, country, lat, lng, image], i) => ({
  ...base(
    id as string,
    'destination',
    en as string,
    pl as string,
    t(`Explore ${en}, ${country}.`, `Odkryj ${pl}, ${country}.`),
    photo(image as string),
    10 + i,
  ),
  region: country as string,
  lat: lat as number,
  lng: lng as number,
}));
seed.push(...europeDestinations);
const countryNamesPl = [
  'Portugalia',
  'Hiszpania',
  'Włochy',
  'Czechy',
  'Austria',
  'Francja',
  'Niderlandy',
  'Grecja',
];
export const europeTours: Content[] = europeDestinations.map((d, i) => ({
  ...base(
    `${d.id}-tour`,
    'trip',
    d.region!,
    countryNamesPl[i],
    t(
      `<p>A sample tour itinerary in ${d.title.en}. Tour dates and inclusions are not yet configured.</p>`,
      `<p>Przykładowy plan wycieczki: ${d.title.pl}. Terminy i szczegóły wycieczki nie zostały jeszcze ustalone.</p>`,
    ),
    d.image,
    10 + i,
  ),
  destinationId: d.id,
  duration: 3,
  budget: 500,
  price: 1490 + i * 100,
  routeIds: [],
}));
const romeTour = europeTours.find((tour) => tour.id === 'rome-tour')!;
romeTour.title = t('Three days in Rome', 'Trzy dni w Rzymie');
romeTour.duration = 3;
romeTour.description = t(
  '<p>Rome is a city best discovered on foot: ancient monuments give way to neighbourhood streets, lively piazzas and places to stop for a long Italian lunch. Our three-day tour brings those pieces together in a plan shaped around your dates and interests.</p><h2>From ancient Rome to the heart of the city</h2><p>Begin with the <strong>Colosseum and Roman Forum</strong>, where the scale of the ancient city becomes real. Follow the streets into the historic centre to see the Pantheon and Trevi Fountain, with time to explore the piazzas and find a place to eat along the way.</p><p>You can also explore the Vatican Museums, Trastevere or Tivoli with our free route guides. Each is an independent plan: choose the ones that interest you and discuss how they could fit your trip.</p><h2>A trip planned around you</h2><p>We can help arrange flights, accommodation and airport transfers around your dates and budget. Much of the centre is walkable; we can also discuss local transport and any mobility needs when planning your route.</p><h3>What to discuss with us</h3><ul><li>Your preferred travel dates and budget</li><li>Accommodation and flight options</li><li>Attraction tickets, local transport and accessibility</li><li>Entry requirements and practical details before departure</li></ul><p>The listed tour price is a starting point. We will confirm the itinerary, inclusions and final quote with you before booking. Allow separately for meals and personal spending unless agreed otherwise.</p>',
  '<p>Rzym najlepiej odkrywać pieszo: starożytne zabytki przechodzą w uliczki dzielnic, tętniące życiem place i miejsca na spokojny włoski obiad. Nasza trzydniowa wycieczka łączy je w plan dopasowany do Twoich terminów i zainteresowań.</p><h2>Od starożytnego Rzymu do serca miasta</h2><p>Zacznij od <strong>Koloseum i Forum Romanum</strong>, gdzie można poczuć skalę starożytnego miasta. Przejdź przez historyczne centrum do Panteonu i fontanny di Trevi, zatrzymując się po drodze na placach i posiłek.</p><p>Możesz też poznać Muzea Watykańskie, Zatybrze lub Tivoli z naszymi bezpłatnymi trasami. Każda jest osobnym planem: wybierz te, które Cię interesują, i porozmawiajmy o tym, jak włączyć je do podróży.</p><h2>Podróż dopasowana do Ciebie</h2><p>Pomożemy zorganizować loty, noclegi i transfery z lotniska stosownie do terminów i budżetu. Większość centrum można zwiedzać pieszo; przy planowaniu omówimy też transport lokalny i potrzeby związane z dostępnością.</p><h3>Co warto z nami omówić</h3><ul><li>Preferowane terminy i budżet</li><li>Możliwości lotów i noclegów</li><li>Bilety do atrakcji, transport lokalny i dostępność</li><li>Wymagania wjazdowe i praktyczne szczegóły przed wyjazdem</li></ul><p>Podana cena wycieczki jest ceną wyjściową. Przed rezerwacją potwierdzimy z Tobą plan, zakres usług i końcową ofertę. Jeśli nie ustalimy inaczej, uwzględnij osobno posiłki i wydatki osobiste.</p>',
);
romeTour.gallery = [
  romeTour.image,
  photo('photo-1531572753322-ad063cecc140'),
  photo('photo-1525874684015-58379d421a52'),
  photo('photo-1594404147062-ec7297a2a28d'),
  photo('photo-1654612533611-d4f18261d444'),
  photo('photo-1573071509995-4256edc7681d'),
];
romeTour.routeIds = [
  'rome-ancient-route',
  'rome-centre-route',
  'rome-vatican-route',
  'rome-trastevere-route',
  'rome-tivoli-route',
];
export const romeRoutes: Content[] = [
  {
    ...base(
      'rome-ancient-route',
      'route',
      'Ancient Rome',
      'Starożytny Rzym',
      t(
        '<p>Spend two days exploring ancient Rome from a central base. Settle into your accommodation, visit the Colosseum and Roman Forum, and allow time for the Capitoline Museums. Tickets and the hotel are confirmed when planning your trip.</p>',
        '<p>Spędź dwa dni na odkrywaniu starożytnego Rzymu, korzystając z noclegu w centrum. Odwiedź Koloseum, Forum Romanum i Muzea Kapitolińskie. Bilety i hotel ustalimy podczas planowania podróży.</p>',
      ),
      romeTour.image,
    ),
    tripId: romeTour.id,
    destinationId: 'rome',
    duration: 48,
    budget: 300,
    transport: 'walking',
    stopIds: ['rome-stay', 'rome-colosseum', 'rome-forum', 'rome-capitoline'],
  },
  {
    ...base(
      'rome-centre-route',
      'route',
      'Rome’s historic centre',
      'Historyczne centrum Rzymu',
      t(
        '<p>Walk through the historic centre, stopping at the Pantheon and Trevi Fountain.</p>',
        '<p>Spacer po historycznym centrum z przystankami przy Panteonie i fontannie di Trevi.</p>',
      ),
      romeTour.gallery[1],
    ),
    tripId: romeTour.id,
    destinationId: 'rome',
    duration: 4,
    budget: 100,
    transport: 'walking',
    stopIds: ['rome-pantheon', 'rome-trevi'],
  },
  {
    ...base(
      'rome-vatican-route',
      'route',
      'Vatican museums and St Peter’s',
      'Muzea Watykańskie i Bazylika św. Piotra',
      t(
        '<p>Visit the Vatican Museums and St Peter’s Square. Museum entry requires a ticket; check availability in advance.</p>',
        '<p>Odwiedź Muzea Watykańskie i plac św. Piotra. Wstęp do muzeów wymaga biletu; sprawdź dostępność z wyprzedzeniem.</p>',
      ),
      romeTour.gallery[1],
    ),
    tripId: romeTour.id,
    destinationId: 'rome',
    duration: 5,
    budget: 180,
    transport: 'walking',
    stopIds: ['rome-vatican-museums', 'rome-st-peters'],
  },
  {
    ...base(
      'rome-trastevere-route',
      'route',
      'Trastevere and Janiculum Hill',
      'Zatybrze i wzgórze Janikulum',
      t(
        '<p>Explore Trastevere’s streets and piazzas, then climb Janiculum Hill for a view across Rome.</p>',
        '<p>Poznaj uliczki i place Zatybrza, a następnie wejdź na Janikulum, skąd rozciąga się widok na Rzym.</p>',
      ),
      romeTour.gallery[3],
    ),
    tripId: romeTour.id,
    destinationId: 'rome',
    duration: 3,
    budget: 80,
    transport: 'walking',
    stopIds: ['rome-trastevere', 'rome-janiculum'],
  },
  {
    ...base(
      'rome-tivoli-route',
      'route',
      'Tivoli and its villas',
      'Tivoli i jego wille',
      t(
        '<p>Travel from Rome to Tivoli for the gardens and fountains of Villa d’Este, followed by time in the old town. Transport and entry can be arranged when discussing the tour.</p>',
        '<p>Wyrusz z Rzymu do Tivoli, by zobaczyć ogrody i fontanny Villa d’Este, a potem odwiedzić stare miasto. Przejazd i bilety możemy ustalić podczas planowania wycieczki.</p>',
      ),
      romeTour.gallery[4],
    ),
    tripId: romeTour.id,
    destinationId: 'rome',
    duration: 8,
    budget: 180,
    transport: 'train',
    stopIds: ['rome-tivoli', 'rome-villa-este'],
  },
  ...(
    [
      [
        'rome-stay',
        'A central Rome stay',
        'Nocleg w centrum Rzymu',
        41.8955,
        12.4823,
        photo('photo-1566073771259-6a8506099945'),
        'accommodation',
        '<p>Example accommodation in central Rome. The hotel and room are selected to suit your dates and budget before booking.</p>',
        '<p>Przykładowy nocleg w centrum Rzymu. Hotel i pokój dobieramy do terminów i budżetu przed rezerwacją.</p>',
      ],
      ['rome-colosseum', 'Colosseum', 'Koloseum', 41.8902, 12.4922, romeTour.image],
      ['rome-forum', 'Roman Forum', 'Forum Romanum', 41.8925, 12.4853, romeTour.image],
      ['rome-pantheon', 'Pantheon', 'Panteon', 41.8986, 12.4769, romeTour.gallery[2]],
      ['rome-trevi', 'Trevi Fountain', 'Fontanna di Trevi', 41.9009, 12.4833, romeTour.gallery[1]],
      [
        'rome-capitoline',
        'Capitoline Museums',
        'Muzea Kapitolińskie',
        41.8933,
        12.4828,
        romeTour.image,
      ],
      [
        'rome-vatican-museums',
        'Vatican Museums',
        'Muzea Watykańskie',
        41.9065,
        12.4536,
        romeTour.gallery[5],
      ],
      [
        'rome-st-peters',
        'St Peter’s Square',
        'Plac św. Piotra',
        41.9022,
        12.4574,
        romeTour.gallery[1],
      ],
      ['rome-trastevere', 'Trastevere', 'Zatybrze', 41.8897, 12.4707, romeTour.gallery[3]],
      ['rome-janiculum', 'Janiculum Hill', 'Janikulum', 41.8918, 12.4605, romeTour.gallery[3]],
      [
        'rome-tivoli',
        'Tivoli old town',
        'Stare miasto w Tivoli',
        41.9635,
        12.7989,
        romeTour.gallery[4],
      ],
      [
        'rome-villa-este',
        'Villa d’Este gardens',
        'Ogrody Villa d’Este',
        41.9631,
        12.7964,
        romeTour.gallery[4],
      ],
    ] as const
  ).map(([id, en, pl, lat, lng, image, category, descriptionEn, descriptionPl]) => ({
    ...base(
      id,
      'place',
      en,
      pl,
      t(
        descriptionEn ||
          `<p>Visit ${en} as part of your route. Check opening times and ticket availability when planning your visit.</p>`,
        descriptionPl ||
          `<p>Odwiedź ${pl} podczas podróży. Planując wizytę, sprawdź godziny otwarcia i dostępność biletów.</p>`,
      ),
      image,
    ),
    destinationId: 'rome',
    lat,
    lng,
    category: category || 'sight',
    duration: 60,
    budget: 0,
  })),
];
// Route options stand alone: travellers can choose one or combine several.
export const romeRouteDefaults = romeRoutes.map((entry) => structuredClone(entry));
const romeRoutePlans = [
  {
    id: 'rome-ancient-route',
    description: t(
      '<p>Trace the city from the imperial arena to the Capitoline Hill, with an overnight stay in central Rome. Two days give you time for the Forum and a museum without rushing through both.</p><h2>Plan your visit</h2><p>Start at the Colosseum, then continue through the Forum and Palatine Hill. On the second day, visit the Capitoline Museums and look out over the Forum from the hill. Reserve attraction tickets in advance and check the entry times before setting out.</p><p>The accommodation stop is an example; the hotel is selected to suit your dates and budget.</p>',
      '<p>Poznaj miasto od cesarskiego amfiteatru po Kapitol, z noclegiem w centrum Rzymu. Dwa dni pozwalają spokojnie zwiedzić Forum i muzeum.</p><h2>Plan wizyty</h2><p>Zacznij od Koloseum, następnie przejdź przez Forum i Palatyn. Drugiego dnia odwiedź Muzea Kapitolińskie i spójrz na Forum ze wzgórza. Bilety warto zarezerwować wcześniej i sprawdzić godziny wejścia.</p><p>Nocleg jest przykładowy; hotel dobieramy do terminów i budżetu.</p>',
    ),
    stops: [
      'rome-stay',
      'rome-colosseum',
      'rome-forum',
      'rome-palatine',
      'rome-capitoline',
      'rome-campidoglio',
    ],
  },
  {
    id: 'rome-centre-route',
    duration: 7,
    description: t(
      '<p>A walk through the historic centre, linking classical architecture with lively squares and a market lunch. The compact route is easy to follow on foot, with opportunities to stop for coffee or linger over lunch.</p><h2>Along the way</h2><p>Start at Campo de’ Fiori, continue to Piazza Navona and the Pantheon, then make your way to the Trevi Fountain and Spanish Steps. The Pantheon may require a ticket; check opening hours before you go. The market is busiest earlier in the day.</p>',
      '<p>Spacer po historycznym centrum łączy klasyczną architekturę z placami i lunchem przy targu. Trasę łatwo pokonać pieszo, z przerwą na kawę lub posiłek.</p><h2>Po drodze</h2><p>Zacznij na Campo de’ Fiori, idź na Piazza Navona i do Panteonu, a następnie do fontanny di Trevi i Schodów Hiszpańskich. Do Panteonu może być potrzebny bilet; sprawdź godziny otwarcia. Targ najlepiej odwiedzić wcześniej w ciągu dnia.</p>',
    ),
    stops: ['rome-campo', 'rome-navona', 'rome-pantheon', 'rome-trevi', 'rome-spanish'],
  },
  {
    id: 'rome-vatican-route',
    duration: 8,
    description: t(
      '<p>Explore Vatican art and architecture, then cross the Tiber toward the historic centre. This route pairs a substantial museum visit with open-air stops and a chance to pause for lunch.</p><h2>Plan your visit</h2><p>Book the Vatican Museums ahead and allow several hours for the galleries and Sistine Chapel. Continue to St Peter’s Square, then walk past Castel Sant’Angelo and across Ponte Sant’Angelo. Entry rules, queues and opening times can change; check them before setting out.</p>',
      '<p>Poznaj sztukę i architekturę Watykanu, a następnie przejdź przez Tyber w stronę centrum. Trasa łączy dłuższą wizytę w muzeum ze spacerem i przerwą na obiad.</p><h2>Plan wizyty</h2><p>Zarezerwuj Muzea Watykańskie z wyprzedzeniem i przeznacz kilka godzin na galerie oraz Kaplicę Sykstyńską. Dalej zobacz plac św. Piotra, Zamek Świętego Anioła i most Świętego Anioła. Sprawdź aktualne zasady wstępu i godziny otwarcia.</p>',
    ),
    stops: ['rome-vatican-museums', 'rome-st-peters', 'rome-castel', 'rome-ponte'],
  },
  {
    id: 'rome-trastevere-route',
    duration: 6,
    description: t(
      '<p>A slower walk through Trastevere: neighbourhood lanes, a riverside island, a hilltop view and time for a Roman meal. Wear comfortable shoes for the uphill stretch to Janiculum.</p><h2>Along the way</h2><p>Cross Tiber Island into Trastevere, visit Piazza di Santa Maria and the basilica, then climb to the Janiculum viewpoint. Return downhill for dinner in the neighbourhood; restaurants and opening times are not included in the route.</p>',
      '<p>Spokojniejszy spacer po Zatybrzu: uliczki dzielnicy, wyspa na Tybrze, panorama ze wzgórza i czas na rzymski posiłek. Na podejście na Janikulum przydadzą się wygodne buty.</p><h2>Po drodze</h2><p>Przejdź przez Wyspę Tyberyjską na Zatybrze, odwiedź plac i bazylikę Santa Maria, a następnie wejdź na punkt widokowy na Janikulum. Wróć do dzielnicy na kolację; restauracje i godziny otwarcia nie są gwarantowane.</p>',
    ),
    stops: [
      'rome-tiber-island',
      'rome-trastevere',
      'rome-santa-maria',
      'rome-janiculum',
      'rome-dinner',
    ],
  },
  {
    id: 'rome-tivoli-route',
    duration: 48,
    description: t(
      '<p>Take two days away from Rome for Tivoli’s gardens, ancient villas and old town. An overnight stay makes it possible to visit both major estates without squeezing them into one afternoon.</p><h2>Plan your visit</h2><p>Travel from Rome to Tivoli, explore Villa d’Este and its gardens, then stay overnight in town. The following day, visit Hadrian’s Villa before returning to Rome. The sites are separate and require local transport; check train connections, opening days and tickets before travelling.</p><p>Accommodation is illustrative and can be discussed when planning your trip.</p>',
      '<p>Spędź dwa dni poza Rzymem, poznając ogrody, starożytne wille i stare miasto Tivoli. Nocleg pozwala odwiedzić obie główne rezydencje bez pośpiechu.</p><h2>Plan wizyty</h2><p>Przyjedź z Rzymu do Tivoli, zwiedź Villa d’Este i ogrody, a następnie zatrzymaj się w mieście na noc. Następnego dnia odwiedź Willę Hadriana przed powrotem. Obiekty są oddalone od siebie; sprawdź połączenia, dni otwarcia i bilety przed wyjazdem.</p><p>Nocleg jest przykładowy i można go omówić podczas planowania podróży.</p>',
    ),
    stops: ['rome-tivoli', 'rome-villa-este', 'rome-tivoli-stay', 'rome-hadrian'],
  },
];
for (const plan of romeRoutePlans) {
  const route = romeRoutes.find((entry) => entry.id === plan.id)!;
  route.description = plan.description;
  route.stopIds = plan.stops;
  if (plan.duration) route.duration = plan.duration;
}
const romeStopNotes: Record<string, Copy> = {
  'rome-colosseum': t(
    'Visit the amphitheatre; timed tickets are usually needed. Allow time for security checks.',
    'Odwiedź amfiteatr; zwykle potrzebny jest bilet na określoną godzinę. Uwzględnij kontrolę bezpieczeństwa.',
  ),
  'rome-forum': t(
    'Walk through the Forum between the Colosseum and Palatine. Paths are uneven, with limited shade.',
    'Przejdź przez Forum między Koloseum a Palatynem. Ścieżki są nierówne i miejscami pozbawione cienia.',
  ),
  'rome-capitoline': t(
    'Explore the collections on Capitoline Hill. Check museum opening days and ticket options before visiting.',
    'Poznaj zbiory na Kapitolu. Przed wizytą sprawdź dni otwarcia i możliwości zakupu biletów.',
  ),
  'rome-pantheon': t(
    'See the ancient dome and interior. Check current access and ticket arrangements before arriving.',
    'Zobacz starożytną kopułę i wnętrze. Przed wizytą sprawdź aktualne zasady wstępu i bilety.',
  ),
  'rome-trevi': t(
    'Stop at the fountain on the way to Piazza di Spagna. Earlier visits can be less crowded.',
    'Zatrzymaj się przy fontannie w drodze na Piazza di Spagna. Rano bywa tu mniej tłoczno.',
  ),
  'rome-vatican-museums': t(
    'Set aside several hours for the galleries and Sistine Chapel. Reserve a timed ticket in advance.',
    'Przeznacz kilka godzin na galerie i Kaplicę Sykstyńską. Zarezerwuj bilet na określoną godzinę.',
  ),
  'rome-st-peters': t(
    'Walk through the square and check current security and dress requirements if entering the basilica.',
    'Przejdź przez plac; przed wejściem do bazyliki sprawdź aktualne zasady kontroli i ubioru.',
  ),
  'rome-trastevere': t(
    'Explore the lanes around the neighbourhood’s piazzas, with time to find a café or restaurant.',
    'Poznaj uliczki wokół placów dzielnicy i znajdź czas na kawiarnię lub restaurację.',
  ),
  'rome-janiculum': t(
    'Climb to the viewpoint for a panorama over Rome; expect an uphill walk and plan for warm weather.',
    'Wejdź na punkt widokowy z panoramą Rzymu; przygotuj się na podejście i upał.',
  ),
  'rome-tivoli': t(
    'Explore Tivoli’s old streets before the gardens. Check train connections and the walk from the station.',
    'Poznaj stare uliczki Tivoli przed wizytą w ogrodach. Sprawdź połączenia kolejowe i drogę ze stacji.',
  ),
  'rome-villa-este': t(
    'Allow time for the terraced gardens and fountains. Check opening days, tickets and any fountain maintenance.',
    'Zaplanuj czas na tarasowe ogrody i fontanny. Sprawdź dni otwarcia, bilety oraz ewentualne prace przy fontannach.',
  ),
};
for (const entry of romeRoutes) {
  const note = romeStopNotes[entry.id];
  if (note) entry.description = t(`<p>${note.en}</p>`, `<p>${note.pl}</p>`);
}
const romeExtraStops = [
  [
    'rome-palatine',
    'Palatine Hill',
    'Palatyn',
    41.8894,
    12.4874,
    'sight',
    'Walk among imperial ruins above the Forum. Allow time for uneven paths and check ticket access.',
    'Spacer wśród cesarskich ruin nad Forum. Uwzględnij nierówne ścieżki i sprawdź zasady wstępu.',
  ],
  [
    'rome-campidoglio',
    'Piazza del Campidoglio',
    'Plac na Kapitolu',
    41.8932,
    12.4828,
    'sight',
    'Finish on Capitoline Hill, with a view over the Forum from the terraces nearby.',
    'Zakończ spacer na Kapitolu, skąd z pobliskich tarasów widać Forum.',
  ],
  [
    'rome-campo',
    'Campo de’ Fiori',
    'Campo de’ Fiori',
    41.8956,
    12.4721,
    'food',
    'Start at the square and explore its market; check market days and arrive earlier for the stalls.',
    'Zacznij na placu i odwiedź targ; sprawdź dni handlowe i przyjdź wcześniej.',
  ],
  [
    'rome-navona',
    'Piazza Navona',
    'Piazza Navona',
    41.8992,
    12.4731,
    'sight',
    'Pause at the fountains and take in the architecture around this long piazza.',
    'Zatrzymaj się przy fontannach i zobacz architekturę wokół placu.',
  ],
  [
    'rome-spanish',
    'Spanish Steps',
    'Schody Hiszpańskie',
    41.9059,
    12.4823,
    'sight',
    'End near Piazza di Spagna, with metro connections for the journey back.',
    'Zakończ przy Piazza di Spagna, skąd można wrócić metrem.',
  ],
  [
    'rome-castel',
    'Castel Sant’Angelo',
    'Zamek Świętego Anioła',
    41.9031,
    12.4663,
    'museum',
    'Walk along the river to the fortress; allow extra time and check tickets if visiting inside.',
    'Dojdź nad rzeką do zamku; na zwiedzanie wnętrz zarezerwuj dodatkowy czas i sprawdź bilety.',
  ],
  [
    'rome-ponte',
    'Ponte Sant’Angelo',
    'Most Świętego Anioła',
    41.902,
    12.4663,
    'sight',
    'Cross the pedestrian bridge toward the historic centre.',
    'Przejdź pieszym mostem w stronę historycznego centrum.',
  ],
  [
    'rome-tiber-island',
    'Tiber Island',
    'Wyspa Tyberyjska',
    41.8909,
    12.4785,
    'sight',
    'Cross the river via the island on your way into Trastevere.',
    'Przejdź przez wyspę na Tybrze w drodze na Zatybrze.',
  ],
  [
    'rome-santa-maria',
    'Santa Maria in Trastevere',
    'Santa Maria na Zatybrzu',
    41.8897,
    12.4705,
    'sight',
    'Visit the basilica and its piazza; check opening times and dress requirements.',
    'Odwiedź bazylikę i plac; sprawdź godziny otwarcia i wymagany strój.',
  ],
  [
    'rome-dinner',
    'Dinner in Trastevere',
    'Kolacja na Zatybrzu',
    41.889,
    12.4695,
    'food',
    'Allow time for dinner in the neighbourhood. Choose a restaurant and book ahead if needed.',
    'Zaplanuj kolację w dzielnicy. Wybierz restaurację i w razie potrzeby zarezerwuj stolik.',
  ],
  [
    'rome-tivoli-stay',
    'A night in Tivoli',
    'Nocleg w Tivoli',
    41.9635,
    12.7989,
    'accommodation',
    'Example overnight stop; accommodation is selected to suit your dates and budget.',
    'Przykładowy nocleg; obiekt dobieramy do terminów i budżetu.',
  ],
  [
    'rome-hadrian',
    'Hadrian’s Villa',
    'Willa Hadriana',
    41.9427,
    12.7757,
    'sight',
    'Explore the extensive archaeological site. It is outside Tivoli centre, so plan local transport and check opening hours.',
    'Zwiedź rozległe stanowisko archeologiczne poza centrum Tivoli; zaplanuj dojazd i sprawdź godziny otwarcia.',
  ],
] as const;
for (const [id, en, pl, lat, lng, category, enNote, plNote] of romeExtraStops) {
  const image =
    id.includes('tivoli') || id === 'rome-hadrian'
      ? romeTour.gallery[4]
      : id.includes('trastevere') ||
          ['rome-tiber-island', 'rome-santa-maria', 'rome-dinner'].includes(id)
        ? romeTour.gallery[3]
        : romeTour.gallery[1];
  romeRoutes.push({
    ...base(id, 'place', en, pl, t(`<p>${enNote}</p>`, `<p>${plNote}</p>`), image),
    destinationId: 'rome',
    lat,
    lng,
    category,
    duration: 60,
    budget: 0,
  });
}
// Keep the previous defaults so existing editorial changes are never overwritten.
export const ancientRomePrevious = romeRoutes
  .filter((entry) =>
    [
      'rome-ancient-route',
      'rome-colosseum',
      'rome-forum',
      'rome-palatine',
      'rome-capitoline',
      'rome-campidoglio',
    ].includes(entry.id),
  )
  .map((entry) => structuredClone(entry));
const ancientRome = romeRoutes.find((entry) => entry.id === 'rome-ancient-route')!;
ancientRome.plan = ancientRomePlan;
ancientRome.description = t(
  '<p>Two days among the remains of ancient Rome, from the Colosseum and imperial palaces to the collections on Capitoline Hill and the Baths of Caracalla. The route is walkable, with time for lunch and breaks between the larger sites.</p><h2>Day one: the heart of the ancient city</h2><p>Start at the Colosseum, then use the same combined ticket to explore the Roman Forum and Palatine Hill. The Forum and Palatine form one archaeological area: allow several hours and enter only once. End in Monti for dinner.</p><h2>Day two: museums and monumental baths</h2><p>Begin at the Capitoline Museums and take in the Forum view from the hill. Continue past Circus Maximus to the Baths of Caracalla. The baths are closed on Mondays, so swap the days if necessary.</p><h2>Before you go</h2><p>Reserve a timed Colosseum entry in advance through the <a href="https://colosseo.it/en/opening-times-and-tickets/">official archaeological park</a>. The standard ticket covers one entry to the Colosseum and one to the Forum–Palatine within 24 hours. Bring ID, water and comfortable shoes; paths are uneven and exposed. Check current hours and tickets for the <a href="https://www.museicapitolini.org/en/informazioni_pratiche/orari_e_indirizzi">Capitoline Museums</a> and <a href="https://turismoroma.it/en/places/baths-caracalla">Baths of Caracalla</a> before travelling. Meals, accommodation and tickets are separate.</p>',
  '<p>Dwa dni wśród pozostałości starożytnego Rzymu: od Koloseum i cesarskich pałaców po zbiory na Kapitolu i Termy Karakalli. Trasę można pokonać pieszo, z czasem na obiad i odpoczynek.</p><h2>Dzień pierwszy: serce starożytnego miasta</h2><p>Zacznij od Koloseum, a następnie na tym samym bilecie zwiedź Forum Romanum i Palatyn. Forum i Palatyn tworzą jeden obszar archeologiczny: zaplanuj kilka godzin i jedno wejście. Wieczorem zjedz kolację w Monti.</p><h2>Dzień drugi: muzeum i monumentalne termy</h2><p>Zacznij w Muzeach Kapitolińskich i obejrzyj Forum ze wzgórza. Przejdź obok Circus Maximus do Term Karakalli. Termy są zamknięte w poniedziałki, więc w razie potrzeby zamień kolejność dni.</p><h2>Przed wyjazdem</h2><p>Zarezerwuj wejście do Koloseum na konkretną godzinę na <a href="https://colosseo.it/en/opening-times-and-tickets/">oficjalnej stronie parku archeologicznego</a>. Standardowy bilet obejmuje jedno wejście do Koloseum i jedno na teren Forum i Palatynu w ciągu 24 godzin. Zabierz dokument tożsamości, wodę i wygodne buty; ścieżki są nierówne i nasłonecznione. Przed wyjazdem sprawdź godziny i bilety do <a href="https://www.museicapitolini.org/en/informazioni_pratiche/orari_e_indirizzi">Muzeów Kapitolińskich</a> i <a href="https://turismoroma.it/en/places/baths-caracalla">Term Karakalli</a>. Posiłki, noclegi i bilety opłacane są osobno.</p>',
);
ancientRome.stopIds = [
  'rome-colosseum',
  'rome-forum',
  'rome-palatine',
  'rome-capitoline',
  'rome-campidoglio',
  'rome-circus-maximus',
  'rome-caracalla',
];
const ancientNotes: Record<string, [number, Copy]> = {
  'rome-colosseum': [
    75,
    t(
      'Walk the amphitheatre’s tiers and museum. Book a timed entry, arrive 15 minutes early and bring the ID used for the named ticket.',
      'Zwiedź kondygnacje amfiteatru i muzeum. Zarezerwuj godzinę wejścia, przyjdź 15 minut wcześniej i zabierz dokument tożsamości.',
    ),
  ],
  'rome-forum': [
    120,
    t(
      'Explore the temples, basilicas and Via Sacra. The Forum and Palatine share an entrance area and a single entry on the standard ticket.',
      'Zobacz świątynie, bazyliki i Via Sacra. Forum i Palatyn tworzą jeden obszar z jednym wejściem na standardowym bilecie.',
    ),
  ],
  'rome-palatine': [
    90,
    t(
      'Climb among the imperial residences and gardens for views over the Forum and Circus Maximus. Continue here before leaving the archaeological area.',
      'Wejdź między ruiny cesarskich rezydencji i ogrody, skąd widać Forum i Circus Maximus. Zwiedź Palatyn przed opuszczeniem terenu archeologicznego.',
    ),
  ],
  'rome-capitoline': [
    150,
    t(
      'See the Capitoline Wolf, ancient sculpture and the bronze Marcus Aurelius. The museum entrance is on Piazza del Campidoglio.',
      'Zobacz Wilczycę Kapitolińską, starożytne rzeźby i brązowy pomnik Marka Aureliusza. Wejście znajduje się na Piazza del Campidoglio.',
    ),
  ],
  'rome-campidoglio': [
    20,
    t(
      'Walk behind the square to the terraces overlooking the Forum, then descend toward Circus Maximus.',
      'Przejdź za plac na tarasy z widokiem na Forum, a potem zejdź w kierunku Circus Maximus.',
    ),
  ],
};
for (const entry of romeRoutes) {
  const note = ancientNotes[entry.id];
  if (note) {
    entry.duration = note[0];
    entry.description = t(`<p>${note[1].en}</p>`, `<p>${note[1].pl}</p>`);
  }
}
for (const [id, en, pl, lat, lng, minutes, enNote, plNote] of [
  [
    'rome-circus-maximus',
    'Circus Maximus',
    'Circus Maximus',
    41.8861,
    12.4851,
    30,
    'Follow the edge of the former chariot-racing stadium towards the baths. The open valley is free to visit.',
    'Przejdź wzdłuż dawnego stadionu wyścigów rydwanów w stronę term. Otwarta dolina jest dostępna bezpłatnie.',
  ],
  [
    'rome-caracalla',
    'Baths of Caracalla',
    'Termy Karakalli',
    41.88139,
    12.49282,
    90,
    'Explore the vast bathing complex and its surviving mosaics. Allow time for the gardens; the site is closed on Mondays.',
    'Poznaj rozległy kompleks łaźni i zachowane mozaiki. Zostaw czas na ogrody; obiekt jest zamknięty w poniedziałki.',
  ],
] as const) {
  romeRoutes.push({
    ...base(id, 'place', en, pl, t(`<p>${enNote}</p>`, `<p>${plNote}</p>`), romeTour.image),
    destinationId: 'rome',
    lat,
    lng,
    category: 'sight',
    duration: minutes,
  });
}
export const ancientRomePreviousPhotos = romeRoutes
  .filter((entry) =>
    [
      'rome-forum',
      'rome-palatine',
      'rome-capitoline',
      'rome-campidoglio',
      'rome-circus-maximus',
      'rome-caracalla',
    ].includes(entry.id),
  )
  .map((entry) => ({ id: entry.id, image: entry.image }));
const ancientRomePhotos: Record<string, string> = {
  'rome-forum': photo('photo-1725402209645-bc9a8452d587'),
  'rome-palatine': photo('photo-1783713335433-77e3338adabc'),
  'rome-capitoline': photo('photo-1678180295581-0626e88db42f'),
  'rome-campidoglio': photo('photo-1678180295581-0626e88db42f'),
  'rome-circus-maximus': photo('photo-1734809633535-e3e888551395'),
  'rome-caracalla': photo('photo-1667853648306-c3f7ea9a9743'),
};
for (const entry of romeRoutes) {
  if (ancientRomePhotos[entry.id]) {
    entry.image = ancientRomePhotos[entry.id];
    entry.gallery = [entry.image];
  }
}
seed.push(...europeTours, ...romeRoutes);
const peruImage = photo('photo-1526392060635-9d6019884377');
export const peruContent: Content[] = [
  {
    ...base(
      'peru',
      'destination',
      'Peru',
      'Peru',
      t('Explore the Andes, Cusco and the Sacred Valley.', 'Poznaj Andy, Cusco i Świętą Dolinę.'),
      peruImage,
    ),
    region: 'Peru',
    lat: -13.52,
    lng: -71.97,
  },
  {
    ...base(
      'peru-tour',
      'trip',
      'Peru',
      'Peru',
      t(
        '<p>A sample tour through Cusco, the Sacred Valley and Machu Picchu. Dates and inclusions are not yet configured.</p>',
        '<p>Przykładowa wycieczka przez Cusco, Świętą Dolinę i Machu Picchu. Terminy i szczegóły nie zostały jeszcze ustalone.</p>',
      ),
      peruImage,
    ),
    destinationId: 'peru',
    duration: 7,
    budget: 1200,
    price: 6900,
    routeIds: ['peru-route'],
  },
  {
    ...base(
      'peru-route',
      'route',
      'Cusco and the Sacred Valley',
      'Cusco i Święta Dolina',
      t(
        '<p>A sample route connecting a place to stay with sights around Cusco and the Sacred Valley. Check the tour details for confirmed accommodation and travel arrangements.</p>',
        '<p>Przykładowa trasa łącząca nocleg z atrakcjami Cusco i Świętej Doliny. Potwierdzone noclegi i szczegóły przejazdów znajdziesz w opisie wycieczki.</p>',
      ),
      peruImage,
    ),
    tripId: 'peru-tour',
    destinationId: 'peru',
    duration: 48,
    budget: 450,
    transport: 'driving',
    stopIds: ['peru-hotel', 'peru-cusco', 'peru-machu-picchu'],
  },
  {
    ...base(
      'peru-hotel',
      'place',
      'Cusco accommodation',
      'Nocleg w Cusco',
      t(
        '<p>Example accommodation stop. The hotel is confirmed in the tour details.</p>',
        '<p>Przykładowy przystanek noclegowy. Hotel zostanie potwierdzony w szczegółach wycieczki.</p>',
      ),
      peruImage,
    ),
    destinationId: 'peru',
    lat: -13.518,
    lng: -71.978,
    category: 'accommodation',
    duration: 60,
    budget: 0,
  },
  {
    ...base(
      'peru-cusco',
      'place',
      'Cusco',
      'Cusco',
      t('<p>Explore the historic centre of Cusco.</p>', '<p>Poznaj historyczne centrum Cusco.</p>'),
      peruImage,
    ),
    destinationId: 'peru',
    lat: -13.516,
    lng: -71.978,
    category: 'city',
    duration: 120,
    budget: 0,
  },
  {
    ...base(
      'peru-machu-picchu',
      'place',
      'Machu Picchu',
      'Machu Picchu',
      t(
        '<p>Visit the archaeological site. Check the current admission and access arrangements before travel.</p>',
        '<p>Odwiedź stanowisko archeologiczne. Przed podróżą sprawdź aktualne zasady wstępu.</p>',
      ),
      peruImage,
    ),
    destinationId: 'peru',
    lat: -13.163,
    lng: -72.545,
    category: 'museum',
    duration: 180,
    budget: 200,
  },
];
seed.push(...peruContent);
const stops: Record<string, [string, string, number, number, string, number, number][][]> = {
  tatras: [
    [
      ['Palenica Białczańska', 'Palenica Białczańska', 49.255, 20.103, 'nature', 20, 40],
      ['Wodogrzmoty Mickiewicza', 'Wodogrzmoty Mickiewicza', 49.234, 20.086, 'nature', 30, 0],
      ['Morskie Oko', 'Morskie Oko', 49.197, 20.071, 'nature', 90, 0],
    ],
    [
      ['Kuźnice', 'Kuźnice', 49.27, 19.981, 'city', 30, 0],
      ['Hala Gąsienicowa', 'Hala Gąsienicowa', 49.243, 20.006, 'nature', 60, 0],
      ['Czarny Staw Gąsienicowy', 'Czarny Staw Gąsienicowy', 49.231, 20.014, 'nature', 60, 0],
    ],
    [
      ['Dolina Kościeliska', 'Dolina Kościeliska', 49.271, 19.868, 'nature', 90, 10],
      ['Schronisko Ornak', 'Schronisko Ornak', 49.229, 19.859, 'food', 60, 45],
      ['Smreczyński Staw', 'Smreczyński Staw', 49.22, 19.865, 'nature', 45, 0],
    ],
  ],
  krakow: [
    [
      ['Rynek Główny', 'Rynek Główny', 50.061, 19.937, 'city', 60, 0],
      ['Sukiennice Gallery', 'Galeria w Sukiennicach', 50.06, 19.937, 'museum', 90, 35],
      ['Wawel Hill', 'Wzgórze Wawelskie', 50.054, 19.935, 'museum', 120, 45],
    ],
    [
      ['Kazimierz', 'Kazimierz', 50.051, 19.946, 'city', 90, 0],
      ['Plac Nowy', 'Plac Nowy', 50.052, 19.945, 'food', 45, 35],
      ['Vistula river path', 'Bulwary Wiślane', 50.046, 19.94, 'nature', 60, 0],
    ],
  ],
  baltic: [
    [
      ['Long Market', 'Długi Targ', 54.348, 18.653, 'city', 60, 0],
      [
        'European Solidarity Centre',
        'Europejskie Centrum Solidarności',
        54.361,
        18.65,
        'museum',
        120,
        35,
      ],
      ['Motława riverfront', 'Nabrzeże Motławy', 54.35, 18.659, 'city', 60, 0],
    ],
    [
      ['Sopot Pier', 'Molo w Sopocie', 54.447, 18.577, 'city', 45, 10],
      ['Orłowo Cliff', 'Klif Orłowski', 54.484, 18.565, 'nature', 90, 0],
      ['Orłowo fishing harbour', 'Przystań rybacka Orłowo', 54.48, 18.566, 'food', 60, 55],
    ],
    [
      ['Brzeźno Beach', 'Plaża Brzeźno', 54.412, 18.635, 'nature', 90, 0],
      ['Jelitkowo', 'Jelitkowo', 54.423, 18.603, 'nature', 60, 0],
      ['Oliwa Park', 'Park Oliwski', 54.411, 18.56, 'nature', 60, 0],
    ],
  ],
  bieszczady: [
    [
      ['Wyżna Pass', 'Przełęcz Wyżna', 49.142, 22.548, 'nature', 20, 10],
      ['Połonina Wetlińska', 'Połonina Wetlińska', 49.154, 22.583, 'nature', 120, 0],
      ['Chatka Puchatka', 'Chatka Puchatka', 49.154, 22.58, 'food', 45, 30],
    ],
    [
      ['Wołosate', 'Wołosate', 49.066, 22.681, 'city', 30, 0],
      ['Tarnica', 'Tarnica', 49.074, 22.726, 'nature', 150, 10],
      ['Ustrzyki Górne', 'Ustrzyki Górne', 49.108, 22.65, 'food', 60, 45],
    ],
  ],
};
destinations.forEach((d, i) => {
  seed.push({
    ...base(d.id, 'destination', d.en, d.pl, d.desc, d.image, i),
    region: d.region,
    lat: d.lat,
    lng: d.lng,
  });
  const tripId = `${d.id}-weekend`;
  const routeIds = stops[d.id].map((_, r) => `${d.id}-day-${r + 1}`);
  seed.push({
    ...base(
      tripId,
      'trip',
      d.trip[0],
      d.trip[1],
      t(
        `<p>${d.desc.en} This ${d.days}-day itinerary connects practical daily routes with independent stops. Budgets are estimates per person, excluding travel to the destination.</p>`,
        `<p>${d.desc.pl} Plan na ${d.days} dni łączy codzienne trasy z ciekawymi przystankami. Budżet jest szacunkiem na osobę, bez dojazdu.</p>`,
      ),
      d.image,
      i,
    ),
    destinationId: d.id,
    duration: d.days,
    budget: d.budget,
    price: d.price,
    routeIds,
  });
  stops[d.id].forEach((day, r) => {
    const routeId = routeIds[r];
    const stopIds = day.map((_, s) => `${d.id}-stop-${r}-${s}`);
    seed.push({
      ...base(
        routeId,
        'route',
        `${day[0][0]} to ${day[2][0]}`,
        `${day[0][1]} – ${day[2][1]}`,
        t(
          '<p>Start early and follow the stops in order. Allow extra time for breaks, check local opening hours, and check trail conditions before setting out. Carry water and a weatherproof layer.</p>',
          '<p>Wyrusz wcześnie i odwiedzaj przystanki po kolei. Zaplanuj czas na przerwy, sprawdź godziny otwarcia i warunki na szlaku. Zabierz wodę i kurtkę przeciwdeszczową.</p>',
        ),
        d.image,
        r,
      ),
      tripId,
      destinationId: d.id,
      duration: d.id === 'tatras' ? 6 : 4,
      budget: day.reduce((n, s) => n + s[6], 0),
      transport: 'walking',
      stopIds,
    });
    day.forEach((s, n) => {
      seed.push({
        ...base(
          stopIds[n],
          'place',
          s[0],
          s[1],
          t(
            `<p>${s[0]} is a stop on our ${d.en} itinerary. Take time to explore the surrounding area. The suggested visit is ${s[5]} minutes; admission and opening times can change, so confirm locally before visiting.</p>`,
            `<p>${s[1]} to przystanek na trasie ${d.pl}. Poświęć chwilę na poznanie okolicy. Sugerowany czas wizyty to ${s[5]} minut. Sprawdź aktualne ceny i godziny otwarcia na miejscu.</p>`,
          ),
          d.id === 'tatras' && n === 2 ? images.lake : d.image,
          n,
        ),
        destinationId: d.id,
        lat: s[2],
        lng: s[3],
        category: s[4],
        duration: s[5],
        budget: s[6],
      });
    });
  });
});
