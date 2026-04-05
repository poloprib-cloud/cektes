import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string | null;
    user: DefaultSession["user"] & {
      id?: string | number;
      email?: string | null;
      name?: string | null;
      role?: string | null;
      whatsapp?: string | null;
      accessToken?: string | null;
      token?: string | null;
    };
  }

  interface User {
    id?: string | number;
    email?: string | null;
    name?: string | null;
    role?: string | null;
    whatsapp?: string | null;
    accessToken?: string;
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    token?: string;
    user?: {
      id?: string | number;
      email?: string | null;
      name?: string | null;
      role?: string | null;
      whatsapp?: string | null;
    };
  }
}
