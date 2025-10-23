/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ModernCard from "@/components/ui/ModernCard";
import { Search, Filter } from "lucide-react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowHeightParams,
} from "@mui/x-data-grid";
import { Colors, ProductVariant } from "@prisma/client";

interface Supplier {
  id: string;
  name: string;
}

interface SupplierProduct {
  id: string;
  title: string;
  product: string;
  supplier: string;
  count: number;
  price: number;
  stockStatus: "موجود" | "کم موجودی" | "ناموجود";
  lastUpdatedBySupplier: string;
  colors: Colors[];
}

const getStockStatus = (quantity: number) => {
  if (quantity === 0) return "ناموجود";
  if (quantity < 5) return "کم موجودی";
  return "موجود";
};

const fetchSuppliers = async () => {
  const res = await fetch("/api/supplier");
  if (!res.ok) throw new Error("خطا در دریافت تامین‌کننده‌ها");
  return (await res.json()) as Supplier[];
};

const fetchProducts = async (supplierId: string) => {
  const res = await fetch(`/api/supplier/${supplierId}/products`);
  if (!res.ok) throw new Error("خطا در دریافت محصولات");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await res.json()) as any[];
};

const SupplierProductsList = () => {
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
    staleTime: 1000 * 60 * 5, // ۵ دقیقه
  });

  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const deferredFilter = useDeferredValue(globalFilter);

  useEffect(() => {
    if (!selectedSupplierId && suppliers.length > 0) {
      setSelectedSupplierId(suppliers[0].id);
    }
  }, [suppliers]);

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", selectedSupplierId],
    queryFn: () => fetchProducts(selectedSupplierId!),
    enabled: !!selectedSupplierId,
    select: (raw) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      raw.map((p: SupplierProduct) => ({
        id: p.id || "نامشخص",
        product: p.title || "نامشخص",
        supplier:
          suppliers.find((s) => s.id === selectedSupplierId)?.name || "نامعلوم",
        quantity: p.count ?? 0,
        price: p.price ?? 0,
        stockStatus: getStockStatus(p.count ?? 0),
        lastUpdated: p.lastUpdatedBySupplier
          ? new Date(p.lastUpdatedBySupplier).toLocaleDateString("fa-IR")
          : "-",
        colors: p.colors ?? [], // 👈 این مهمه
      })),
  });

  interface ColorCell {
    id: string;
    color: string;
    inventory: number;
    model: string;
    parentModel: string | null;
  }

  const columns: GridColDef[] = useMemo<GridColDef[]>(
    () => [
      { field: "product", headerName: "محصول", flex: 1 },
      { field: "supplier", headerName: "تامین‌کننده", flex: 1 },
      {
        field: "colors",
        headerName: "رنگ‌ها و موجودی",
        // type: "number",
        flex: 2,
        sortable: false,
        // valueGetter: (params) => params.row.colors,

        renderCell: (
          params: GridRenderCellParams<{ colors: ColorCell[] }, ColorCell[]>
        ) => {
          const colors = Array.isArray(params.value) ? params.value : [];
          if (colors.length === 0)
            return <span className="text-gray-400">بدون رنگ</span>;

          return (
            <div className="flex flex-col gap-1 py-2">
              {colors.map((c) => (
                <span
                  key={c.id}
                  className="whitespace-nowrap flex-row flex gap-3 items-center"
                >
                  {c.color}: {c.inventory} - {c.model}
                  <span
                    style={{ backgroundColor: c.color }}
                    className="w-2 h-2 block  rounded-full"
                  ></span>
                </span>
              ))}
            </div>
          );
        },
      },
      {
        field: "price",
        headerName: "قیمت",
        flex: 1,
        renderCell: (params) => (
          <span>{(params.value as number).toLocaleString()} تومان</span>
        ),
      },
      { field: "stockStatus", headerName: "وضعیت موجودی", flex: 1 },
      { field: "lastUpdated", headerName: "آخرین به‌روزرسانی", flex: 1 },
    ],
    []
  );

  // فیلتر دستی

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        deferredFilter === "" ||
        p.product.includes(deferredFilter) ||
        p.supplier.includes(deferredFilter);
      const matchStatus = statusFilter === "" || p.stockStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [products, deferredFilter, statusFilter]);

  if (isLoadingSuppliers || isLoadingProducts) return <p>در حال بارگذاری...</p>;

  return (
    <ModernCard className="p-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="جستجو..."
            className="pl-10 pr-4 py-2 border rounded-xl"
          />
        </div>

        <div className="relative">
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-xl"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="موجود">موجود</option>
            <option value="کم موجودی">کم موجودی</option>
            <option value="ناموجود">ناموجود</option>
          </select>
        </div>

        <select
          value={selectedSupplierId || ""}
          onChange={(e) => setSelectedSupplierId(e.target.value || null)}
          className="pl-4 pr-4 py-2 border rounded-xl"
        >
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={filteredProducts}
          columns={columns}
          getRowHeight={() => "auto"} // ✨ این خط مشکل را حل می‌کند
          pageSizeOptions={[5, 10, 20]}
          pagination
          disableRowSelectionOnClick
          rowBufferPx={2} // پیش‌بارگذاری ردیف کمتر
        />
      </div>
    </ModernCard>
  );
};

export default SupplierProductsList;
