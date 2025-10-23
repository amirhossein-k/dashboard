// src\components\dashboard\OrdersListForSupplier.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, CheckCircle, XCircle } from "lucide-react";
import { FullPurchaseOrder } from "@/types";
import { useSession } from "next-auth/react";

export default function OrdersListForSupplier() {
  const { data: session, status } = useSession();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<FullPurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // استخراج supplierId از session
  const supplierId = session?.supplier?.id;

  useEffect(() => {
    if (status === "authenticated" && supplierId) {
      fetchOrders();
    }
  }, [status, supplierId]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/purchase-orders?supplierId=${supplierId}`);
      if (!res.ok) throw new Error("خطا در دریافت سفارشات");
      const data = await res.json();

      // فقط سفارشات در انتظار تایید
      const pendingOrders = data.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (order: any) => order.status === "PENDING"
      );
      setOrders(pendingOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/purchase-orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((order) => order.id !== orderId)); // حذف از لیست
      }
    } catch (err) {
      console.error("خطا در بروزرسانی وضعیت سفارش:", err);
    }
  };
  if (status === "loading")
    return <div className="p-4 text-center">در حال بررسی ورود...</div>;

  if (loading)
    return <div className="p-4 text-center">در حال بارگذاری سفارشات...</div>;

  if (orders.length === 0)
    return (
      <div className="p-8 text-center text-gray-500">
        هیچ سفارشی در انتظار تأیید وجود ندارد.
      </div>
    );

  return (
    <div className="space-y-4">
      {orders.map((order, index) => {
        // فقط آیتم‌هایی که محصولشان متعلق به این تأمین‌کننده است
        const supplierItems = order.items.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (i: any) => i.product.supplierId === supplierId
        );

        const supplierTotal = supplierItems.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (sum: number, i: any) => sum + i.totalPrice,
          0
        );

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow p-4 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">
                خریدار: {order.storeOwner?.name ?? "ناشناخته"}
              </h3>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                در انتظار تایید
              </span>
            </div>

            <p className="text-gray-600 text-sm">
              تعداد محصولات شما در این سفارش:{" "}
              <span className="font-medium">{supplierItems.length}</span>
            </p>
            <p className="text-gray-600 text-sm">
              مبلغ کل:{" "}
              <span className="font-medium">
                {supplierItems?.toLocaleString()} تومان
              </span>
            </p>
            <div className="mt-3 border-t pt-2 space-y-1">
              {supplierItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>{item.product.title}</span>
                  <span>{item.totalPrice.toLocaleString()} تومان</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                تایید سفارش
              </button>
              <button
                onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                <XCircle className="w-4 h-4" />
                لغو سفارش
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
