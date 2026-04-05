import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth/config";
import { db } from "~/server/db";
import { ProfileForm } from "./profile-form";
import { ArrowLeft } from "lucide-react";
import { eq } from "drizzle-orm";
import { users } from "~/db/schema";

export const metadata = {
  title: "Settings — SignificantHobbies",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      id: true,
      name: true,
      username: true,
      bio: true,
      website: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      {/* Back link */}
      {user.username && (
        <Link
          href={`/u/${user.username}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to profile
        </Link>
      )}

      <h1 className="mb-8 text-2xl font-bold text-stone-900">Settings</h1>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-stone-800">
          Edit profile
        </h2>
        <ProfileForm
          initialName={user.name ?? ""}
          initialBio={user.bio ?? ""}
          initialWebsite={user.website ?? ""}
          username={user.username ?? ""}
        />
      </div>
    </div>
  );
}
