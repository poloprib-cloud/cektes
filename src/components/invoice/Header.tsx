"use client";

import { motion } from "framer-motion";
import Lottie from "react-lottie-player";
import { Transaction } from "@/types";
import LottiePlayerClient from "@/components/LottiePlayerClient";

interface InvoiceHeaderProps {
  order: Transaction | null;
  getLottieAnimation: () => any;
  getPayStatusMessage: () => string;
  getBuyStatusMessage: () => string;
  getBackgroundColor: () => string;
}

export function InvoiceHeader({
  order,
  getLottieAnimation,
  getPayStatusMessage,
  getBuyStatusMessage,
  getBackgroundColor
}: InvoiceHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center min-h-[300px] text-warning-foreground p-8 -mx-4 -my-8 md:-mx-8 ${getBackgroundColor()}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-40 md:w-64 lg:w-80">
          <LottiePlayerClient loop animationData={getLottieAnimation()} play />
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-white mt-4">
          {getPayStatusMessage()}
        </h2>
        <p className="text-sm md:text-lg font-medium text-white mt-2">
          {getBuyStatusMessage()}
        </p>
      </motion.div>
    </motion.div>
  );
}