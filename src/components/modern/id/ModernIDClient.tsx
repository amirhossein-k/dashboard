// src\components\modern\id\ModernIDClient.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FullPurchaseOrder } from "@/app/(protected)/dashboard/modern/[id]/page";
import { Package, CheckCircle, Clock, XCircle } from "lucide-react";
import { FaArrowRight } from "react-icons/fa6";
import Link from "next/link";

interface ModernIDClientProps {
  order: FullPurchaseOrder;
}

export default function ModernIDClient({ order }: ModernIDClientProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "delivered":
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
        return <Clock className="w-5 h-5" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-8 space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link href={"/dashboard/modern"} className="">
        برگشت <FaArrowRight />
      </Link>
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">جزئیات سفارش</h2>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusIcon(order.status)}
          <span>{order.status}</span>
        </div>
      </div>

      {/* اطلاعات خریدار */}
      <div>
        <h3 className="text-lg font-semibold mb-2">مشخصات خریدار</h3>
        <p>نام: {order.storeOwner.name ?? "نامشخص"}</p>
        <p>شماره تماس: {order.storeOwner.phoneNumber ?? "-"}</p>
      </div>

      {/* محصولات */}
      <div>
        <h3 className="text-lg font-semibold mb-2">محصولات سفارش</h3>
        <div className="divide-y border rounded-lg overflow-hidden">
          {order.items.map((item) => (
            <motion.div
              key={item.id}
              className="p-4 flex justify-between items-center hover:bg-gray-50"
              whileHover={{ scale: 1.01 }}
            >
              <div>
                <p className="font-medium text-gray-800">
                  {item.product.title ?? "محصول بدون نام"}
                </p>
                <p className="text-sm text-gray-500">
                  تأمین‌کننده: {item.product.supplier?.name ?? "نامشخص"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  <span>قیمت واحد: </span>
                  {item.unitPrice.toLocaleString()} تومان
                </p>
                <p className="text-sm text-gray-500">تعداد: {item.quantity}</p>
                <p className="font-semibold">
                  <span>قیمت کل : </span>
                  <span className="text-red-500">
                    {item.totalPrice.toLocaleString()} تومان
                  </span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* فاکتور */}
      {order.invoiceUrl && (
        <div className="pt-4">
          <a
            href={order.invoiceUrl}
            target="_blank"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            مشاهده فاکتور
          </a>
        </div>
      )}
    </motion.div>
  );
}
