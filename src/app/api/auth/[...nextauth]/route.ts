// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db as prisma } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { Supplier } from "@prisma/client";
import { ADRESS, InvoiceProduct, Product, PublicSupplier, USERTYPE } from "@/types";


export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      id: "supplier-login",
      name: "Supplier Login",
      credentials: {
        phoneNumber: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"phoneNumber" | "password", string> | undefined
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ): Promise<any> { // ← اینجا نوع خروجی را any قرار دادیم
        const creds = credentials as { phoneNumber: string; password: string };
        const { phoneNumber, password } = creds;

        if (!phoneNumber || !password) return null;

        // پیدا کردن تأمین‌کننده
        const supplier = await prisma.supplier.findUnique({
          where: { phoneNumber }
        });

        if (!supplier) throw new Error("تأمین‌کننده یافت نشد");

        // بررسی رمز عبور
        if (!supplier.password) throw new Error("رمز عبور تنظیم نشده");
        const isValid = await bcrypt.compare(password, supplier.password);
        if (!isValid) throw new Error("رمز عبور اشتباه است");

        // برگرداندن supplier برای ذخیره در JWT
        // فقط فیلدهای ساده و اسکالر
        return {
          id: supplier.id,
          name: supplier.name,
          phoneNumber: supplier.phoneNumber,
          address: supplier.address ?? undefined,
          createdAt: supplier.createdAt.toISOString(),
          updatedAt: supplier.updatedAt.toISOString(),
          lastReminderSent: supplier.lastReminderSent
            ? supplier.lastReminderSent.toISOString()
            : null,
          reminderFrequency: supplier.reminderFrequency ?? null,
          reminderTime: supplier.reminderTime ?? null,
        };
      },
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "phone-otp",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
        name: { label: "Name", type: "text" }, // فقط برای ثبت‌نام
      },
      async authorize(credentials) {
        const { phone, otp, name } = credentials as {
          phone: string;
          otp: string;
          name?: string;
        };
        if (!phone || !otp) return null;

        const otpRecord = await prisma.oTP.findFirst({
          where: { phone },
          orderBy: { createdAt: "desc" },
        });

        if (!otpRecord) throw new Error("OTP not found");
        if (otpRecord.expiresAt < new Date()) throw new Error("OTP Expired");

        const isValid = await bcrypt.compare(otp, otpRecord.codeHash);
        if (!isValid) throw new Error("Invalid OTP");

        let user = await prisma.user.findUnique({
          where: { phoneNumber: phone },
        });

        if (!user) {
          if (!name) throw new Error("NEW_USER_REQUIRE_NAME");
          user = await prisma.user.create({
            data: {
              phoneNumber: phone,
              name,
              isVerfied: true,
            },
          });
        }

        return user as USERTYPE;
      },
    }),
  ],
  pages: {
    signIn: "/login", // صفحه ورود سفارشی
  },
  callbacks: {

    async jwt({ token, user }) {
      if (user) {
        if ("isVerfied" in user) { // برای user
          token.user = {
            id: (user as USERTYPE).id,
            phoneNumber: (user as USERTYPE).phoneNumber,
            admin: (user as USERTYPE).admin,
            isVerfied: (user as USERTYPE).isVerfied,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } else if ((user as any).phoneNumber) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const supplierUser = user as any;
          token.supplier = {
            id: supplierUser.id,
            phoneNumber: supplierUser.phoneNumber,
            name: supplierUser.name,
          };
        }
      }
      return token;
    },
    // Session.lazy-load
    async session({ session, token }) {
      if (token.user) {

        session.user = {
          ...token.user,
          products: [],
          listordershop: [],
          address: [],
          name: null,
          createdAt: new Date().toISOString(), // مقدار پیش‌فرض به‌عنوان string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any; // cast موقت برای رفع خطا

        const dbUser = await prisma.user.findUnique({
          where: { id: token.user.id },
          include: {
            products: true,
            listordershop: true,
            address: true,
          },
        });
        if (dbUser && session.user) {
          session.user.products = dbUser.products as unknown as Product[];
          session.user.listordershop = dbUser.listordershop as unknown as InvoiceProduct[];
          session.user.address = dbUser.address as unknown as ADRESS[];
          session.user.name = dbUser.name ?? null;
          session.user.createdAt = dbUser.createdAt;
        }
      } else if (token.supplier) {
        session.supplier = { ...token.supplier };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
