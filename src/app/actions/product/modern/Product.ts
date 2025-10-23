// D:\prject\dashboard\src\app\actions\product\modern\Product.ts
'use server'

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { actionsGetRes, Product } from "@/types";
import { getServerSession } from "next-auth";
import { db as prisma } from '@/app/lib/db'
import { Prisma } from "@prisma/client";

type FullProduct = Prisma.ProductGetPayload<{
    include: {
        categoryList: true;
        listProperty: true;
        productImage: true;
        productVariants: true;
        purchaseOrderItems: true;
        review: true;
        supplier: true;
        author: true;
        colors: true;
    };
}>;
interface DashboardStatsData {
    totalProducts: number;
    totalSuppliers: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    lowStockProducts: number;
}
export async function GetRecentProduct(): Promise<actionsGetRes<FullProduct[]>> {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.admin) {

            return {
                data: [],
                error: true,
                message: "ادمین نیستی",
                success: false,

            }
        }
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },

            include: {
                categoryList: true,
                listProperty: true,
                productImage: true,
                productVariants: true,
                purchaseOrderItems: true,
                review: true,
                supplier: true,
                author: true,
                colors: true,
            }
        })

        return {
            data: products,
            error: false,
            message: "محصولات با موفقیت دریافت شدند",
            success: true,
        };

    } catch (error) {

        console.error("Error fetching brands:", error);
        return { data: [], error: true, message: "خطا در دریافت برندها", success: false };

    }
}


export async function fetchDashboardStats(
    referenceDate: Date = new Date() // تاریخ مرجع، پیش‌فرض تاریخ فعلی
): Promise<actionsGetRes<DashboardStatsData & { previousData?: DashboardStatsData }>> {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.admin) {

            return {
                data: {
                    totalProducts: 0,
                    totalSuppliers: 0,
                    totalOrders: 0,
                    totalRevenue: 0,
                    pendingOrders: 0,
                    lowStockProducts: 0,
                },
                error: true,
                message: "فقط ادمین‌ها می‌توانند به آمار دسترسی داشته باشند",
                success: false,
            };
        }
        // 🟢 شمارش پایه

        const totalProducts = await prisma.product.count();
        const totalSuppliers = await prisma.supplier.count();
        // 🟢 گرفتن سفارش‌ها با آیتم‌ها و محصولات مربوطه

        const purchaseOrders = await prisma.purchaseOrder.findMany({
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                countproduct: true,
                            },
                        },
                    },
                },
            },
        });
        // 🟣 محاسبه آمار جاری

        const totalOrders = purchaseOrders.length;
        let totalRevenue = 0;
        let pendingOrders = 0;
        let lowStockProducts = 0;

        for (const order of purchaseOrders) {
            totalRevenue += order.totalPrice ?? 0;
            if (order.status === "PENDING") pendingOrders += 1;

            // بررسی محصولات با موجودی پایین در هر آیتم سفارش
            for (const item of order.items) {
                if (item.product?.countproduct < 10) {
                    lowStockProducts += 1;
                }
            }
        }
        // 🗓 محاسبه بازه ماه قبل

        const now = new Date(referenceDate); // تاریخ مرجع
        // محاسبه داده‌های ماه قبل
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const previousMonthOrders = purchaseOrders.filter(order =>
            order.createdAt >= firstDayOfLastMonth && order.createdAt <= lastDayOfLastMonth
        );

        const previousTotalOrders = previousMonthOrders.length;
        let previousTotalRevenue = 0;
        let previousPendingOrders = 0;
        let previousLowStockProducts = 0;


        for (const order of previousMonthOrders) {
            previousTotalRevenue += order.totalPrice ?? 0;
            if (order.status === "PENDING") previousPendingOrders += 1;
            for (const item of order.items) {
                if (item.product?.countproduct < 10) previousLowStockProducts += 1;
            }
        }


        // داده‌های قبلی
        const previousData: DashboardStatsData = {
            totalProducts: await prisma.product.count({ where: { createdAt: { lte: lastDayOfLastMonth } } }),
            totalSuppliers: await prisma.supplier.count({ where: { createdAt: { lte: lastDayOfLastMonth } } }),
            totalOrders: previousTotalOrders,
            totalRevenue: previousTotalRevenue,
            pendingOrders: previousPendingOrders,
            lowStockProducts: previousLowStockProducts,
        };

        return {
            data: {
                totalProducts,
                totalSuppliers,
                totalOrders,
                totalRevenue,
                pendingOrders,
                lowStockProducts,
                previousData,
            },
            error: false,
            message: "آمار داشبورد با موفقیت دریافت شد",
            success: true,
        };


    } catch (error) {
        console.error("Error fetching brands:", error);
        return {
            data: {
                totalProducts: 0,
                totalSuppliers: 0,
                totalOrders: 0,
                totalRevenue: 0,
                pendingOrders: 0,
                lowStockProducts: 0,
            },
            error: true,
            message: "خطا در دریافت آمار داشبورد",
            success: false,
        };
    }
}