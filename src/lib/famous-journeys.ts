export type FamousJourney = {
  slug: string;
  name: string;
  knownFor: string;
  emoji: string;
  born: string;
  phases: {
    label: string;
    hobbies: string[];
  }[];
  surprisingHobbies: string[];
  hobbyInfluence: string;
  quote?: { text: string; attribution?: string };
};

export const FAMOUS_JOURNEYS: FamousJourney[] = [
  {
    slug: "steve-jobs",
    name: "Steve Jobs",
    knownFor: "Co-founder of Apple; revolutionized personal computing, smartphones, and digital media",
    emoji: "💻",
    born: "1955–2011",
    phases: [
      {
        label: "Childhood / Teens",
        hobbies: ["Electronics tinkering", "Swimming", "Reading", "Homebrew Computer Club"],
      },
      {
        label: "College / Early Career",
        hobbies: ["Calligraphy", "Eastern spirituality", "Zen Buddhism", "Meditation", "Traveling India"],
      },
      {
        label: "Peak Career (Apple era)",
        hobbies: ["Walking meetings", "Fruitarian diets", "Minimalist living", "Daily meditation"],
      },
    ],
    surprisingHobbies: [
      "Deeply devoted to Bob Dylan's music throughout his life",
      "Practiced long periods of silence and solitary reflection",
      "His interest in Japanese aesthetics and Zen gardens directly influenced Apple's design language",
    ],
    hobbyInfluence:
      "The calligraphy course gave Apple its typographic soul — Jobs said in his 2005 Stanford speech that without it, the Mac would have never had multiple typefaces or proportionally spaced fonts. His Zen practice drove the minimalist design philosophy that defined Apple products. Walking meetings became legendary for producing Apple's biggest ideas.",
    quote: {
      text: "If you just sit and observe, you will see how restless your mind is... over time it does calm, and when it does, there's room to hear more subtle things... Your mind just slows down, and you see a tremendous expanse in the moment.",
    },
  },
  {
    slug: "elon-musk",
    name: "Elon Musk",
    knownFor: "CEO of Tesla and SpaceX; pushing boundaries of electric vehicles, space exploration, and AI",
    emoji: "🚀",
    born: "b. 1971",
    phases: [
      {
        label: "Childhood (South Africa)",
        hobbies: ["Voracious reading", "Science fiction", "Self-taught programming", "Making rockets", "Magic tricks"],
      },
      {
        label: "Teens / Early Career",
        hobbies: ["Obsessive reading (sci-fi, philosophy, biographies)", "Video game development"],
      },
      {
        label: "Peak Career",
        hobbies: ["Competitive video gaming", "Anime", "Reading (biographies, physics, AI research)"],
      },
    ],
    surprisingHobbies: [
      "Reportedly ranked top 20 globally in Diablo IV",
      "Childhood explosives experiments (pool chlorine + brake fluid)",
      "Hypnotized his sister into believing she was a dog as a child",
      "Taught himself magic tricks",
    ],
    hobbyInfluence:
      "The sci-fi books — especially Asimov's Foundation and Hitchhiker's Guide — directly shaped his vision for SpaceX and Mars colonization. His childhood coding hobby became the foundation for his tech career. His reading habit, which he maintains to this day, is how he taught himself rocket science, famously reading engineering textbooks cover to cover to build SpaceX.",
    quote: {
      text: "I was raised by books. Books, and then my parents.",
      attribution: "on his childhood reading",
    },
  },
  {
    slug: "taylor-swift",
    name: "Taylor Swift",
    knownFor: "Global pop/country superstar; one of the best-selling music artists of all time",
    emoji: "🎸",
    born: "b. 1989",
    phases: [
      {
        label: "Childhood (Pennsylvania)",
        hobbies: ["Competitive horseback riding", "Growing up on a Christmas tree farm"],
      },
      {
        label: "Teens (Nashville years)",
        hobbies: ["Songwriting", "Poetry and journaling"],
      },
      {
        label: "Peak Career",
        hobbies: ["Baking and cooking", "Painting", "Antique collecting", "Cats", "Waterskiing", "Hiking", "Volleyball"],
      },
    ],
    surprisingHobbies: [
      "Was a competitive horseback rider from age 9 — she gave it up at 12 specifically to pursue music",
      "Is a serious antique collector — photographed buying vintage jewelry, art, and furniture",
      "Painting is a private creative outlet she shares only occasionally",
    ],
    hobbyInfluence:
      "The discipline of competitive horseback riding taught her performance and competition skills from a very young age. Her baking and gift-giving habits reflect the personal connection with fans that became her brand signature. Her storytelling instincts — visible in her journaling and songwriting from childhood — are the backbone of her entire career.",
    quote: {
      text: "I'm sorry, but I don't love riding as much as you do. I want to write songs and play guitar.",
      attribution: "age 12, to her mother — choosing her path",
    },
  },
  {
    slug: "keanu-reeves",
    name: "Keanu Reeves",
    knownFor: "Actor (The Matrix, John Wick); widely regarded as one of the kindest people in Hollywood",
    emoji: "🎬",
    born: "b. 1964",
    phases: [
      {
        label: "Childhood / Teens (Toronto)",
        hobbies: ["Ice hockey (promising goalie, nicknamed 'The Wall')", "Dreamed of playing in the NHL"],
      },
      {
        label: "Early Career (1980s–90s Los Angeles)",
        hobbies: ["Bass guitar", "Co-founded band Dogstar", "Motorcycles"],
      },
      {
        label: "Peak Career",
        hobbies: [
          "Dogstar (reunited 2022, new album 2023)",
          "ARCH Motorcycle Company (co-founded 2011)",
          "Brazilian jiu-jitsu",
          "Judo",
          "Horseback riding",
          "Surfing",
          "Writing poetry (published two books)",
        ],
      },
    ],
    surprisingHobbies: [
      "Ice hockey background is largely unknown — he was good enough to seriously consider going pro in the NHL",
      "He writes and publishes poetry (two books: 'Ode to Happiness' and 'Shadows')",
      "He actively designs motorcycles at ARCH — not just a celebrity investor",
    ],
    hobbyInfluence:
      "His martial arts training transformed him into one of the most physically capable action stars in Hollywood, allowing him to perform his own stunts in John Wick. His motorcycle passion led to a legitimate manufacturing business. Music kept him grounded and creatively fulfilled throughout his career's ups and downs.",
    quote: {
      text: "There were some things that I wanted to do; I wanted to learn how to ride a motorcycle and how to play bass... connect the daydream, playing music, following your passionate side.",
    },
  },
  {
    slug: "albert-einstein",
    name: "Albert Einstein",
    knownFor: "Theoretical physicist; theory of relativity; E=mc²; Nobel Prize in Physics",
    emoji: "🎻",
    born: "1879–1955",
    phases: [
      {
        label: "Childhood (Germany)",
        hobbies: ["Violin (introduced at age 5)", "At 13, discovered Mozart and fell in love with music"],
      },
      {
        label: "College / Early Career",
        hobbies: ["Violin practice", "Sailing", "Philosophical reading (Hume, Spinoza, Schopenhauer)"],
      },
      {
        label: "Peak Career (Princeton years)",
        hobbies: ["Violin (never traveled without it)", "Piano improvisation", "Sailing", "Travel journals"],
      },
    ],
    surprisingHobbies: [
      "Was a genuinely bad sailor who kept sailing anyway — loved it because it let his mind wander",
      "Said if he hadn't been a physicist, he would have been a musician",
      "Used music actively as a problem-solving tool — played violin when stuck on physics problems",
    ],
    hobbyInfluence:
      "Einstein's son Hans recalled that whenever Einstein felt he had come to the end of the road in his work, he would take refuge in music, and that would usually resolve all his difficulties. Einstein himself said 'The theory of relativity occurred to me by intuition, and music is the driving force behind this intuition.' His sailing — despite being terrible at it — gave him unstructured thinking time that fed his theoretical work.",
    quote: {
      text: "Life without playing music is inconceivable for me. I live my daydreams in music. I see my life in terms of music... I get most joy in life out of music.",
    },
  },
  {
    slug: "oprah-winfrey",
    name: "Oprah Winfrey",
    knownFor: "Media mogul, talk show host, philanthropist; one of the most influential women in the world",
    emoji: "📚",
    born: "b. 1954",
    phases: [
      {
        label: "Childhood (Mississippi)",
        hobbies: ["Public speaking (reciting in church from age 3)", "Reading", "Performing and dramatic interpretation"],
      },
      {
        label: "Teens (Nashville)",
        hobbies: [
          "Speech and debate",
          "Won national dramatic interpretation competitions",
          "Radio broadcasting (still in high school)",
        ],
      },
      {
        label: "Peak Career",
        hobbies: ["Reading (Oprah's Book Club)", "Poetry (reads every evening)", "Cooking", "Gardening", "Hiking", "Photography"],
      },
    ],
    surprisingHobbies: [
      "Was giving church recitations at age 3 — essentially performing publicly before she could read",
      "Reads poetry every single evening as a calming ritual",
      "Her gardening at Montecito is a serious practice, not just casual",
    ],
    hobbyInfluence:
      "Her childhood public speaking directly launched her career — a speaking contest got her a college scholarship, and a beauty pageant declaration led to her first media job. Her reading passion became the backbone of her brand (Oprah's Book Club could make any book a bestseller overnight). Her curiosity-driven hobby exploration became her interviewing superpower.",
    quote: {
      text: "Reading gave me hope. For me it was the open door.",
      attribution: "on her Book Club",
    },
  },
  {
    slug: "lebron-james",
    name: "LeBron James",
    knownFor: "NBA superstar; widely considered one of the greatest basketball players of all time",
    emoji: "🏀",
    born: "b. 1984",
    phases: [
      {
        label: "Childhood (Akron, Ohio)",
        hobbies: ["Football (wide receiver, legitimate dual-sport prospect)", "Basketball"],
      },
      {
        label: "Teens / Early Career",
        hobbies: ["Hip-hop music", "Social media"],
      },
      {
        label: "Peak Career",
        hobbies: ["Reading (pre-game ritual since 2012 playoffs)", "Golf", "Business and investing", "Philanthropy", "DJ culture"],
      },
    ],
    surprisingHobbies: [
      "Was recruited by major college programs for football, not just basketball — a serious dual-sport talent",
      "Started a pre-game reading ritual before the 2012 playoffs and maintained it ever since",
      "Self-described 'addicted' to golf; calls it his coolest hobby outside basketball",
    ],
    hobbyInfluence:
      "His football background gave him the physicality and versatility that set him apart in basketball. His reading habit helps him manage the immense pressure of playoff basketball. His business hobbies turned him into a billionaire and media mogul beyond basketball — and his philanthropy in Akron (opening the I Promise School in 2018) redefined what athlete community impact looks like.",
    quote: {
      text: "I was reading to not only do something different, but to also take my mind off the game... I needed some moments where I could just get a different perspective — escape.",
    },
  },
  {
    slug: "julia-child",
    name: "Julia Child",
    knownFor: "Celebrity chef who brought French cuisine to the American public; iconic TV personality",
    emoji: "👩‍🍳",
    born: "1912–2004",
    phases: [
      {
        label: "Childhood / College",
        hobbies: ["Aspired to be a novelist", "Athletics", "Writing (advertising, newspapers)"],
      },
      {
        label: "Early Career — The Lost Years",
        hobbies: ["Government work", "OSS spy (WWII, top secret clearance)", "Developing shark repellent"],
      },
      {
        label: "The Transformation (age 36–49)",
        hobbies: ["French cuisine (Le Cordon Bleu, 1949)", "Cookbook writing (nearly a decade)"],
      },
      {
        label: "Peak Career (age 49+)",
        hobbies: ["Teaching", "Writing", "TV hosting (The French Chef, age 51)"],
      },
    ],
    surprisingHobbies: [
      "Was literally a spy — worked for the OSS during WWII with top secret clearance",
      "Helped invent shark repellent (tested over 100 substances)",
      "Couldn't cook at all until her mid-30s and freely admitted it",
    ],
    hobbyInfluence:
      "Julia Child is the ultimate late-bloomer story. She tried everything — writing, advertising, espionage — before finding cooking at 36. Her OSS experience gave her worldliness and confidence. Her writing ambitions gave her the communication skills that made her TV persona so compelling. She didn't publish until 49 or get on TV until 51, proving that your life's calling can arrive in what others would call middle age.",
    quote: {
      text: "I was 32 when I started cooking. Up until then, I just ate.",
    },
  },
  {
    slug: "anthony-bourdain",
    name: "Anthony Bourdain",
    knownFor: "Chef, author, and TV host (No Reservations, Parts Unknown); redefined food and travel media",
    emoji: "✈️",
    born: "1956–2018",
    phases: [
      {
        label: "Childhood (New York/New Jersey)",
        hobbies: ["Comic book collecting", "Drawing (wanted to draw comics professionally)", "Literature", "Boy Scouts"],
      },
      {
        label: "Teens / Early Career",
        hobbies: ["Punk rock (the Ramones, Dead Boys)", "Writing (literary magazine submissions)", "Selling comics to fund other habits"],
      },
      {
        label: "Peak Career (TV era)",
        hobbies: ["Brazilian jiu-jitsu (started age 58)", "Music and film", "Travel", "Writing"],
      },
    ],
    surprisingHobbies: [
      "Wanted to be a comic book artist, not a chef, as a kid",
      "Won a BJJ gold medal at the 2016 New York Open BJJ competition — at age 60",
      "Had a secret Reddit account for years where he discussed martial arts and defended people with addiction issues",
    ],
    hobbyInfluence:
      "His literary upbringing and failed comic book dreams made him the writer who could turn Kitchen Confidential into a cultural phenomenon. Punk rock gave him his anti-establishment voice. BJJ gave him a late-life physical and spiritual practice that replaced 40+ years of self-destructive habits — he said it made alcohol 'a much less attractive option.' His curiosity — whether about comics, punk, food, or martial arts — was the throughline of his entire life.",
    quote: {
      text: "I am 59 years old and a Brazilian jiu-jitsu practitioner... I train as much as I can, wherever I am in the world.",
    },
  },
  {
    slug: "vera-wang",
    name: "Vera Wang",
    knownFor: "Iconic fashion designer; transformed the bridal industry; started her fashion career at age 40",
    emoji: "👗",
    born: "b. 1949",
    phases: [
      {
        label: "Childhood / Teens",
        hobbies: ["Competitive figure skating (from age 8)", "Competed at 1968 U.S. National Championships"],
      },
      {
        label: "College / Early Career (post-skating)",
        hobbies: ["Fashion (realized passion during semester in Paris)", "Magazine editing (Vogue, 17 years)", "Design direction (Ralph Lauren)"],
      },
      {
        label: "The Pivot (age 40)",
        hobbies: ["Wedding dress design (couldn't find one she liked for her own wedding)"],
      },
      {
        label: "Peak Career",
        hobbies: ["Fashion empire building", "Olympic figure skating costume design (Kerrigan, Kwan, Lysacek, Nathan Chen)"],
      },
    ],
    surprisingHobbies: [
      "Was a nationally competitive figure skater — most people only know her as a fashion designer",
      "Designed Olympic skating costumes, merging her two life passions decades later",
      "Spent 17 years at Vogue before ever designing a single garment",
    ],
    hobbyInfluence:
      "Figure skating gave her an understanding of how fabric moves on the body, the drama of performance, and the emotional power of what you wear. Her inability to find her own perfect wedding dress at 39 became the founding story of a billion-dollar brand. Her skating connections let her design Olympic costumes, creating a poetic full-circle from failed Olympian to dressing Olympic champions.",
    quote: {
      text: "I thought maybe it's just too late for me.",
      attribution: "on starting her company at 40",
    },
  },
  {
    slug: "richard-feynman",
    name: "Richard Feynman",
    knownFor: "Nobel Prize-winning physicist; worked on the Manhattan Project; legendary science communicator",
    emoji: "⚛️",
    born: "1918–1988",
    phases: [
      {
        label: "Childhood / Teens",
        hobbies: ["Radio tinkering and repair", "Mathematics puzzles", "Taking things apart compulsively"],
      },
      {
        label: "College / Manhattan Project",
        hobbies: ["Lock picking and safecracking (at Los Alamos nuclear facility)"],
      },
      {
        label: "Peak Career",
        hobbies: [
          "Bongo drums (performed at parties; his actual drums sold at Sotheby's)",
          "Drawing and painting (under pseudonym 'Ofey'; shown in galleries)",
          "Visiting strip clubs to draw dancers while doing physics calculations",
          "Obsessive quest to visit Tuva (remote Russia)",
        ],
      },
    ],
    surprisingHobbies: [
      "Cracked safes containing nuclear secrets at Los Alamos using a screwdriver and bent paperclip",
      "Drew nude portraits under a pseudonym and showed them in legitimate galleries",
      "Was introduced at events as 'bongo player' before 'physicist'",
    ],
    hobbyInfluence:
      "Feynman's hobbies were extensions of his scientific curiosity — he approached drums, art, locks, and foreign countries with the same experimental rigor he brought to quantum electrodynamics. His famous Feynman Diagrams were essentially visual art applied to physics. His playfulness and hobby-driven approach to life made him the most beloved physics teacher of the 20th century and the subject of two bestselling memoirs.",
    quote: {
      text: "When called upon to play bongo drums formally, introducers never mentioned that he also did theoretical physics.",
      attribution: "paraphrased from his memoir",
    },
  },
  {
    slug: "serena-williams",
    name: "Serena Williams",
    knownFor: "Tennis champion with 23 Grand Slam singles titles; one of the greatest athletes of all time",
    emoji: "🎾",
    born: "b. 1981",
    phases: [
      {
        label: "Childhood (Compton, California)",
        hobbies: ["Tennis from age 3 (trained by father Richard Williams on public courts)"],
      },
      {
        label: "Teens / Early Career",
        hobbies: ["Fashion interest", "Bold on-court outfit expression"],
      },
      {
        label: "Peak Career",
        hobbies: [
          "Fashion design (attended fashion school between Grand Slam victories)",
          "Nail art (240-hour certification)",
          "Acting (TV and film roles since 2002)",
          "Venture capital (Serena Ventures, 2014)",
          "Philanthropy (UNICEF, schools in Kenya)",
        ],
      },
    ],
    surprisingHobbies: [
      "Literally went to fashion school while being the world's #1 tennis player",
      "Completed a 240-hour nail technician certification — could professionally do your nails",
      "Her venture capital firm is a serious investment vehicle, not a celebrity vanity project",
    ],
    hobbyInfluence:
      "Serena has said her longevity in tennis stemmed partly from having 'a rich life outside of sports.' Fashion design and nail art gave her creative outlets that prevented burnout during a 25+ year professional career. Her business and fashion interests prepared her for a seamless post-tennis career transition — she launched WYN Beauty in 2024 and was named CFDA Fashion Icon in 2023.",
    quote: {
      text: "I love designing dresses and tops. I went to fashion school, and I'm starting to have to do bags and stuff.",
    },
  },
  {
    slug: "warren-buffett",
    name: "Warren Buffett",
    knownFor: "CEO of Berkshire Hathaway; one of the most successful investors in history; the Oracle of Omaha",
    emoji: "💰",
    born: "b. 1930",
    phases: [
      {
        label: "Childhood / Teens",
        hobbies: ["Entrepreneurial hobbies from age 6 (selling Coca-Cola, newspapers, golf balls)", "Obsessive financial reading"],
      },
      {
        label: "College",
        hobbies: ["Ukulele (learned to impress a young woman — it worked)"],
      },
      {
        label: "Peak Career (CEO decades)",
        hobbies: ["Bridge (~12 hours per week, often with Bill Gates)", "Ukulele (plays at Berkshire shareholder meetings, charity events)", "Reading (80% of his work day)"],
      },
    ],
    surprisingHobbies: [
      "Learned ukulele to impress a girl in college and still plays it 70+ years later",
      "Has performed ukulele duets with Bon Jovi on video",
      "Plays bridge 12 hours per week — more than most people spend on any single hobby",
    ],
    hobbyInfluence:
      "Bridge trains exactly the skills Buffett uses as an investor: probabilistic thinking, reading opponents, making decisions with incomplete information, and long-term strategic planning. His reading habit (5–6 hours daily) is what he credits most for his investment success. The ukulele keeps him playful and approachable, which is central to his folksy, trust-building brand.",
    quote: {
      text: "Bridge is such a sensational game that I wouldn't mind being in jail if I had three cellmates who were decent players.",
    },
  },
  {
    slug: "marie-curie",
    name: "Marie Curie",
    knownFor: "Physicist and chemist; first woman to win a Nobel Prize; only person to win Nobels in two different sciences",
    emoji: "🔬",
    born: "1867–1934",
    phases: [
      {
        label: "Childhood (Warsaw, Poland)",
        hobbies: ["Intense academic focus", "Reading voraciously under political restrictions"],
      },
      {
        label: "College / Early Career (Paris)",
        hobbies: ["Cycling (bonded with Pierre Curie over cycling)", "Physics research"],
      },
      {
        label: "Peak Career",
        hobbies: ["Extensive cycling tours throughout Europe (with Pierre)", "Gardening and nature walks", "Raising two daughters alone after Pierre's death"],
      },
    ],
    surprisingHobbies: [
      "She and Pierre used their wedding gift money to buy bicycles instead of anything traditional",
      "They were serious recreational cyclists — their cycling trips were their primary relaxation and connection",
      "Maintained physical hobbies despite working in conditions that were slowly killing her (radiation exposure)",
    ],
    hobbyInfluence:
      "Cycling was how she and Pierre built their partnership — both romantic and scientific. Their rides provided thinking time and relaxation between grueling lab work. The physical activity helped sustain her through decades of exhausting research in dangerous conditions. The cycling trips around France gave them shared experiences that strengthened the most productive scientific partnership of the early 20th century.",
    quote: {
      text: "Marie and Pierre used their wedding gift money to buy bicycles — their bikes became symbols of their partnership and their shared way of seeing the world.",
    },
  },
  {
    slug: "barack-obama",
    name: "Barack Obama",
    knownFor: "44th President of the United States; first African American president; author and constitutional law professor",
    emoji: "🏛️",
    born: "b. 1961",
    phases: [
      {
        label: "Childhood / Teens (Hawaii and Indonesia)",
        hobbies: ["Basketball (varsity team, Punahou School)", "Reading (Spider-Man, Conan the Barbarian comics)", "Body surfing"],
      },
      {
        label: "College / Early Career",
        hobbies: ["Basketball pickup games", "Writing (first book in 1995)", "Poker"],
      },
      {
        label: "Peak Career (Presidency and beyond)",
        hobbies: [
          "Basketball (played on Election Day as stress ritual)",
          "Golf",
          "Writing (The Audacity of Hope, A Promised Land)",
          "Cooking",
          "Reading (annual public reading list)",
          "Scrabble",
          "Kitesurfing (post-presidency)",
        ],
      },
    ],
    surprisingHobbies: [
      "Grew up reading Spider-Man and Conan the Barbarian comics",
      "Plays Scrabble competitively with family",
      "His basketball-on-election-day superstition became a famous presidential tradition",
    ],
    hobbyInfluence:
      "Basketball was central to his identity and leadership style. He said 'I've always loved basketball because it's about building a team that's equal to more than the sum of its parts' — a direct parallel to his political philosophy. His writing skills made him one of the most eloquent presidents in U.S. history. His ability to stay calm under pressure was practiced on the basketball court, and even his election-day hoops ritual was strategic stress management.",
    quote: {
      text: "I've always loved basketball because it's about building a team that's equal to more than the sum of its parts.",
    },
  },
];
