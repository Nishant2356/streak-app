import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // ✅ FIX 1: Explicitly SELECT all needed fields
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            image: true,
            username: true,
            githubId: true,
            leetcodeId: true,
          },
        });

        if (!user) return null;

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) return null;

        // ✅ FIX 2: Return fields EXACTLY once (no Prisma object leak)
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
          githubId: user.githubId,
          leetcodeId: user.leetcodeId,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    // ✅ FIX 3: Persist everything in JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.username = (user as any).username;
        token.githubId = (user as any).githubId ?? null;
        token.leetcodeId = (user as any).leetcodeId ?? null;
      }
      return token;
    },

    // ✅ FIX 4: Expose everything to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;

        (session.user as any).username = token.username;
        (session.user as any).githubId = token.githubId;
        (session.user as any).leetcodeId = token.leetcodeId;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
