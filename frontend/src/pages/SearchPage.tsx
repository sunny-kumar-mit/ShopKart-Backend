
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { products } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { SlidersHorizontal, X, Star, Grid3X3, List, Search as SearchIcon } from 'lucide-react';
import { PriceFilter } from '@/components/filters/PriceFilter';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [priceRange, setPriceRange] = useState<[number, number]>([0, 150000]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState('relevance');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filter products based on search query
    const searchResults = products.filter((p) => {
        const searchLower = query.toLowerCase();
        return (
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower) ||
            p.brand.toLowerCase().includes(searchLower)
        );
    });

    // Get unique brands from search results
    const brands = [...new Set(searchResults.map((p) => p.brand))];

    // Apply active filters
    let filteredProducts = searchResults.filter((product) => {
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
        const matchesRating = selectedRating === null || product.rating >= selectedRating;
        return matchesPrice && matchesBrand && matchesRating;
    });

    // Sort products
    filteredProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return b.rating - a.rating;
            case 'discount':
                return (b.discount || 0) - (a.discount || 0);
            default:
                // For relevance, we could score matches, but simple inclusion is fine for now
                return 0;
        }
    });

    const toggleBrand = (brand: string) => {
        setSelectedBrands((prev) =>
            prev.includes(brand)
                ? prev.filter((b) => b !== brand)
                : [...prev, brand]
        );
    };

    const clearFilters = () => {
        setPriceRange([0, 150000]);
        setSelectedBrands([]);
        setSelectedRating(null);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 150000 || selectedBrands.length > 0 || selectedRating !== null;

    // Reset filters when query changes
    useEffect(() => {
        clearFilters();
    }, [query]);

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Price Range */}
            <PriceFilter
                min={0}
                max={150000}
                step={1000}
                onChange={setPriceRange} // The PriceFilter now handles efficient local state, pushing changes up
                initialValue={priceRange}
            />

            {/* Brands */}
            <div>
                <h3 className="font-semibold text-foreground mb-4">Brand</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                        <label
                            key={brand}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <Checkbox
                                checked={selectedBrands.includes(brand)}
                                onCheckedChange={() => toggleBrand(brand)}
                            />
                            <span className="text-sm">{brand}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Rating */}
            <div>
                <h3 className="font-semibold text-foreground mb-4">Customer Rating</h3>
                <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                            className={cn(
                                "flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors",
                                selectedRating === rating
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                            )}
                        >
                            <span>{rating}</span>
                            <Star className={cn("h-4 w-4", selectedRating === rating ? "fill-current" : "")} />
                            <span>& above</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                </Button>
            )}
        </div>
    );

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Search Results for "<span className="text-primary">{query}</span>"
                    </h1>
                    <p className="text-muted-foreground">
                        Found {filteredProducts.length} items
                    </p>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Filters */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-24 bg-card rounded-xl border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold text-lg">Filters</h2>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                            <FilterContent />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between gap-4 mb-6 bg-card rounded-xl border p-4">
                            {/* Mobile Filter Button */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="lg:hidden">
                                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                                        Filters
                                        {hasActiveFilters && (
                                            <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                                !
                                            </span>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-80">
                                    <SheetHeader>
                                        <SheetTitle>Filters</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6">
                                        <FilterContent />
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* Sort */}
                            <div className="flex items-center gap-4 ml-auto">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="relevance">Relevance</SelectItem>
                                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                                        <SelectItem value="rating">Highest Rated</SelectItem>
                                        <SelectItem value="discount">Biggest Discount</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* View Mode */}
                                <div className="hidden md:flex items-center border rounded-lg">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="icon"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="icon"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {priceRange[0] > 0 || priceRange[1] < 150000 ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                                        <button onClick={() => setPriceRange([0, 150000])}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ) : null}
                                {selectedBrands.map((brand) => (
                                    <span
                                        key={brand}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                                    >
                                        {brand}
                                        <button onClick={() => toggleBrand(brand)}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                                {selectedRating && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                                        {selectedRating}+ Stars
                                        <button onClick={() => setSelectedRating(null)}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Products Grid */}
                        {filteredProducts.length > 0 ? (
                            <div
                                className={cn(
                                    "grid gap-4",
                                    viewMode === 'grid'
                                        ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                                        : "grid-cols-1"
                                )}
                            >
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 flex flex-col items-center">
                                <div className="p-6 bg-muted rounded-full mb-4">
                                    <SearchIcon className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">
                                    We couldn't find any products matching "{query}". Try checking for typos or using different keywords.
                                </p>
                                <Button onClick={clearFilters}>Clear Filters</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
