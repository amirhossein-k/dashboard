// src\types\next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user?: {
            id: string;
            phoneNumber?: string;
            admin?: boolean;
            isVerfied?: boolean;
            products: Product[];
            listordershop: InvoiceProduct[];
            address: Address[];
            createdAt?: Date;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        } & DefaultSession["user"];
        supplier?: {
            id: string;
            phoneNumber?: string;
            name?: string;
        };
    }

    interface User extends DefaultUser {
        phoneNumber?: string;
        admin?: boolean;
        isVerfied?: boolean;
        products?: Product[];
        listordershop?: InvoiceProduct[];
        address?: Address[];
        createdAt?: Date;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user?: {
            id: string;
            phoneNumber?: string;
            admin?: boolean;
            isVerfied?: boolean;
        };
        supplier?: {
            id: string;
            phoneNumber?: string;
            name?: string;
        };
    }
}