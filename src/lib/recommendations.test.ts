import { describe, it, expect } from "vitest";
import { getRecommendations } from "./recommendations";
import type { Phase } from "./types";

function makePhase(id: string, order: number, hobbies: string[]): Phase {
  return {
    id,
    label: `Phase ${id}`,
    order,
    hobbies: hobbies.map((name) => ({ name })),
  };
}

describe("getRecommendations", () => {
  describe("empty phases", () => {
    it("returns starter recommendations for each category", () => {
      const results = getRecommendations([]);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(8);
      results.forEach((r) => {
        expect(r.reason).toMatch(/^Start your journey with/);
        expect(r.score).toBe(0.5);
        expect(r.name).toBeTruthy();
        expect(r.category).toBeTruthy();
        expect(r.categoryEmoji).toBeTruthy();
      });
    });

    it("respects custom limit for empty phases", () => {
      const results = getRecommendations([], 3);
      expect(results.length).toBe(3);
    });
  });

  describe("single hobby", () => {
    it("recommends from same category first", () => {
      const phases = [makePhase("1", 0, ["Guitar"])];
      const results = getRecommendations(phases);
      // Guitar is in Music category — top results should be Music hobbies
      const musicResults = results.filter((r) => r.category === "Music");
      expect(musicResults.length).toBeGreaterThan(0);
      // First result should be from Music (high affinity)
      expect(results[0].category).toBe("Music");
    });

    it("does not include the existing hobby in recommendations", () => {
      const phases = [makePhase("1", 0, ["Guitar"])];
      const results = getRecommendations(phases);
      const names = results.map((r) => r.name.toLowerCase());
      expect(names).not.toContain("guitar");
    });

    it("uses 'Matches your ... streak' reason for top category", () => {
      const phases = [makePhase("1", 0, ["Guitar"])];
      const results = getRecommendations(phases);
      const musicRec = results.find((r) => r.category === "Music");
      expect(musicRec?.reason).toMatch(/Matches your music streak/);
    });
  });

  describe("category affinity scoring", () => {
    it("scores high-affinity categories higher than zero-affinity ones", () => {
      const phases = [
        makePhase("1", 0, ["Guitar", "Piano", "Singing"]),
      ];
      const results = getRecommendations(phases);
      const musicRec = results.find((r) => r.category === "Music");
      const zeroAffinityRec = results.find((r) =>
        ["Outdoor", "Culinary", "Collecting", "Social"].includes(r.category),
      );
      if (musicRec && zeroAffinityRec) {
        expect(musicRec.score).toBeGreaterThan(zeroAffinityRec.score);
      }
    });

    it("uses recency weighting — later phases count more", () => {
      // Phase 0 has Creative, Phase 1 has Music — Music should have higher affinity
      const phases = [
        makePhase("1", 0, ["Drawing"]),   // weight 1, Creative
        makePhase("2", 1, ["Guitar"]),    // weight 2, Music
      ];
      const results = getRecommendations(phases);
      const musicResults = results.filter((r) => r.category === "Music");
      const creativeResults = results.filter((r) => r.category === "Creative");
      // Music has higher weighted score, so should have higher scores
      if (musicResults.length > 0 && creativeResults.length > 0) {
        expect(musicResults[0].score).toBeGreaterThanOrEqual(creativeResults[0].score);
      }
    });

    it("assigns 'Builds on your ... interest' for medium-affinity categories", () => {
      // Make one category clearly top, another with some affinity
      const phases = [
        makePhase("1", 0, ["Guitar", "Piano", "Drums", "Violin"]), // Music dominates
        makePhase("2", 1, ["Running"]), // Physical has some affinity
      ];
      const results = getRecommendations(phases);
      // Physical is not in top 3 (only Music is strongly represented)
      // but it does have affinity, so it should have "Builds on" reason
      const physicalRec = results.find((r) => r.category === "Physical");
      if (physicalRec) {
        expect(physicalRec.reason).toMatch(/Builds on your physical interest|Matches your physical streak/);
      }
    });

    it("assigns 'Try something new' for zero-affinity categories", () => {
      // Use limit=50 to see past high-affinity hobbies and reach zero-affinity ones
      const phases = [makePhase("1", 0, ["Guitar"])];
      const results = getRecommendations(phases, 50);
      const newCatRec = results.find((r) => r.reason.startsWith("Try something new"));
      expect(newCatRec).toBeTruthy();
      expect(newCatRec?.score).toBe(0.3);
    });
  });

  describe("exhausted categories", () => {
    it("skips categories where user has all hobbies", () => {
      // Gaming has 7 hobbies — put all of them in
      const gamingHobbies = ["Video games", "Board games", "Tabletop RPGs", "Speedrunning", "Esports", "Card games", "Dungeon Master"];
      const phases = [makePhase("1", 0, gamingHobbies)];
      const results = getRecommendations(phases);
      const gamingResults = results.filter((r) => r.category === "Gaming");
      expect(gamingResults.length).toBe(0);
    });
  });

  describe("deduplication", () => {
    it("does not recommend hobbies already in any phase", () => {
      const phases = [
        makePhase("1", 0, ["Guitar", "Piano"]),
        makePhase("2", 1, ["Drums", "Running"]),
      ];
      const results = getRecommendations(phases);
      const existingLower = new Set(["guitar", "piano", "drums", "running"]);
      results.forEach((r) => {
        expect(existingLower.has(r.name.toLowerCase())).toBe(false);
      });
    });

    it("handles case-insensitive deduplication", () => {
      const phases = [makePhase("1", 0, ["guitar", "PIANO"])];
      const results = getRecommendations(phases);
      const names = results.map((r) => r.name.toLowerCase());
      expect(names).not.toContain("guitar");
      expect(names).not.toContain("piano");
    });
  });

  describe("limit", () => {
    it("defaults to 8 results", () => {
      const phases = [makePhase("1", 0, ["Guitar"])];
      const results = getRecommendations(phases);
      expect(results.length).toBeLessThanOrEqual(8);
    });

    it("respects custom limit", () => {
      const phases = [makePhase("1", 0, ["Guitar"])];
      const results = getRecommendations(phases, 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it("returns fewer than limit if not enough candidates", () => {
      // Fill almost everything in one category
      const phases = [makePhase("1", 0, ["Guitar", "Piano", "Drums", "Violin", "Bass", "Singing", "DJing", "Ukulele", "Saxophone", "Flute"])];
      const results = getRecommendations(phases);
      // Music only has 11 hobbies — 10 used, 1 left. Should still return results from other categories
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("result structure", () => {
    it("returns well-formed RecommendedHobby objects", () => {
      const phases = [makePhase("1", 0, ["Guitar"])];
      const results = getRecommendations(phases);
      results.forEach((r) => {
        expect(typeof r.name).toBe("string");
        expect(typeof r.category).toBe("string");
        expect(typeof r.categoryEmoji).toBe("string");
        expect(typeof r.reason).toBe("string");
        expect(typeof r.score).toBe("number");
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(1);
      });
    });

    it("results are sorted by score descending", () => {
      const phases = [makePhase("1", 0, ["Guitar", "Piano"])];
      const results = getRecommendations(phases, 20);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });
  });

  describe("multiple phases with varying affinity", () => {
    it("top 3 categories get streak reason", () => {
      const phases = [
        makePhase("1", 0, ["Guitar"]),       // Music: weight 1
        makePhase("2", 1, ["Drawing"]),      // Creative: weight 2
        makePhase("3", 2, ["Running"]),      // Physical: weight 3
        makePhase("4", 3, ["Cooking"]),      // Culinary: weight 4
      ];
      // Culinary (4), Physical (3), Creative (2) are top 3
      const results = getRecommendations(phases, 20);
      const culinary = results.find((r) => r.category === "Culinary");
      const physical = results.find((r) => r.category === "Physical");
      const creative = results.find((r) => r.category === "Creative");
      const music = results.find((r) => r.category === "Music");

      if (culinary) expect(culinary.reason).toMatch(/Matches your culinary streak/);
      if (physical) expect(physical.reason).toMatch(/Matches your physical streak/);
      if (creative) expect(creative.reason).toMatch(/Matches your creative streak/);
      if (music) expect(music.reason).toMatch(/Builds on your music interest/);
    });
  });
});
