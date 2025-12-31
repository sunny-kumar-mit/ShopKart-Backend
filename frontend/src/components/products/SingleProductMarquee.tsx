import { Product } from '@/types';
import { MarqueeProductCard } from '@/components/products/MarqueeProductCard';

interface SingleProductMarqueeProps {
    products: Product[];
    title?: string;
    direction?: 'left' | 'right';
}

export function SingleProductMarquee({ products, title, direction = 'right' }: SingleProductMarqueeProps) {
    // If we don't have enough products, just use the full list for both to look good
    const activeProducts = products.length < 5 ? [...products, ...products, ...products] : products;

    return (
        <div className="space-y-6">
            {title && <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>}

            <div className="relative w-full overflow-hidden group rounded-xl bg-muted/5 border">
                <div
                    className={`flex w-max gap-4 p-4 ${direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'
                        }`}
                >
                    {/* Render logic depends on direction for seamless loop? 
              scroll-right: moves 0% -> 100% (or -50% -> 0% in tailwind config?)
              Let's check tailwind config in memory:
              scroll-right: 0% { transform: translateX(-50%) }, 100% { transform: translateX(0) }
              This means it starts shifted left (showing 2nd half) and moves right to 0 (showing 1st half).
              So order should be [Duplicate, Original].
              
              scroll-left: 0% { translateX(0) }, 100% { translateX(-50%) }
              Starts at 0, moves left to -50%.
              Order should be [Original, Duplicate].
           */}

                    {direction === 'right' ? (
                        <>
                            {/* Duplicate Set (starts visible if we translate -50%) */}
                            {activeProducts.map((product, idx) => (
                                <div key={`d-${product.id}-${idx}`} className="w-[300px] shrink-0">
                                    <MarqueeProductCard product={product} />
                                </div>
                            ))}
                            {/* Original Set */}
                            {activeProducts.map((product, idx) => (
                                <div key={`o-${product.id}-${idx}`} className="w-[300px] shrink-0">
                                    <MarqueeProductCard product={product} />
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            {/* Original Set */}
                            {activeProducts.map((product, idx) => (
                                <div key={`o-${product.id}-${idx}`} className="w-[300px] shrink-0">
                                    <MarqueeProductCard product={product} />
                                </div>
                            ))}
                            {/* Duplicate Set */}
                            {activeProducts.map((product, idx) => (
                                <div key={`d-${product.id}-${idx}`} className="w-[300px] shrink-0">
                                    <MarqueeProductCard product={product} />
                                </div>
                            ))}
                        </>
                    )}
                </div>
                {/* Gradients */}
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background/80 to-transparent z-10 pointer-events-none" />
            </div>
        </div>
    );
}
