import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

type ApiAuthResponse = {
  success?: boolean;
  message?: string;
  user?: {
    id: number | string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
    saldo?: number | null;
    whatsapp?: string | null;
  };
  token?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        turnstile_token: { label: "Turnstile", type: "text" },
      },
      async authorize(credentials) {
        const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
        if (!base) return null;

        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const turnstileToken = typeof credentials?.turnstile_token === "string" ? credentials.turnstile_token : "";

        try {
          const res = await fetch(`${base}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-API-KEY": process.env.API_ACCESS_KEY!,
            },
            body: JSON.stringify({ email, password, turnstile_token: turnstileToken }),
            cache: "no-store",
          });

          const data: ApiAuthResponse = await res.json().catch(() => ({} as any));
          if (!res.ok || !data?.token || !data?.user) return null;

          return {
            id: String(data.user.id),
            name: data.user.name,
            email: data.user.email,
            token: data.token,
            role: data.user.role,
            saldo: data.user.saldo,
            whatsapp: data.user.whatsapp,
          } as any;
        } catch {
          return null;
        }
      },
    }),

    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        whatsapp: { label: "WhatsApp", type: "text" },
        otp: { label: "OTP", type: "text" },
        purpose: { label: "Purpose", type: "text" },
        name: { label: "Name", type: "text" },
        turnstile_token: { label: "Turnstile", type: "text" },
      },
      async authorize(credentials) {
        const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
        if (!base) return null;

        const whatsapp = typeof credentials?.whatsapp === "string" ? credentials.whatsapp : "";
        const otp = typeof credentials?.otp === "string" ? credentials.otp : "";
        const purpose = typeof credentials?.purpose === "string" ? credentials.purpose : "";
        const name = typeof credentials?.name === "string" ? credentials.name : undefined;
        const turnstileToken = typeof credentials?.turnstile_token === "string" ? credentials.turnstile_token : "";

        try {
          const res = await fetch(`${base}/api/auth/otp/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-API-KEY": process.env.API_ACCESS_KEY!,
            },
            body: JSON.stringify({
              whatsapp,
              otp,
              purpose,
              ...(name ? { name } : {}),
              turnstile_token: turnstileToken,
            }),
            cache: "no-store",
          });

          const data: ApiAuthResponse = await res.json().catch(() => ({} as any));
          if (!res.ok || !data?.token || !data?.user) return null;

          return {
            id: String(data.user.id),
            name: data.user.name,
            email: data.user.email,
            token: data.token,
            role: data.user.role,
            saldo: data.user.saldo,
            whatsapp: data.user.whatsapp,
          } as any;
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const base = process.env.NEXT_PRIVATE_API_URL || process.env.NEXT_PUBLIC_API_URL;
      if (!base) return false;

      const idToken = (account as any)?.id_token as string | undefined;
      if (!idToken) return false;

      try {
        const res = await fetch(`${base}/api/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-API-KEY": process.env.API_ACCESS_KEY!,
          },
          body: JSON.stringify({ id_token: idToken, name: user?.name ?? null }),
          cache: "no-store",
        });

        if (!res.ok) return false;

        const data: ApiAuthResponse = await res.json().catch(() => ({} as any));
        if (!data?.token || !data?.user) return false;

        (user as any).token = data.token;
        (user as any).role = data.user.role;
        (user as any).saldo = data.user.saldo;
        (user as any).whatsapp = data.user.whatsapp;
        (user as any).email = data.user.email;
        (user as any).name = data.user.name;

        return true;
      } catch {
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        (token as any).jwtToken = (user as any).token;
        (token as any).role = (user as any).role ?? null;
        (token as any).saldo = (user as any).saldo ?? null;
        (token as any).whatsapp = (user as any).whatsapp ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      (session.user as any).token = typeof (token as any).jwtToken === "string" ? (token as any).jwtToken : undefined;
      (session.user as any).role = (token as any).role ?? null;
      (session.user as any).saldo = (token as any).saldo ?? null;
      (session.user as any).whatsapp = (token as any).whatsapp ?? null;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };