import { db as prisma } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { phone } = await req.json();
        if (!phone) return Response.json({ error: "Phone required" }, { status: 400 });

        // تولید OTP تصادفی (۶ رقمی)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // ذخیره هش در DB
        const codeHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // ۲ دقیقه اعتبار
        await prisma.oTP.create({
            data: { phone, codeHash, expiresAt }
        });

        // حالت Dev Mode → چاپ در کنسول
        if (process.env.NODE_ENV === "development") {
            console.log(`OTP for ${phone}: ${otp}`);
        }

        // TODO: حالت Production → ارسال از طریق سامانه پیامکی واقعی
        return Response.json({ success: true, message: "OTP sent" });
    } catch (err) {
        console.error(err);
        return Response.json({ error: "Server error", message: "Server error" }, { status: 500 });
    }
}
