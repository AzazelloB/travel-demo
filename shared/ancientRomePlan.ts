import type { Copy, RoutePlan } from './types';
import { ancientRomeMaps } from './ancientRomeMap';

const t = (en: string, pl: string): Copy => ({ en, pl });

// Opening information is a dated snapshot, not a live availability feed.
export const ancientRomePlan: RoutePlan = {
  checkedAt: '2026-10-29',
  introduction: t(
    'Two days tracing Roman life from the arena and imperial palaces to sculpture, public squares and monumental baths. Follow either day on its own, or use both as part of a longer stay. Entry tickets, meals and accommodation are arranged separately.',
    'Dwa dni śladami życia starożytnych Rzymian: od areny i cesarskich pałaców po rzeźby, place i monumentalne termy. Wybierz jeden dzień albo połącz oba podczas dłuższego pobytu. Bilety wstępu, posiłki i noclegi organizuje się osobno.',
  ),
  accessibility: t(
    'Expect cobbles, exposed paths and uphill sections, especially on the Palatine. This walking plan is not step-free. Families may want to shorten the archaeological visit; wheelchair users should arrange an accessible itinerary with the sites before booking.',
    'Spodziewaj się bruku, odsłoniętych ścieżek i podejść, szczególnie na Palatynie. Ta piesza trasa obejmuje schody. Rodzinom polecamy krótsze zwiedzanie ruin; osoby na wózkach powinny uzgodnić dostępny wariant z obiektami przed zakupem biletów.',
  ),
  days: [
    {
      id: 'arena-and-palaces',
      map: ancientRomeMaps['arena-and-palaces'],
      title: t('The arena & imperial palaces', 'Arena i cesarskie pałace'),
      summary: t('Colosseum, Forum and Palatine, using one combined ticket.', 'Koloseum, Forum i Palatyn na jednym bilecie łączonym.'),
      startTime: '09:00', walkingKm: 4.5,
      arrival: t('Aim to be at the Colosseum entrance by 08:45 for a 09:00 booking. From Termini, take Metro B towards Laurentina to Colosseo, then walk to the entrance near the Arch of Constantine. Allow 25–35 minutes from Termini, including the wait and security buffer.', 'Na wejście o 09:00 przyjdź pod Koloseum o 08:45. Z Termini jedź metrem B w stronę Laurentina do Colosseo, potem przejdź do wejścia przy Łuku Konstantyna. Zarezerwuj 25–35 minut od Termini, wliczając oczekiwanie i zapas na kontrolę.'),
      departure: t('After leaving the archaeological area, walk towards Monti for an early dinner. Colosseo and Cavour stations both connect to Metro B; use live directions from your chosen exit.', 'Po wyjściu z terenu archeologicznego przejdź w stronę Monti na wczesną kolację. Stacje Colosseo i Cavour obsługują linię B; sprawdź dojście z wybranego wyjścia.'),
      notice: t('The Forum and Palatine share a single-entry area. Bring a packed lunch and stay inside until you have visited both. Suggested times assume a 09:00 Colosseum booking.', 'Forum i Palatyn tworzą obszar z jednym wejściem. Zabierz prowiant i nie wychodź przed zwiedzeniem obu miejsc. Proponowane godziny zakładają rezerwację Koloseum na 09:00.'),
      steps: [
        {
          id: 'colosseum', kind: 'visit', placeId: 'rome-colosseum', minutes: 75,
          description: t('Look down into the arena from the first and second tiers, then visit the museum. The standard ticket does not include the arena floor or underground passages.', 'Spójrz na arenę z pierwszej i drugiej kondygnacji, potem odwiedź muzeum. Standardowy bilet nie obejmuje płyty areny ani podziemi.'),
          admission: t('€18 · combined ticket', '18 € · bilet łączony'),
          hours: t('Opens 08:30. Winter closing 16:30; last entry 15:30. Hours change seasonally.', 'Otwarcie 08:30. Zimą zamknięcie 16:30, ostatnie wejście 15:30. Godziny zależą od sezonu.'),
          booking: t('Reserve a named, timed ticket. Sales open 30 days ahead. Bring matching ID and arrive 15 minutes early.', 'Zarezerwuj bilet imienny na konkretną godzinę. Sprzedaż rusza 30 dni wcześniej. Zabierz dokument i przyjdź 15 minut przed wejściem.'),
          sourceId: 'colosseum-ticket',
          transfer: { minutes: 15, distance: '0.4 km', description: t('Walk past the Arch of Constantine to the Arch of Titus entrance. Allow extra time for the entrance queue; follow staff directions if access changes.', 'Przejdź obok Łuku Konstantyna do wejścia przy Łuku Tytusa. Uwzględnij kolejkę; w razie zmian kieruj się wskazówkami obsługi.') },
        },
        {
          id: 'forum', kind: 'visit', placeId: 'rome-forum', minutes: 120,
          description: t('Follow the Via Sacra through the civic heart of Rome. Look for the House of the Vestals, the Temple of Saturn and the Arch of Septimius Severus. Leave time to explore the side paths rather than walking straight through.', 'Idź Via Sacra przez dawne centrum życia publicznego. Odszukaj Dom Westalek, świątynię Saturna i Łuk Septymiusza Sewera. Zostaw czas na boczne ścieżki zamiast przechodzić prosto przez teren.'),
          admission: t('Included in the €18 ticket', 'W cenie biletu za 18 €'),
          hours: t('Opens 09:00. Winter closing 16:30; last entry 15:30. Seasonal hours apply.', 'Otwarcie 09:00. Zimą zamknięcie 16:30, ostatnie wejście 15:30. Godziny sezonowe.'),
          booking: t('Use the same ticket as the Colosseum. One Forum–Palatine entry, within 24 hours before or after your booked Colosseum time.', 'Użyj biletu do Koloseum. Jedno wejście na Forum i Palatyn w ciągu 24 godzin przed lub po rezerwacji Koloseum.'),
          sourceId: 'colosseum-ticket',
          transfer: { minutes: 10, distance: '0.3 km', description: t('Stay inside the archaeological park and find a permitted resting spot before the uphill section.', 'Zostań na terenie parku i znajdź dozwolone miejsce odpoczynku przed podejściem.') },
        },
        {
          id: 'park-lunch', kind: 'meal', minutes: 40,
          title: t('Lunch inside the park', 'Lunch na terenie parku'),
          description: t('Bring sandwiches and water, eat only where permitted and take rubbish with you. A restaurant lunch outside would use up your single admission. Save a sit-down meal for after the Palatine.', 'Weź kanapki i wodę, jedz wyłącznie w dozwolonych miejscach i zabierz śmieci. Wyjście do restauracji oznacza wykorzystanie jednorazowego wstępu. Posiłek w lokalu zaplanuj po Palatynie.'),
          admission: t('Allow €8–12 for packed lunch', 'Zaplanuj 8–12 € na prowiant'),
          transfer: { minutes: 10, distance: '0.3 km', description: t('Follow the signed paths uphill to the Palatine; uneven stone and steps make this slower than the distance suggests.', 'Idź oznakowaną ścieżką pod górę na Palatyn; kamienie i stopnie wydłużają przejście.') },
        },
        {
          id: 'palatine', kind: 'visit', placeId: 'rome-palatine', minutes: 90,
          description: t('Explore the imperial residences and gardens, then find the terraces overlooking the Forum and Circus Maximus. This is the most exposed, uphill part of the day; allow extra rests in hot weather.', 'Zwiedź cesarskie rezydencje i ogrody, potem odszukaj tarasy z widokiem na Forum i Circus Maximus. To najbardziej odsłonięta część dnia z podejściami; w upał rób więcej przerw.'),
          admission: t('Included in the €18 ticket', 'W cenie biletu za 18 €'),
          hours: t('Same seasonal hours as the Forum. Leave the park before closing.', 'Te same sezonowe godziny co Forum. Opuść park przed zamknięciem.'),
          sourceId: 'park-hours',
        },
      ],
    },
    {
      id: 'collections-and-baths',
      map: ancientRomeMaps['collections-and-baths'],
      title: t('Collections & monumental baths', 'Zbiory i monumentalne termy'),
      summary: t('Capitoline art, a Forum viewpoint and a walk south to Caracalla.', 'Sztuka na Kapitolu, widok na Forum i spacer do Term Karakalli.'),
      startTime: '09:30', walkingKm: 4,
      arrival: t('Start at Piazza del Campidoglio. From Colosseo Metro B, allow around 20 minutes on foot along Via dei Fori Imperiali and up to the square. The museum entrance is in Palazzo dei Conservatori.', 'Zacznij na Piazza del Campidoglio. Ze stacji metra B Colosseo dojdziesz w około 20 minut Via dei Fori Imperiali, z podejściem na plac. Wejście do muzeum znajduje się w Palazzo dei Conservatori.'),
      departure: t('From the baths, walk around 15 minutes back to Circo Massimo Metro B via Viale delle Terme di Caracalla. Trains towards Rebibbia or Jonio return to Termini.', 'Z term wróć pieszo w około 15 minut do metra B Circo Massimo przez Viale delle Terme di Caracalla. Pociągi w stronę Rebibbia lub Jonio jadą do Termini.'),
      shorterDeparture: t('Finish at Circus Maximus and walk around 5 minutes from the east end to Circo Massimo Metro B. Take a train towards Rebibbia or Jonio for Termini.', 'Zakończ przy Circus Maximus i przejdź około 5 minut od wschodniego końca do metra B Circo Massimo. Do Termini jedź w stronę Rebibbia lub Jonio.'),
      notice: t('Caracalla is closed on Mondays. Choose a different day, or leave out the optional baths visit and finish at Circus Maximus.', 'Termy Karakalli są zamknięte w poniedziałki. Wybierz inny dzień lub pomiń opcjonalne termy i zakończ przy Circus Maximus.'),
      steps: [
        {
          id: 'capitoline', kind: 'visit', placeId: 'rome-capitoline', minutes: 150,
          description: t('Make time for the bronze Marcus Aurelius, the Capitoline Wolf and the ancient sculpture collections. The underground gallery links the museum buildings and offers a view across the Forum.', 'Zobacz brązowy pomnik Marka Aureliusza, Wilczycę Kapitolińską i zbiory antycznych rzeźb. Podziemna galeria łączy budynki muzeum i otwiera widok na Forum.'),
          admission: t('€15 standard · exhibitions extra', '15 € standardowo · wystawy dodatkowo'),
          hours: t('Daily 09:30–19:30, last admission 18:30. Closed 1 May and 25 December; holiday hours differ.', 'Codziennie 09:30–19:30, ostatnie wejście 18:30. Zamknięte 1 maja i 25 grudnia; inne godziny w święta.'),
          booking: t('Advance booking is optional. Online presale adds €1. The current exhibition rate is €16.50 through 1 November 2026.', 'Rezerwacja nie jest obowiązkowa. Przedsprzedaż online kosztuje dodatkowo 1 €. Do 1 listopada 2026 stawka z wystawą wynosi 16,50 €.'),
          sourceId: 'capitoline-tickets',
          transfer: { minutes: 5, distance: '0.1 km', description: t('Leave onto Piazza del Campidoglio and walk behind Palazzo Senatorio to the public Forum viewpoint.', 'Wyjdź na Piazza del Campidoglio i przejdź za Palazzo Senatorio do publicznego punktu widokowego na Forum.') },
        },
        {
          id: 'campidoglio', kind: 'visit', placeId: 'rome-campidoglio', minutes: 20,
          description: t('Take in the Forum from above, then cross Michelangelo’s square. This view helps connect yesterday’s ruins with the layout of the ancient city.', 'Spójrz na Forum z góry, potem przejdź przez plac zaprojektowany przez Michała Anioła. Ten widok pozwala lepiej zrozumieć układ starożytnego miasta.'),
          admission: t('Free', 'Bezpłatnie'), hours: t('Outdoor public square; access can change during events.', 'Plac publiczny na zewnątrz; dostęp może się zmieniać podczas wydarzeń.'),
          transfer: { minutes: 20, distance: '0.9 km', description: t('Descend towards Via del Teatro di Marcello, then continue to the streets around Santa Maria in Cosmedin for lunch.', 'Zejdź w stronę Via del Teatro di Marcello i przejdź w okolice Santa Maria in Cosmedin na lunch.') },
        },
        {
          id: 'aventino-lunch', kind: 'meal', minutes: 60,
          title: t('Lunch near the Aventine', 'Lunch u stóp Awentynu'),
          description: t('Choose a café or trattoria around Via della Greca or Viale Aventino. Allow €15–25 for a simple lunch and check the menu for a cover charge before sitting down. No restaurant reservation is included.', 'Wybierz kawiarnię lub trattorię przy Via della Greca albo Viale Aventino. Na prosty lunch zaplanuj 15–25 €; przed zajęciem miejsca sprawdź coperto w menu. Trasa nie obejmuje rezerwacji stolika.'),
          admission: t('Allow €15–25', 'Zaplanuj 15–25 €'),
          transfer: { minutes: 10, distance: '0.4 km', description: t('Walk to the western end of Circus Maximus via Via della Greca.', 'Przejdź Via della Greca do zachodniego krańca Circus Maximus.') },
        },
        {
          id: 'circus', kind: 'visit', placeId: 'rome-circus-maximus', minutes: 30,
          description: t('Walk along the open valley where chariots once raced, with the Palatine palaces rising above you. This plan uses the free outdoor area, not the separately ticketed archaeological enclosure.', 'Przejdź otwartą doliną dawnych wyścigów rydwanów, z pałacami Palatynu nad głową. Plan obejmuje bezpłatny teren zewnętrzny, a nie osobno biletowaną strefę archeologiczną.'),
          admission: t('Free outdoor area', 'Teren zewnętrzny bezpłatny'), hours: t('Outdoor visit in daylight; events may restrict access.', 'Zwiedzanie na zewnątrz za dnia; wydarzenia mogą ograniczać dostęp.'),
          transfer: { minutes: 20, distance: '1 km', description: t('Continue east to Piazza di Porta Capena, then follow Viale delle Terme di Caracalla to the entrance at number 52.', 'Idź na wschód do Piazza di Porta Capena, potem Viale delle Terme di Caracalla do wejścia pod numerem 52.') },
        },
        {
          id: 'caracalla', kind: 'visit', placeId: 'rome-caracalla', minutes: 90, optional: true,
          description: t('Walk through the enormous bathing halls and surviving mosaics. The scale makes the baths a useful counterpoint to the palaces and temples. Skip this final visit if you want a shorter day.', 'Przejdź przez ogromne sale term i obejrzyj zachowane mozaiki. Skala budowli dobrze uzupełnia pałace i świątynie. Pomiń ostatnią wizytę, jeśli wolisz krótszy dzień.'),
          admission: t('€8 · exhibition supplements possible', '8 € · możliwa dopłata za wystawę'),
          hours: t('Tuesday–Sunday from 09:00. Winter closing 16:30, last entry 15:30; later in summer. Closed Mondays.', 'Wtorek–niedziela od 09:00. Zimą zamknięcie 16:30, ostatnie wejście 15:30; latem dłużej. Zamknięte w poniedziałki.'),
          booking: t('Buy through Musei Italiani or at the official ticket machines. Check the site calendar for special closures.', 'Kup bilet przez Musei Italiani lub w oficjalnym automacie. Sprawdź kalendarz wyjątkowych zamknięć.'),
          sourceId: 'caracalla',
        },
      ],
    },
  ],
  costs: [
    { label: t('Colosseum + Forum + Palatine', 'Koloseum + Forum + Palatyn'), min: 18, max: 18, note: t('One combined adult ticket, counted once.', 'Jeden łączony bilet normalny, liczony tylko raz.'), sourceId: 'colosseum-ticket' },
    { label: t('Capitoline Museums', 'Muzea Kapitolińskie'), min: 15, max: 17.5, note: t('€15 base rate; €16.50 current exhibition rate, plus €1 if booked online.', '15 € cena podstawowa; 16,50 € z aktualną wystawą, plus 1 € przy rezerwacji online.'), sourceId: 'capitoline-tickets' },
    { label: t('Baths of Caracalla', 'Termy Karakalli'), min: 8, max: 8, note: t('Optional; temporary exhibitions may add a supplement.', 'Opcjonalnie; możliwa dopłata za wystawę czasową.'), sourceId: 'caracalla-price', optionalStepId: 'caracalla' },
    { label: t('Two lunches', 'Dwa lunche'), min: 23, max: 37, note: t('Planning allowance: a packed lunch and a simple sit-down meal.', 'Szacunek: prowiant i jeden prosty posiłek w lokalu.') },
    { label: t('Local transport', 'Transport miejski'), min: 3, max: 6, note: t('Allow 2–4 BIT tickets at €1.50. Each lasts 100 minutes and includes one metro journey.', 'Zaplanuj 2–4 bilety BIT po 1,50 €. Każdy jest ważny 100 minut i obejmuje jeden przejazd metrem.'), sourceId: 'atac' },
  ],
  preparation: [
    { title: t('Book the Colosseum first', 'Najpierw zarezerwuj Koloseum'), description: t('Choose your timed admission before arranging the rest of day one. All times in this plan are suggestions based on a 09:00 slot. The Forum and Palatine must fit within the same ticket’s validity.', 'Wybierz godzinę wejścia przed ułożeniem pierwszego dnia. Godziny w planie są propozycją dla wejścia o 09:00. Forum i Palatyn muszą zmieścić się w okresie ważności tego samego biletu.'), sourceId: 'park-hours' },
    { title: t('Keep tickets and ID together', 'Przygotuj bilety i dokument'), description: t('Download tickets to your phone before leaving Wi-Fi. Take the identity document matching your named tickets. Saving this route does not book admission.', 'Pobierz bilety na telefon przed wyjściem z Wi-Fi. Zabierz dokument zgodny z biletami imiennymi. Zapisanie trasy nie rezerwuje wstępu.'), sourceId: 'colosseum-ticket' },
    { title: t('Pack for the archaeological park', 'Przygotuj się na park archeologiczny'), description: t('Bring water, sun protection, comfortable shoes and a packed lunch. Carry a small bag and allow time for security. Wet cobbles can be slippery.', 'Zabierz wodę, ochronę przed słońcem, wygodne buty i prowiant. Weź małą torbę i zostaw czas na kontrolę. Mokry bruk bywa śliski.') },
    { title: t('Sort out city transport', 'Przygotuj transport miejski'), description: t('Buy and validate a BIT ticket, or use ATAC Tap & Go. A paper ticket needs validation at the start of travel. Keep the same card or device when using contactless payments.', 'Kup i skasuj bilet BIT albo użyj ATAC Tap & Go. Bilet papierowy wymaga skasowania na początku podróży. Przy płatności zbliżeniowej używaj tej samej karty lub urządzenia.'), sourceId: 'atac' },
  ],
  alternatives: [
    { title: t('A shorter second day', 'Krótszy drugi dzień'), description: t('Leave out Caracalla using the optional-stop switch. Finish at Circus Maximus and take Metro B from Circo Massimo. Allow around 5 minutes to reach the station from the east end of the valley.', 'Pomiń Karakallę przełącznikiem opcjonalnego przystanku. Zakończ przy Circus Maximus i wróć metrem B ze stacji Circo Massimo, około 5 minut od wschodniego końca doliny.') },
    { title: t('Rain or strong heat', 'Deszcz lub upał'), description: t('Use the Capitoline Museums for the wetter part of your stay. In hot weather, keep the archaeological park in the morning. Change a booked Colosseum visit only through the ticket provider’s rules.', 'Zaplanuj Muzea Kapitolińskie na bardziej deszczową część pobytu. W upał zwiedzaj park rano. Zmiany rezerwacji Koloseum podlegają zasadom wystawcy biletu.') },
    { title: t('No Colosseum tickets left?', 'Brak biletów do Koloseum?'), description: t('Visit the exterior, then check the official Forum-only ticket options and their availability. The €18 combined-ticket budget no longer applies; confirm the replacement price before buying.', 'Obejrzyj Koloseum z zewnątrz, następnie sprawdź oficjalne bilety na samo Forum i ich dostępność. Budżet biletu łączonego za 18 € przestaje obowiązywać; sprawdź cenę przed zakupem.') },
  ],
  sources: [
    { id: 'colosseum-ticket', label: 'Colosseum · tickets & admission', url: 'https://colosseo.it/en/tickets/colosseum-roman-forum-palatine/' },
    { id: 'park-hours', label: 'Colosseum park · hours & booking', url: 'https://colosseo.it/en/opening-times-and-tickets/' },
    { id: 'capitoline-tickets', label: 'Capitoline Museums · tickets', url: 'https://www.museicapitolini.org/en/biglietti-e-prenotazioni/tickets-and-videoguides' },
    { id: 'capitoline-hours', label: 'Capitoline Museums · opening hours', url: 'https://www.museicapitolini.org/en/informazioni_pratiche/orari_e_indirizzi' },
    { id: 'caracalla', label: 'Baths of Caracalla · visiting calendar', url: 'https://soprintendenzaspecialeroma.it/luoghi/terme-di-caracalla/' },
    { id: 'caracalla-price', label: 'Ministry of Culture · Caracalla tickets', url: 'https://cultura.gov.it/luogo/terme-di-caracalla' },
    { id: 'atac', label: 'ATAC · transport tickets', url: 'https://atac.roma.it/en/tickets-and-passes' },
  ],
};
