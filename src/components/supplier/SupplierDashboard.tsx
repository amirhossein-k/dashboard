'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, DollarSign, TrendingUp, Settings, Bell } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  count: number;
  lastUpdatedBySupplier?: string;
  purchaseOrders: PurchaseOrder[];
}

interface PurchaseOrder {
  id: string;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  storeOwner: {
    name: string;
    phoneNumber: string;
  };
}

interface SupplierDashboardProps {
  supplierId: string;
  supplierName: string;
}

export default function SupplierDashboard({ supplierId, supplierName }: SupplierDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [reminderSettings, setReminderSettings] = useState({
    reminderFrequency: 'daily',
    reminderTime: '09:00'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchReminderSettings();
  }, [supplierId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/supplier/${supplierId}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReminderSettings = async () => {
    try {
      const response = await fetch(`/api/supplier/${supplierId}/reminders`);
      if (response.ok) {
        const data = await response.json();
        setReminderSettings({
          reminderFrequency: data.reminderFrequency || 'daily',
          reminderTime: data.reminderTime || '09:00'
        });
      }
    } catch (error) {
      console.error('Error fetching reminder settings:', error);
    }
  };

  const updateReminderSettings = async () => {
    try {
      const response = await fetch(`/api/supplier/${supplierId}/reminders`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminderSettings),
      });
      
      if (response.ok) {
        alert('تنظیمات یادآوری با موفقیت به‌روزرسانی شد');
      }
    } catch (error) {
      console.error('Error updating reminder settings:', error);
    }
  };

  const updateProduct = async (productId: string, price: number, count: number) => {
    try {
      const response = await fetch(`/api/product/${productId}/update-by-supplier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price,
          count,
          supplierId
        }),
      });
      
      if (response.ok) {
        fetchProducts(); // Refresh products list
        alert('محصول با موفقیت به‌روزرسانی شد');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const getOutdatedProducts = () => {
    return products.filter(product => {
      if (!product.lastUpdatedBySupplier) return true;
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(product.lastUpdatedBySupplier).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceUpdate > 1;
    });
  };

  const getTotalOrders = () => {
    return products.reduce((total, product) => total + product.purchaseOrders.length, 0);
  };

  const getTotalRevenue = () => {
    return products.reduce((total, product) => 
      total + product.purchaseOrders.reduce((orderTotal, order) => orderTotal + order.totalPrice, 0), 0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const outdatedProducts = getOutdatedProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            داشبورد تامین‌کننده - {supplierName}
          </h1>
          <p className="text-gray-600">مدیریت محصولات و سفارشات خود</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">کل محصولات</p>
                <p className="text-2xl font-bold text-blue-600">{products.length}</p>
              </div>
              <Package className="h-12 w-12 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">محصولات نیازمند به‌روزرسانی</p>
                <p className="text-2xl font-bold text-orange-600">{outdatedProducts.length}</p>
              </div>
              <Clock className="h-12 w-12 text-orange-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">کل سفارشات</p>
                <p className="text-2xl font-bold text-green-600">{getTotalOrders()}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">کل درآمد</p>
                <p className="text-2xl font-bold text-purple-600">
                  {getTotalRevenue().toLocaleString()} تومان
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-purple-500" />
            </div>
          </motion.div>
        </div>

        {/* Reminder Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-blue-600 ml-2" />
            <h2 className="text-xl font-bold text-gray-800">تنظیمات یادآوری</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تکرار یادآوری
              </label>
              <select
                value={reminderSettings.reminderFrequency}
                onChange={(e) => setReminderSettings({
                  ...reminderSettings,
                  reminderFrequency: e.target.value
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">روزانه</option>
                <option value="weekly">هفتگی</option>
                <option value="disabled">غیرفعال</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                زمان یادآوری
              </label>
              <input
                type="time"
                value={reminderSettings.reminderTime}
                onChange={(e) => setReminderSettings({
                  ...reminderSettings,
                  reminderTime: e.target.value
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={updateReminderSettings}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ذخیره تنظیمات
              </button>
            </div>
          </div>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">محصولات شما</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نام محصول
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    قیمت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    موجودی
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    آخرین به‌روزرسانی
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    سفارشات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onUpdate={updateProduct}
                    index={index}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Separate component for product row to handle individual state
function ProductRow({ product, onUpdate, index }: {
  product: Product;
  onUpdate: (id: string, price: number, count: number) => void;
  index: number;
}) {
  const [editMode, setEditMode] = useState(false);
  const [price, setPrice] = useState(product.price);
  const [count, setCount] = useState(product.count);

  const handleSave = () => {
    onUpdate(product.id, price, count);
    setEditMode(false);
  };

  const handleCancel = () => {
    setPrice(product.price);
    setCount(product.count);
    setEditMode(false);
  };

  const isOutdated = () => {
    if (!product.lastUpdatedBySupplier) return true;
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(product.lastUpdatedBySupplier).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceUpdate > 1;
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`hover:bg-gray-50 ${isOutdated() ? 'bg-orange-50' : ''}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{product.title}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editMode ? (
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            className="w-20 p-1 border border-gray-300 rounded text-sm"
          />
        ) : (
          <div className="text-sm text-gray-900">{product.price.toLocaleString()} تومان</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editMode ? (
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseFloat(e.target.value))}
            className="w-20 p-1 border border-gray-300 rounded text-sm"
          />
        ) : (
          <div className="text-sm text-gray-900">{product.count}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {product.lastUpdatedBySupplier
            ? new Date(product.lastUpdatedBySupplier).toLocaleDateString('fa-IR')
            : 'هرگز'
          }
        </div>
        {isOutdated() && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            نیاز به به‌روزرسانی
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{product.purchaseOrders.length} سفارش</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {editMode ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-900 ml-2"
            >
              ذخیره
            </button>
            <button
              onClick={handleCancel}
              className="text-red-600 hover:text-red-900"
            >
              لغو
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="text-blue-600 hover:text-blue-900"
          >
            ویرایش
          </button>
        )}
      </td>
    </motion.tr>
  );
}

