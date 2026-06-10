import { describe, expect,it } from "vitest";

import { getRoadmapForHobby } from "./hobby-roadmap";

describe("getRoadmapForHobby", () => {
  it("returns a 4-step roadmap with the expected horizons", () => {
    const roadmap = getRoadmapForHobby("Guitar");
    expect(roadmap.steps).toHaveLength(4);
    expect(roadmap.steps.map((s) => s.id)).toEqual(["today", "week", "month", "quarter"]);
    expect(roadmap.steps.map((s) => s.horizon)).toEqual([
      "Today",
      "This week",
      "This month",
      "3 months",
    ]);
  });

  it("uses hobby-specific overrides when available", () => {
    const roadmap = getRoadmapForHobby("Guitar");
    expect(roadmap.steps[0].action).toMatch(/song/i);
    expect(roadmap.steps[0].goal.length).toBeGreaterThan(0);
  });

  it("falls back to a category template for hobbies without overrides", () => {
    const roadmap = getRoadmapForHobby("Sculpting");
    expect(roadmap.category?.name).toBe("Creative");
    expect(roadmap.steps).toHaveLength(4);
    roadmap.steps.forEach((step) => {
      expect(step.goal).toBeTruthy();
      expect(step.action).toBeTruthy();
    });
  });

  it("falls back to the default template for unknown hobbies", () => {
    const roadmap = getRoadmapForHobby("Underwater basket weaving");
    expect(roadmap.category).toBeUndefined();
    expect(roadmap.steps).toHaveLength(4);
    expect(roadmap.steps[0].horizon).toBe("Today");
  });

  it("covers every hobby in the taxonomy", async () => {
    const { ALL_HOBBIES } = await import("./hobbies");
    for (const hobby of ALL_HOBBIES) {
      const roadmap = getRoadmapForHobby(hobby);
      expect(roadmap.steps).toHaveLength(4);
      roadmap.steps.forEach((s) => expect(s.action.length).toBeGreaterThan(10));
    }
  });
});
