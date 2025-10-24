"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Clock,
  DollarSign,
  Plus,
  Bell,
  Settings,
  Search,
  Filter,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import ModernCard from "@/components/ui/ModernCard";
import GradientButton from "@/components/ui/GradientButton";
import ModernTable from "@/components/ui/ModernTable";
import PurchaseOrdersList from "@/components/purchase-orders/PurchaseOrdersList";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import PurchaseOrderForm from "@/components/purchase-orders/PurchaseOrderForm";
import SupplierProductsList from "@/components/supplier/SupplierProductsList";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardStats,
  GetRecentProduct,
} from "@/app/actions/product/modern/Product";
import { Prisma } from "@prisma/client";

interface DashboardStats {
  totalProducts: number;
  totalSuppliers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  previousData?: DashboardStats; // اضافه کردن فیلد قبلی
}
type FullProduct = Prisma.ProductGetPayload<{
  include: {
    categoryList: true;
    listProperty: true;
    productImage: true;
    productOrderOwner: true;
    productVariants: true;
    purchaseOrders: true;
    review: true;
    supplier: true;
    author: true;
  };
}>;

export default function ModernDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSuppliers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });

  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "products" | "suppliers"
  >("overview");
  const [loading, setLoading] = useState(true);

  const {
    data: DashboardStats,
    error: ErrorDshboardStats,
    isPending: isPendingStats,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => fetchDashboardStats(new Date()), // یا تاریخ دلخواه
  });
  // به‌روزرسانی stats با داده‌های واقعی
  useEffect(() => {
    if (DashboardStats?.data) {
      setStats(DashboardStats.data);
    }
  }, [DashboardStats]);

  const handleLogOut = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (err) {
      toast.error(`خروج مشکل دارد ${err}`);
    }
  };

  const {
    data: recentOrders,
    isLoading: recentOrderLoading,
    error,
  } = useQuery({
    queryKey: ["recentOrders"],
    queryFn: GetRecentProduct,
  });
  console.log(recentOrders?.data, "data");

  const tableColumns = [
    {
      key: "title",
      label: "محصول",
      align: "right" as const,
    },
    {
      key: "supplier",
      label: "تامین‌کننده",
      align: "right" as const,
      render: (value: { id: string; name: string }) => value?.name ?? "—",
    },
    {
      key: "countproduct",
      label: "تعداد",
      align: "center" as const,
    },
    {
      key: "price",
      label: "مبلغ کل",
      align: "right" as const,
      render: (value: number) =>
        value != null ? `${value.toLocaleString()} تومان` : "—",
    },
    {
      key: "published",
      label: "وضعیت",
      align: "center" as const,
      render: (value: boolean) => {
        if (!value) return false;
        // const status = value;
        console.log(stats, "huhuu");
        const color = !value
          ? "bg-yellow-100 text-yellow-800"
          : value
          ? "bg-blue-100 text-blue-800"
          : "bg-green-100 text-green-800";

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}
          >
            {value ? "منتشر" : "نامنتشر"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "تاریخ",
      align: "center" as const,
      render: (value: Date) =>
        value ? new Date(value).toLocaleDateString("fa-IR") : "—",
    },
  ];

  console.log("object");
  if (isPendingStats || recentOrderLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">در حال بارگذاری داشبورد...</p>
        </motion.div>
      </div>
    );
  }

  // محاسبه درصد تغییر برای هر متریک
  const calculateChange = (current: number, previous: number | undefined) => {
    if (!previous || previous === 0)
      return { value: 0, type: "increase" as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      type: change >= 0 ? "increase" : ("decrease" as const),
    };
  };

  const statChanges = {
    totalProducts: calculateChange(
      stats.totalProducts,
      stats.previousData?.totalProducts
    ),
    totalSuppliers: calculateChange(
      stats.totalSuppliers,
      stats.previousData?.totalSuppliers
    ),
    totalOrders: calculateChange(
      stats.totalOrders,
      stats.previousData?.totalOrders
    ),
    totalRevenue: calculateChange(
      stats.totalRevenue,
      stats.previousData?.totalRevenue
    ),
    pendingOrders: calculateChange(
      stats.pendingOrders,
      stats.previousData?.pendingOrders
    ),
    lowStockProducts: calculateChange(
      stats.lowStockProducts,
      stats.previousData?.lowStockProducts
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                داشبورد مدیریت
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                مدیریت محصولات و تامین‌کنندگان
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="جستجو..."
                  className="pl-4 pr-10 py-2 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="relative group cursor-pointer">
                <div className="p-2  text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <Settings className="h-5 w-5  " />
                  <div className="absolute  right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 hidden group-hover:block z-50">
                    <button
                      onClick={handleLogOut}
                      className="w-full cursor-pointer text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600"
                    >
                      خروج
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mt-4">
            {[
              { key: "overview", label: "نمای کلی", icon: TrendingUp },
              { key: "orders", label: "سفارشات", icon: ShoppingCart },
              { key: "products", label: "محصولات", icon: Package },
              { key: "suppliers", label: "تامین‌کنندگان", icon: Users },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === key
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Icon className="h-4 w-4 ml-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              <StatCard
                title="کل محصولات"
                value={stats.totalProducts}
                icon={Package}
                color="blue"
                change={statChanges.totalProducts}
              />
              <StatCard
                title="تامین‌کنندگان"
                value={stats.totalSuppliers}
                icon={Users}
                color="green"
                change={statChanges.totalSuppliers}
              />
              <StatCard
                title="کل سفارشات"
                value={stats.totalOrders}
                icon={ShoppingCart}
                color="purple"
                change={statChanges.totalOrders}
              />
              <StatCard
                title="درآمد کل"
                value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
                icon={DollarSign}
                color="orange"
                change={statChanges.totalRevenue}
              />
              <StatCard
                title="سفارشات معلق"
                value={stats.pendingOrders}
                icon={Clock}
                color="red"
                change={statChanges.pendingOrders}
              />
              <StatCard
                title="موجودی کم"
                value={stats.lowStockProducts}
                icon={Package}
                color="orange"
                change={statChanges.lowStockProducts}
              />
            </div>

            {/* Recent Orders Table */}
            <ModernCard className="mb-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">محصولات</h2>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                      <Filter className="h-4 w-4" />
                    </button>
                    <GradientButton
                      size="sm"
                      onClick={() => setActiveTab("orders")}
                    >
                      مشاهده همه
                    </GradientButton>
                  </div>
                </div>
              </div>

              {/* <ModernTable
                columns={tableColumns}
                data={recentOrders}
                className="shadow-none"
              /> */}
              {recentOrderLoading ? (
                <div className="p-6 text-center text-gray-500">
                  در حال بارگذاری سفارشات اخیر...
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">
                  خطا در دریافت سفارشات
                </div>
              ) : (
                <ModernTable
                  columns={tableColumns}
                  data={recentOrders?.data ?? []} // ← اگر undefined باشد، یک آرایه خالی استفاده شود                  className="shadow-none"
                />
              )}
            </ModernCard>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ModernCard
                hover
                className="p-6 cursor-pointer"
                onClick={() => setShowPurchaseForm(true)}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-xl ml-4">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">سفارش جدید</h3>
                    <p className="text-gray-600 text-sm">ثبت سفارش خرید جدید</p>
                  </div>
                </div>
              </ModernCard>

              <ModernCard hover className="p-6 cursor-pointer">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-xl ml-4">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      مدیریت محصولات
                    </h3>
                    <p className="text-gray-600 text-sm">
                      افزودن و ویرایش محصولات
                    </p>
                  </div>
                </div>
              </ModernCard>

              <ModernCard
                hover
                className="p-6 cursor-pointer"
                onClick={() => setActiveTab("suppliers")}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-xl ml-4">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      تامین‌کنندگان
                    </h3>
                    <p className="text-gray-600 text-sm">
                      مدیریت تامین‌کنندگان
                    </p>
                  </div>
                </div>
              </ModernCard>
            </div>
          </>
        )}
        {/* بخش سفارشات */}
        {activeTab === "orders" && (
          <PurchaseOrdersList userId="current-user-id" userType="store_owner" />
        )}

        {activeTab === "products" && (
          <ModernCard className="p-8 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              مدیریت محصولات
            </h3>
            <p className="text-gray-600 mb-6">این بخش در حال توسعه است</p>
            <GradientButton>افزودن محصول جدید</GradientButton>
          </ModernCard>
        )}

        {activeTab === "suppliers" && (
          // <ModernCard className="p-8 text-center">
          //   <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          //   <h3 className="text-xl font-semibold text-gray-800 mb-2">
          //     مدیریت تامین‌کنندگان
          //   </h3>
          //   <p className="text-gray-600 mb-6">این بخش در حال توسعه است</p>
          //   <GradientButton>افزودن تامین‌کننده جدید</GradientButton>
          // </ModernCard>
          <SupplierProductsList />
        )}
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={Plus}
        onClick={() => setShowPurchaseForm(true)}
        tooltip="سفارش جدید"
        color="blue"
      />

      {/* Purchase Order Form Modal */}
      {showPurchaseForm && (
        <PurchaseOrderForm
          storeOwnerId="current-user-id"
          onClose={() => setShowPurchaseForm(false)}
          onSuccess={() => {
            setShowPurchaseForm(false);
            // Refresh data
            // fetchDashboardStats();
          }}
        />
      )}
    </div>
  );
}
