


import { db as prisma } from '@/app/lib/db'
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {



    const { name, phone, password, address } = await req.json()


    const existing = await prisma.supplier.findUnique({ where: { phone } });
    if (existing) {
        return NextResponse.json({ error: "این شماره قبلا ثبت شده" }, { status: 400 });
    }


    const hashedPassword = await bcrypt.hash(password, 10)

    const supplier = await prisma.supplier.create({
        data: {
            name,
            phone,
            password: hashedPassword,
            address,
        },
    });

    return NextResponse.json({ success: true, supplier });


}



