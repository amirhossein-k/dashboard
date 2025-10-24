// src\app\(protected)\dashboard\modern\[id]\page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ModernIDClient from "@/components/modern/id/ModernIDClient";
import { Prisma } from "@prisma/client";
import { motion } from "framer-motion";

export type FullPurchaseOrder = Prisma.PurchaseOrderGetPayload<{
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

async function fetchPurchaseOrder(id: string): Promise<FullPurchaseOrder> {
  const res = await fetch(`/api/purchase-orders/${id}`);
  if (!res.ok) throw new Error("Failed to fetch purchase order");
  return res.json();
}

export default function PurchaseOrderspage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery<FullPurchaseOrder>({
    queryKey: ["purchase-order", id],
    queryFn: () => fetchPurchaseOrder(id!),
    enabled: !!id, // فقط وقتی id وجود دارد اجرا می‌شود
  });

  if (!id)
    return (
      <div className="p-10 text-center text-red-500">
        شناسه سفارش نامعتبر است.
      </div>
    );

  if (isLoading)
    return (
      <div className="p-10 space-y-6 animate-pulse">
        <motion.div
          className="h-8 w-1/3 bg-gray-300 rounded-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          className="h-6 bg-gray-200 rounded-lg w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          className="h-6 bg-gray-200 rounded-lg w-5/6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          className="h-6 bg-gray-200 rounded-lg w-4/6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          className="h-6 bg-gray-200 rounded-lg w-3/6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      </div>
    );

  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        خطا در دریافت اطلاعات سفارش: {(error as Error).message}
      </div>
    );

  if (!order)
    return (
      <div className="p-10 text-center text-gray-500">سفارشی یافت نشد.</div>
    );

  return <ModernIDClient order={order} />;
}
