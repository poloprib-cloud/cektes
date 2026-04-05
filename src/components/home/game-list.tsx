import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface Game {
  id: number | string;
  title: string;
  developers?: string | null;
  image: string;
  slug: string;
}

interface GameListProps {
  isLoading: boolean;
  filteredGames?: Game[];
}

export function GameList({ isLoading, filteredGames }: GameListProps) {
  const [visibleCount, setVisibleCount] = useState(12);

  const games = useMemo(() => {
    return Array.isArray(filteredGames) ? filteredGames : [];
  }, [filteredGames]);

  const visibleGames = useMemo(() => {
    return games.slice(0, visibleCount);
  }, [games, visibleCount]);

  const loadMoreGames = () => setVisibleCount((prev) => prev + 6);

  if (!isLoading && games.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
        <div className="text-sm font-medium">Game belum tersedia</div>
        <div className="mt-1 text-xs text-muted-foreground">Coba pilih kategori lain atau refresh halaman.</div>
      </div>
    );
  }

  return (
    <>
      <motion.ul
        className="mb-4 grid grid-cols-3 gap-4 sm:mb-8 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-5 xl:grid-cols-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        {isLoading
          ? [...Array(9)].map((_, index) => (
              <li key={`skeleton-${index}`} className="relative rounded-xl bg-muted">
                <Skeleton className="w-full aspect-square rounded-xl" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </li>
            ))
          : visibleGames.map((game: any, index: number) => (
              <motion.li
                key={String(game.id)}
                className="group relative"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03, ease: [0.4, 0.0, 0.2, 1] }}
                layout
              >
                <Link prefetch href={`/order/${game.slug}`} className="block">
                  <div className="relative transform overflow-hidden rounded-xl bg-muted duration-300 ease-in-out hover:shadow-2xl hover:ring-my-color hover:ring-offset-2 hover:ring-offset-background hover:ring-[3px]">
                    <div className="w-full aspect-square overflow-hidden rounded-t-xl">
                      <Image
                        src={game.image}
                        alt={game.title}
                        width={192}
                        height={288}
                        className="aspect-square rounded-t-xl object-cover object-center transition-all duration-300 group-hover:scale-105"
                        priority
                      />
                    </div>
                    <div className="p-3">
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{game.title}</h2>
                      <p className="text-xs text-gray-400 truncate">{game.developers || ""}</p>
                    </div>
                  </div>
                </Link>
              </motion.li>
            ))}
      </motion.ul>

      {!isLoading && games.length > 0 && visibleCount < games.length && (
        <div className="flex justify-center mt-4">
          <motion.button
            onClick={loadMoreGames}
            className="px-6 py-2 text-sm font-medium bg-muted rounded-full shadow-md transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="button"
          >
            Tampilkan Lainnya...
          </motion.button>
        </div>
      )}
    </>
  );
}