import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import { type JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { db } from "~/server/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string | null;
    userId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        username: (user as { username?: string | null }).username ?? null,
      },
    }),
    jwt: async ({ token, user, trigger }) => {
      // On sign-in, user object is available
      if (user) {
        token.userId = user.id;
        token.username = (user as { username?: string | null }).username ?? null;
      }
      // On update trigger or if username not yet set, fetch from DB
      if (trigger === "update" || (token.userId && token.username === undefined)) {
        const dbUser = await db.user.findUnique({
          where: { id: token.userId as string },
          select: { username: true },
        });
        token.username = dbUser?.username ?? null;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
};
