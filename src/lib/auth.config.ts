import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isProtected = pathname.startsWith("/vinhos");
      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/cadastro");

      if (isProtected) {
        return isLoggedIn;
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/vinhos", request.nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
