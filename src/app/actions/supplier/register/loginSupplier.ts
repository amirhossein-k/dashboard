


import { db as prisma } from '@/app/lib/db'
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

export async function loginSupplier({ phone, password }: { phone: string; password: string }) {


    const supplier = await prisma.supplier.findUnique({ where: { phone } });
    if (!supplier) throw new Error("تأمین‌کننده یافت نشد");

    const isValid = await bcrypt.compare(password, supplier.password);
    if (!isValid) throw new Error("رمز عبور اشتباه است");

    const token = jwt.sign({ id: supplier.id, name: supplier.name }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    return { token, supplier };


}



