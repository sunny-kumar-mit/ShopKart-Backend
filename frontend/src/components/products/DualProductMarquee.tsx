import { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { MarqueeProductCard } from '@/components/products/MarqueeProductCard';
import { cn } from '@/lib/utils';
import { useRef, useEffect, useState } from 'react';

interface DualProductMarqueeProps {
    products: Product[];
    title?: string;
    subtitle?: string;
}

export function DualProductMarquee({ products, title, subtitle }: DualProductMarqueeProps) {
    // Split products into two rows
    const midPoint = Math.ceil(products.length / 2);
    const row1 = products.slice(0, midPoint);
    const row2 = products.slice(midPoint);

    // If we don't have enough products, just use the full list for both to look good
    const activeRow1 = row1.length < 5 ? products : row1;
    const activeRow2 = row2.length < 5 ? products : row2;

    return (
        <div className="space-y-8">
            {(title || subtitle) && (
                <div className="mb-6">
                    {title && <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>}
                    {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
                </div>
            )}

            <div className="flex flex-col gap-6">

                {/* Row 1 - Moving Left */}
                <div className="relative w-full overflow-hidden group rounded-xl bg-muted/5 border">
                    <div className="flex w-max gap-4 animate-scroll-left p-4">
                        {/* Original Set */}
                        {activeRow1.map((product) => (
                            <div key={`r1-o-${product.id}`} className="w-[300px] shrink-0">
                                <MarqueeProductCard product={product} />
                            </div>
                        ))}
                        {/* Duplicate Set for Loop */}
                        {activeRow1.map((product) => (
                            <div key={`r1-d-${product.id}`} className="w-[300px] shrink-0">
                                <MarqueeProductCard product={product} />
                            </div>
                        ))}
                    </div>
                    {/* Gradients */}
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background/80 to-transparent z-10 pointer-events-none" />
                </div>

                {/* Row 2 - Moving Right */}
                <div className="relative w-full overflow-hidden group rounded-xl bg-muted/5 border">
                    <div className="flex w-max gap-4 animate-scroll-right p-4">
                        {/* Duplicate Set */}
                        {activeRow2.map((product) => (
                            <div key={`r2-d-${product.id}`} className="w-[300px] shrink-0">
                                <MarqueeProductCard product={product} />
                            </div>
                        ))}
                        {/* Original Set */}
                        {activeRow2.map((product) => (
                            <div key={`r2-o-${product.id}`} className="w-[300px] shrink-0">
                                <MarqueeProductCard product={product} />
                            </div>
                        ))}
                    </div>
                    {/* Gradients */}
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background/80 to-transparent z-10 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
