// src\app\api\product\update\route.ts

import { db as prisma } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.supplier?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, title, price, count } = body;

    if (!productId || price == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // پیدا کردن محصول و بررسی تعلق به تامین‌کننده
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { supplierId: true, price: true },
    });

    if (!product || product.supplierId !== session.supplier.id) {
      return NextResponse.json({ error: "Not authorized to update this product" }, { status: 403 });
    }

    // محاسبه قیمت فروشگاه با سود
    const profitRate = 0.2; // مثلا 20٪ سود
    const priceWithProfit = price * (1 + profitRate);

    // آپدیت محصول
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        price,
        count,
        priceWithProfit,
      },
    });

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
