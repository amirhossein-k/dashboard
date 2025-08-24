"use client";
import React from "react";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
const LoginComponent = () => {
  const { data: session, status } = useSession();

  if (!session) {
    return (
      <button
        onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        ورود
      </button>
    );
  }

  return (
    <Link
      href={` ${session.user.admin ? "/dashboard" : "/profile"}`}
      className="bg-blue-500 text-white px-3 py-1 rounded"
    >
      {`${session.user.admin ? "داشبورد" : "پروفایل"}`}
    </Link>
  );
};

export default LoginComponent;
