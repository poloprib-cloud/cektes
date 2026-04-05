import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface Game {
  id: string;
  title: string;
  developers: string;
  image: string;
  slug: string;
}

interface PopularGamesProps {
  isLoading: boolean;
  popularGames?: Game[];
}

export function PopularGames({ isLoading, popularGames }: PopularGamesProps) {
  return (
        <div>
          <motion.div className="mb-5 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}>
            <div className="flex items-center gap-1 mb-2">
              <Image 
                src="/promo.gif"
                alt="Promo"
                width={28} 
                height={28} 
                className="w-7 h-7" />
              <h3 className="text-lg font-semibold uppercase leading-relaxed tracking-wider">
                TRENDING
              </h3>
            </div>
            <p className="pl-6 text-xs">
              Berikut adalah beberapa produk yang paling populer saat ini.
            </p>
          </motion.div>
    
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {isLoading
              ?
                Array.from({ length: 6 }).map((_, index) => (
                  <li key={index} className="relative rounded-2xl">
                    <div
                      className="w-full h-20 rounded-2xl animate-pulse bg-gray-700/50 dark:bg-gray-600/50"
                      style={{
                        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 10%, transparent 20%)`,
                        backgroundSize: "5px 5px",
                      }}
                    />
                  </li>
                ))
              :
                popularGames?.map((gamePopuler: Game, index: number) => (
                  <motion.li
                    key={gamePopuler.id}
                    className="group relative rounded-2xl bg-muted transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{
                      backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 10%, transparent 20%)`,
                      backgroundSize: "5px 5px",
                    }}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      ease: [0.4, 0.0, 0.2, 1],
                    }}
                  >
                    <Link prefetch={true}
                      href={`/order/${gamePopuler.slug}`}
                      className="flex items-center gap-2 p-2 rounded-2xl bg-opacity-80 hover:bg-opacity-100 transition-all duration-300 ease-in-out hover:shadow-2xl hover:ring-my-color hover:ring-offset-2 hover:ring-offset-background hover:ring-[3px]"
                    >
                      {/* Gambar Game */}
                      <Image
                        alt={gamePopuler.title}
                        priority={true}
                        width={56}
                        height={56}
                        className="aspect-square h-14 w-14 rounded-xl object-cover shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg md:h-20 md:w-20"
                        src={gamePopuler.image}
                        crossOrigin="anonymous"
                      />
    
                      {/* Informasi Game */}
                      <div className="flex-1 overflow-hidden">
                        <h2 className="truncate text-xs font-semibold sm:max-w-[125px] md:max-w-[150px] md:text-base lg:max-w-[175px]">
                          {gamePopuler.title}
                        </h2>
                        <p className="truncate text-xs opacity-80 md:text-sm">
                          {gamePopuler.developers}
                        </p>
                      </div>
                    </Link>
                  </motion.li>
                ))}
          </ul>
        </div>
  );
}