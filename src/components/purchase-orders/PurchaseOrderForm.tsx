"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Upload, X } from "lucide-react";
import { Supplier } from "@prisma/client";

interface Product {
  id: string;
  title: string;
  price: number;
  count: number;
  supplier: Supplier;
}

interface PurchaseOrderFormProps {
  storeOwnerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PurchaseOrderForm({
  storeOwnerId,
  onClose,
  onSuccess,
}: PurchaseOrderFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Product, 2: Enter Details, 3: Upload Invoice

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // This would typically fetch products available for purchase
      // For now, we'll use a placeholder API call
      const response = await fetch("/api/product");
      if (response.ok) {
        const data = await response.json();
        const produuct = data.data || [];
        setProducts(produuct);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setStep(2);
  };

  const handleSubmitOrder = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      const orderData = {
        productId: selectedProduct.id,
        supplierId: selectedProduct.supplier.id,
        storeOwnerId,
        quantity,
        totalPrice: selectedProduct.price * quantity,
      };

      const response = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();

        // If invoice file is selected, upload it
        if (invoiceFile) {
          await uploadInvoice(order.id);
        }

        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadInvoice = async (orderId: string) => {
    if (!invoiceFile) return;

    const formData = new FormData();
    formData.append("invoice", invoiceFile);

    try {
      const response = await fetch(
        `/api/purchase-orders/${orderId}/upload-invoice`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        console.error("Failed to upload invoice");
      }
    } catch (error) {
      console.error("Error uploading invoice:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (
      file &&
      (file.type === "application/pdf" || file.type.startsWith("image/"))
    ) {
      setInvoiceFile(file);
    } else {
      alert("لطفاً فایل PDF یا تصویر انتخاب کنید");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <ShoppingCart className="h-6 w-6 text-blue-600 ml-2" />
            <h2 className="text-xl font-bold text-gray-800">
              ثبت سفارش خرید جدید
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-8">
            <div
              className={`flex items-center ${
                step >= 1 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="mr-2 text-sm font-medium">انتخاب محصول</span>
            </div>
            <div
              className={`flex items-center ${
                step >= 2 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="mr-2 text-sm font-medium">جزئیات سفارش</span>
            </div>
            <div
              className={`flex items-center ${
                step >= 3 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span className="mr-2 text-sm font-medium">بارگذاری فاکتور</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                انتخاب محصول
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                    onClick={() => handleProductSelect(product)}
                  >
                    <h4 className="font-medium text-gray-800 mb-2">
                      {product.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      تامین‌کننده: {product.supplier?.name} -{" "}
                      {product.supplier?.phoneNumber}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      قیمت: {product.price.toLocaleString()} تومان
                    </p>
                    <p className="text-sm text-gray-600">
                      موجودی: {product.count}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedProduct && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                جزئیات سفارش
              </h3>

              {/* Selected Product Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-2">
                  محصول انتخاب شده
                </h4>
                <p className="text-blue-700">{selectedProduct.title}</p>
                <p className="text-blue-600 text-sm">
                  تامین‌کننده: {selectedProduct.supplier.name}
                </p>
                <p className="text-blue-600 text-sm">
                  قیمت واحد: {selectedProduct.price.toLocaleString()} تومان
                </p>
              </div>

              {/* Quantity Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تعداد
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.count}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  حداکثر موجود: {selectedProduct.count}
                </p>
              </div>

              {/* Total Price */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">
                  مبلغ کل: {(selectedProduct.price * quantity).toLocaleString()}{" "}
                  تومان
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  بازگشت
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ادامه
                </button>
              </div>
            </div>
          )}

          {step === 3 && selectedProduct && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                بارگذاری فاکتور
              </h3>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-800 mb-2">خلاصه سفارش</h4>
                <p className="text-gray-700">محصول: {selectedProduct.title}</p>
                <p className="text-gray-700">تعداد: {quantity}</p>
                <p className="text-gray-700">
                  مبلغ کل: {(selectedProduct.price * quantity).toLocaleString()}{" "}
                  تومان
                </p>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  فاکتور خرید (اختیاری)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="invoice-upload"
                  />
                  <label
                    htmlFor="invoice-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700"
                  >
                    کلیک کنید تا فایل انتخاب کنید
                  </label>
                  <p className="text-gray-500 text-sm mt-2">
                    فرمت‌های مجاز: PDF, JPG, PNG
                  </p>
                  {invoiceFile && (
                    <p className="text-green-600 text-sm mt-2">
                      فایل انتخاب شده: {invoiceFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  بازگشت
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "در حال ثبت..." : "ثبت سفارش"}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
