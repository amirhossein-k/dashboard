"use client";

import LogOutComponent from "@/components/login/LogOutComponent";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Profilepage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 2️⃣ اگر کاربر لاگین نکرده → ریدایرکت به لاگین
  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
    }
  }, [session, router]);
  // 1️⃣ حالت لودینگ
  if (status === "loading") {
    return <div className="p-4">در حال بارگذاری...</div>;
  }

  if (!session?.user) return null;

  const user = session.user;
  return (
    <div className="p-6 flex flex-col gap-3" dir="rtl">
      <h1 className="text-2xl font-bold">پروفایل کاربر</h1>
      <p>آیدی: {user?.id}</p>
      <p>ایمیل: {user.email}</p>
      <p>نام: {user.name}</p>
      <div className="flex  gap-3">
        <Link
          href={`/profile/${user.id}/address`}
          className="text-lg text-red-500"
        >
          ادرس
        </Link>
        {user.admin && (
          <Link href={`/dashboard`} className="text-lg text-red-500">
            {" "}
            داشبورد مدیریت
          </Link>
        )}
      </div>
      <LogOutComponent />
    </div>
  );
};

export default Profilepage;
