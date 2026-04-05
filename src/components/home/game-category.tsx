import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: number | string;
  title: string;
}

interface GameCategoriesProps {
  dataCategories?: { data: Category[] };
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string) => void;
  scrollCategories: (direction: "left" | "right") => void;
  categoryRef: React.RefObject<HTMLDivElement>;
}

export function GameCategories({
  dataCategories,
  selectedCategory,
  setSelectedCategory,
  scrollCategories,
  categoryRef,
}: GameCategoriesProps) {
  const categoryContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const categoryItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <>
      {dataCategories ? (
        <motion.div className="relative flex items-center" initial="hidden" animate="visible" variants={categoryContainerVariants}>
          <motion.button
            type="button"
            className="absolute left-0 bg-my-color p-2 rounded-full text-white shadow-md"
            onClick={() => scrollCategories("left")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={20} />
          </motion.button>

          <motion.div
            ref={categoryRef}
            className="hide-scrollbar mx-11 flex transform items-center gap-2 overflow-auto duration-300 ease-in-out md:gap-3"
            variants={categoryContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {dataCategories.data.map((category: any) => {
              const id = String(category.id);
              const active = String(selectedCategory || "") === id;

              return (
                <motion.button
                  type="button"
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold outline-none duration-300 ${
                    active ? "bg-my-color text-white" : "border border-border bg-muted"
                  }`}
                  variants={categoryItemVariants}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {category.title}
                </motion.button>
              );
            })}
          </motion.div>

          <motion.button
            type="button"
            className="absolute right-0 bg-my-color p-2 rounded-full text-white shadow-md"
            onClick={() => scrollCategories("right")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      ) : (
        <motion.div className="relative flex items-center">
          <motion.div className="absolute left-0 z-10 rounded-full shadow-md bg-muted" style={{ width: 40, height: 40 }} />
          <div className="hide-scrollbar mx-11 flex transform items-center gap-2 overflow-auto duration-300 ease-in-out md:gap-3">
            {[...Array(3)].map((_, index) => (
              <motion.div key={index} className="whitespace-nowrap rounded-full px-14 py-3 h-8 w-24 bg-muted" />
            ))}
          </div>
          <motion.div className="absolute right-0 z-10 rounded-full shadow-md bg-muted" style={{ width: 40, height: 40 }} />
        </motion.div>
      )}
    </>
  );
}