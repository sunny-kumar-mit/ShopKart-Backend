import { Layout } from '@/components/layout/Layout';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryGrid } from '@/components/categories/CategoryGrid';
import { DealsSection } from '@/components/home/DealsSection';
import { ProductGrid } from '@/components/products/ProductGrid';
import { FeaturesBar } from '@/components/home/FeaturesBar';
import { DualProductMarquee } from '@/components/products/DualProductMarquee';
import { categories, products, dealProducts, trendingProducts } from '@/data/mockData';

const Index = () => {
  return (
    <Layout>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Features Bar */}
      <FeaturesBar />

      {/* Categories */}
      <div className="container mx-auto px-4">
        <CategoryGrid categories={categories} />
      </div>

      {/* Flash Deals */}
      <div className="container mx-auto px-4">
        <DealsSection products={dealProducts} />
      </div>

      {/* Trending Products */}
      <div className="container mx-auto px-4">
        <ProductGrid
          products={trendingProducts}
          title="Trending Now"
          subtitle="Most popular products this week"
        />
      </div>

      {/* All Products Marquee */}
      <div className="container mx-auto px-4 pb-12">
        <DualProductMarquee
          products={products}
          title="Explore All Products"
          subtitle="Discover our complete collection"
        />
      </div>
    </Layout>
  );
};

export default Index;
