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
  {
    slug: "bill-gates",
    name: "Bill Gates",
    knownFor: "Co-founder of Microsoft, philanthropist, one of the wealthiest people in history",
    emoji: "💻",
    born: "b. 1955",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Reading (World Book encyclopedia by age 8)", "Math", "Chess", "Strategy board games"],
      },
      {
        label: "Teens / Early Career",
        hobbies: ["Programming and computers", "Deep reading", "Mathematics"],
      },
      {
        label: "Career Peak",
        hobbies: ["Think Weeks (solo cabin reading retreats)", "Bridge (with Warren Buffett)", "Reading (a book a week)"],
      },
      {
        label: "Later Life",
        hobbies: ["Tennis", "Settlers of Catan", "Reading nonfiction", "Philanthropic travel"],
      },
    ],
    surprisingHobbies: [
      "Plays bridge competitively — deepened through his famous friendship with Warren Buffett",
      "Hosts 'Think Weeks': entire weeks alone in a Pacific Northwest cabin reading and thinking",
      "Settlers of Catan game nights with his family",
    ],
    hobbyInfluence:
      "His childhood habit of deep, uninterrupted reading and thinking became the foundation of his analytical approach to business and philanthropy. Think Weeks at Microsoft led to major strategic pivots, including the famous 'Internet Tidal Wave' memo. A 1993 trip to Africa with Melinda transformed his philanthropic focus entirely.",
    quote: {
      text: "When I felt restless or bored I would disappear into my room and lose myself in books or ideas, often for hours without interruption. This ability to turn idle time into deep thinking became a fundamental part of who I am.",
    },
  },
  {
    slug: "mark-zuckerberg",
    name: "Mark Zuckerberg",
    knownFor: "Co-founder and CEO of Meta (Facebook), youngest self-made billionaire",
    emoji: "👤",
    born: "b. 1984",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Latin and ancient Greek", "Classical literature", "Chess", "Fencing"],
      },
      {
        label: "Teens",
        hobbies: ["Fencing (team captain, Phillips Exeter)", "Coding side projects", "Classics study"],
      },
      {
        label: "Career",
        hobbies: ["Annual personal challenges (Mandarin, running, AI building)", "Reading (one book every 2 weeks)"],
      },
      {
        label: "Later Life",
        hobbies: ["Brazilian jiu-jitsu and MMA (competing)", "Hydrofoiling", "Surfing", "Barbecuing"],
      },
    ],
    surprisingHobbies: [
      "Was captain of his fencing team and planned to major in classics — Latin and ancient Greek",
      "Quoted Virgil's Aeneid at a Facebook product conference",
      "Competes in BJJ tournaments and MMA fights",
      "Self-described 'meat chef' who is serious about barbecue",
    ],
    hobbyInfluence:
      "Fencing taught him strategy, competition, and reading opponents. Classical studies gave him a framework for thinking about human nature and building social systems. Annual challenges kept him in a growth mindset. His MMA/BJJ shift reflects Meta's more aggressive competitive posture.",
    quote: {
      text: "I learned more from fencing, in some ways, than I learned in any of my courses at Harvard. It taught me that when you want something, you have to go out and take it.",
    },
  },
  {
    slug: "jeff-bezos",
    name: "Jeff Bezos",
    knownFor: "Founder of Amazon and Blue Origin, space entrepreneur",
    emoji: "🛒",
    born: "b. 1964",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Building robots and gadgets", "Sci-fi reading (Asimov, Heinlein)", "Playing Star Trek with friends", "Ranch work (Texas summers)"],
      },
      {
        label: "Teens",
        hobbies: ["Invention and engineering", "Space daydreaming"],
      },
      {
        label: "Career",
        hobbies: ["Blue Origin (space company as passion project)", "Star Trek cameo acting"],
      },
      {
        label: "Later Life",
        hobbies: ["Deep-sea exploration for Apollo rocket engines", "Hiking", "Kayaking"],
      },
    ],
    surprisingHobbies: [
      "Scours the ocean floor for discarded NASA Apollo-era rocket engines using submarines",
      "Star Trek superfan since childhood — made a cameo in Star Trek Beyond (2016)",
      "Spent summers as a ranch hand: castrating cattle and fixing windmills",
    ],
    hobbyInfluence:
      "Childhood tinkering and invention directly shaped his engineering mindset. Star Trek fandom inspired Blue Origin, Alexa, and Amazon's space ambitions. His grandfather's ranch taught him self-reliance and practical problem-solving. Sci-fi reading fueled his long-term thinking about civilization-scale problems.",
    quote: {
      text: "We'd fight over who'd get to be Captain Kirk, or Spock, and somebody used to play the computer too. We'd have little cardboard phasers and cardboard tricorders.",
    },
  },
  {
    slug: "beyonce",
    name: "Beyoncé",
    knownFor: "Singer, songwriter, dancer, actress — one of the best-selling music artists of all time",
    emoji: "🐝",
    born: "b. 1981",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Dance classes (from age 7)", "Talent shows (won 35 consecutive local competitions)", "Opera voice lessons (age 9)"],
      },
      {
        label: "Teens",
        hobbies: ["Running a mile while singing (stamina training)", "Obsessive repetition practice"],
      },
      {
        label: "Career Peak",
        hobbies: ["Swimming", "Horror movies", "Nintendo video games", "Italian cooking"],
      },
      {
        label: "Later Life",
        hobbies: ["Beekeeping (80,000 bees, produces hundreds of jars of honey)", "Italian cooking", "Family"],
      },
    ],
    surprisingHobbies: [
      "Keeps two beehives with ~80,000 bees — started for her daughters' allergies (real 'Queen Bey' energy)",
      "Plays Nintendo video games in her free time",
      "Watches slasher horror movies before going to sleep",
      "Trained with an opera singer at age 9",
    ],
    hobbyInfluence:
      "Dance classes, which started to overcome shyness, became the foundation of her performance style. Running while singing at age 10 built the legendary stamina she displays on stage. Her obsessive childhood practice habits created her reputation for perfection. Beekeeping reflects her evolution into a grounded, self-sufficient lifestyle.",
    quote: {
      text: "When everybody else was ready to take a break, she wanted to continue — taking a line out of a song or a routine and doing it over and over again until it was perfect.",
      attribution: "Solange Knowles, on Beyoncé at age 10",
    },
  },
  {
    slug: "lady-gaga",
    name: "Lady Gaga",
    knownFor: "Pop icon, singer, songwriter, actress (A Star is Born, House of Gucci), fashion provocateur",
    emoji: "🎤",
    born: "b. 1986",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Piano (self-taught by ear at age 4)", "Piano lessons", "My Little Pony collection"],
      },
      {
        label: "Teens",
        hobbies: ["Jazz music", "School theater", "Dreaming of being a war correspondent"],
      },
      {
        label: "Career",
        hobbies: ["Italian cooking (loves pasta)", "Horror movies (watches to fall asleep)", "Makeup as creative art"],
      },
      {
        label: "Later Life",
        hobbies: ["Mental health advocacy", "HAUS Laboratories cosmetics (hobby-turned-business)", "Fashion and costume design"],
      },
    ],
    surprisingHobbies: [
      "Dreamed of being a war correspondent before choosing music",
      "Watches horror movies to fall asleep",
      "Taught herself piano by ear at age 4",
      "Childhood My Little Pony obsession shaped her 'beautiful misfit' identity brand",
    ],
    hobbyInfluence:
      "Early piano training by ear gave her the musical foundation for her songwriting. Jazz appreciation influenced her 'Cheek to Cheek' album with Tony Bennett. Horror movie fandom shapes her theatrical, provocative visual aesthetic. Her makeup hobby became a business (HAUS Laboratories). My Little Pony obsession planted the seed for her 'born this way' identity.",
    quote: {
      text: "I was obsessed with the idea of a creature that was born with something magical that made them the misfit in the world of the stallion.",
    },
  },
  {
    slug: "post-malone",
    name: "Post Malone",
    knownFor: "Rapper, singer, songwriter — genre-blending artist spanning hip-hop, pop, country, and rock",
    emoji: "🎵",
    born: "b. 1995",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Hard rock music (introduced by his DJ father)", "Video games"],
      },
      {
        label: "Teens",
        hobbies: ["Guitar Hero (led to learning real guitar)", "Minecraft (joined Team Crafted YouTube group)", "Metalcore music"],
      },
      {
        label: "Early Career",
        hobbies: ["Living with Minecraft YouTubers", "Making music in closets and spare rooms"],
      },
      {
        label: "Career / Present",
        hobbies: ["Beer pong (professional level, filed trademark for 'World Pong League')", "Medieval sword and armor collecting and forging", "Magic: The Gathering (ultra-rare card collecting)", "Custom Crocs design", "Firearms"],
      },
    ],
    surprisingHobbies: [
      "Almost became a Minecraft content creator instead of a musician — lived with Team Crafted in Encino",
      "Forges medieval swords and armor himself",
      "Filed a trademark for the 'World Pong League' after winning $50K at beer pong",
      "Guitar Hero (the video game) is what made him pick up a real guitar",
    ],
    hobbyInfluence:
      "Guitar Hero literally launched his music career by inspiring him to learn real guitar. The Minecraft community in LA gave him the connections and living situation to break into music. Beer pong became a marketing and brand identity pillar. His genre-hopping mirrors his eclectic hobby interests, and medieval aesthetics influence his tattoo style and visual branding.",
    quote: {
      text: "He was sleeping in a closet and freeloading while trying to make it in music — living with Minecraft YouTubers in Encino.",
      attribution: "on his early days in LA",
    },
  },
  {
    slug: "david-bowie",
    name: "David Bowie",
    knownFor: "Rock icon, cultural shapeshifter, musician, actor, fashion pioneer",
    emoji: "⚡",
    born: "1947–2016",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Saxophone (received at age 12)", "Jazz (Charles Mingus)", "Music with his brother"],
      },
      {
        label: "Teens / Young Adult",
        hobbies: ["Art school", "Mime (trained under Lindsay Kemp — his primary income when music flopped)"],
      },
      {
        label: "Career",
        hobbies: ["Painting (neo-expressionist, post-modern)", "Writing art criticism for Modern Painters magazine", "Art collecting"],
      },
      {
        label: "Later Life",
        hobbies: ["Reading (published 100 favorite books list)", "Traveling by ocean liner (afraid of flying)", "Contemporary music discovery"],
      },
    ],
    surprisingHobbies: [
      "Was a professional mime artist before becoming a rock star",
      "Wrote art criticism for a serious art publication (Modern Painters)",
      "Afraid of flying — crossed the Atlantic on ocean liners",
      "His art collection sold for £32.9 million at auction after his death",
    ],
    hobbyInfluence:
      "Mime training gave him the theatrical physicality that defined his stage performances — Ziggy Stardust and all his personas. Painting was his creative problem-solving tool: 'If I had some creative obstacle in the music, I would often revert to drawing it out or painting it out.' Jazz saxophone at age 12 gave him the musical foundation for his genre-spanning career.",
    quote: {
      text: "Painting was about problem solving. I'd find that if I had some creative obstacle in the music that I was working on, I would often revert to drawing it out or painting it out.",
    },
  },
  {
    slug: "tom-hanks",
    name: "Tom Hanks",
    knownFor: "Two-time Academy Award-winning actor, filmmaker, and author",
    emoji: "🎬",
    born: "b. 1956",
    phases: [
      {
        label: "Teens / Early Career",
        hobbies: ["Got his first typewriter at age 19 — a cheap plastic model"],
      },
      {
        label: "Early Career (1978)",
        hobbies: ["Typewriter restoration (a Cleveland restorer introduced him to steel machines)", "Hermes 2000 (cornerstone of his collection)"],
      },
      {
        label: "Career Peak",
        hobbies: ["Typewriter collecting (amassed nearly 250)", "Creating a typewriter app for Apple", "Short fiction writing"],
      },
      {
        label: "Later Life",
        hobbies: ["Giving away his collection (one lovingly wrapped typewriter at a time)", "Writing", "Philanthropy"],
      },
    ],
    surprisingHobbies: [
      "Collected nearly 250 typewriters over 40+ years",
      "Created an iPad app that simulates authentic typewriter sounds",
      "Published 'Uncommon Type: Some Stories' — 17 short stories all revolving around typewriters",
      "Anonymously sends typewriters to antique shops across the country",
    ],
    hobbyInfluence:
      "Typewriters connected him to the tactile, physical process of storytelling. The collection inspired his debut fiction book. His appreciation for mechanical craftsmanship mirrors his approach to acting — valuing precision and authenticity. Giving away his collection reflects the generous public persona central to his career.",
    quote: {
      text: "Everything you type on a typewriter sounds grand, the words forming in mini-explosions of SHOOK SHOOK SHOOK. A thank-you note resonates with the same heft as a literary masterpiece.",
    },
  },
  {
    slug: "meryl-streep",
    name: "Meryl Streep",
    knownFor: "Most nominated actor in Academy Award history (21 nominations); considered the greatest living actress",
    emoji: "🎭",
    born: "b. 1949",
    phases: [
      {
        label: "Childhood",
        hobbies: ["NYC trips with her mother (museums, Broadway, United Nations)", "School recitals"],
      },
      {
        label: "Teens",
        hobbies: ["Opera lessons (with famed teacher Estelle Liebling, age 12–16)", "Cheerleading", "High school theater"],
      },
      {
        label: "Career",
        hobbies: ["Knitting (expert level — taught Amy Adams to knit on set)", "Learning instruments for roles", "Reading poetry"],
      },
      {
        label: "Later Life",
        hobbies: ["Knitting", "Empathy practice as philosophy", "Philanthropic work"],
      },
    ],
    surprisingHobbies: [
      "Studied opera seriously for 4 years with a famous teacher — then quit because she couldn't emotionally connect to the music",
      "Expert knitter who teaches co-stars to knit on film sets",
      "Her acting philosophy traces to a needlepoint sampler she saw in a mean girl's hallway: 'walk a mile in his moccasins'",
    ],
    hobbyInfluence:
      "Opera training gave her extraordinary vocal control and the accent ability that defines her career. Quitting opera because she 'didn't feel it' showed her early instinct that authentic emotional connection matters more than technical skill. NYC trips exposed her to diverse cultures and performances. Knitting provides meditative calm on high-pressure film sets.",
    quote: {
      text: "I was singing something I didn't feel and understand.",
      attribution: "on quitting opera — the same instinct became the hallmark of her acting",
    },
  },
  {
    slug: "arnold-schwarzenegger",
    name: "Arnold Schwarzenegger",
    knownFor: "7x Mr. Olympia bodybuilder, Hollywood action star, Governor of California",
    emoji: "💪",
    born: "b. 1947",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Chess (daily games with his father from age 8)", "Physical fitness (interest from age 14)"],
      },
      {
        label: "Teens / Military",
        hobbies: ["Weight training (started at 15)", "Tank operation (Austrian military, M47 Patton)", "Bodybuilding competitions"],
      },
      {
        label: "Career",
        hobbies: ["Chess (plays on movie sets between takes)", "Horseback riding", "Scuba diving", "Skiing", "Motorcycles", "Reading biographies"],
      },
      {
        label: "Later Life",
        hobbies: ["Chess (plays with Chris Pratt, hosts chess at Arnold Classic)", "Reading", "Classical music", "Art appreciation"],
      },
    ],
    surprisingHobbies: [
      "Lifelong chess player — started at age 8, plays on movie sets, hosts chess at the Arnold Classic",
      "Owns a personal M47 Patton tank from his Austrian military days (paid $20,000 to ship it to America)",
      "Passionate reader of success stories and biographies",
    ],
    hobbyInfluence:
      "Chess trained his strategic thinking for business and politics. Bodybuilding — originally a hobby — became his first career and springboard to Hollywood. Reading success stories motivated his relentless self-improvement. Multi-sport athleticism gave him the physical versatility needed for action films.",
    quote: {
      text: "Chess gives the brain a workout. I see chess through the same lens as bodybuilding — both require discipline, strategy, and continuous improvement.",
    },
  },
  {
    slug: "stephen-king",
    name: "Stephen King",
    knownFor: "Author of horror and thriller novels (The Shining, IT, The Stand); one of the best-selling authors of all time",
    emoji: "📖",
    born: "b. 1947",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Reading fiction voraciously", "Horror movies and comics", "Early story writing"],
      },
      {
        label: "Teens / Young Adult",
        hobbies: ["Submitting stories to magazines", "Guitar (self-taught)"],
      },
      {
        label: "Career",
        hobbies: ["Rock guitar (co-founded the Rock Bottom Remainders with authors Dave Barry, Amy Tan, Barbara Kingsolver)", "Red Sox fandom", "Bowling", "Jigsaw puzzles"],
      },
      {
        label: "Later Life",
        hobbies: ["Writing pop culture criticism for Entertainment Weekly", "Reading", "Guitar (privately)"],
      },
    ],
    surprisingHobbies: [
      "Played guitar in a rock band with famous authors for 20 years — the Rock Bottom Remainders (1992–2012)",
      "Writes pop culture journalism for Entertainment Weekly",
      "Loves bowling and jigsaw puzzles",
      "His love of baseball directly inspired the novel 'The Girl Who Loved Tom Gordon'",
    ],
    hobbyInfluence:
      "Reading fiction as a child directly fueled his writing career. Horror movies shaped his storytelling sensibility. Music and rock culture inform the rhythm and energy of his prose. His pop culture journalism keeps him connected to contemporary trends and feeds material back into his fiction.",
    quote: {
      text: "Bruce Springsteen told us we weren't bad, but not to try to get any better otherwise we'd just be another lousy band. After 20 years, we still meet his stringent requirements.",
    },
  },
  {
    slug: "haruki-murakami",
    name: "Haruki Murakami",
    knownFor: "Japanese novelist (Norwegian Wood, 1Q84, Kafka on the Shore); one of the most translated living authors",
    emoji: "🏃",
    born: "b. 1949",
    phases: [
      {
        label: "Teens",
        hobbies: ["Jazz (discovered at age 15, Art Blakey concert in Kobe)", "Vinyl record collecting"],
      },
      {
        label: "Young Adult",
        hobbies: ["Running a jazz bar and coffeehouse ('Peter Cat')", "Vinyl collecting (over 10,000 records)"],
      },
      {
        label: "Career",
        hobbies: ["Marathon running (started 1982 when he became a full-time novelist)", "Reading (one hour afternoons, one hour before bed)", "Ultramarathon running"],
      },
      {
        label: "Later Life",
        hobbies: ["Hosting radio shows on writing and records", "Running", "Reading", "Vinyl collecting (preserved at Waseda University)"],
      },
    ],
    surprisingHobbies: [
      "Owned and operated a jazz bar before becoming a famous novelist",
      "Has run over 30 marathons and at least one 62-mile ultramarathon",
      "Owns 10,000+ vinyl records spanning jazz, classical, and 60s pop",
      "Considers himself more musician than writer — says music shaped his prose more than books",
    ],
    hobbyInfluence:
      "Jazz taught him rhythm, improvisation, and harmony — all of which he applies directly to writing. Running provides the physical discipline and mental endurance needed for novel-writing. His music obsession permeates his novels (over 3,350 songs referenced across his works). He describes writing as 'a very physical process' — running and writing are inseparable for him.",
    quote: {
      text: "Pain is inevitable. Suffering is optional. Exerting yourself to the fullest within your individual limits: that's the essence of running, and a metaphor for life — and for me, for writing as well.",
    },
  },
  {
    slug: "cristiano-ronaldo",
    name: "Cristiano Ronaldo",
    knownFor: "Portuguese footballer, 5x Ballon d'Or winner, all-time international goal scorer",
    emoji: "⚽",
    born: "b. 1985",
    phases: [
      {
        label: "Childhood (Madeira, Portugal)",
        hobbies: ["Street football (missed meals to play, escaped through his bedroom window with a ball)"],
      },
      {
        label: "Teens (Sporting CP Academy)",
        hobbies: ["Football as emotional anchor during homesickness"],
      },
      {
        label: "Career",
        hobbies: ["Swimming", "Tennis", "Table tennis", "Cycling", "Luxury car collecting (19+ vehicles)", "Bingo (learned at Manchester United)", "Contemporary art collecting (Banksy, Jeff Koons)"],
      },
      {
        label: "Later Life",
        hobbies: ["Surfing (secretly, in Madeira)", "Stand-up paddleboarding", "Jet skiing", "Family"],
      },
    ],
    surprisingHobbies: [
      "Plays bingo — learned it at Manchester United in 2003",
      "Serious contemporary art collector: Banksy, Jeff Koons — collection valued at $12M+",
      "Surfs secretly at secluded beaches in Madeira",
      "High-stakes poker player",
    ],
    hobbyInfluence:
      "Childhood obsession with street football developed his legendary footwork and agility. Competitive card games and poker maintain his mental sharpness. Water sports keep him physically active and mentally refreshed during off-seasons. Art collecting reflects his appreciation for excellence and craftsmanship beyond the pitch.",
    quote: {
      text: "It's no different than anyone else. I spend all my time playing football every day, and I'm not tired of it. It was just a fun childhood like everyone else's.",
    },
  },
  {
    slug: "roger-federer",
    name: "Roger Federer",
    knownFor: "Swiss tennis champion, 20 Grand Slam titles, considered one of the greatest athletes of all time",
    emoji: "🎾",
    born: "b. 1981",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Skiing", "Wrestling", "Swimming", "Skateboarding", "Basketball", "Handball", "Table tennis", "Badminton", "Soccer — tried 10+ sports"],
      },
      {
        label: "Teens",
        hobbies: ["Tennis (narrowed focus)", "Soccer", "Piano"],
      },
      {
        label: "Career",
        hobbies: ["Golf", "PlayStation", "Card games", "Classical music (Bach)", "Cultural travel", "Language learning (fluent in German, French, English, Swiss German)"],
      },
      {
        label: "Post-Retirement",
        hobbies: ["Fatherhood and family", "Philanthropy (Roger Federer Foundation)", "Travel"],
      },
    ],
    surprisingHobbies: [
      "Sampled 10+ sports as a child before choosing tennis",
      "Credits badminton specifically for developing his legendary hand-eye coordination",
      "Played piano (performed Bach in a 2019 advertisement)",
      "Still sees tennis as a hobby, not a job — key to his longevity",
    ],
    hobbyInfluence:
      "Multi-sport sampling gave him exceptional athletic versatility and prevented burnout. Badminton developed the wrist speed and hand-eye coordination that defined his game. His calm, cultured off-court persona — music, travel, languages — made him one of sport's most marketable athletes. Playing many sports kept him seeing tennis as fun rather than work.",
    quote: {
      text: "Do other sports too, for fun. Go play squash, go ride your bike, go ski. If you only start focusing on one sport only, you can get burned out and start seeing it as a job rather than a hobby — and I still see tennis as my hobby.",
    },
  },
  {
    slug: "simone-biles",
    name: "Simone Biles",
    knownFor: "Most decorated gymnast in history, 37 World and Olympic medals, mental health advocate",
    emoji: "🤸",
    born: "b. 1997",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Gymnastics (discovered on a daycare field trip at age 6)", "Finding stability in training"],
      },
      {
        label: "Teens / Competition Years",
        hobbies: ["Reading (Hunger Games series)", "Movies (Divergent, Pretty Little Liars)", "Spending time with friends"],
      },
      {
        label: "Olympic Career / Withdrawal (2021)",
        hobbies: ["Mental health advocacy (after withdrawing from Olympics citing mental health)"],
      },
      {
        label: "Post-Break / Comeback",
        hobbies: ["Horseback riding lessons", "Ice skating", "Pilates", "Long walks", "Therapy and spa days with husband"],
      },
    ],
    surprisingHobbies: [
      "Horseback riding and ice skating — never had time before due to 24/7 gym training",
      "Values 'doing nothing' as a radical act after years of constant training",
      "Hunger Games superfan",
      "Her 2021 mental health withdrawal ultimately fueled her greatest comeback",
    ],
    hobbyInfluence:
      "Her 2021 withdrawal and discovery of life outside gymnastics ultimately fueled her return — she came back stronger and more dominant than ever. Horseback riding and new physical activities kept her body engaged without gym pressure. Finding hobbies helped her redefine her relationship with gymnastics: 'now it's just a part of what I do.'",
    quote: {
      text: "Whenever I find hobbies and do little things outside, that's when I'm the best version of myself. In the gym, that's when I'm the most successful.",
    },
  },
  {
    slug: "leonardo-da-vinci",
    name: "Leonardo da Vinci",
    knownFor: "Renaissance polymath — painter (Mona Lisa, The Last Supper), inventor, scientist, and anatomist",
    emoji: "🎨",
    born: "1452–1519",
    phases: [
      {
        label: "Childhood / Youth",
        hobbies: ["Obsessive nature observation", "Apprenticeship in Verrocchio's workshop", "Drawing"],
      },
      {
        label: "Young Adult (Milan)",
        hobbies: ["Music (arrived at Duke Sforza's court primarily as a musician with a handmade lyre)", "Singing", "Anatomy dissection"],
      },
      {
        label: "Career",
        hobbies: ["Human anatomy (dissected 30+ corpses)", "Invention (parachutes, underwater breathing, armored cars)", "Notebook keeping (painting, architecture, mechanics, anatomy)", "Cooking and kitchen gadgets"],
      },
      {
        label: "Later Life",
        hobbies: ["Architecture", "Mathematics", "Geology", "Astronomy", "Botany", "Cartography"],
      },
    ],
    surprisingHobbies: [
      "His primary role when he arrived in Milan was as a musician — he built a lyre shaped like a horse's head",
      "Invented swimming fins at age 11",
      "Obsessed with kitchen gadgets and nutrition — an early foodie, likely vegetarian",
      "Dissected over 30 human corpses as a self-driven anatomy hobby",
    ],
    hobbyInfluence:
      "Anatomical dissection made his paintings anatomically revolutionary. Musical training gave him understanding of rhythm and proportion in visual art. Nature observation was the foundation of his scientific and artistic insights. His refusal to specialize — treating everything as a hobby worth mastering — made him history's greatest polymath.",
    quote: {
      text: "I have from an early age abjured the use of meat, and the time will come when men such as I will look upon the murder of animals as they now look on the murder of men.",
    },
  },
  {
    slug: "winston-churchill",
    name: "Winston Churchill",
    knownFor: "British Prime Minister during WWII, Nobel Prize-winning author, statesman",
    emoji: "🎖️",
    born: "1874–1965",
    phases: [
      {
        label: "Childhood / Youth",
        hobbies: ["Avid reading", "Writing", "Toy soldiers (collection of 1,500)"],
      },
      {
        label: "Discovery of Painting (age 40)",
        hobbies: ["Watercolors (started during family holiday 1915 after Gallipoli resignation)", "Oil painting (quickly switched)"],
      },
      {
        label: "Middle Life (Chartwell Estate)",
        hobbies: ["Bricklaying (got an apprentice card in the bricklayers' union)", "Landscaping (built lakes, rockery, waterfall)", "Animal keeping (ducks, black swans, goldfish, pigs, cats)"],
      },
      {
        label: "Later Life",
        hobbies: ["Painting (500+ works total)", "Writing (Nobel Prize in Literature 1953)", "Gardening"],
      },
    ],
    surprisingHobbies: [
      "Got a union apprentice card as a bricklayer — laid bricks at Chartwell with his own hands",
      "Produced over 500 oil paintings despite zero formal art training",
      "Kept pedigreed Middle White pigs and black swans at Chartwell",
      "Rebuilt much of his country estate largely by himself",
    ],
    hobbyInfluence:
      "Painting saved his mental health during his darkest political moment — after Gallipoli — and became his lifelong therapy against depression ('the black dog'). Bricklaying and landscaping gave him physical release during political exile. He wrote that creative leisure was essential to effective leadership in his essay 'Painting as a Pastime.'",
    quote: {
      text: "Happy are the painters for they shall not be lonely. Light and colour, peace and hope, will keep them company to the end, or almost to the end, of the day.",
    },
  },
  {
    slug: "benjamin-franklin",
    name: "Benjamin Franklin",
    knownFor: "Founding Father, inventor, diplomat, printer, scientist, and author",
    emoji: "🔑",
    born: "1706–1790",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Swimming (lifelong passion from childhood in Boston)", "Kite flying (used a kite to pull himself across a pond)", "Reading (couldn't remember a time when he couldn't read)"],
      },
      {
        label: "Young Adult",
        hobbies: ["Writing and publishing (Poor Richard's Almanack)", "Chess (one of the earliest players in America)", "Printing"],
      },
      {
        label: "Middle Life (retired at 42)",
        hobbies: ["Electricity experiments", "Invention (lightning rod, bifocals, Franklin stove, glass armonica)", "Number theory and mathematics"],
      },
      {
        label: "Later Life",
        hobbies: ["Diplomacy", "Science", "Glass armonica playing", "Chess"],
      },
    ],
    surprisingHobbies: [
      "Invented swimming fins at age 11",
      "Used a kite to pull himself across a pond as a child — decades before his famous lightning experiment",
      "Retired at 42 to pursue hobbies full-time — those hobbies became some of history's most important inventions",
      "Played chess so seriously he wrote an essay about it ('The Morals of Chess')",
    ],
    hobbyInfluence:
      "Childhood swimming led to his invention of swim fins. Reading and writing as hobbies became his printing career. His 'retirement hobbies' in science and invention became his greatest legacy. Chess trained his strategic and diplomatic thinking. His kite experiments as a child foreshadowed his lightning research decades later.",
    quote: {
      text: "Of all my inventions, the glass armonica has given me the greatest personal satisfaction.",
    },
  },
  {
    slug: "frida-kahlo",
    name: "Frida Kahlo",
    knownFor: "Mexican painter, icon of self-portraiture, feminist and cultural symbol",
    emoji: "🌺",
    born: "1907–1954",
    phases: [
      {
        label: "Childhood",
        hobbies: ["Soccer", "Swimming", "Boxing and wrestling (encouraged by her father to aid recovery from polio)", "Pre-med studies (dreamed of becoming a doctor)"],
      },
      {
        label: "Teens (after bus accident at 18)",
        hobbies: ["Painting in bed (her mother had a special easel made)", "Oil painting (using her father's brushes)"],
      },
      {
        label: "Career",
        hobbies: ["Painting (143 works, 55 self-portraits)", "Political activism (Mexican Communist Party)", "Tehuana dress as creative identity"],
      },
      {
        label: "Later Life",
        hobbies: ["Painting through chronic pain", "Personal suffering as artistic material"],
      },
    ],
    surprisingHobbies: [
      "Played soccer, boxed, and wrestled as a girl in 1910s Mexico — highly unusual for the era",
      "Originally wanted to be a doctor, not an artist",
      "Painting began entirely as therapy during bedridden recovery from her bus accident",
      "Married and divorced the same person (Diego Rivera) twice",
    ],
    hobbyInfluence:
      "Childhood sports gave her the resilience and fighting spirit that defined her life. Her medical interest informed her anatomically precise and psychologically penetrating self-portraits. Painting — which started as a bedridden hobby — became one of the 20th century's most influential art careers. Wrestling and boxing, fighting against limitations, became the metaphor of her entire artistic identity.",
    quote: {
      text: "I paint myself because I am so often alone and because I am the subject I know best. Painting has made my life full. Painting has replaced everything.",
    },
  },
  {
    slug: "michael-jordan",
    name: "Michael Jordan",
    knownFor: "6x NBA champion, 5x MVP, considered the greatest basketball player of all time",
    emoji: "🏀",
    born: "b. 1963",
    phases: [
      {
        label: "Childhood / Teens",
        hobbies: ["Baseball and basketball", "Was cut from varsity basketball team as a sophomore"],
      },
      {
        label: "Career (Basketball)",
        hobbies: ["Golf (obsessively during off-seasons)", "Gambling (well-documented)", "Competitive games of any kind"],
      },
      {
        label: "First Retirement (1993–1995)",
        hobbies: ["Professional baseball (Birmingham Barons, AA minor league)"],
      },
      {
        label: "Post-Basketball",
        hobbies: ["Golf (built private course The Grove XXIII in Hobe Sound, Florida)", "Fishing (to learn patience for golf)", "Team ownership (Charlotte Hornets)", "Tequila brand (Cincoro)"],
      },
    ],
    surprisingHobbies: [
      "Built his own private golf course (The Grove XXIII) — one of the most exclusive in the country",
      "Bets up to $300,000 on a single golf hole",
      "Took up fishing specifically to practice patience — a quality he famously lacked during his playing days",
      "Actually played professional minor league baseball during his first retirement",
    ],
    hobbyInfluence:
      "His competitive nature in gambling and golf is the same drive that made him the greatest basketball player. His baseball retirement showed how deeply childhood dreams persist. Golf became his post-basketball identity and mental health outlet. Fishing taught him patience — ironic for a player famous for his relentless aggression.",
    quote: {
      text: "For a competitive junkie like me, golf is a great solution because it smacks you in the face every time you think you have accomplished something. That to me has taken over a lot of the energy and competitiveness for basketball.",
    },
  },
];
