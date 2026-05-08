import { describe, expect, it } from "vitest";

import {
  buildCirclePlan,
  createDefaultCircle,
  normalizeMemberList,
  type HobbyCircle,
} from "./accountability-circles";

describe("accountability circles", () => {
  it("creates a usable local-first default circle", () => {
    const circle = createDefaultCircle(new Date("2026-05-08T00:00:00Z"));

    expect(circle.name).toBe("Weekend hobby circle");
    expect(circle.focus).toBe("balanced");
    expect(circle.members).toEqual(["Me"]);
  });

  it("prioritizes quests matching the circle focus", () => {
    const circle: HobbyCircle = {
      id: "circle-1",
      name: "Kitchen crew",
      focus: "culinary",
      cadence: "weekend",
      members: ["Me", "Asha"],
      createdAt: "2026-05-08T00:00:00Z",
    };

    const plan = buildCirclePlan(circle, []);

    expect(plan.quests).toHaveLength(3);
    expect(plan.quests.some((quest) => quest.category === "culinary")).toBe(true);
    expect(plan.checkInPrompt).toContain("Kitchen crew check-in");
  });

  it("deprioritizes already completed quests", () => {
    const circle = createDefaultCircle(new Date("2026-05-08T00:00:00Z"));
    const firstPlan = buildCirclePlan(circle, []);
    const nextPlan = buildCirclePlan(circle, [firstPlan.quests[0]!.id]);

    expect(nextPlan.quests[0]?.id).not.toBe(firstPlan.quests[0]?.id);
  });

  it("normalizes pasted member lists", () => {
    expect(normalizeMemberList("Me, Asha\nMe, Dev")).toEqual(["Me", "Asha", "Dev"]);
  });
});
