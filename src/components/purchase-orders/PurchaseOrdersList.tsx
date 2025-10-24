"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { Prisma } from "@prisma/client";
import Link from "next/link";

type FullPurchaseOrder = Prisma.PurchaseOrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: { supplier: true };
        };
      };
    };
    storeOwner: true;
  };
}>;

interface PurchaseOrdersListProps {
  userId: string;
  userType: "store_owner" | "supplier";
}

const STATUS_OPTIONS = [
  { value: "all", label: "همه وضعیت‌ها" },
  { value: "loading", label: "در حال آماده‌سازی (پرداخت‌نشده)" },
  { value: "loadingpaid", label: "منتقل‌شده به پرداخت" },
  { value: "pending", label: "در انتظار تایید" },
  { value: "confirmed", label: "تایید شده" },
  { value: "paid", label: "پرداخت شده" },
  { value: "shipped_by_supplier", label: "ارسال‌شده توسط تامین‌کننده" },
  { value: "delivered_to_store", label: "تحویل به فروشگاه" },
  { value: "shipped_to_customer", label: "ارسال به مشتری نهایی" },
  { value: "completed", label: "تکمیل شده" },
  { value: "cancelled", label: "لغو شده" },
];

export default function PurchaseOrdersList({
  userId,
  userType,
}: PurchaseOrdersListProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const isAdmin = session?.user?.admin === true;

  // 🔹 تعریف تابع گرفتن سفارشات
  const fetchOrders = async (): Promise<FullPurchaseOrder[]> => {
    const response = await fetch(`/api/purchase-orders`);
    if (!response.ok) throw new Error("Failed to fetch purchase orders");
    return response.json();
  };

  // 🔹 گرفتن داده‌ها با useQuery
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useQuery<FullPurchaseOrder[]>({
    queryKey: ["purchase-orders"],
    queryFn: fetchOrders,
    enabled: status === "authenticated" && isAdmin, // فقط زمانی که کاربر مدیر است
  });

  // 🔹 به‌روزرسانی وضعیت سفارش
  const mutation = useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
    }: {
      orderId: string;
      newStatus: string;
    }) => {
      const response = await fetch(`/api/purchase-orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });

  if (status === "loading")
    return <div className="p-10 text-center">در حال بررسی ورود...</div>;

  if (!isAdmin) {
    return (
      <div className="p-10 text-center text-red-500 font-semibold">
        ❌ شما دسترسی مشاهده سفارش‌ها را ندارید.
      </div>
    );
  }

  if (isLoading)
    return <div className="p-10 text-center">در حال بارگذاری سفارش‌ها...</div>;

  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        خطا در دریافت اطلاعات: {(error as Error).message}
      </div>
    );

  const filteredOrders = orders.filter((order) =>
    filter === "all" ? true : order.status.toLowerCase() === filter
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "delivered_to_store":
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
      case "delivered":
      case "delivered_to_store":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          {userType === "store_owner" ? "سفارشات خرید شما" : "سفارشات دریافتی"}
        </h2>

        <div className="flex space-x-2 items-center relative">
          <div className="group cursor-pointer hover:bg-blue-500 w-[100px]">
            <span>راهنما</span>
            <ul className="group-hover:flex absolute top-0 flex-col overflow-y-auto bg-sky-300 hidden gap-1 h-[100px]">
              {STATUS_OPTIONS.map((item, index) => (
                <li className="bg-[#fff] border rounded-md" key={item.label}>
                  {index} - {item.label} :
                  <span className="text-red-600">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <label htmlFor="statusFilter" className="text-sm text-gray-600">
            فیلتر بر اساس وضعیت:
          </label>
          <select
            id="statusFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>هیچ سفارشی یافت نشد</p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 hover:bg-gray-200 transition-colors flex flex-col gap-2 w-full"
            >
              <Link
                href={`/dashboard/modern/${order.id}`}
                className="flex items-center justify-between w-full"
              >
                <div className="flex-1">
                  <div className="flex flex-row-reverse items-center p-1 mb-2 bg-[#c8e9f3] rounded-md">
                    <h3
                      className="text-lg font-semibold text-gray-800 ml-3"
                      dir="rtl"
                    >
                      خریدار: {order.storeOwner.name ?? "خریدار"} - شماره:{" "}
                      {order.storeOwner.phoneNumber}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="mr-1">{order.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium">
                        {userType === "store_owner" ? "تامین‌کننده" : "خریدار"}
                      </p>
                      <p>
                        {userType === "store_owner"
                          ? order.items?.[0]?.product?.supplier?.name ??
                            "نامشخص"
                          : order.storeOwner.name ?? "نامشخص"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">تعداد محصولات سفارش</p>
                      <p>{order.items?.length ?? "-"}</p>
                    </div>
                    <div>
                      <p className="font-medium">مبلغ کل</p>
                      <p>{order.totalPrice?.toLocaleString() ?? "-"} تومان</p>
                    </div>
                    <div>
                      <p className="font-medium">تاریخ سفارش</p>
                      <p>
                        {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
