import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client.js";

async function createDb() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
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
];

async function main() {
  const db = await createDb();
  console.log("🌱 Seeding database with famous hobby journeys...");

  try {
    // Remove old demo timelines
    for (const slug of ["demo-alex", "demo-sam", "demo-jordan"]) {
      const existing = await db.timeline.findUnique({ where: { slug } });
      if (existing) {
        await db.timeline.delete({ where: { slug } });
        console.log(`  🗑 Removed old demo: ${slug}`);
      }
    }

    // Seed famous timelines
    for (const demo of famousTimelines) {
      const user = await db.user.upsert({
        where: { email: demo.email },
        update: { username: demo.username, name: demo.name },
        create: {
          email: demo.email,
          name: demo.name,
          username: demo.username,
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${demo.name}`,
        },
      });

      await db.timeline.upsert({
        where: { slug: demo.timeline.slug },
        update: { phases: JSON.stringify(demo.timeline.phases), title: demo.timeline.title },
        create: {
          userId: user.id,
          title: demo.timeline.title,
          visibility: "PUBLIC",
          slug: demo.timeline.slug,
          phases: JSON.stringify(demo.timeline.phases),
        },
      });

      console.log(`  ✓ ${demo.name} (@${demo.username})`);
    }
    console.log("✅ Seeding complete!");
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
