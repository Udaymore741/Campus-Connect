import { categories } from "../data/mockData";
import { cn } from "@/lib/utils";

/**
 * @param {{ selectedCategory: string | null, onSelectCategory: (category: string | null) => void }} props
 */
export default function CategorySelector({ selectedCategory, onSelectCategory }) {
  return (
    <div className="overflow-x-auto pb-2 -mx-2 px-2">
      <div className="flex space-x-2 min-w-max">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "px-4 py-2 text-sm rounded-full transition-all",
            selectedCategory === null
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary hover:bg-secondary/80 text-foreground"
          )}
        >
          All
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.slug)}
            className={cn(
              "px-4 py-2 text-sm rounded-full transition-all",
              selectedCategory === category.slug
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary hover:bg-secondary/80 text-foreground"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
} 