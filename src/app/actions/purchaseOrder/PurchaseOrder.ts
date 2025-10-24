
// src\app\actions\purchaseOrder\PurchaseOrder.ts
import { db as prisma } from '@/app/lib/db'

export async function PurchaseOrderById({ id }: { id: string }) {

    try {

        const PurchaseOrder = await prisma.purchaseOrder.findUnique({
            where: {
                id
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: { supplier: true }, // ← اضافه کردن این خط
                        },
                    }
                }, storeOwner: true
            },

        })

        return { success: true, data: PurchaseOrder, error: false, message: 'سفارش گرفته شد' }

    } catch (error) {
        console.error("Error finalizing order:", error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: "خطا در گرفتن سفارش" };
    }
}