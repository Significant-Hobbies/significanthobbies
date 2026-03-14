import { describe, it, expect } from "vitest";
import { findRediscoveryOpportunities } from "./rediscovery";
import type { Phase } from "./types";

// Helper to build a Phase quickly
function makePhase(id: string, label: string, order: number, hobbies: string[]): Phase {
  return { id, label, order, hobbies: hobbies.map((name) => ({ name })) };
}

describe("findRediscoveryOpportunities", () => {
  describe("edge cases", () => {
    it("returns empty results for empty phases array", () => {
      const result = findRediscoveryOpportunities([]);
      expect(result.dropped).toEqual([]);
      expect(result.dormant).toEqual([]);
      expect(result.rekindleCandidates).toEqual([]);
    });

    it("returns empty results for single phase", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Childhood", 0, ["drawing", "cycling"]),
      ]);
      expect(result.dropped).toEqual([]);
      expect(result.dormant).toEqual([]);
      expect(result.rekindleCandidates).toEqual([]);
    });

    it("returns empty dropped/dormant when all hobbies present in all phases", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Phase 1", 0, ["reading", "cycling"]),
        makePhase("2", "Phase 2", 1, ["reading", "cycling"]),
        makePhase("3", "Phase 3", 2, ["reading", "cycling"]),
      ]);
      expect(result.dropped).toEqual([]);
      expect(result.dormant).toEqual([]);
    });

    it("hobby only in last phase is NOT dropped", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Phase 1", 0, ["reading"]),
        makePhase("2", "Phase 2", 1, ["reading", "newHobby"]),
      ]);
      const names = result.dropped.map((d) => d.name);
      expect(names).not.toContain("newhobby");
      expect(names).not.toContain("newHobby");
    });
  });

  describe("dropped hobbies", () => {
    it("detects hobby present in earlier phase but absent in last phase", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Childhood", 0, ["drawing", "cycling"]),
        makePhase("2", "Teen", 1, ["cycling", "gaming"]),
        makePhase("3", "Adult", 2, ["gaming", "hiking"]),
      ]);
      const names = result.dropped.map((d) => d.name);
      expect(names).toContain("drawing");
      expect(names).toContain("cycling");
      expect(names).not.toContain("gaming");
      expect(names).not.toContain("hiking");
    });

    it("includes correct lastSeenPhase and totalPhases", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Childhood", 0, ["drawing", "cycling"]),
        makePhase("2", "Teen", 1, ["cycling"]),
        makePhase("3", "Adult", 2, ["hiking"]),
      ]);
      const drawing = result.dropped.find((d) => d.name === "drawing");
      expect(drawing).toBeDefined();
      expect(drawing!.lastSeenPhase).toBe("Childhood");
      expect(drawing!.totalPhases).toBe(1);

      const cycling = result.dropped.find((d) => d.name === "cycling");
      expect(cycling).toBeDefined();
      expect(cycling!.lastSeenPhase).toBe("Teen");
      expect(cycling!.totalPhases).toBe(2);
    });

    it("is case-insensitive", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Phase 1", 0, ["Drawing"]),
        makePhase("2", "Phase 2", 1, ["drawing"]),
        makePhase("3", "Phase 3", 2, ["hiking"]),
      ]);
      const names = result.dropped.map((d) => d.name);
      expect(names).toContain("drawing");
      expect(names).not.toContain("Drawing");
    });

    it("sorts by totalPhases descending", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Phase 1", 0, ["a", "b", "c"]),
        makePhase("2", "Phase 2", 1, ["a", "b"]),
        makePhase("3", "Phase 3", 2, ["a"]),
        makePhase("4", "Phase 4", 3, ["z"]),
      ]);
      // a is in phases 1,2,3; b is in phases 1,2; c is in phase 1
      const counts = result.dropped.map((d) => d.totalPhases);
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i - 1]!).toBeGreaterThanOrEqual(counts[i]!);
      }
    });
  });

  describe("dormant hobbies", () => {
    it("detects hobby absent from last 2 phases as dormant", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Phase 1", 0, ["drawing"]),
        makePhase("2", "Phase 2", 1, ["cycling"]),
        makePhase("3", "Phase 3", 2, ["hiking"]),
      ]);
      const names = result.dormant.map((d) => d.name);
      expect(names).toContain("drawing");
      // cycling is absent only from last phase, not last 2
      expect(names).not.toContain("cycling");
    });

    it("dormant is subset of dropped", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Phase 1", 0, ["a", "b"]),
        makePhase("2", "Phase 2", 1, ["b"]),
        makePhase("3", "Phase 3", 2, ["c"]),
        makePhase("4", "Phase 4", 3, ["d"]),
      ]);
      const dormantNames = new Set(result.dormant.map((d) => d.name));
      const droppedNames = new Set(result.dropped.map((d) => d.name));
      for (const name of dormantNames) {
        expect(droppedNames.has(name)).toBe(true);
      }
    });

    it("hobby absent in last 2+ phases has type dormant", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Phase 1", 0, ["yoga"]),
        makePhase("2", "Phase 2", 1, ["cycling"]),
        makePhase("3", "Phase 3", 2, ["hiking"]),
      ]);
      const yoga = result.dormant.find((d) => d.name === "yoga");
      expect(yoga).toBeDefined();
      expect(yoga!.type).toBe("dormant");
    });
  });

  describe("rekindle candidates", () => {
    it("detects hobby that appeared then was absent then reappeared", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Childhood", 0, ["drawing", "cycling"]),
        makePhase("2", "Teen", 1, ["cycling", "gaming"]),
        makePhase("3", "College", 2, ["drawing", "hiking"]),
      ]);
      const names = result.rekindleCandidates.map((d) => d.name);
      expect(names).toContain("drawing");
    });

    it("hobby in first and last phase but not middle is rekindle candidate but NOT dropped", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Phase 1", 0, ["drawing"]),
        makePhase("2", "Phase 2", 1, ["cycling"]),
        makePhase("3", "Phase 3", 2, ["drawing"]),
      ]);
      const rekindleNames = result.rekindleCandidates.map((d) => d.name);
      expect(rekindleNames).toContain("drawing");

      const droppedNames = result.dropped.map((d) => d.name);
      expect(droppedNames).not.toContain("drawing");
    });

    it("hobby only present once is not a rekindle candidate", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Phase 1", 0, ["oneshot"]),
        makePhase("2", "Phase 2", 1, ["cycling"]),
        makePhase("3", "Phase 3", 2, ["hiking"]),
      ]);
      const names = result.rekindleCandidates.map((d) => d.name);
      expect(names).not.toContain("oneshot");
    });

    it("hobby present in all consecutive phases is not a rekindle candidate", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Phase 1", 0, ["reading"]),
        makePhase("2", "Phase 2", 1, ["reading"]),
        makePhase("3", "Phase 3", 2, ["reading"]),
      ]);
      const names = result.rekindleCandidates.map((d) => d.name);
      expect(names).not.toContain("reading");
    });

    it("rekindle candidate has correct type", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Childhood", 0, ["drawing"]),
        makePhase("2", "Teen", 1, ["cycling"]),
        makePhase("3", "College", 2, ["drawing"]),
      ]);
      const drawing = result.rekindleCandidates.find((d) => d.name === "drawing");
      expect(drawing).toBeDefined();
      expect(drawing!.type).toBe("rekindle");
    });

    it("sorts rekindle candidates by totalPhases descending", () => {
      // drawing: phases 1,3,5 → totalPhases=3; yoga: phases 2,4 → totalPhases=2
      const result = findRediscoveryOpportunities([
        makePhase("1", "P1", 0, ["drawing"]),
        makePhase("2", "P2", 1, ["yoga"]),
        makePhase("3", "P3", 2, ["drawing"]),
        makePhase("4", "P4", 3, ["yoga"]),
        makePhase("5", "P5", 4, ["drawing"]),
      ]);
      const counts = result.rekindleCandidates.map((d) => d.totalPhases);
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i - 1]!).toBeGreaterThanOrEqual(counts[i]!);
      }
      const drawing = result.rekindleCandidates.find((d) => d.name === "drawing");
      expect(drawing!.totalPhases).toBe(3);
    });
  });

  describe("two-phase scenarios", () => {
    it("handles two phases correctly for dropped", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Phase 1", 0, ["a", "b"]),
        makePhase("2", "Phase 2", 1, ["b", "c"]),
      ]);
      const droppedNames = result.dropped.map((d) => d.name);
      expect(droppedNames).toContain("a");
      expect(droppedNames).not.toContain("b");
      expect(droppedNames).not.toContain("c");
    });

    it("two phases: hobby in second-to-last phase is NOT dormant (last 2 phases covers it)", () => {
      const result = findRediscoveryOpportunities([
        makePhase("1", "Phase 1", 0, ["a"]),
        makePhase("2", "Phase 2", 1, ["b"]),
      ]);
      // "a" is in phase 1 (the second-to-last), so it IS in the last 2 phases window → not dormant
      // Only dropped since it's absent from the very last phase
      expect(result.dormant.find((d) => d.name === "a")).toBeUndefined();
      expect(result.dropped.find((d) => d.name === "a")).toBeDefined();
    });
  });
});
