import type { Metadata } from "next";
import { SideQuestsClient } from "./side-quests-client";

export const metadata: Metadata = {
  title: "Side Quests — SignificantHobbies",
  description: "50 curated micro-adventures to make life more interesting. Roll a random quest, get a personalized pick, or take on the full board.",
};

export default function SideQuestsPage() {
  return <SideQuestsClient />;
}
