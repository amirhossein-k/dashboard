"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  shadow?: "sm" | "md" | "lg" | "xl";
  onClick?: React.MouseEventHandler<HTMLDivElement>; // اضافه کردن onClick
}

export default function ModernCard({
  children,
  className,
  hover = true,
  gradient = false,
  shadow = "lg",
  onClick,
}: ModernCardProps) {
  const shadowClasses = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300",
        shadowClasses[shadow],
        gradient && "bg-gradient-to-br from-white to-gray-50",
        hover && "hover:shadow-2xl hover:border-gray-200",
        className
      )}
      onClick={onClick} // اضافه کردن onClick به motion.div
    >
      {children}
    </motion.div>
  );
}
