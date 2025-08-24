// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db as prisma } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      id: "supplier-login",
      name: "Supplier Login",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { phone, password } = credentials as {
          phone: string;
          password: string;
        };

        if (!phone || !password) return null;

        // پیدا کردن تأمین‌کننده
        const supplier = await prisma.supplier.findUnique({
          where: { phone },
        });

        if (!supplier) throw new Error("تأمین‌کننده یافت نشد");

        // بررسی رمز عبور
        if (!supplier.password) throw new Error("رمز عبور تنظیم نشده");
        const isValid = await bcrypt.compare(password, supplier.password);
        if (!isValid) throw new Error("رمز عبور اشتباه است");

        // برگرداندن supplier برای ذخیره در JWT
        return supplier;
      },
    }),
  ],
  pages: {
    signIn: "/login", // صفحه ورود سفارشی
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.supplier = {
          id: user.id,
          name: user.name,
          phone: user.phone,
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.supplier = token.supplier!;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
