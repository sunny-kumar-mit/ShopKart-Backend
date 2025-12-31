import { Link } from 'react-router-dom';
import { Category } from '@/types';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/category/${category.slug}`} className="block">
      <motion.div
        whileHover={{
          y: -5,
          scale: 1.05,
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)"
        }}
        className="group flex flex-col items-center p-4 min-w-[140px] mx-2 rounded-2xl bg-white border border-gray-100/50 hover:border-blue-200 transition-all duration-300 cursor-pointer relative overflow-hidden"
      >
        {/* Decorative Background Gradient on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/50 transition-all duration-300" />

        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full p-[2px] mb-3 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-400 group-hover:to-purple-500 transition-all duration-500">
          <div className="w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover rounded-full transform transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </div>

        <h3 className="relative text-sm md:text-base font-bold text-gray-700 text-center group-hover:text-blue-600 transition-colors">
          {category.name}
        </h3>
        <p className="relative text-xs text-gray-400 mt-1 font-medium group-hover:text-gray-500">
          {category.productCount.toLocaleString()} items
        </p>
      </motion.div>
    </Link>
  );
}

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Duplicate categories to create seamless loop
  const marqueeCategories = [...categories, ...categories, ...categories];

  return (
    <section className="py-12 overflow-hidden bg-gradient-to-b from-transparent to-blue-50/30">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
          Shop by Category
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {categories.length} Classics
          </span>
        </h2>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full flex">
        {/* Gradient Masks for smooth fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex"
          animate={{
            x: ["0%", "-33.33%"] // Move one set length
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20, // Adjust for speed (seconds)
              ease: "linear",
            },
          }}
          whileHover={{ animationPlayState: "paused" }} // Optional: pause on hover if implemented via CSS, but tricky with motion. animate props don't support playState directly easily without useAnimation. We'll stick to continuous flow or valid framer motion controls.
        >
          {marqueeCategories.map((category, index) => (
            <div key={`${category.id}-${index}`} className="flex-shrink-0">
              <CategoryCard category={category} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
