import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { authConfig } from "./auth.config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_POOLED });
const prisma = new PrismaClient({ adapter });

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
          session.user.role = token.role as string;
          session.user.id = token.sub as string; 
      }
      return session;
    },
  },
});