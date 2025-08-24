"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Character({ color = "#4ECDC4", delay = 0 }) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 120 }}
      className="flex flex-col items-center"
    >
      {/* سر */}
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="35" fill={color} />
        <circle cx="28" cy="35" r="5" fill="#fff" />
        <circle cx="52" cy="35" r="5" fill="#fff" />
        <path
          d="M25 50 Q40 60 55 50"
          stroke="#fff"
          strokeWidth="3"
          fill="transparent"
        />
      </svg>

      {/* بدن */}
      <div className="w-6 h-20 bg-gray-800 rounded mt-1 relative">
        {/* دست‌ها متحرک */}
        <motion.div
          className="absolute -left-10 top-3 w-10 h-2 bg-gray-800 rounded"
          animate={{ rotate: [0, 25, -25, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, delay }}
        />
        <motion.div
          className="absolute -right-10 top-3 w-10 h-2 bg-gray-800 rounded"
          animate={{ rotate: [0, -25, 25, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, delay }}
        />
      </div>
    </motion.div>
  );
}

export default function DashboardStory({
  showIntro,
  setShowIntro,
}: {
  setShowIntro: (v: boolean) => void;
  showIntro: boolean;
}) {
  //   const [show, setShow] = useState(true);

  const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#6A4C93"];
  const storyTexts = [
    "چند نفر با ایده‌ها و آرزوهای بزرگ دور هم جمع شدند...",
    "تصمیم گرفتند کسب‌وکاری راه بیندازند که همه چیز را ساده کند و زندگی مردم را راحت‌تر کند...",
    "آن‌ها می‌خواستند نه تنها برای خودشان سود داشته باشند، بلکه فروش تامین‌کننده‌ها و شریکانشان را هم افزایش دهند!",
  ];

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center p-6 z-50"
        >
          {/* دکمه Close */}
          <button
            onClick={() => setShowIntro(false)}
            className="absolute top-5 right-5 bg-white text-black px-3 py-1 rounded hover:bg-gray-200 transition"
          >
            Close
          </button>

          {/* متن داستان مرحله‌ای */}
          <div className="text-center text-white mb-8 space-y-2" dir="rtl">
            {storyTexts.map((text, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: idx * 1.8,
                  type: "spring",
                  stiffness: 100,
                }}
                className="text-lg font-semibold"
              >
                {text}
              </motion.p>
            ))}
          </div>

          {/* کارکترها */}
          <div className="flex justify-center space-x-8 relative z-10">
            {colors.map((c, idx) => (
              <Character key={idx} color={c} delay={idx * 0.3} />
            ))}
          </div>

          {/* نور ایده (lightbulb) */}
          <motion.div
            className="absolute top-20 w-20 h-20 bg-yellow-400 rounded-full shadow-xl"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: [0, 1.3, 1], rotate: [0, 15, -15, 0] }}
            transition={{
              delay: 4.5,
              duration: 2,
              type: "tween",
              ease: "easeInOut",
            }}
          />

          {/* ذرات نورانی */}
          {Array.from({ length: 20 }).map((_, idx) => (
            <motion.div
              key={idx}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: [-50 + Math.random() * 100, 0],
                y: [-50 + Math.random() * 100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                delay: 4.5 + Math.random(),
                repeat: Infinity,
                duration: 2 + Math.random() * 2,
              }}
              style={{
                top: `${50 + Math.random() * 100}px`,
                left: `${50 + Math.random() * 100}px`,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
