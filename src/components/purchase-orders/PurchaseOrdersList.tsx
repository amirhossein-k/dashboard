"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react"; // ← اضافه کن

import { Package, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { Prisma } from "@prisma/client";

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
// تمام وضعیت‌های سبد خرید طبق enum
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
  const [orders, setOrders] = useState<FullPurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  // تعیین نوع کاربر
  // فقط مدیر سایت می‌تواند ببیند
  const isAdmin = session?.user?.admin === true;

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      fetchOrders();
    }
  }, [status, isAdmin]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/purchase-orders`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error("Failed to fetch orders:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
    } finally {
      setLoading(false);
    }
  };
  if (status === "loading")
    return <div className="p-10 text-center">در حال بررسی ورود...</div>;

  if (!isAdmin) {
    return (
      <div className="p-10 text-center text-red-500 font-semibold">
        ❌ شما دسترسی مشاهده سفارش‌ها را ندارید.
      </div>
    );
  }
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/purchase-orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

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

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "در انتظار";
      case "confirmed":
        return "تایید شده";
      case "delivered":
        return "تحویل داده شده";
      case "cancelled":
        return "لغو شده";
      default:
        return status;
    }
  };

  console.log(orders, "orders سفارااشات");
  const filteredOrders = orders.filter((order) =>
    filter === "all" ? true : order.status.toLowerCase() === filter
  );

  if (loading)
    return <div className="p-10 text-center">در حال بارگذاری سفارش‌ها...</div>;
  if (orders.length === 0)
    return (
      <div className="p-10 text-center text-gray-500">
        هیچ سفارشی وجود ندارد.
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          {userType === "store_owner" ? "سفارشات خرید شما" : "سفارشات دریافتی"}
        </h2>
        <div className="flex space-x-2 items-center">
          {/* {["all", "pending", "confirmed", "delivered"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {
                {
                  all: "همه",
                  pending: "در انتظار",
                  confirmed: "تایید شده",
                  delivered: "تحویل شده",
                }[f]
              }
            </button>
          ))} */}
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
              className="p-6 hover:bg-gray-200 transition-colors flex flex-col gap-2 w-full "
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex-1">
                  <div className="flex flex-row-reverse items-center p-1 mb-2 bg-[#c8e9f3] rounded-md">
                    <h3
                      className="text-lg font-semibold text-gray-800 ml-3 "
                      dir="rtl"
                    >
                      خریدار: {order.storeOwner.name ?? "خریدار"}- شماره:{" "}
                      {order.storeOwner.phoneNumber}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="mr-1">
                        {/* {getStatusText(order.status)} */}
                        {order.status}
                      </span>
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
                      <p className="font-medium"> تعداد محصولات سفارش</p>
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
                {/* اگر رسید دارد */}

                <div className="flex items-center space-x-2 mr-4">
                  {order.invoiceUrl && (
                    <button
                      onClick={() =>
                        window.open(order.invoiceUrl ?? "", "_blank")
                      }
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="مشاهده فاکتور"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  )}

                  {userType === "supplier" &&
                    order.status.toLowerCase() === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            updateOrderStatus(order.id, "CONFIRMED")
                          }
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          تایید
                        </button>
                        <button
                          onClick={() =>
                            updateOrderStatus(order.id, "CANCELLED")
                          }
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          لغو
                        </button>
                      </div>
                    )}

                  {userType === "supplier" &&
                    order.status.toLowerCase() === "confirmed" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        تحویل شد
                      </button>
                    )}
                </div>
              </div>

              {order.status.toLowerCase() === "pending" && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    {userType === "store_owner"
                      ? "سفارش شما در انتظار تایید تامین‌کننده است"
                      : "این سفارش نیاز به تایید شما دارد"}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
