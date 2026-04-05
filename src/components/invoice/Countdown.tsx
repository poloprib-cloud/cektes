import { motion } from "framer-motion";
import { Transaction } from "@/types";

interface InvoiceCountdownProps {
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export function InvoiceCountdown({ timeLeft }: InvoiceCountdownProps) {
  return (
    <div className="flex items-center justify-between gap-4 mt-4">
      <motion.div 
        className="flex gap-2 rounded-lg md:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/80 px-4 py-1.5">
          <div className="flex gap-1 text-sm font-semibold text-destructive-foreground md:text-base">
            <span>{timeLeft.hours}</span>
            <span>Jam</span>
          </div>
          <div className="flex gap-1 text-sm font-semibold text-destructive-foreground md:text-base">
            <span>{timeLeft.minutes}</span>
            <span>Menit</span>
          </div>
          <div className="flex gap-1 text-sm font-semibold text-destructive-foreground md:text-base">
            <span>{timeLeft.seconds}</span>
            <span>Detik</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}