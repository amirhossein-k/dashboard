"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: string;
  };
  color?: "blue" | "green" | "purple" | "orange" | "red";
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  color = "blue",
  className,
}: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      icon: "text-blue-600",
      value: "text-blue-700",
      change: "text-blue-600",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      icon: "text-green-600",
      value: "text-green-700",
      change: "text-green-600",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      icon: "text-purple-600",
      value: "text-purple-700",
      change: "text-purple-600",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100",
      icon: "text-orange-600",
      value: "text-orange-700",
      change: "text-orange-600",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-red-100",
      icon: "text-red-600",
      value: "text-red-700",
      change: "text-red-600",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 shadow-lg border border-white/20",
        "backdrop-blur-sm transition-all duration-300 hover:shadow-xl",
        colorClasses[color].bg,
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/30"></div>
        <div className="absolute -left-2 -bottom-2 h-16 w-16 rounded-full bg-white/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "p-3 rounded-xl bg-white/50",
              colorClasses[color].icon
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          {change && (
            <div
              className={cn(
                "flex items-center text-sm font-medium",
                change.type === "increase" ? "text-green-600" : "text-red-600"
              )}
            >
              <span className="mr-1">
                {change.type === "increase" ? "↗" : "↘"}
              </span>
              {Math.abs(change.value)}%
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className={cn("text-2xl font-bold", colorClasses[color].value)}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
}
