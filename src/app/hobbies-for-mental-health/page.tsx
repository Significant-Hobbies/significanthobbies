import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "~/components/json-ld";

export const metadata: Metadata = {
  title: "15 Hobbies That Improve Mental Health — Science-Backed | SignificantHobbies",
  description:
    "Discover 15 science-backed hobbies that genuinely improve mental health — from yoga and running to gardening and writing. Learn why each one works.",
};

function hobbySlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

type MentalHealthHobby = {
  name: string;
  benefit: string;
  why: string;
};

const HOBBIES: MentalHealthHobby[] = [
  {
    name: "Yoga",
    benefit: "Reduces cortisol & anxiety",
    why: "Yoga activates the parasympathetic nervous system — your rest-and-digest mode. Even 20 minutes of mindful movement measurably lowers cortisol, the body's primary stress hormone. The breath-focus component trains the same attentional circuits used in meditation.",
  },
  {
    name: "Running",
    benefit: "Triggers endorphins & builds resilience",
    why: "The 'runner's high' is real — aerobic exercise floods the brain with endorphins and endocannabinoids, producing genuine euphoria. More importantly, running builds psychological resilience: learning to push through discomfort in training carries over into life.",
  },
  {
    name: "Gardening",
    benefit: "Grounding & sensory restoration",
    why: "Contact with soil exposes you to Mycobacterium vaccae, a soil bacteria linked to serotonin production. Beyond the biology, gardening demands slow, sensory attention — the opposite of screen-based anxiety loops. Watching something grow over weeks is itself therapeutic.",
  },
  {
    name: "Writing",
    benefit: "Emotional processing & self-understanding",
    why: "Expressive writing — journaling, letters you never send, raw stream-of-consciousness — forces you to translate emotions into language, which activates the prefrontal cortex and dampens the amygdala's stress response. It also creates a record of your thinking you can return to.",
  },
  {
    name: "Cooking",
    benefit: "Mindfulness & sense of accomplishment",
    why: "Cooking requires full sensory presence: you're chopping, smelling, tasting, adjusting. This is informal mindfulness. Completing a meal also provides a tangible, shareable result — rare in modern knowledge work. The act of feeding others is psychologically nourishing too.",
  },
  {
    name: "Swimming",
    benefit: "Reduces anxiety & improves sleep",
    why: "The rhythmic, repetitive motion of swimming in water has a uniquely calming effect on the nervous system. Water immersion reduces muscle tension. Regular swimmers report better sleep quality and lower generalized anxiety scores in multiple studies.",
  },
  {
    name: "Music",
    benefit: "Mood regulation & emotional release",
    why: "Playing an instrument engages both hemispheres of the brain simultaneously, creating a form of neural integration that relieves rumination. Even listening to music you love triggers dopamine release. Playing music for others adds a social dimension that amplifies the effect.",
  },
  {
    name: "Drawing",
    benefit: "Attention restoration & stress relief",
    why: "Drawing forces you into the present — you can't draw what you're not looking at. This shifts attention from internal worry loops to external observation. Art therapists use drawing specifically for trauma processing because it bypasses verbal defenses.",
  },
  {
    name: "Hiking",
    benefit: "Reduces rumination & restores attention",
    why: "A Stanford study found that walking in nature for 90 minutes reduced activity in the subgenual prefrontal cortex — the brain region associated with repetitive negative thoughts. Hiking combines exercise, nature exposure, and often social connection.",
  },
  {
    name: "Volunteering",
    benefit: "Meaning, connection & perspective",
    why: "Volunteering is one of the most evidence-backed mood interventions available. It activates the brain's reward centers, combats loneliness, provides structure, and forces you outside your own concerns. People who volunteer regularly report higher life satisfaction across age groups.",
  },
  {
    name: "Chess",
    benefit: "Cognitive flow & escape from worry",
    why: "Chess demands total mental engagement — there's no cognitive bandwidth left for anxious rumination. The flow state it induces (fully absorbed, challenged-but-capable) is one of the most reliable mood-elevating states humans can access.",
  },
  {
    name: "Dance",
    benefit: "Joy, body confidence & social bonding",
    why: "Dance combines physical exercise, music, rhythm, and social coordination in a single activity. The social touch involved in partner dancing triggers oxytocin. Improvisational dance is particularly powerful for releasing held tension and reconnecting with bodily pleasure.",
  },
  {
    name: "Bird watching",
    benefit: "Mindful attention & wonder",
    why: "Birding retrains scattered attention toward acute, present-moment observation. Recent research found that seeing or hearing more bird species is associated with greater wellbeing — the effect is similar to the feeling of encountering natural beauty. It also gets you outside, reliably.",
  },
  {
    name: "Reading",
    benefit: "Empathy, escapism & cognitive calm",
    why: "Fiction reading measurably increases empathy by simulating other minds and experiences. Six minutes of reading reduces heart rate and muscle tension by up to 68% according to University of Sussex research — more effective than listening to music or going for a walk.",
  },
  {
    name: "Ceramics",
    benefit: "Tactile grounding & creative flow",
    why: "Working with clay is intensely physical and demands fine motor attention — the exact combination that interrupts anxiety spirals. Clay's responsiveness provides immediate feedback: you shape it, it shapes back. Pottery studios are also socially warm environments that reduce isolation.",
  },
];

export default function HobbiesForMentalHealthPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "15 Hobbies That Improve Mental Health — Science-Backed",
          description:
            "Discover 15 science-backed hobbies that genuinely improve mental health. Learn the mechanism behind each one.",
          author: { "@type": "Organization", name: "SignificantHobbies" },
          publisher: { "@type": "Organization", name: "SignificantHobbies" },
        }}
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What hobbies help with anxiety?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Four hobbies with strong evidence for reducing anxiety: Yoga (activates the parasympathetic nervous system and lowers cortisol), Gardening (grounding through sensory attention and soil contact), Journaling or writing (translates emotions into language, dampening the amygdala's stress response), and Walking or hiking (rhythmic movement in nature resets the nervous system)."
            }
          },
          {
            "@type": "Question",
            "name": "Can hobbies improve mental health?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Research consistently shows that engaged leisure activity improves mental health through three main mechanisms: flow state (complete absorption that quiets rumination), social connection (belonging and shared purpose), and sense of accomplishment (tangible progress that counters feelings of stagnation). Even 2-3 hours of hobby engagement per week produces measurable improvements in wellbeing."
            }
          },
          {
            "@type": "Question",
            "name": "What is the best hobby for depression?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Three hobbies with particularly strong evidence for depression: Running (aerobic exercise releases endorphins and endocannabinoids, producing genuine mood elevation — comparable to antidepressants in some studies), Gardening (contact with soil bacteria linked to serotonin production, plus the therapeutic effect of watching something grow), and Cooking (mindful, sensory engagement that produces a tangible, shareable result — rare in modern life)."
            }
          }
        ]
      }} />

      <div className="mb-6">
        <Link href="/hobbies" className="text-sm text-stone-500 hover:text-stone-700">
          ← Hobby Directory
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-stone-900 mb-4">
        15 Hobbies That Improve Mental Health — Science-Backed
      </h1>
      <p className="text-lg text-stone-500 mb-4 leading-relaxed">
        Hobbies aren&apos;t a luxury — they&apos;re one of the most effective, accessible mental health tools available. Research consistently shows that engaged leisure activity reduces anxiety, counters depression, builds resilience, and even slows cognitive decline.
      </p>
      <p className="text-lg text-stone-500 mb-8 leading-relaxed">
        Three mechanisms explain most of the effect: <strong className="text-stone-700">flow state</strong> (full absorption that quiets rumination), <strong className="text-stone-700">social connection</strong> (most hobbies create community), and <strong className="text-stone-700">identity</strong> (having a self beyond work and roles). Below are 15 hobbies with strong evidence behind them — and an explanation of exactly why each one works.
      </p>

      <div className="space-y-6">
        {HOBBIES.map((hobby, i) => (
          <div
            key={hobby.name}
            className="rounded-xl border border-stone-200 bg-white p-6 hover:border-emerald-200 transition-colors"
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-3 mb-2">
                  <Link
                    href={`/hobbies/${hobbySlug(hobby.name)}`}
                    className="text-lg font-bold text-stone-900 hover:text-emerald-700 transition-colors"
                  >
                    {hobby.name}
                  </Link>
                  <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-medium text-emerald-700">
                    {hobby.benefit}
                  </span>
                </div>
                <p className="text-stone-600 leading-relaxed text-sm">{hobby.why}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-stone-50 border border-stone-200 p-6">
        <h2 className="text-base font-bold text-stone-800 mb-2">A note on consistency</h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          The mental health benefits of hobbies are cumulative and dose-dependent. A single session of yoga is pleasant. Two hundred sessions builds a different kind of person. The key isn&apos;t finding the perfect hobby — it&apos;s finding one you&apos;ll actually return to, and returning to it.
        </p>
      </div>

      <div className="mt-12 rounded-xl bg-emerald-50 border border-emerald-200 p-8 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Find your perfect hobby</h2>
        <p className="text-stone-500 mb-4">
          Take our 2-minute quiz for personalized recommendations based on your personality, schedule, and what you want to get out of it.
        </p>
        <Link
          href="/find-your-hobby"
          className="inline-flex rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          Take the Quiz →
        </Link>
      </div>
    </div>
  );
}
