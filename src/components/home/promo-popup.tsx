"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogTitle, DialogContent, DialogClose } from "@/components/ui/dialog";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function PromoPopup() {
  const { data } = useSWR("/api/popup-promo", fetcher);
  const [showPopup, setShowPopup] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const dismissedUntil = localStorage.getItem("promo_dismissed_until");
    const now = new Date();

    if (dismissedUntil && new Date(dismissedUntil) > now) return;

    if (data?.promo && data.promo.is_active) {
      const start = new Date(data.promo.start_at);
      const end = new Date(data.promo.end_at);

      if (now >= start && now <= end) {
        setTimeout(() => setShowPopup(true), 1000);
      }
    }
  }, [data]);

  const handleClose = () => {
    if (dontShowAgain) {
      const oneHourLater = new Date();
      oneHourLater.setHours(oneHourLater.getHours() + 1);
      localStorage.setItem("promo_dismissed_until", oneHourLater.toISOString());
    }
    setShowPopup(false);
  };

  if (!data?.promo) return null;

  return (
    <AnimatePresence>
      {showPopup && (
        <Dialog open={showPopup} onOpenChange={setShowPopup}>
          <DialogContent className="max-w-sm p-0 overflow-hidden rounded-lg">
            <DialogTitle className="sr-only">{data.promo.title}</DialogTitle>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { when: "beforeChildren", staggerChildren: 0.1 },
              }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50"
                    onClick={handleClose}
                  >
                    <X className="h-4 w-4 text-white" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogClose>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <Image
                  src={data.promo.image_url}
                  alt={data.promo.title}
                  width={640}
                  height={360}
                  className="w-full object-cover"
                  onLoad={() => setIsImageLoaded(true)}
                  style={{ opacity: isImageLoaded ? 1 : 0, transition: "opacity 0.3s ease" }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6"
              >
                <h3 className="text-lg font-semibold mb-2">{data.promo.title}</h3>

                {data.promo.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line mb-4">
                    {data.promo.description}
                  </p>
                )}

                {data.promo.link && (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400 }}>
                    <a
                      href={data.promo.link}
                      className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors mb-4"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Lihat Detail
                    </a>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-2 pt-4 border-t"
                >
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <input
                      type="checkbox"
                      id="dontShowAgain"
                      checked={dontShowAgain}
                      onChange={() => setDontShowAgain(!dontShowAgain)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </motion.div>
                  <label htmlFor="dontShowAgain" className="text-sm">
                    Jangan tampilkan lagi
                  </label>
                </motion.div>
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}