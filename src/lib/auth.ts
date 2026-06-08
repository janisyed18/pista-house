import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { verifyAdminPassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "pista-house-local-admin-secret-change-in-production",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL ?? "admin@pistahouse.com.au";
        const developmentPassword = process.env.ADMIN_PASSWORD ?? "pistahouse-admin";

        if (
          credentials?.email === adminEmail &&
          credentials.password &&
          verifyAdminPassword(credentials.password, process.env.ADMIN_PASSWORD_HASH, developmentPassword)
        ) {
          return {
            id: "admin",
            email: adminEmail,
            name: "Pista House Admin",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      if (session.user) {
        session.user.name = session.user.name ?? "Pista House Admin";
      }
      return session;
    },
  },
};
