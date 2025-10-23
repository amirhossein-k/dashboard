import React, { useState } from "react";

// ## 1. تعریف تایپ‌ها و اینترفیس‌ها

// یک اینترفیس پایه برای سفارش، فقط شامل فیلدهایی که در این کامپوننت استفاده می‌شود
interface Order {
  id: string;
  // می‌توان سایر فیلدهای سفارش را در صورت نیاز اضافه کرد
}

// تایپ داده‌ای که به تابع onAction ارسال می‌شود
type ActionPayload = {
  invoiceUrl?: string;
  trackingCode?: string;
  status: string; // وضعیت جدید سفارش
};

// تعریف تایپ‌های پراپرتی‌های (props) کامپوننت ActionModal
interface ActionModalProps {
  order: Order;
  onClose: () => void; // تابعی که هیچ ورودی و خروجی ندارد
  onAction: (orderId: string, payload: ActionPayload) => void; // تابعی برای اجرای اکشن اصلی
  actionType: "upload" | "tracking"; // نوع اکشن فقط می‌تواند یکی از این دو مقدار باشد
}

// ## 2. کامپوننت با تایپ‌دهی کامل

const ActionModal: React.FC<ActionModalProps> = ({
  order,
  onClose,
  onAction,
  actionType,
}) => {
  // state برای فایل آپلودی با تایپ File یا null
  const [file, setFile] = useState<File | null>(null);

  // state برای کد رهگیری با تایپ string
  const [trackingCode, setTrackingCode] = useState<string>("");

  // state برای وضعیت آپلود با تایپ boolean
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // تایپ‌دهی رویداد onChange برای input فایل
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // اطمینان از وجود فایل‌ها و انتخاب اولین فایل
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Upload failed");
      }
      const data = await res.json();

      // فراخوانی onAction با payload کاملاً تایپ‌شده
      onAction(order.id, { invoiceUrl: data.filePath, status: "PAID" });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      onClose();
    }
  };

  const handleAddTrackingCode = () => {
    if (!trackingCode.trim()) return; // جلوگیری از ارسال کد خالی

    // فراخوانی onAction با payload کاملاً تایپ‌شده
    onAction(order.id, {
      trackingCode: trackingCode,
      status: "SHIPPED_TO_CUSTOMER",
    });
    onClose();
  };

  // JSX بدون تغییر باقی می‌ماند
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-bold mb-4 text-gray-800">
          {actionType === "upload" ? "آپلود رسید پرداخت" : "ثبت کد رهگیری"}
        </h3>

        {actionType === "upload" && (
          <div className="space-y-4">
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? "در حال آپلود..." : "آپلود و تایید پرداخت"}
            </button>
          </div>
        )}

        {actionType === "tracking" && (
          <div className="space-y-4">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="کد رهگیری را وارد کنید"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddTrackingCode}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              ثبت کد و ارسال
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-3 text-gray-600 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          انصراف
        </button>
      </div>
    </div>
  );
};

export default ActionModal;
