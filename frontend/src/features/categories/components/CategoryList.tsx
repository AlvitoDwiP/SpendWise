"use client";

import { motion } from "framer-motion";

import type { Category } from "@/types/category.types";
import { CategoryCard } from "./CategoryCard";

type CategoryListProps = {
  categories: Category[];
  onDeleteClick: (category: Category) => void;
  onEditClick: (category: Category) => void;
};

export function CategoryList({
  categories,
  onDeleteClick,
  onEditClick,
}: CategoryListProps) {
  return (
    <motion.div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      {categories.map((category) => (
        <CategoryCard
          category={category}
          key={category.id}
          onDeleteClick={onDeleteClick}
          onEditClick={onEditClick}
        />
      ))}
    </motion.div>
  );
}
