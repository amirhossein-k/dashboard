// src\app\api\product\route.ts

import { NextResponse } from "next/server";
import { db as prisma } from '@/app/lib/db'

export async function GET() {
    try {

        const products = await prisma.product.findMany({
            include: {
                categoryList: true,
                listProperty: true,
                productImage: true,
                productOrderOwner: true,
                productVariants: true,
                purchaseOrders: true,
                review: true,
                supplier: true
            }
        })

        return NextResponse.json({ data: products, success: true, error: false, message: 'گرفقته شد اطلاعات' })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: true, message: 'خطا در سرور گرفتن محصول', success: false }, { status: 500 });

    }
}