"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductVariant } from "@prisma/client";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import OrdersListForSupplier from "./OrdersListForSupplier";
// import { Product } from "@/types";

interface Product {
  id: string;
  title: string;
  price: number;
  count: number;
  productVariants: {
    id: string;
    variantId: string;
    variant: {
      color: string;
      inventory: number;
    };
  }[];
}
export default function DashboardClient({
  products: initialProducts,
}: {
  products: Product[];
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const handleSignOut = async (e: React.MouseEvent) => {
    try {
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (error) {
      toast.error(`خطا در خروج ${error}`);
    }
  };
  const handleVariantChange = (
    productId: string,
    variantId: string,
    newInventory: number
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              productVariants: p.productVariants.map((v) =>
                v.id === variantId
                  ? { ...v, variant: { ...v.variant, inventory: newInventory } }
                  : v
              ),
            }
          : p
      )
    );
  };
  const handlePriceChange = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p))
    );
  };
  const handleUpdateProduct = async (product: Product) => {
    try {
      await fetch("/api/product/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          title: product.title,
          price: product.price,
          count: product.count,
          variants: product.productVariants.map((v) => ({
            id: v.id,
            inventory: v.variant.inventory,
          })),
        }),
      });
      alert("محصول با موفقیت بروزرسانی شد!");
    } catch (error) {
      console.error(error);
      alert("خطا در بروزرسانی محصول");
    }
  };
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ duration: 0.3 }}
            className="w-64 bg-gray-800 text-white flex flex-col p-4 space-y-4"
          >
            {["dashboard", "list", "add", "orders"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === tab ? "bg-gray-700" : "hover:bg-gray-600"
                }`}
              >
                {tab === "dashboard"
                  ? "داشبورد"
                  : tab === "list"
                  ? "لیست محصولات"
                  : tab === "orders"
                  ? "سفارشات"
                  : "اضافه کردن محصول"}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 flex justify-between items-center bg-white shadow-md">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-1 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            {sidebarOpen ? "بستن منو" : "باز کردن منو"}
          </button>
          <button
            onClick={handleSignOut}
            className="px-3 py-1 bg-red-800 text-white rounded-md hover:bg-red-700 cursor-pointer "
          >
            {sidebarOpen ? "خروج" : "در حال خروج..."}
          </button>
          <h2 className="text-xl font-bold">
            {activeTab === "dashboard"
              ? "داشبورد"
              : activeTab === "list"
              ? "لیست محصولات"
              : activeTab === "orders"
              ? "سفارشات"
              : "اضافه کردن محصول"}
          </h2>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-3xl font-bold mb-4">داشبورد</h1>
                <p>اینجا اطلاعات کلی و نمودارها نمایش داده می‌شود.</p>
              </motion.div>
            )}

            {activeTab === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-4 rounded shadow space-y-2"
                  >
                    <h2 className="font-semibold">{p.title}</h2>

                    <div className="flex gap-2 items-center">
                      <span>قیمت تامین‌کننده:</span>
                      <input
                        type="number"
                        value={p.price}
                        onChange={(e) =>
                          handlePriceChange(p.id, parseFloat(e.target.value))
                        }
                        className="border p-1 rounded w-24"
                      />
                    </div>

                    <div className="space-y-1">
                      {p.productVariants.map((v) => (
                        <div key={v.id} className="flex gap-2 items-center">
                          <span>{v.variant.color}</span>
                          <input
                            type="number"
                            value={v.variant.inventory}
                            onChange={(e) =>
                              handleVariantChange(
                                p.id,
                                v.id,
                                parseInt(e.target.value)
                              )
                            }
                            className="border p-1 rounded w-20"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUpdateProduct(p)}
                      className="px-3 py-1 bg-blue-600 text-white rounded mt-2"
                    >
                      بروزرسانی محصول
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "add" && (
              <motion.div
                key="add"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-3xl font-bold mb-4">اضافه کردن محصول</h1>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="نام محصول"
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="number"
                    placeholder="قیمت"
                    className="border p-2 rounded w-full"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded">
                    اضافه کن
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <OrdersListForSupplier />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
