import type { Metadata } from "next";
import { GetStartedClient } from "./get-started-client";

export const metadata: Metadata = {
  title: "Get Your Username — SignificantHobbies",
  description:
    "Choose your unique username on SignificantHobbies. Get your own profile at significanthobbies.com/u/yourname and start sharing your hobby journey.",
};

export default function GetStartedPage() {
  return <GetStartedClient />;
}
