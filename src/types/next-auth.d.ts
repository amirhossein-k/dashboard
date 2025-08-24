// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        supplier: {
            id: string;
            phone?: string;
            name?: string;
        };
    }
    interface User extends DefaultUser {
        phone?: string;
        name?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        supplier?: {
            id: string;
            phone?: string;
            name?: string;
        };
    }
}
