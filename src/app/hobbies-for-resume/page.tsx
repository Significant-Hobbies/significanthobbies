import type { Metadata } from 'next';
import Link from 'next/link';

import { JsonLd } from '~/components/json-ld';

export const metadata: Metadata = {
  title: '30 Impressive Hobbies to Put on Your Resume | SignificantHobbies',
  description:
    'Learn which hobbies to include on your resume and why. 30 hobbies organized by what they signal to employers — leadership, creativity, discipline, and more.',
};

function hobbySlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

type ResumeHobby = {
  name: string;
  signal: string;
};

type Category = {
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hobbies: ResumeHobby[];
};

const CATEGORIES: Category[] = [
  {
    title: 'Leadership & Initiative',
    description: 'These hobbies show you take charge, organize others, and drive outcomes.',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hobbies: [
      {
        name: 'Volunteering',
        signal:
          'Demonstrates civic commitment and initiative. If you&apos;ve held a coordinator or lead role, mention it — it&apos;s effectively management experience.',
      },
      {
        name: 'Improv comedy',
        signal:
          'Shows quick thinking, leadership in unstructured environments, and the ability to support teammates under pressure.',
      },
      {
        name: 'Theater',
        signal:
          'Directing or producing theater is genuine project management — budgets, timelines, people, audiences.',
      },
      {
        name: 'Hosting dinners',
        signal:
          'Signals warmth, organizational skill, and the ability to create environments where people thrive. Underrated on a resume.',
      },
      {
        name: 'Dungeon Master',
        signal:
          'Running tabletop RPGs requires storytelling, improvisation, conflict resolution, and sustained creative leadership for a group.',
      },
    ],
  },
  {
    title: 'Creativity & Innovation',
    description:
      'These signal original thinking, aesthetic judgment, and the ability to produce something from nothing.',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hobbies: [
      {
        name: 'Photography',
        signal:
          'Compositional eye, attention to detail, and often technical skills in editing software. Directly applicable to marketing and design roles.',
      },
      {
        name: 'Songwriting',
        signal:
          'Writing original music signals creative courage — finishing and sharing a creative work is harder than it looks.',
      },
      {
        name: 'Graphic design',
        signal:
          'A technical creative skill with direct professional applications. Portfolio-linked hobbies are especially powerful.',
      },
      {
        name: 'Filmmaking',
        signal:
          'End-to-end creative projects: planning, execution, editing, storytelling. One well-made short film says more than a line on a resume.',
      },
      {
        name: '3D printing',
        signal:
          'Bridges creativity and technical precision. Signals comfort with emerging technology and hands-on problem solving.',
      },
      {
        name: 'Music production',
        signal:
          'Technical artistry. Learning to produce music involves software, acoustics, arrangement, and relentless iteration.',
      },
    ],
  },
  {
    title: 'Discipline & Consistency',
    description:
      'These demonstrate the ability to commit, practice deliberately, and improve over time.',
    color: 'text-foreground',
    bgColor: 'bg-foreground/10',
    borderColor: 'border-foreground/20',
    hobbies: [
      {
        name: 'Running',
        signal:
          'Training for a race requires sustained goal-setting, delayed gratification, and recovery from setbacks. Mention a specific goal or race.',
      },
      {
        name: 'Martial arts',
        signal:
          'Belt progression is a direct analogy for professional advancement — visible milestones, earned through consistent practice.',
      },
      {
        name: 'Guitar',
        signal:
          'Learning a string instrument to competence is a multi-year commitment. It signals patience and intrinsic motivation.',
      },
      {
        name: 'Chess',
        signal:
          'Rated chess players have a measurable skill level. A meaningful ELO score or tournament history is a concrete signal of analytical capability.',
      },
      {
        name: 'Language learning',
        signal:
          'Reaching conversational or professional fluency in a second language is one of the most impressive long-game disciplines visible to employers.',
      },
      {
        name: 'Yoga',
        signal:
          'Shows a commitment to physical discipline and mental regulation — traits that correlate with high performance.',
      },
    ],
  },
  {
    title: 'Teamwork & Collaboration',
    description: 'These show you work well with others, support teammates, and share credit.',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hobbies: [
      {
        name: 'Basketball',
        signal:
          'Team sports are the original teamwork classroom. Position awareness, communication, adapting to others&apos; styles — all transferable.',
      },
      {
        name: 'Book club',
        signal:
          'Organizing or sustaining a book club signals intellectual humility and the ability to facilitate group discussion without dominating it.',
      },
      {
        name: 'Band or ensemble',
        signal:
          'Playing in a group requires listening more than playing. Musicians who can play ensemble music understand coordination deeply.',
      },
      {
        name: 'Rowing',
        signal:
          'Crew is the most team-dependent sport there is — the boat moves as one or not at all. Exceptional signal for collaborative culture fits.',
      },
      {
        name: 'Tabletop RPGs',
        signal:
          'Co-op tabletop gaming demands collaborative problem-solving, creative compromise, and sustained group engagement.',
      },
    ],
  },
  {
    title: 'Problem-Solving & Analysis',
    description:
      'These signal a systematic mind — the ability to break down complexity and think through problems.',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    hobbies: [
      {
        name: 'Coding',
        signal:
          'Building personal projects is often more impressive than coursework. What you&apos;ve built is what matters — link to it.',
      },
      {
        name: 'Woodworking',
        signal:
          'Precise measurements, understanding material properties, planning cuts — woodworking demands spatial reasoning and analytical patience.',
      },
      {
        name: 'Electronics',
        signal:
          'Circuits don&apos;t lie. Debugging electronic projects is pure analytical work, and the outcome is either right or wrong.',
      },
      {
        name: 'Astronomy',
        signal:
          'Navigating the night sky, understanding orbital mechanics, or contributing to citizen science projects signals deep curiosity and analytical rigor.',
      },
      {
        name: 'Puzzles',
        signal:
          'Competitive puzzling (speed-solving, cryptics) is a direct measure of pattern recognition and working memory. Worth mentioning if you&apos;re competitive at it.',
      },
      {
        name: 'Philosophy',
        signal:
          'A serious philosophy hobby signals comfort with ambiguity, rigorous argumentation, and reading difficult material carefully — valuable in research and strategy roles.',
      },
      {
        name: 'Fermentation',
        signal:
          'Fermentation is applied microbiology. Troubleshooting a failed ferment requires hypothesis-testing and iteration — the scientific method in your kitchen.',
      },
      {
        name: 'Mathematics',
        signal:
          'Recreational mathematics — puzzles, proofs, competition math — signals raw analytical capability that few other hobbies match.',
      },
    ],
  },
];

export default function HobbiesForResumePage() {
  const total = CATEGORIES.reduce((sum, c) => sum + c.hobbies.length, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: '30 Impressive Hobbies to Put on Your Resume',
          description:
            'Learn which hobbies to include on your resume and why. 30 hobbies organized by what they signal to employers.',
          author: { '@type': 'Organization', name: 'SignificantHobbies' },
          publisher: { '@type': 'Organization', name: 'SignificantHobbies' },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What hobbies look good on a resume?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Five hobbies that consistently impress employers: Volunteering (signals civic commitment and initiative), Chess (signals strategic thinking and patience), Marathon running or endurance sports (signals discipline and goal-setting), Open-source coding or creative portfolio work (directly demonstrates skills), and Teaching or coaching (signals communication and leadership). The key is choosing hobbies that signal traits relevant to the role.',
              },
            },
            {
              '@type': 'Question',
              name: 'Should I put hobbies on my resume?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: "Yes, when done intentionally. A hobbies section humanizes you beyond your work history, signals personality and culture fit, and can demonstrate transferable skills. It's especially valuable for early-career candidates, career changers, and roles where personality matters (sales, management, creative fields). Keep it to 2-4 hobbies and choose ones that signal something useful about you.",
              },
            },
            {
              '@type': 'Question',
              name: 'What hobbies show leadership?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Three hobby categories that directly signal leadership: Team sports (especially captain or organizer roles — shows you perform under pressure and support teammates), Volunteering (especially coordinator or lead positions — this is genuine management experience), and Dungeon Mastering or running tabletop RPGs (requires sustained creative leadership, conflict resolution, and improvisation for a group — underrated on a resume).',
              },
            },
          ],
        }}
      />

      <div className="mb-6">
        <Link href="/hobbies" className="text-sm text-muted-foreground hover:text-foreground">
          ← Hobby Directory
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-4">
        {total} Impressive Hobbies to Put on Your Resume
      </h1>
      <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
        The hobbies section of a resume is either an afterthought or a differentiator. Done well, it
        signals personality, discipline, and transferable skills that work history alone can&apos;t
        convey. Done poorly, it&apos;s filler that interviewers skip.
      </p>
      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
        The rule: only include a hobby if you can speak about it substantively in an interview.
        Depth beats breadth. Below are {total} hobbies organized by what they communicate — pick the
        ones that genuinely reflect you, then be ready to talk about them.
      </p>

      <div className="mb-8 rounded-xl bg-amber-400/10 border border-amber-400/30 p-5">
        <h2 className="text-sm font-bold text-amber-300 mb-1">How to choose what to include</h2>
        <ul className="space-y-1.5 text-sm text-amber-300">
          <li>
            Include hobbies where you&apos;ve reached a notable level — a rank, a project, a
            milestone
          </li>
          <li>
            Match hobbies to the role: creative hobbies for creative roles, analytical for
            analytical
          </li>
          <li>Mention the community aspect if relevant — clubs, competitions, teaching others</li>
          <li>Never include something you can&apos;t discuss for 60 seconds unprompted</li>
        </ul>
      </div>

      <div className="space-y-10">
        {CATEGORIES.map((cat) => (
          <section key={cat.title}>
            <div className={`rounded-lg ${cat.bgColor} border ${cat.borderColor} px-5 py-4 mb-4`}>
              <h2 className={`text-lg font-bold ${cat.color} mb-1`}>{cat.title}</h2>
              <p className="text-sm text-muted-foreground">{cat.description}</p>
            </div>
            <ul className="space-y-3">
              {cat.hobbies.map((hobby) => (
                <li
                  key={hobby.name}
                  className="flex gap-4 rounded-lg border border-border bg-card p-4 hover:border-foreground/30 transition-colors"
                >
                  <div className="flex-1">
                    <Link
                      href={`/hobbies/${hobbySlug(hobby.name)}`}
                      className="font-semibold text-foreground hover:text-foreground transition-colors"
                    >
                      {hobby.name}
                    </Link>
                    <p
                      className="mt-1 text-sm text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: hobby.signal }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-foreground/10 border border-foreground/20 p-8 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Build your hobby timeline</h2>
        <p className="text-muted-foreground mb-4">
          Track your hobbies over time — a visual record of the skills, communities, and experiences
          you&apos;ve built. Useful for interviews, applications, and self-understanding.
        </p>
        <Link
          href="/timeline/new"
          className="inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-colors"
        >
          Build your timeline →
        </Link>
        <div className="mt-4">
          <Link
            href="/find-your-hobby"
            className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Or take the quiz to find a new hobby →
          </Link>
        </div>
      </div>
    </div>
  );
}
