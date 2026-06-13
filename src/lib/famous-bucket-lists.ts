export type BucketItemStatus = "planned" | "done";

export type BucketItemCategory =
  | "travel"
  | "adventure"
  | "creative"
  | "achievement"
  | "social"
  | "humanitarian";

export type FamousBucketItem = {
  title: string;
  description: string;
  category: BucketItemCategory;
  status: BucketItemStatus;
  completedNote?: string;
};

export type FamousBucketSource = {
  label: string; // e.g. "CNN Politics, Feb 2017"
  url: string;   // actual verified URL
};

export type FamousBucketList = {
  slug: string;
  name: string;
  knownFor: string;
  emoji: string;
  items: FamousBucketItem[];
  quote?: { text: string; attribution?: string };
  sources?: FamousBucketSource[];
};

export const FAMOUS_BUCKET_LISTS: FamousBucketList[] = [
  {
    slug: "will-smith",
    name: "Will Smith",
    knownFor: "Actor & producer who turned 50 into a bucket-list TV series",
    emoji: "🎬",
    items: [
      {
        title: "Bungee jump from a helicopter over the Grand Canyon",
        description: "Leap into one of the world's most iconic landscapes from a hovering helicopter.",
        category: "adventure",
        status: "done",
        completedNote: "Completed live on YouTube on his 50th birthday, September 25, 2018.",
      },
      {
        title: "Skydive in Dubai",
        description: "Freefall over the Palm Jumeirah with the desert skyline below.",
        category: "adventure",
        status: "done",
        completedNote: "Convinced wife Jada Pinkett Smith to join him.",
      },
      {
        title: "Race a Formula 1 car",
        description: "Get behind the wheel of an F1 car at a real racing circuit.",
        category: "adventure",
        status: "done",
        completedNote: "Raced in Abu Dhabi as part of his Facebook Watch bucket-list series.",
      },
      {
        title: "Swim with sharks",
        description: "Enter the ocean with one of nature's apex predators.",
        category: "adventure",
        status: "done",
        completedNote: "Documented and filmed during his bucket-list series.",
      },
      {
        title: "Perform stand-up comedy in front of a sold-out crowd",
        description: "Take the stage alone with only your wit and a microphone.",
        category: "creative",
        status: "done",
        completedNote: "Pulled off with help from Dave Chappelle coaching him backstage.",
      },
      {
        title: "Run a half marathon in Cuba with 3 weeks of prep",
        description: "Train for 13.1 miles in under a month, then run it in a foreign country.",
        category: "achievement",
        status: "done",
        completedNote: "Completed in Havana, Cuba, documented in his series.",
      },
      {
        title: "Dance in a Bollywood movie",
        description: "Perform a full Bollywood dance number alongside professional dancers.",
        category: "creative",
        status: "done",
        completedNote: "Fulfilled during his 50th-birthday bucket-list journey.",
      },
    ],
    quote: {
      text: "The secret to life is to die knowing that you squeezed everything you could out of it.",
    },
    sources: [
      { label: "Variety – Facebook Watch 'Bucket List' series (2019)", url: "https://variety.com/2019/digital/news/will-smith-bucket-list-facebook-watch-1203150965/" },
    ],
  },
  {
    slug: "barack-obama",
    name: "Barack Obama",
    knownFor: "44th U.S. President — pursued personal adventures within weeks of leaving office",
    emoji: "🇺🇸",
    items: [
      {
        title: "Learn to kitesurf",
        description: "Master the art of riding the wind and waves on a kitesurf board.",
        category: "adventure",
        status: "done",
        completedNote: "Went to Richard Branson's Necker Island less than a month after leaving the White House. Beat Branson in a kitesurf vs. foilboard challenge.",
      },
      {
        title: "Visit Stonehenge",
        description: "Stand among the ancient megaliths and experience 5,000 years of history.",
        category: "travel",
        status: "done",
        completedNote: "Visited during the 2014 NATO summit — \"knocked it off the bucket list\" in his own words.",
      },
      {
        title: "Build a film and TV production company",
        description: "Create original stories that reflect diverse human experiences.",
        category: "achievement",
        status: "done",
        completedNote: "Founded Higher Ground Productions; signed a landmark deal with Netflix to produce films and series.",
      },
      {
        title: "Write a presidential memoir",
        description: "Capture the story of your time in office for history and future generations.",
        category: "creative",
        status: "done",
        completedNote: "Published A Promised Land in November 2020 — it sold 890,000 copies on its first day.",
      },
    ],
    quote: {
      text: "The best way to not feel hopeless is to get up and do something.",
    },
    sources: [
      { label: "CNN Politics – Obama kitesurfing on Necker Island (Feb 2017)", url: "https://www.cnn.com/2017/02/07/politics/barack-obama-kitesurfing-richard-branson/index.html" },
    ],
  },
  {
    slug: "richard-branson",
    name: "Richard Branson",
    knownFor: "Virgin Group founder — serial bucket-lister who chases world records",
    emoji: "🎈",
    items: [
      {
        title: "Cross the Atlantic Ocean in a hot air balloon",
        description: "Float from mainland to mainland across 3,000 miles of open ocean in a balloon.",
        category: "adventure",
        status: "done",
        completedNote: "Completed in 1987, setting a Guinness World Record for the fastest Atlantic crossing by balloon.",
      },
      {
        title: "Cross the Pacific Ocean in a hot air balloon",
        description: "Cross 6,700 miles from Japan to Canada at speeds up to 245 mph.",
        category: "adventure",
        status: "done",
        completedNote: "Completed in 1991 in 47 hours — another world record.",
      },
      {
        title: "Go to space",
        description: "Leave Earth's atmosphere and see our planet from the void of space.",
        category: "adventure",
        status: "done",
        completedNote: "Flew aboard Virgin Galactic's VSS Unity in July 2021, beating Jeff Bezos to space by nine days.",
      },
      {
        title: "Climb Mount Toubkal in the Atlas Mountains",
        description: "Summit the highest peak in North Africa outside Marrakech.",
        category: "adventure",
        status: "planned",
      },
    ],
    quote: {
      text: "You don't learn to walk by following rules. You learn by doing and by falling over.",
    },
    sources: [
      { label: "Virgin Galactic – first fully crewed spaceflight (Jul 2021)", url: "https://www.virgingalactic.com/articles/virgin-galactic-completes-first-fully-crewed-spaceflight/" },
    ],
  },
  {
    slug: "mark-zuckerberg",
    name: "Mark Zuckerberg",
    knownFor: "Meta co-founder — runs a new personal challenge every year as his bucket list",
    emoji: "💻",
    items: [
      {
        title: "Learn Mandarin Chinese",
        description: "Achieve conversational fluency in the world's most-spoken language.",
        category: "achievement",
        status: "done",
        completedNote: "His 2010 annual challenge. Delivered a 30-minute Q&A entirely in Mandarin at Tsinghua University in 2014.",
      },
      {
        title: "Only eat meat from animals you personally raised or hunted",
        description: "Develop a direct, honest relationship with the food you consume.",
        category: "social",
        status: "done",
        completedNote: "His 2011 challenge. Started with a lobster, then worked up to a goat and a pig — learned to stun, slaughter, and butcher them himself.",
      },
      {
        title: "Build an AI assistant for your home",
        description: "Create a voice-controlled AI that manages lights, music, temperature, and your day.",
        category: "achievement",
        status: "done",
        completedNote: "His 2016 challenge. Built 'Jarvis,' voiced by Morgan Freeman, that controlled his home and learned his preferences.",
      },
      {
        title: "Have meaningful conversations in all 50 U.S. states",
        description: "Travel every state and connect with people outside your usual circles.",
        category: "social",
        status: "done",
        completedNote: "His 2017 challenge. Visited factories, churches, farms, and community centers across all 50 states.",
      },
      {
        title: "Earn a black belt in Brazilian jiu-jitsu",
        description: "Commit to years of mat time to master the gentle art.",
        category: "achievement",
        status: "planned",
      },
    ],
    quote: {
      text: "The biggest risk is not taking any risk. In a world that's changing quickly, the only strategy guaranteed to fail is not taking risks.",
    },
    sources: [
      { label: "Inc. – How Zuckerberg keeps his personal challenges (2016)", url: "https://www.inc.com/julie-anne-exter/how-mark-zuckerberg-keeps-his-ridiculously-challenging-new-years-resolutions.html" },
    ],
  },
  {
    slug: "oprah-winfrey",
    name: "Oprah Winfrey",
    knownFor: "Media mogul and philanthropist who builds her bucket list around sensory experiences",
    emoji: "📺",
    items: [
      {
        title: "Go truffle hunting in Italy",
        description: "Trek through Florentine forests with trained pigs and dogs hunting the rarest fungi.",
        category: "travel",
        status: "done",
        completedNote: "Planned every summer for years before finally doing it with Gayle King in Tuscany in 2014.",
      },
      {
        title: "Hot air balloon ride over the Serengeti",
        description: "Drift at dawn over the African savanna watching wildlife move across the plains.",
        category: "travel",
        status: "done",
        completedNote: "Completed on safari with partner Stedman Graham — she described it as one of the most peaceful experiences of her life.",
      },
      {
        title: "Support a generation of African girls through education",
        description: "Build and sustain a school that gives girls a path out of poverty.",
        category: "humanitarian",
        status: "done",
        completedNote: "The Oprah Winfrey Leadership Academy for Girls in South Africa has graduated thousands of young women since 2007.",
      },
    ],
    quote: {
      text: "The biggest adventure you can take is to live the life of your dreams.",
    },
    sources: [
      { label: "E! Online – Oprah checks truffle hunting off her bucket list (Oct 2014)", url: "https://www.eonline.com/news/588680/oprah-winfrey-checks-another-item-off-her-bucket-list-truffle-hunting-with-gayle-king-in-italy" },
    ],
  },
  {
    slug: "bill-clinton",
    name: "Bill Clinton",
    knownFor: "42nd U.S. President who splits his bucket list into an 'A list' and 'B list'",
    emoji: "🏛️",
    items: [
      {
        title: "Ride a horse across the Mongolian steppes to where Genghis Khan is buried",
        description: "Travel the same ancient land routes to imagine life in Genghis Khan's horde.",
        category: "travel",
        status: "planned",
      },
      {
        title: "Climb Mount Kilimanjaro before the glaciers melt",
        description: "Summit Africa's highest peak while its famous snows still crown the summit.",
        category: "adventure",
        status: "planned",
      },
      {
        title: "Run a marathon",
        description: "Complete 26.2 miles on foot before your body won't allow it anymore.",
        category: "achievement",
        status: "planned",
      },
      {
        title: "Visit Namibia to see the oldest desert in the world",
        description: "Stand in the Namib Desert — 55 million years of sculpted silence.",
        category: "travel",
        status: "planned",
      },
      {
        title: "Live to see your grandchildren grow up",
        description: "Be present for the life milestones of the next generation you helped create.",
        category: "social",
        status: "done",
        completedNote: "Clinton called this the top item on his 'A list' — the most meaningful goal, not the most dramatic.",
      },
    ],
    quote: {
      text: "There is nothing wrong with America that cannot be cured with what is right with America.",
    },
    sources: [
      { label: "CBS News – Clinton bucket list: Kilimanjaro and grandkids", url: "https://www.cbsnews.com/news/bill-clintons-bucket-list-seeing-grandkids-and-climbing-kilimanjaro/" },
      { label: "ABC News – Clinton bucket list includes riding horse in Mongolia", url: "https://abcnews.go.com/Politics/bill-clinton-bucket-list-includes-riding-horse-mongolia/story?id=25707905" },
    ],
  },
  {
    slug: "serena-williams",
    name: "Serena Williams",
    knownFor: "Tennis legend whose post-retirement bucket list is built around wilderness and family",
    emoji: "🎾",
    items: [
      {
        title: "Hike the Pacific Crest Trail end to end",
        description: "Walk 2,650 miles from Mexico to Canada through some of America's wildest terrain.",
        category: "adventure",
        status: "planned",
      },
      {
        title: "Free-climb the big walls of Yosemite",
        description: "Scale El Capitan or Half Dome using nothing but hands, feet, and a rope.",
        category: "adventure",
        status: "planned",
      },
      {
        title: "Visit all seven wonders of the world with your daughters",
        description: "Experience humanity's greatest achievements through the eyes of the people you love most.",
        category: "travel",
        status: "planned",
      },
      {
        title: "Be volunteer of the year at your daughter's school",
        description: "Show up not as a celebrity, but as a present and involved parent.",
        category: "social",
        status: "planned",
      },
      {
        title: "Have a second child",
        description: "Grow your family and give your child a sibling.",
        category: "social",
        status: "done",
        completedNote: "Her daughter Adira River Ohanian was born in 2023.",
      },
    ],
    quote: {
      text: "Tennis has been my whole life, but I want to have a life where I'm not just tennis.",
    },
    sources: [
      { label: "SportsKeeda – Serena Williams' plans after retirement", url: "https://www.sportskeeda.com/tennis/tennis-chosen-i-loved-choice-now-first-time-entire-life-i-m-choosing-something-serena-williams-plans-ambitions-following-retirement-tennis" },
    ],
  },
  {
    slug: "elon-musk",
    name: "Elon Musk",
    knownFor: "SpaceX and Tesla CEO whose entire bucket list is civilization-scale",
    emoji: "🚀",
    items: [
      {
        title: "Die on Mars",
        description: "Not the dying part — but living on another planet long enough that Mars becomes home.",
        category: "adventure",
        status: "planned",
      },
      {
        title: "Establish a self-sustaining city on Mars with over 1 million people",
        description: "Build the first off-world city that can survive and grow without resupply from Earth.",
        category: "humanitarian",
        status: "planned",
      },
      {
        title: "Make humanity a multi-planetary species before extinction risks close the window",
        description: "Ensure there is always a backup of human civilization somewhere other than Earth.",
        category: "humanitarian",
        status: "planned",
      },
    ],
    quote: {
      text: "I would like to die on Mars. Just not on impact.",
    },
    sources: [
      { label: "Futurism – Elon Musk's main goal: get humanity to Mars before he dies", url: "https://futurism.com/the-byte/elon-musk-main-goal-get-humanity-mars-before-die" },
    ],
  },
  {
    slug: "bill-gates",
    name: "Bill Gates",
    knownFor: "Microsoft co-founder who traded personal bucket-list items for philanthropic missions",
    emoji: "💊",
    items: [
      {
        title: "Eradicate polio from the planet",
        description: "Finish what vaccines started and make polio the second human disease ever fully eliminated.",
        category: "humanitarian",
        status: "planned",
      },
      {
        title: "Visit Antarctica",
        description: "Stand on the most remote and pristine continent on Earth.",
        category: "travel",
        status: "done",
        completedNote: "Visited Antarctica as one of his personal travel milestones alongside his philanthropic work.",
      },
      {
        title: "Tour the Large Hadron Collider with your kids",
        description: "Walk the 27-km tunnel where physicists discovered the Higgs boson particle.",
        category: "achievement",
        status: "done",
        completedNote: "Made the trip with his children to bring abstract physics to life.",
      },
      {
        title: "Ensure every child on Earth can access life-saving vaccines",
        description: "Eliminate the geography-of-birth lottery that determines whether a child survives their first years.",
        category: "humanitarian",
        status: "planned",
      },
    ],
    quote: {
      text: "Don't die. (His literal answer when asked what's left on his bucket list — he was only half joking.)",
    },
    sources: [
      { label: "Benzinga – what Bill Gates has left on his bucket list (Jan 2025)", url: "https://www.benzinga.com/personal-finance/25/01/42992135/billionaire-bill-gates-was-asked-whats-left-on-his-bucket-list-he-reveals-theres-only-one-thing-dont-die" },
    ],
  },
  {
    slug: "ryan-reynolds",
    name: "Ryan Reynolds",
    knownFor: "Actor and entrepreneur who turned fandom and friendship into career milestones",
    emoji: "🎭",
    items: [
      {
        title: "Perform on Broadway",
        description: "Take the stage in a live Broadway production — no second takes, no safety net.",
        category: "creative",
        status: "planned",
      },
      {
        title: "Star in a movie with Will Ferrell",
        description: "Work alongside the comedy legend in a proper feature film.",
        category: "creative",
        status: "done",
        completedNote: "Co-starred in Spirited (2022). Called it 'an experience of a lifetime' and 'a bucket list item forever.'",
      },
    ],
    quote: {
      text: "I always thought I'd be the older brother. I was born to be the older brother.",
    },
    sources: [
      { label: "Broadway World – Ryan Reynolds: Broadway is on the bucket list (Jul 2015)", url: "https://www.broadwayworld.com/article/Ryan-Reynolds-Exchanged-Broadway-for-Parenthood-Broadways-On-the-Bucket-List-20150711" },
    ],
  },
  {
    slug: "shaquille-oneal",
    name: "Shaquille O'Neal",
    knownFor: "NBA Hall of Famer who says he's 'mostly done everything' except two big ones",
    emoji: "🏀",
    items: [
      {
        title: "Skydive",
        description: "Jump out of a plane and freefall at 120 mph before the parachute opens.",
        category: "adventure",
        status: "planned",
      },
      {
        title: "Climb Mount Kilimanjaro",
        description: "Reach the 19,341-foot summit of Africa's highest peak.",
        category: "adventure",
        status: "planned",
      },
    ],
    quote: {
      text: "I've mostly done everything that I've set out to do. Now I just need to get in tip-top shape for these last two.",
    },
    sources: [
      { label: "Yahoo Entertainment – Shaq shares last things on his bucket list", url: "https://www.yahoo.com/entertainment/shaquille-oneal-shares-last-things-212049793.html" },
    ],
  },
  {
    slug: "dwayne-johnson",
    name: "Dwayne Johnson",
    knownFor: "Actor and former wrestler whose bucket list extends into creative and artistic dreams",
    emoji: "💪",
    items: [
      {
        title: "Make a Christmas movie",
        description: "Create a big-hearted holiday film that families watch together every year.",
        category: "creative",
        status: "done",
        completedNote: "Made Red One (2024) with Amazon MGM. Called it 'a bucket list thing now checked off.'",
      },
      {
        title: "Become a country singer",
        description: "Record original country music and perform it live on stage.",
        category: "creative",
        status: "planned",
      },
    ],
    quote: {
      text: "Success isn't always about greatness. It's about consistency. Consistent hard work gains success.",
    },
    sources: [
      { label: "IMDb News – Dwayne Johnson on Red One as a bucket list achievement (2024)", url: "https://m.imdb.com/news/ni64938197" },
    ],
  },
];

export function getFamousBucketList(slug: string): FamousBucketList | undefined {
  return FAMOUS_BUCKET_LISTS.find((l) => l.slug === slug);
}

export const BUCKET_ITEM_CATEGORIES: Record<BucketItemCategory, { label: string; emoji: string }> = {
  travel: { label: "Travel", emoji: "✈️" },
  adventure: { label: "Adventure", emoji: "⛰️" },
  creative: { label: "Creative", emoji: "🎨" },
  achievement: { label: "Achievement", emoji: "🏆" },
  social: { label: "Social", emoji: "❤️" },
  humanitarian: { label: "Humanitarian", emoji: "🌍" },
};
