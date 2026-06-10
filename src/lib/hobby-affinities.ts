import { ALL_HOBBIES,getCategoryForHobby } from "./hobbies";

export type HobbyAffinity = {
  name: string;
  reason: string;
};

// Cross-category affinities for popular hobbies.
// Each entry lists 3 hobbies from DIFFERENT categories than the source, with a short reason.
const HOBBY_AFFINITIES: Record<string, HobbyAffinity[]> = {
  // Creative
  Drawing: [
    { name: "Woodworking", reason: "Both reward patience, design thinking, and making something by hand" },
    { name: "Cooking", reason: "Creative expression through presentation and arrangement" },
    { name: "Chess", reason: "Spatial reasoning and pattern recognition carry over" },
  ],
  Painting: [
    { name: "Gardening", reason: "Color, composition, and patience in a different medium" },
    { name: "Cooking", reason: "Plating food is painting on a plate" },
    { name: "Yoga", reason: "Both reward slow, meditative focus over time" },
  ],
  Photography: [
    { name: "Hiking", reason: "Trails put you in front of compelling subjects and light" },
    { name: "Bird watching", reason: "Patience, observation, and timing — same core skills" },
    { name: "Cooking", reason: "Food photography is a natural extension" },
  ],
  Writing: [
    { name: "Reading", reason: "Every serious writer is first a serious reader" },
    { name: "Book club", reason: "Discussion sharpens instincts about what works on the page" },
    { name: "Chess", reason: "Plot structure and strategy both reward thinking many moves ahead" },
  ],
  Knitting: [
    { name: "Yoga", reason: "Rhythmic, meditative, and surprisingly similar to breathwork" },
    { name: "Book club", reason: "Something satisfying to work on while listening and talking" },
    { name: "Gardening", reason: "Natural, tactile, patient — the same personality gravitates to both" },
  ],
  Poetry: [
    { name: "Reading", reason: "Immersion in language deepens every line you write" },
    { name: "Singing", reason: "Poetry set to melody is the oldest art form" },
    { name: "Philosophy", reason: "Both chase precision of meaning in compressed form" },
  ],
  Calligraphy: [
    { name: "Yoga", reason: "Breath control and stillness matter as much as technique" },
    { name: "Reading", reason: "Calligraphy deepens appreciation for language itself" },
    { name: "Origami", reason: "Patience, precision, and beautiful outcomes from simple materials" },
  ],
  Filmmaking: [
    { name: "Photography", reason: "Composition and light — video is just photos in motion" },
    { name: "Writing", reason: "Screenwriting is storytelling with pictures" },
    { name: "Music production", reason: "Score and sound design make or break a film" },
  ],
  "Graphic design": [
    { name: "Coding", reason: "Build the interfaces you've been designing" },
    { name: "Photography", reason: "Original assets elevate every design project" },
    { name: "Woodworking", reason: "Physical making gives a new perspective on form and function" },
  ],
  "Music production": [
    { name: "Coding", reason: "Audio programming and DSP are a natural next step" },
    { name: "Dance", reason: "Understanding rhythm at the hips changes how you mix" },
    { name: "Philosophy", reason: "Sound design raises real questions about perception and aesthetics" },
  ],
  Songwriting: [
    { name: "Writing", reason: "Lyrics are compressed poetry — the craft transfers directly" },
    { name: "History", reason: "Songs tell stories; knowing history gives you richer material" },
    { name: "Yoga", reason: "Creative blocks often clear when the body is moving and the mind is quiet" },
  ],

  // Music
  Guitar: [
    { name: "Writing", reason: "Lyrics are the natural next step when you can carry a tune" },
    { name: "Yoga", reason: "Daily practice and mindful repetition — the same discipline" },
    { name: "History", reason: "Tracing the blues, folk, and rock lineage deepens your playing" },
  ],
  Piano: [
    { name: "Chess", reason: "Both reward deep pattern learning through slow, deliberate practice" },
    { name: "Coding", reason: "Music theory and programming share the same logical structure" },
    { name: "Yoga", reason: "Flow state and breath control unlock levels in both" },
  ],
  Singing: [
    { name: "Improv comedy", reason: "Both live and die on presence, listening, and commitment" },
    { name: "Theater", reason: "Most ensemble work combines the two naturally" },
    { name: "Writing", reason: "Lyrics start on paper — writing makes you a better lyricist" },
  ],
  Drums: [
    { name: "Dance", reason: "Rhythm is rhythm — drummers who dance understand groove" },
    { name: "Yoga", reason: "Body awareness and breath control matter behind the kit" },
    { name: "Coding", reason: "Many drummers build their own electronic kits and MIDI tools" },
  ],
  DJing: [
    { name: "Dance", reason: "DJs and dancers are symbiotic — playing for dancers changes your ear" },
    { name: "Vinyl records", reason: "Crate digging feeds the set list" },
    { name: "Coding", reason: "Audio tech, tools, and plugins are a short hop from the console" },
  ],
  Violin: [
    { name: "Chess", reason: "Long arcs of deliberate practice; plateau-busting requires the same patience" },
    { name: "History", reason: "Classical repertoire opens a direct window into European history" },
    { name: "Yoga", reason: "Posture and breath control are underrated parts of technique" },
  ],

  // Physical
  Running: [
    { name: "Reading", reason: "Audiobooks turn long runs into a reason to go further" },
    { name: "Cooking", reason: "Nutrition becomes interesting when performance is at stake" },
    { name: "Bird watching", reason: "Same trails, slower pace — you'll notice things you never saw at speed" },
  ],
  Cycling: [
    { name: "Cooking", reason: "Fueling long rides turns meal planning into a game" },
    { name: "Photography", reason: "Bikes get you to shots that a car and a hiker both miss" },
    { name: "Camping", reason: "Bikepacking is cycling plus camping — a natural combo" },
  ],
  Hiking: [
    { name: "Photography", reason: "Trails put you in front of light and landscapes cameras love" },
    { name: "Bird watching", reason: "Slow the pace and the trail becomes a completely different experience" },
    { name: "Cooking", reason: "Trail food and camp meals make the journey as good as the destination" },
  ],
  Yoga: [
    { name: "Gardening", reason: "Both are slow, grounding, and reward showing up consistently" },
    { name: "Reading", reason: "Philosophy and contemplation are natural companions to the practice" },
    { name: "Writing", reason: "Journaling after practice deepens the reflection yoga opens up" },
  ],
  Climbing: [
    { name: "Chess", reason: "Route-reading is chess on a vertical plane — pure problem solving" },
    { name: "Yoga", reason: "Flexibility and breath control directly improve sends" },
    { name: "Camping", reason: "Crags are usually outside — overnight trips extend the adventure" },
  ],
  "Martial arts": [
    { name: "Reading", reason: "Philosophy, strategy, and discipline theory run deep in the tradition" },
    { name: "History", reason: "Most martial arts are inseparable from the culture that created them" },
    { name: "Yoga", reason: "Flexibility and proprioception cross over directly" },
  ],
  Dance: [
    { name: "Singing", reason: "Performance arts that both unlock from working the other" },
    { name: "Filmmaking", reason: "Choreography on camera is its own discipline worth exploring" },
    { name: "Improv comedy", reason: "Both require total physical presence and willingness to look foolish" },
  ],
  Swimming: [
    { name: "Yoga", reason: "Breathing technique from yoga translates directly into the water" },
    { name: "Cooking", reason: "Recovery nutrition becomes fascinating when you're training volume" },
    { name: "Reading", reason: "Audiobooks and podcasts fill the mental void of lap swimming" },
  ],

  // Intellectual
  Reading: [
    { name: "Writing", reason: "Reading widely is the most direct path to writing well" },
    { name: "Book club", reason: "Discussion surfaces things solo reading always misses" },
    { name: "Coffee brewing", reason: "A ritual that pairs naturally — they've been together for centuries" },
  ],
  Chess: [
    { name: "Piano", reason: "Both reward deep pattern learning through slow, deliberate practice" },
    { name: "Board games", reason: "Strategic thinking spans a much wider design space" },
    { name: "Yoga", reason: "Mental clarity from physical practice transfers to over-the-board decisions" },
  ],
  Coding: [
    { name: "Electronics", reason: "Software and hardware become far more interesting together" },
    { name: "Video games", reason: "The gap between player and builder collapses fast once you can code" },
    { name: "3D printing", reason: "Design meets code — parametric models are just programs" },
  ],
  "Language learning": [
    { name: "Travel", reason: "Speaking the language transforms every trip" },
    { name: "Cooking", reason: "Cooking from the cuisine is the best study aid there is" },
    { name: "Guitar", reason: "Learning songs in the target language makes vocabulary stick" },
  ],
  Philosophy: [
    { name: "Writing", reason: "Arguments only get better when you have to put them into prose" },
    { name: "Chess", reason: "Both are games of consequence chains and first principles" },
    { name: "Debate club", reason: "The fastest feedback loop for untested ideas" },
  ],
  History: [
    { name: "Reading", reason: "Primary sources beat every summary" },
    { name: "Travel", reason: "Standing in a place makes history stop being abstract" },
    { name: "Collecting", reason: "Objects carry history in a way no text fully reproduces" },
  ],
  Astronomy: [
    { name: "Stargazing", reason: "The obvious pairing — the theory and the experience together" },
    { name: "Photography", reason: "Astrophotography is one of the most technically rewarding genres" },
    { name: "Camping", reason: "Dark skies require getting out of the city — camping gets you there" },
  ],

  // Gaming
  "Video games": [
    { name: "Coding", reason: "The gap between player and builder shrinks fast" },
    { name: "Drawing", reason: "Character and world art is where many game dev projects start" },
    { name: "Board games", reason: "Mechanics translate — many great video games started as tabletop designs" },
  ],
  "Board games": [
    { name: "Chess", reason: "Deep strategic thinking across a much wider game space" },
    { name: "Hosting dinners", reason: "Games are better with people — the dinner table is the natural venue" },
    { name: "Reading", reason: "Game design theory and strategy writing are surprisingly deep" },
  ],
  "Tabletop RPGs": [
    { name: "Writing", reason: "Worldbuilding and narrative improv are the core of the craft" },
    { name: "Improv comedy", reason: "Same muscle — yes-and, character commitment, building on the moment" },
    { name: "History", reason: "The best settings are grounded in real history" },
  ],
  "Dungeon Master": [
    { name: "Writing", reason: "Every campaign is a collaborative novel — worldbuilding is writing" },
    { name: "Improv comedy", reason: "DMing is improv with dice — the skills transfer directly" },
    { name: "History", reason: "Rich settings borrow liberally from real civilizations" },
  ],

  // Outdoor
  Gardening: [
    { name: "Cooking", reason: "Growing what you cook closes a satisfying loop" },
    { name: "Yoga", reason: "Both are slow, grounding, and reward consistent presence" },
    { name: "Writing", reason: "Garden journaling tracks patterns across seasons better than memory" },
  ],
  "Bird watching": [
    { name: "Photography", reason: "Capture what you see — the two deepen each other" },
    { name: "Hiking", reason: "Go where the birds are; trails unlock entirely new sightings" },
    { name: "Drawing", reason: "Field sketching is how most serious birders sharpen observation" },
  ],
  Camping: [
    { name: "Cooking", reason: "Campfire cooking is its own genre — constraints make it creative" },
    { name: "Photography", reason: "Dark skies and golden light make campsites exceptional shooting locations" },
    { name: "Hiking", reason: "Overnight trips extend the adventure that day hikes only start" },
  ],
  Fishing: [
    { name: "Cooking", reason: "Cooking your catch is the most satisfying part of the loop" },
    { name: "Reading", reason: "The waiting game pairs perfectly with a long book" },
    { name: "Yoga", reason: "Patience and stillness — the same quality that makes both rewarding" },
  ],
  Stargazing: [
    { name: "Photography", reason: "Astrophotography is one of the most technically rewarding genres" },
    { name: "Astronomy", reason: "Theory and observation reinforce each other" },
    { name: "Camping", reason: "Dark skies require leaving the city — overnight trips are the best plan" },
  ],
  Foraging: [
    { name: "Cooking", reason: "What you find becomes dinner — the loop is deeply satisfying" },
    { name: "Gardening", reason: "Learning wild plants builds a botanical eye that carries over" },
    { name: "Hiking", reason: "Trails are where foragers spend most of their time" },
  ],

  // Culinary
  Cooking: [
    { name: "Gardening", reason: "Growing ingredients closes the loop from soil to table" },
    { name: "Hosting dinners", reason: "Cooking needs an audience — hosting is where it comes alive" },
    { name: "Wine tasting", reason: "Pairing food and wine is a craft that rewards the curious cook" },
  ],
  Baking: [
    { name: "Gardening", reason: "Fresh herbs and fruits make baking seasons meaningful" },
    { name: "Reading", reason: "Recipe books and baking science are a genre worth exploring" },
    { name: "Writing", reason: "Recipe blogging and food writing are natural extensions" },
  ],
  "Coffee brewing": [
    { name: "Reading", reason: "The ritual pairing goes back centuries for a reason" },
    { name: "Gardening", reason: "Curiosity about flavor origin leads naturally to growing" },
    { name: "Science", reason: "Water chemistry, extraction, and roast curves are genuinely scientific" },
  ],
  "Wine tasting": [
    { name: "Cooking", reason: "Pairing food and wine is a craft that rewards both interests" },
    { name: "Travel", reason: "Regions are the curriculum — every bottle is a reason to visit" },
    { name: "History", reason: "Wine is one of the oldest continuous threads in Western history" },
  ],
  BBQ: [
    { name: "Woodworking", reason: "Many BBQ devotees build their own smokers — the crafts overlap" },
    { name: "Science", reason: "The chemistry of smoke, time, and temperature is real and interesting" },
    { name: "Hosting dinners", reason: "BBQ is inherently social — a long cook invites people" },
  ],

  // Collecting
  "Vinyl records": [
    { name: "DJing", reason: "Crate digging feeds directly into the DJ set list" },
    { name: "Music production", reason: "Sample culture connects deeply to vinyl culture" },
    { name: "Hosting dinners", reason: "A great record collection sets the tone for a dinner" },
  ],
  Books: [
    { name: "Writing", reason: "Book collecting becomes active engagement when you start writing" },
    { name: "Book club", reason: "A collection is more meaningful when it's in conversation with others" },
    { name: "Coffee brewing", reason: "The reading-coffee ritual is ancient and worth building deliberately" },
  ],
  Art: [
    { name: "Drawing", reason: "Collecting art alongside making art sharpens what you see" },
    { name: "Travel", reason: "Galleries and studios give travel a cultural backbone" },
    { name: "History", reason: "Art history makes every piece you own more legible" },
  ],

  // Making
  Woodworking: [
    { name: "Drawing", reason: "Sketching designs before cutting wood saves timber and reveals ideas" },
    { name: "Yoga", reason: "Physical focus and slow deliberate movement — the same mindset in a different shop" },
    { name: "Cooking", reason: "Cutting boards, spoons, and serving boards — the two hobbies feed each other literally" },
  ],
  "3D printing": [
    { name: "Coding", reason: "Parametric design is programming for physical objects" },
    { name: "Electronics", reason: "Printed enclosures and mounts bring electronics projects together" },
    { name: "Board games", reason: "Custom tokens, minis, and inserts are a popular application" },
  ],
  Electronics: [
    { name: "Coding", reason: "Firmware and software make hardware actually do something" },
    { name: "Music production", reason: "Synth building and audio hardware are beloved intersections" },
    { name: "3D printing", reason: "Print the enclosures; build the circuits inside them" },
  ],
  "Jewelry making": [
    { name: "Drawing", reason: "Sketching designs is the first step in every piece" },
    { name: "Yoga", reason: "Fine motor patience and a calm mind — both benefit from the same source" },
    { name: "Collecting", reason: "Appreciation for precious materials crosses over naturally" },
  ],
  "Candle making": [
    { name: "Yoga", reason: "Scent and atmosphere — candles are already embedded in mindfulness practice" },
    { name: "Gardening", reason: "Growing herbs and botanicals feeds directly into fragrance" },
    { name: "Hosting dinners", reason: "Table settings and ambiance are where candles shine most" },
  ],

  // Social
  "Hosting dinners": [
    { name: "Cooking", reason: "Hosting is why cooking wants an audience" },
    { name: "Wine tasting", reason: "Good wine anchors a dinner party" },
    { name: "Board games", reason: "Games extend the evening and turn dinner guests into friends" },
  ],
  "Book club": [
    { name: "Writing", reason: "Discussing books is the fastest way to start writing about them" },
    { name: "Reading", reason: "Book club adds accountability and new lenses to any reading habit" },
    { name: "Hosting dinners", reason: "Most book clubs work best when the food and company are good" },
  ],
  "Improv comedy": [
    { name: "Theater", reason: "Improv is the engine that makes all performance better" },
    { name: "Singing", reason: "Both demand presence, commitment, and not being afraid to look foolish" },
    { name: "Tabletop RPGs", reason: "Yes-and lives in both — the skills transfer almost completely" },
  ],
  Theater: [
    { name: "Singing", reason: "Musical theater is the natural next level" },
    { name: "Writing", reason: "Understanding dramatic structure changes how you perform it" },
    { name: "Improv comedy", reason: "Improv builds the presence and listening that scripted work needs" },
  ],
  Travel: [
    { name: "Photography", reason: "Photos are how travel stays meaningful after you come home" },
    { name: "Language learning", reason: "Speaking even 50 words of the local language transforms the trip" },
    { name: "History", reason: "Knowing the history makes you read the place rather than just see it" },
  ],
};

export function getRelatedHobbies(hobbyName: string): HobbyAffinity[] {
  const sourceCategory = getCategoryForHobby(hobbyName);
  const affinities = HOBBY_AFFINITIES[hobbyName] ?? [];

  // Filter to only hobbies that exist in the taxonomy and are in a different category
  return affinities.filter(({ name }) => {
    if (!ALL_HOBBIES.some((h) => h.toLowerCase() === name.toLowerCase())) return false;
    const targetCategory = getCategoryForHobby(name);
    // Exclude same-category suggestions (those are shown in the existing section)
    return !sourceCategory || !targetCategory || targetCategory.name !== sourceCategory.name;
  });
}
