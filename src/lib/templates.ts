export type TimelineTemplate = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  phases: Array<{
    label: string;
    ageStart?: number;
    ageEnd?: number;
    suggestedHobbies: string[];
  }>;
};

export const TIMELINE_TEMPLATES: TimelineTemplate[] = [
  {
    id: 'blank',
    name: 'Blank timeline',
    emoji: '✨',
    description: 'Start from scratch with empty phases',
    phases: [],
  },
  {
    id: 'life-journey',
    name: 'Life journey',
    emoji: '🗺️',
    description: 'Classic childhood → teen → adult arc',
    phases: [
      {
        label: 'Childhood',
        ageStart: 5,
        ageEnd: 12,
        suggestedHobbies: ['Drawing', 'LEGO', 'Reading', 'Football', 'Swimming'],
      },
      {
        label: 'Teen years',
        ageStart: 13,
        ageEnd: 18,
        suggestedHobbies: ['Guitar', 'Gaming', 'Photography', 'Running', 'Anime'],
      },
      {
        label: 'College',
        ageStart: 18,
        ageEnd: 22,
        suggestedHobbies: ['Coding', 'Hiking', 'Cooking', 'Gym', 'Writing'],
      },
      {
        label: 'Career start',
        ageStart: 22,
        ageEnd: 28,
        suggestedHobbies: ['Yoga', 'Cycling', 'Reading', 'Travel', 'Side projects'],
      },
    ],
  },
  {
    id: 'creative',
    name: 'The creative',
    emoji: '🎨',
    description: 'For artists, makers, and creative souls',
    phases: [
      {
        label: 'First sparks',
        suggestedHobbies: ['Drawing', 'Painting', 'Origami', 'Clay', 'Colouring'],
      },
      {
        label: 'Finding style',
        suggestedHobbies: ['Watercolour', 'Digital art', 'Photography', 'Journaling', 'Collage'],
      },
      {
        label: 'Going deeper',
        suggestedHobbies: [
          'Oil painting',
          'Graphic design',
          'Illustration',
          'Ceramics',
          'Filmmaking',
        ],
      },
      {
        label: 'Sharing work',
        suggestedHobbies: ['Blogging', 'YouTube', 'Instagram art', 'Etsy', 'Gallery shows'],
      },
    ],
  },
  {
    id: 'athlete',
    name: 'The athlete',
    emoji: '🏃',
    description: 'Track your sporting evolution over time',
    phases: [
      {
        label: 'Playground days',
        suggestedHobbies: ['Football', 'Swimming', 'Tag', 'Cricket', 'Cycling'],
      },
      {
        label: 'School sports',
        suggestedHobbies: ['Basketball', 'Athletics', 'Tennis', 'Badminton', 'Volleyball'],
      },
      {
        label: 'Serious training',
        suggestedHobbies: ['Gym', 'Running', 'Martial arts', 'Rock climbing', 'CrossFit'],
      },
      {
        label: 'Now',
        suggestedHobbies: ['Trail running', 'Triathlon', 'Yoga', 'Pilates', 'Hiking'],
      },
    ],
  },
  {
    id: 'techie',
    name: 'The techie',
    emoji: '💻',
    description: 'From first computer to side projects',
    phases: [
      {
        label: 'First computer',
        suggestedHobbies: [
          'Gaming',
          'Flash games',
          'LEGO Technic',
          'Robotics club',
          'Typing games',
        ],
      },
      {
        label: 'Learning to build',
        suggestedHobbies: ['Coding', 'Arduino', 'Minecraft', 'App ideas', 'YouTube tutorials'],
      },
      {
        label: 'Building things',
        suggestedHobbies: [
          'Web development',
          'Open source',
          'Game dev',
          '3D printing',
          'Raspberry Pi',
        ],
      },
      {
        label: 'Shipping',
        suggestedHobbies: ['Side projects', 'Blogging', 'Podcasting', 'Teaching', 'Hackathons'],
      },
    ],
  },
  {
    id: 'explorer',
    name: 'The explorer',
    emoji: '🌍',
    description: 'Curiosity-driven, always trying new things',
    phases: [
      {
        label: 'Early curiosity',
        suggestedHobbies: [
          'Collecting stamps',
          'Bug hunting',
          'Astronomy',
          'Magic tricks',
          'Board games',
        ],
      },
      {
        label: 'Discovery phase',
        suggestedHobbies: [
          'Language learning',
          'Cooking',
          'Travel',
          'History books',
          'Documentaries',
        ],
      },
      {
        label: 'Going deep',
        suggestedHobbies: ['Scuba diving', 'Mountaineering', 'Foraging', 'Astronomy', 'Philosophy'],
      },
      {
        label: 'Sharing finds',
        suggestedHobbies: [
          'Writing',
          'Teaching',
          'Travel blogging',
          'Podcast',
          'Wikipedia editing',
        ],
      },
    ],
  },
];
