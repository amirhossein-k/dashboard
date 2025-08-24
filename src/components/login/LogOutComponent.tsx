"use client";
import React from "react";

import { signOut, useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
const LogOutComponent = () => {
  const { data: session, status } = useSession();

  console.log(session, "session");

  const logOutMutation = useMutation({
    mutationFn: async () => {
      await signOut({ callbackUrl: "/" });
    },
    mutationKey: ["user", session?.user],
    onSuccess: () => {
      toast.success("خروج موققیت امیز بود");
    },
    onError: (error: Error) => {
      toast.error("خطا در خروح");
    },
  });
  if (status === "loading") return <div>در حال بارگذاری...</div>;
  if (!session) return null;

  return (
    <div className="">
      <button
        onClick={() => logOutMutation.mutate()}
        disabled={logOutMutation.isPending}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
      >
        {logOutMutation.isPending ? "در حال خروج..." : "خروج"}
      </button>
    </div>
  );
};

export default LogOutComponent;
