"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface GameHeaderProps {
  games: {
    image: string;
    banner: string;
    title: string;
    developers: string;
  } | null;
}

export default function GameHeader({ games }: GameHeaderProps) {
  return (
    <div className="relative w-full">
      <div className="relative -mx-4 -my-8 lg:-my-2">
        {games ? (
          <Image
            src={games.banner}
            alt={games.title}
            width={1280}
            height={400}
            className="h-48 w-full lg:rounded-2xl object-cover md:h-64 lg:h-80"
            priority
          />
        ) : (
          <Skeleton className="h-48 w-full md:h-64 lg:h-80 bg-muted" />
        )}
      </div>

      <section className="relative z-5 -mt-10 px-8 sm:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl bg-background/90 backdrop-blur-md ring-1 ring-border shadow-sm p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-6"
        >
          <div className="mx-auto md:mx-0 -mt-12 md:mt-0">
            {games ? (
              <Image
                src={games.image}
                alt={games.title}
                width={120}
                height={120}
                className="rounded-xl border shadow-md object-cover w-24 h-24 md:w-28 md:h-28"
              />
            ) : (
              <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-xl" />
            )}
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
            {games ? (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">{games.title}</h1>
                <p className="text-sm text-muted-foreground">{games.developers}</p>
              </>
            ) : (
              <>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
              </>
            )}

            <div className="hidden md:flex mt-4 gap-6">
              {games ? (
                <>
                  <FeatureGif src="/voltage.gif" alt="Proses Cepat" text="Proses Cepat" size={24} />
                  <FeatureGif src="/cs.gif" alt="Layanan Bantuan 24/7" text="Layanan Bantuan 24/7" size={24} />
                  <FeatureGif src="/safe.gif" alt="Pembayaran Aman" text="Pembayaran Aman" size={24} />
                </>
              ) : (
                <>
                  <FeatureSkeleton />
                  <FeatureSkeleton />
                  <FeatureSkeleton />
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="mt-6 md:hidden grid grid-cols-3 gap-4 text-center">
          {games ? (
            <>
              <FeatureGif src="/voltage.gif" alt="Proses Cepat" text="Proses Cepat" size={20} small />
              <FeatureGif src="/cs.gif" alt="Layanan Bantuan 24/7" text="Layanan Bantuan 24/7" size={20} small />
              <FeatureGif src="/safe.gif" alt="Pembayaran Aman" text="Pembayaran Aman" size={20} small />
            </>
          ) : (
            <>
              <FeatureSkeleton small />
              <FeatureSkeleton small />
              <FeatureSkeleton small />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function FeatureGif({
  src,
  alt,
  text,
  size,
  small,
}: {
  src: string;
  alt: string;
  text: string;
  size: number;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Image src={src} alt={alt} width={size} height={size} className="object-contain" unoptimized />
      <span className={`${small ? "text-[11px]" : "text-sm font-medium"} text-muted-foreground`}>
        {text}
      </span>
    </div>
  );
}

function FeatureSkeleton({ small = false }: { small?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Skeleton className={`rounded-full ${small ? "size-5" : "size-6"}`} />
      <Skeleton className={`${small ? "h-3 w-12" : "h-4 w-24"}`} />
    </div>
  );
}