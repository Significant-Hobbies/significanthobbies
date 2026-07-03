import type { Metadata } from 'next';
import Link from 'next/link';

import { JsonLd } from '~/components/json-ld';
import { Lumi } from '~/components/lumi';

export const metadata: Metadata = {
  title: 'Ultimate Travel Bucket List: 75 Destinations to See Before You Die',
  description:
    '75 travel bucket list destinations organized by region: Europe, Asia, Americas, Africa & Middle East, Oceania & Antarctica. With notes on why each one belongs on every serious list.',
  openGraph: {
    title: 'Ultimate Travel Bucket List: 75 Destinations to See Before You Die',
    description:
      'From Stonehenge (Obama) to the Serengeti (Oprah) to Namibia (Clinton) — 75 destinations worth crossing the world for.',
  },
  alternates: { canonical: 'https://significanthobbies.com/travel-bucket-list' },
};

type Destination = {
  name: string;
  why: string;
  famous?: { name: string; slug: string; note: string };
};

const EUROPE: Destination[] = [
  {
    name: 'Stonehenge, England',
    why: 'Four thousand years of mystery on a Wiltshire plain. The scale only registers in person.',
    famous: {
      name: 'Barack Obama',
      slug: 'barack-obama',
      note: 'visited during a G8 trip and described it as genuinely awe-inspiring',
    },
  },
  {
    name: 'The Amalfi Coast, Italy',
    why: 'Cliffside villages above turquoise water. The most dramatic coastline in Europe.',
  },
  {
    name: 'Santorini, Greece',
    why: 'White cube architecture above a caldera. Postcard images that somehow exceed expectations in person.',
  },
  {
    name: 'The Norwegian Fjords',
    why: 'Glacial water, vertical cliffs, silence. The scale of the landscape makes everything else feel small.',
  },
  {
    name: 'Paris at dawn',
    why: 'Not the tourist Paris — the Paris of empty streets, open cafes, and the Eiffel Tower before the crowds arrive.',
  },
  {
    name: 'The Scottish Highlands',
    why: 'Moorland, lochs, and castle ruins. Wild in a way that feels pre-historical.',
  },
  {
    name: 'Venice before mass tourism erases it',
    why: "A city built on water that shouldn't exist — and won't, at current rates. Go while it's still there.",
  },
  {
    name: 'The Alhambra, Granada, Spain',
    why: 'Islamic palace architecture of extraordinary mathematical precision. The most beautiful building in Europe.',
  },
  {
    name: 'Iceland: fire, ice, and the aurora',
    why: 'Geysers, glaciers, lava fields, and the Northern Lights. Iceland packs geological impossibilities into a small island.',
  },
  {
    name: "Dubrovnik's Old City, Croatia",
    why: 'Medieval walls above the Adriatic. Walk the city ramparts at sunset before everyone else figures it out.',
  },
  {
    name: 'Tuscany, Italy',
    why: 'Rolling hills, cypress trees, medieval villages, and wine made from grapes grown in sight of your table.',
  },
  {
    name: 'Transylvania, Romania',
    why: 'Fortified Saxon villages, medieval towns, and mountain landscapes largely unchanged since the Middle Ages.',
  },
  {
    name: 'The Swiss Alps',
    why: 'Walk between villages through mountain passes that have been trade routes for two thousand years.',
  },
  {
    name: 'Lisbon, Portugal',
    why: 'Fado music, pastel de nata, and seven hills of tile-faced buildings. The most underrated capital in Europe.',
  },
  {
    name: 'The Camino de Santiago',
    why: "800km across Spain on foot. The world's most famous pilgrimage — not for religion, but for whatever it teaches you about yourself.",
  },
];

const ASIA: Destination[] = [
  {
    name: 'Kyoto, Japan in cherry blossom season',
    why: 'Ancient temples, Zen gardens, and a week every spring when the city becomes otherworldly.',
  },
  {
    name: 'Angkor Wat, Cambodia',
    why: "The world's largest religious monument, emerging from jungle at sunrise. A civilisation's ambition, petrified in stone.",
  },
  {
    name: 'The Taj Mahal, India',
    why: 'Built as a monument to love. The white marble shifts colour with the light — different at dawn, dusk, and under full moon.',
  },
  {
    name: 'Bhutan',
    why: "The world's only carbon-negative country, where 'gross national happiness' is a policy metric. The Himalayas without the crowds.",
  },
  {
    name: 'Ha Long Bay, Vietnam',
    why: 'Three thousand limestone islands rising from emerald water. Sleep on a traditional junk boat.',
  },
  {
    name: "Bali's rice terraces and temples",
    why: 'Not the tourist Bali — the inland villages, dawn ceremonies, and 2,000-year-old subak irrigation system.',
  },
  {
    name: 'The Silk Road, Uzbekistan',
    why: 'Samarkand, Bukhara, and the turquoise-domed cities of Central Asia. History that most Westerners have never encountered.',
  },
  {
    name: 'Tibet and the Tibetan Plateau',
    why: "The world's highest plateau. Monasteries at 4,000 metres, the Potala Palace, and a sky that looks different at altitude.",
  },
  {
    name: 'Komodo Island, Indonesia',
    why: 'The only place on earth where the Komodo dragon — a living dinosaur — lives wild and hunts in the open.',
  },
  {
    name: 'Rajasthan, India',
    why: 'Fortresses, palaces, camel fairs, and a desert at the edge of a desert kingdom. India at its most theatrical.',
  },
  {
    name: 'The Korean DMZ',
    why: "One of the strangest borders on earth — a 4km strip of no-man's land that has become accidentally rewilded.",
  },
  {
    name: 'Georgia (the country)',
    why: 'Caucasus mountain villages, ancient cave monasteries, and natural wine from 8,000-year-old traditions.',
  },
  {
    name: 'Maldives above and below water',
    why: 'Overwater bungalows above a lagoon that exists nowhere else on earth. Snorkel at dawn before the resort wakes up.',
  },
  {
    name: 'The temples of Bagan, Myanmar',
    why: 'Two thousand temples across a plain. Balloon at dawn, bicycle at dusk. The most underrated ancient site in Asia.',
  },
  {
    name: 'Mount Fuji, Japan',
    why: 'Climb it once. The Japanese have a saying: a fool never climbs Fuji — a greater fool climbs it twice.',
  },
];

const AMERICAS: Destination[] = [
  {
    name: 'Machu Picchu, Peru',
    why: 'An Inca citadel at cloud level, only accessible by train or on foot. The Inca Trail approach earns the view.',
  },
  {
    name: 'Patagonia, Argentina and Chile',
    why: 'The end of the earth: granite towers, glaciers calving into lakes, and condors overhead. Planet Earth on hard mode.',
  },
  {
    name: 'The Amazon Rainforest, Brazil',
    why: 'More species per square kilometre than anywhere else on earth. The lungs of the world, while they still exist.',
  },
  {
    name: 'The Grand Canyon, USA',
    why: 'The scale is impossible to understand from photographs. Stand at the rim and look down — a mile of geological time.',
  },
  {
    name: 'Havana, Cuba',
    why: 'Time-capsule city: 1950s cars, crumbling baroque architecture, and a music culture unchanged by fifty years of isolation.',
  },
  {
    name: 'The Canadian Rockies',
    why: 'Banff, Jasper, Lake Louise — glacier-fed lakes of impossible blue surrounded by peaks that look like set design.',
  },
  {
    name: 'Route 66, USA',
    why: "America's original road trip: 4,000km of diners, motels, and landscapes from Illinois to California.",
  },
  {
    name: 'Galápagos Islands, Ecuador',
    why: 'Where Darwin understood evolution. Wildlife that has never learned to fear humans — you can approach it within metres.',
  },
  {
    name: 'Rio de Janeiro during Carnival',
    why: "The world's largest party: six days of samba, spectacular costumes, and a city that becomes one enormous stage.",
  },
  {
    name: 'Alaska: wilderness at scale',
    why: "Denali at 6,200m, grizzlies fishing salmon, orca pods, and rainforests. America's last frontier, genuinely.",
  },
  {
    name: 'The Atacama Desert, Chile',
    why: "The world's driest non-polar desert — and one of the best places on earth to see the Milky Way.",
  },
  {
    name: 'New Orleans, USA',
    why: 'Creole cuisine, jazz in every bar, above-ground cemeteries, and a city that absorbed four cultures and invented something new.',
  },
  {
    name: "Bolivia's Salar de Uyuni",
    why: "The world's largest salt flat: after rain, a perfect mirror that reflects the sky. Photography doesn't capture it.",
  },
  {
    name: 'Niagara Falls, Canada',
    why: "One of the world's great natural spectacles. Stand at the lip, feel the spray, hear the roar that drowns all conversation.",
  },
  {
    name: 'New York City, properly',
    why: 'Not a tourist visit — a month of living there. The museums, the boroughs, the rooftops, the rhythm of the city.',
  },
];

const AFRICA_MIDDLE_EAST: Destination[] = [
  {
    name: 'The Serengeti, Tanzania',
    why: 'The greatest wildlife spectacle on earth. The great migration: two million wildebeest in motion.',
    famous: {
      name: 'Oprah Winfrey',
      slug: 'oprah-winfrey',
      note: 'has spoken about the Serengeti as a transformative experience',
    },
  },
  {
    name: 'Namibia',
    why: 'The oldest desert on earth, red sand dunes, wild horses, and a coastline where fog rolls in from a cold sea.',
    famous: {
      name: 'Bill Clinton',
      slug: 'bill-clinton',
      note: "visited post-presidency and described Namibia as one of Africa's most extraordinary landscapes",
    },
  },
  {
    name: 'The Pyramids of Giza, Egypt',
    why: 'The last surviving wonder of the ancient world. Stand at the base of the Great Pyramid and feel the scale of 4,500 years.',
  },
  {
    name: 'Zanzibar, Tanzania',
    why: "Stone Town's labyrinthine alleyways, spice plantations, and beaches that belong to a different planet than the mainland.",
  },
  {
    name: 'Gorilla trekking, Rwanda or Uganda',
    why: 'An hour with a family of mountain gorillas in the wild. Nothing else quite explains what it means to share 98% of DNA with another species.',
  },
  {
    name: "Marrakech's medina, Morocco",
    why: "Maze of souks, riads, and hammams. Djemaa el-Fna square at dusk is one of the world's great spectacles of organised chaos.",
  },
  {
    name: 'Victoria Falls, Zambia/Zimbabwe',
    why: "The world's largest waterfall by combined width and height. The mist is visible 50km away.",
  },
  {
    name: 'Petra, Jordan',
    why: 'A city carved into rose-red sandstone by the Nabataeans. Walk through the Siq at dawn before the tour buses arrive.',
  },
  {
    name: 'Cape Town and the Cape Peninsula',
    why: 'Table Mountain, the winelands, Boulders Beach penguins, and Cape Point — where two oceans meet.',
  },
  {
    name: 'The Sahara Desert',
    why: "Sleep in a tent in the silence of the world's largest hot desert. Sunrise over dunes with no other human in sight.",
  },
  {
    name: "Ethiopia's Danakil Depression",
    why: 'The hottest inhabited place on earth — and one of the most alien landscapes: sulfur springs, lava lakes, salt plains.',
  },
  {
    name: 'The Dead Sea, Jordan/Israel',
    why: "Float without swimming. The water is ten times saltier than the ocean. The lowest point on the earth's surface.",
  },
  {
    name: 'Wadi Rum, Jordan',
    why: 'The Valley of the Moon: red sandstone desert used as Mars in a dozen films. Spend a night in a Bedouin camp.',
  },
  {
    name: 'Okavango Delta, Botswana',
    why: "The world's largest inland delta — a river that flows into desert and creates an oasis of extraordinary wildlife.",
  },
  {
    name: "Lalibela's rock-hewn churches, Ethiopia",
    why: "Eleven medieval churches carved downward into solid volcanic rock. Still in active use. One of Africa's great wonders.",
  },
];

const OCEANIA_ANTARCTICA: Destination[] = [
  {
    name: 'The Great Barrier Reef, Australia',
    why: "The world's largest coral system — and one of the places changing fastest. Dive it before the bleaching worsens.",
  },
  {
    name: 'Antarctica',
    why: 'The seventh continent. No permanent residents, no shops, no infrastructure. More penguins than humans. Nothing prepares you for the scale.',
  },
  {
    name: 'Milford Sound, New Zealand',
    why: 'Fiordland: fjords carved by glaciers, waterfalls dropping hundreds of metres, dolphins in water so clear it looks still.',
  },
  {
    name: 'Uluru (Ayers Rock), Australia',
    why: "The world's largest monolith changes colour from orange to purple to deep red as light moves across it. Sacred to the Anangu people.",
  },
  {
    name: 'The Whitsunday Islands, Australia',
    why: "74 tropical islands in the Coral Sea. Whitehaven Beach — almost pure silica — is one of the world's finest.",
  },
  {
    name: 'Fiordland, New Zealand',
    why: "The most remote and spectacular wilderness in the Southern Hemisphere. The Milford Track is one of the world's great hikes.",
  },
  {
    name: 'Raja Ampat, Indonesia',
    why: "The most biodiverse marine area on earth. Seventy-five percent of the world's coral species in one archipelago.",
  },
  {
    name: 'The Kimberley, Australia',
    why: 'Remote wilderness larger than Germany. Ancient Wandjina rock art, gorges, and a coastline no road reaches.',
  },
  {
    name: "Vanuatu's volcanoes",
    why: 'Walk to the rim of Mount Yasur — an active volcano — and look into the crater. Legally accessible. Genuinely dangerous.',
  },
  {
    name: 'Queenstown, New Zealand',
    why: 'The adventure capital of the world: bungee jumping, skydiving, white-water rafting, skiing — in one small city beside a lake.',
  },
  {
    name: 'The Kimberley coast by boat',
    why: 'Accessible only by sea. Horizontal waterfalls, ancient gorges, and Indigenous communities that have lived there for 40,000 years.',
  },
  {
    name: 'Lord Howe Island, Australia',
    why: 'Nine kilometres long, 400 residents, 75% world heritage listed. The most pristine island in the Pacific.',
  },
  {
    name: 'Franz Josef Glacier, New Zealand',
    why: 'A temperate rainforest glacier — rainforest and ice existing alongside each other. Walk on it before it retreats further.',
  },
  {
    name: 'The Daintree Rainforest, Australia',
    why: "The world's oldest surviving tropical rainforest, continuously present for 180 million years. Crocodiles in the river, cassowaries in the bush.",
  },
  {
    name: 'Scott Base, Antarctica',
    why: 'If you can get there — as a tourist, researcher, or journalist — the Antarctic continent changes your frame of reference permanently.',
  },
];

const REGIONS = [
  { id: 'europe', label: 'Europe', emoji: '🏰', color: 'sky', items: EUROPE },
  { id: 'asia', label: 'Asia', emoji: '🏯', color: 'red', items: ASIA },
  { id: 'americas', label: 'Americas', emoji: '🗽', color: 'emerald', items: AMERICAS },
  {
    id: 'africa-middle-east',
    label: 'Africa & Middle East',
    emoji: '🦁',
    color: 'coral',
    items: AFRICA_MIDDLE_EAST,
  },
  {
    id: 'oceania-antarctica',
    label: 'Oceania & Antarctica',
    emoji: '🐧',
    color: 'teal',
    items: OCEANIA_ANTARCTICA,
  },
];

const REGION_STYLES: Record<
  string,
  { bg: string; border: string; text: string; badge: string; dot: string }
> = {
  sky: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    dot: 'bg-sky-400',
  },
  red: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive',
    badge: 'bg-destructive/15 text-destructive border-destructive/30',
    dot: 'bg-destructive/80',
  },
  emerald: {
    bg: 'bg-foreground/10',
    border: 'border-foreground/20',
    text: 'text-foreground',
    badge: 'bg-foreground/10 text-foreground border-foreground/20',
    dot: 'bg-foreground',
  },
  coral: {
    bg: 'bg-[#fff0ec]',
    border: 'border-[#f0a090]',
    text: 'text-[#e05533]',
    badge: 'bg-[#fff0ec] text-[#e05533] border-[#f0a090]',
    dot: 'bg-[#e05533]',
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    badge: 'bg-teal-100 text-teal-700 border-teal-200',
    dot: 'bg-teal-400',
  },
};

const FAQ_ITEMS = [
  {
    q: 'How do you choose which countries to visit first?',
    a: "Start with accessibility and personal resonance, not rankings. The best first international trip is the one you'll actually take. Prioritize countries where a language barrier won't stop you from getting lost — and then deliberately go somewhere where it will.",
  },
  {
    q: 'Is it worth visiting famous destinations that are now overcrowded?',
    a: "Yes, but with strategy. Most overcrowded destinations have off-season windows or early-morning access where the experience is qualitatively different. The Taj Mahal at dawn and the Taj Mahal at noon are almost different places. Go when others don't.",
  },
  {
    q: 'How did famous people like Obama, Oprah, and Clinton approach travel?',
    a: "All three have spoken about travel as a tool for perspective rather than leisure. Obama's Stonehenge visit, Oprah's Serengeti experience, and Clinton's Namibia trip share a common theme: places that force you to reckon with history, scale, or nature at a level that ordinary life doesn't provide.",
  },
  {
    q: 'Should I travel slowly or cover more ground?',
    a: 'Slow travel produces better memories and deeper experiences. Research on episodic memory shows that novelty within a continuous experience (one country, many villages) creates richer recall than rapid location-hopping (many countries, brief stops). Two weeks in one region beats two weeks across six.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

export default function TravelBucketListPage() {
  const totalDestinations = REGIONS.reduce((sum, r) => sum + r.items.length, 0);

  return (
    <main className="bg-card">
      <JsonLd data={faqSchema} />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-card pt-16 pb-10 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <Lumi size={88} glow float className="shrink-0" />
            <div className="space-y-4 text-center sm:text-left">
              <p className="text-[#e05533] text-sm font-semibold uppercase tracking-widest">
                Guided by Lumi · {totalDestinations} destinations across 5 regions
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-foreground text-balance">
                The Ultimate Travel Bucket List{' '}
                <span className="text-[#e05533]">(75 Destinations)</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                From Stonehenge to the Serengeti to Antarctica — 75 places organized by region, with
                notes on why each one belongs on every serious list.
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-[#e05533] px-6 py-3 text-sm font-semibold text-foreground hover:bg-[#c94420] transition-colors shadow-md"
                >
                  Build my travel list
                </Link>
                <Link
                  href="/bucket-lists"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:border-[#e05533] hover:text-[#e05533] transition-colors"
                >
                  See famous lists →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Region nav ───────────────────────────────────────────── */}
      <div className="sticky top-14 z-30 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 overflow-x-auto">
          <div className="flex gap-1 py-2 min-w-max">
            {REGIONS.map((region) => {
              const s = REGION_STYLES[region.color];
              return (
                <a
                  key={region.id}
                  href={`#${region.id}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${s.badge}`}
                >
                  {region.emoji} {region.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Destinations by region ───────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-16">
        {REGIONS.map((region, regionIdx) => {
          const s = REGION_STYLES[region.color];
          let counter = REGIONS.slice(0, regionIdx).reduce((sum, r) => sum + r.items.length, 0);
          return (
            <section key={region.id} id={region.id} className="scroll-mt-28 space-y-6">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl border ${s.border} ${s.bg} flex items-center justify-center text-xl`}
                >
                  {region.emoji}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground text-balance">
                    {region.label}
                  </h2>
                  <p className={`text-sm ${s.text} font-medium`}>
                    {region.items.length} destinations
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {region.items.map((dest, j) => {
                  counter++;
                  return (
                    <div
                      key={j}
                      className={`rounded-xl border ${s.border} ${s.bg} px-5 py-4 space-y-2`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${s.text}`}>{counter}</span>
                            <h3 className="font-semibold text-foreground text-sm leading-snug">
                              {dest.name}
                            </h3>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {dest.why}
                          </p>
                          {dest.famous && (
                            <p className="text-xs text-muted-foreground">
                              <Link
                                href={`/bucket-lists/${dest.famous.slug}`}
                                className={`font-medium ${s.text} hover:underline transition-colors`}
                                prefetch={false}
                              >
                                {dest.famous.name}
                              </Link>{' '}
                              {dest.famous.note}.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="bg-card/40 border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 space-y-8">
          <h2 className="text-2xl font-bold text-foreground text-balance">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-border bg-card px-6 py-5 space-y-3"
              >
                <h3 className="font-semibold text-foreground">{item.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-[#fff0ec] border-t border-[#f0a090]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-6">
          <Lumi size={64} glow float className="mx-auto" />
          <h2 className="text-3xl font-bold text-foreground text-balance">Ready to build yours?</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Lumi tracks your travel bucket list, shows your progress across regions, and matches
            your ambitions to the famous people who share them.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#e05533] px-6 py-3 text-sm font-semibold text-foreground hover:bg-[#c94420] transition-colors shadow-md"
            >
              Build my bucket list
            </Link>
            <Link
              href="/bucket-lists"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:border-[#e05533] transition-colors"
            >
              Browse famous lists →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
