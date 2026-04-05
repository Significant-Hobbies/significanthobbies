import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

function createDb() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
  const client = createClient({ url, authToken });
  return drizzle(client, { schema });
}

const famousTimelines = [
  {
    email: "stevejobs@significanthobbies.demo",
    name: "Steve Jobs",
    username: "stevejobs",
    avatarSeed: "steve",
    timeline: {
      title: "Steve Jobs — From calligraphy to Apple",
      slug: "steve-jobs-journey",
      phases: [
        {
          id: "sj1",
          label: "Childhood / Teens",
          order: 0,
          hobbies: [
            { name: "Electronics tinkering" },
            { name: "Swimming" },
            { name: "Reading" },
          ],
        },
        {
          id: "sj2",
          label: "College / Early Career",
          order: 1,
          hobbies: [
            { name: "Calligraphy" },
            { name: "Yoga" },
            { name: "Meditation" },
          ],
        },
        {
          id: "sj3",
          label: "Peak Career (Apple era)",
          order: 2,
          hobbies: [
            { name: "Walking" },
            { name: "Meditation" },
            { name: "Reading" },
          ],
        },
      ],
    },
  },
  {
    email: "einstein@significanthobbies.demo",
    name: "Albert Einstein",
    username: "alberteinstein",
    avatarSeed: "albert",
    timeline: {
      title: "Einstein — Violin, sailing, and the universe",
      slug: "einstein-journey",
      phases: [
        {
          id: "ae1",
          label: "Childhood (Germany)",
          order: 0,
          hobbies: [
            { name: "Violin" },
            { name: "Reading" },
            { name: "Puzzles" },
          ],
        },
        {
          id: "ae2",
          label: "University / Patent Office",
          order: 1,
          hobbies: [
            { name: "Violin" },
            { name: "Sailing" },
            { name: "Philosophy" },
            { name: "Hiking" },
          ],
        },
        {
          id: "ae3",
          label: "Princeton years",
          order: 2,
          hobbies: [
            { name: "Violin" },
            { name: "Sailing" },
            { name: "Reading" },
          ],
        },
      ],
    },
  },
  {
    email: "feynman@significanthobbies.demo",
    name: "Richard Feynman",
    username: "richardfeynman",
    avatarSeed: "richard",
    timeline: {
      title: "Feynman — Bongos, safecracking, and physics",
      slug: "feynman-journey",
      phases: [
        {
          id: "rf1",
          label: "Childhood (Far Rockaway)",
          order: 0,
          hobbies: [
            { name: "Electronics tinkering" },
            { name: "Puzzles" },
            { name: "Reading" },
          ],
        },
        {
          id: "rf2",
          label: "MIT / Los Alamos",
          order: 1,
          hobbies: [
            { name: "Drums" },
            { name: "Puzzles" },
            { name: "Lock picking" },
          ],
        },
        {
          id: "rf3",
          label: "Caltech years",
          order: 2,
          hobbies: [
            { name: "Drums" },
            { name: "Drawing" },
            { name: "Painting" },
            { name: "Language learning" },
          ],
        },
      ],
    },
  },
  {
    email: "juliachild@significanthobbies.demo",
    name: "Julia Child",
    username: "juliachild",
    avatarSeed: "julia",
    timeline: {
      title: "Julia Child — The ultimate late bloomer",
      slug: "julia-child-journey",
      phases: [
        {
          id: "jc1",
          label: "Childhood / College",
          order: 0,
          hobbies: [
            { name: "Basketball" },
            { name: "Tennis" },
            { name: "Golf" },
          ],
        },
        {
          id: "jc2",
          label: "WWII / OSS (20s-30s)",
          order: 1,
          hobbies: [
            { name: "Writing" },
            { name: "Travel" },
          ],
        },
        {
          id: "jc3",
          label: "Paris (age 36+)",
          order: 2,
          hobbies: [
            { name: "Cooking" },
            { name: "Writing" },
            { name: "Wine tasting" },
          ],
        },
        {
          id: "jc4",
          label: "TV career (50s-80s)",
          order: 3,
          hobbies: [
            { name: "Cooking" },
            { name: "Gardening" },
            { name: "Travel" },
            { name: "Writing" },
          ],
        },
      ],
    },
  },
  {
    email: "obama@significanthobbies.demo",
    name: "Barack Obama",
    username: "barackobama",
    avatarSeed: "barack",
    timeline: {
      title: "Obama — Basketball, books, and playlists",
      slug: "obama-journey",
      phases: [
        {
          id: "bo1",
          label: "Childhood (Hawaii)",
          order: 0,
          hobbies: [
            { name: "Basketball" },
            { name: "Reading" },
            { name: "Bodysurfing" },
          ],
        },
        {
          id: "bo2",
          label: "College / Community organizing",
          order: 1,
          hobbies: [
            { name: "Basketball" },
            { name: "Writing" },
            { name: "Reading" },
          ],
        },
        {
          id: "bo3",
          label: "Presidency",
          order: 2,
          hobbies: [
            { name: "Basketball" },
            { name: "Golf" },
            { name: "Reading" },
            { name: "Cooking" },
          ],
        },
        {
          id: "bo4",
          label: "Post-presidency",
          order: 3,
          hobbies: [
            { name: "Writing" },
            { name: "Golf" },
            { name: "Cooking" },
            { name: "Reading" },
            { name: "Painting" },
          ],
        },
      ],
    },
  },
  {
    email: "billgates@significanthobbies.demo",
    name: "Bill Gates",
    username: "billgates",
    avatarSeed: "Bill Gates",
    timeline: {
      title: "Bill Gates — From encyclopedias to Think Weeks",
      slug: "bill-gates-journey",
      phases: [
        {
          id: "bg1",
          label: "Childhood",
          order: 0,
          hobbies: [
            { name: "Reading" },
            { name: "Chess" },
            { name: "Math" },
            { name: "Strategy board games" },
          ],
        },
        {
          id: "bg2",
          label: "Teens / Early Career",
          order: 1,
          hobbies: [
            { name: "Programming" },
            { name: "Deep reading" },
            { name: "Computer tinkering" },
          ],
        },
        {
          id: "bg3",
          label: "Career Peak",
          order: 2,
          hobbies: [
            { name: "Think Weeks (solo reading retreats)" },
            { name: "Bridge" },
            { name: "Reading (a book a week)" },
          ],
        },
        {
          id: "bg4",
          label: "Later Life",
          order: 3,
          hobbies: [
            { name: "Tennis" },
            { name: "Settlers of Catan" },
            { name: "Reading nonfiction" },
            { name: "Philanthropic travel" },
          ],
        },
      ],
    },
  },
  {
    email: "arnoldschwarzenegger@significanthobbies.demo",
    name: "Arnold Schwarzenegger",
    username: "arnoldschwarzenegger",
    avatarSeed: "Arnold Schwarzenegger",
    timeline: {
      title: "Arnold Schwarzenegger — Chess, tanks, and iron",
      slug: "arnold-schwarzenegger-journey",
      phases: [
        {
          id: "as1",
          label: "Childhood",
          order: 0,
          hobbies: [
            { name: "Chess" },
            { name: "Physical fitness" },
          ],
        },
        {
          id: "as2",
          label: "Teens / Military",
          order: 1,
          hobbies: [
            { name: "Bodybuilding" },
            { name: "Tank operation" },
            { name: "Weightlifting" },
          ],
        },
        {
          id: "as3",
          label: "Hollywood Career",
          order: 2,
          hobbies: [
            { name: "Chess" },
            { name: "Horseback riding" },
            { name: "Scuba diving" },
            { name: "Reading biographies" },
          ],
        },
        {
          id: "as4",
          label: "Later Life",
          order: 3,
          hobbies: [
            { name: "Chess" },
            { name: "Reading" },
            { name: "Classical music" },
          ],
        },
      ],
    },
  },
  {
    email: "leonardodavinci@significanthobbies.demo",
    name: "Leonardo da Vinci",
    username: "leonardodavinci",
    avatarSeed: "Leonardo da Vinci",
    timeline: {
      title: "Leonardo da Vinci — The original polymath",
      slug: "leonardo-da-vinci-journey",
      phases: [
        {
          id: "ldv1",
          label: "Childhood / Youth",
          order: 0,
          hobbies: [
            { name: "Nature observation" },
            { name: "Drawing" },
            { name: "Painting apprenticeship" },
          ],
        },
        {
          id: "ldv2",
          label: "Young Adult (Milan)",
          order: 1,
          hobbies: [
            { name: "Music (lyre)" },
            { name: "Singing" },
            { name: "Anatomy dissection" },
          ],
        },
        {
          id: "ldv3",
          label: "Career",
          order: 2,
          hobbies: [
            { name: "Invention" },
            { name: "Anatomy (30+ dissections)" },
            { name: "Notebook keeping" },
            { name: "Cooking and kitchen gadgets" },
          ],
        },
        {
          id: "ldv4",
          label: "Later Life",
          order: 3,
          hobbies: [
            { name: "Architecture" },
            { name: "Mathematics" },
            { name: "Astronomy" },
            { name: "Botany" },
          ],
        },
      ],
    },
  },
  {
    email: "beyonce@significanthobbies.demo",
    name: "Beyoncé",
    username: "beyonce",
    avatarSeed: "Beyonce",
    timeline: {
      title: "Beyoncé — From talent shows to beekeeping",
      slug: "beyonce-journey",
      phases: [
        {
          id: "bey1",
          label: "Childhood",
          order: 0,
          hobbies: [
            { name: "Dance (from age 7)" },
            { name: "Talent shows (35 consecutive wins)" },
            { name: "Opera voice lessons" },
          ],
        },
        {
          id: "bey2",
          label: "Teens",
          order: 1,
          hobbies: [
            { name: "Running while singing (stamina training)" },
            { name: "Obsessive repetition practice" },
          ],
        },
        {
          id: "bey3",
          label: "Career Peak",
          order: 2,
          hobbies: [
            { name: "Swimming" },
            { name: "Horror movies" },
            { name: "Nintendo video games" },
            { name: "Italian cooking" },
          ],
        },
        {
          id: "bey4",
          label: "Later Life",
          order: 3,
          hobbies: [
            { name: "Beekeeping (80,000 bees)" },
            { name: "Cooking" },
            { name: "Family" },
          ],
        },
      ],
    },
  },
  {
    email: "harukimurakami@significanthobbies.demo",
    name: "Haruki Murakami",
    username: "harukimurakami",
    avatarSeed: "Haruki Murakami",
    timeline: {
      title: "Haruki Murakami — Jazz bars, vinyl, and marathons",
      slug: "haruki-murakami-journey",
      phases: [
        {
          id: "hm1",
          label: "Teens",
          order: 0,
          hobbies: [
            { name: "Jazz (Art Blakey concert at 15)" },
            { name: "Vinyl record collecting" },
          ],
        },
        {
          id: "hm2",
          label: "Young Adult",
          order: 1,
          hobbies: [
            { name: "Running a jazz bar (Peter Cat)" },
            { name: "Vinyl collecting (10,000+ records)" },
          ],
        },
        {
          id: "hm3",
          label: "Career (Novelist)",
          order: 2,
          hobbies: [
            { name: "Marathon running (started 1982)" },
            { name: "Reading (2 hours daily)" },
            { name: "Ultramarathon running" },
          ],
        },
        {
          id: "hm4",
          label: "Later Life",
          order: 3,
          hobbies: [
            { name: "Running" },
            { name: "Reading" },
            { name: "Vinyl collecting" },
            { name: "Radio hosting" },
          ],
        },
      ],
    },
  },
];

async function main() {
  const db = createDb();
  console.log("Seeding database with famous hobby journeys...");

  // Remove old demo timelines
  for (const slug of ["demo-alex", "demo-sam", "demo-jordan"]) {
    const existing = await db.query.timelines.findFirst({
      where: eq(schema.timelines.slug, slug),
    });
    if (existing) {
      await db.delete(schema.timelines).where(eq(schema.timelines.slug, slug));
      console.log(`  Removed old demo: ${slug}`);
    }
  }

  // Seed famous timelines
  for (const demo of famousTimelines) {
    // Upsert user
    let user = await db.query.users.findFirst({
      where: eq(schema.users.email, demo.email),
    });

    if (user) {
      await db
        .update(schema.users)
        .set({ username: demo.username, name: demo.name })
        .where(eq(schema.users.id, user.id));
    } else {
      const [newUser] = await db
        .insert(schema.users)
        .values({
          email: demo.email,
          name: demo.name,
          username: demo.username,
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${demo.name}`,
        })
        .returning();
      user = newUser!;
    }

    // Upsert timeline
    const existingTimeline = await db.query.timelines.findFirst({
      where: eq(schema.timelines.slug, demo.timeline.slug),
    });

    const now = new Date();
    if (existingTimeline) {
      await db
        .update(schema.timelines)
        .set({
          phases: JSON.stringify(demo.timeline.phases),
          title: demo.timeline.title,
          updatedAt: now,
        })
        .where(eq(schema.timelines.id, existingTimeline.id));
    } else {
      await db.insert(schema.timelines).values({
        userId: user.id,
        title: demo.timeline.title,
        visibility: "PUBLIC",
        slug: demo.timeline.slug,
        phases: JSON.stringify(demo.timeline.phases),
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log(`  Done: ${demo.name} (@${demo.username})`);
  }
  console.log("Seeding complete!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
