import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PriceFilterProps {
    min: number;
    max: number;
    step?: number;
    onChange: (value: [number, number]) => void;
    initialValue?: [number, number];
}

export function PriceFilter({ min, max, step = 1000, onChange, initialValue }: PriceFilterProps) {
    // Local state for smooth implementation
    const [localValue, setLocalValue] = useState<[number, number]>(initialValue || [min, max]);

    // Update local state when initialValue changes (e.g. from URL or reset)
    useEffect(() => {
        if (initialValue) {
            setLocalValue(initialValue);
        }
    }, [initialValue]);

    // Handle Slider Change
    const handleSliderChange = (newValue: number[]) => {
        const val = newValue as [number, number];
        setLocalValue(val);
        onChange(val);
    };

    // Handle Input Change
    const handleInputChange = (index: 0 | 1, val: string) => {
        const numVal = Number(val);
        const newRange = [...localValue] as [number, number];
        newRange[index] = numVal;
        setLocalValue(newRange);
        onChange(newRange);
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-foreground mb-4">Price Range</h3>

            {/* Histogram Placeholder (Optional Visual) */}
            <div className="h-10 w-full flex items-end justify-between gap-1 px-1 mb-2 opacity-50">
                {/* Generate some fake bars for visual appeal */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-primary/20 rounded-t-sm w-full"
                        style={{ height: `${Math.random() * 100}%` }}
                    />
                ))}
            </div>

            <Slider
                value={localValue}
                min={min}
                max={max}
                step={step}
                onValueChange={handleSliderChange}
                className="mb-6"
            />

            <div className="flex items-center gap-4">
                <div className="grid gap-1.5 flex-1">
                    <Label className="text-xs text-muted-foreground">Min Price</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                        <Input
                            type="number"
                            value={localValue[0]}
                            onChange={(e) => handleInputChange(0, e.target.value)}
                            className="pl-7 h-9"
                        />
                    </div>
                </div>
                <div className="grid gap-1.5 flex-1">
                    <Label className="text-xs text-muted-foreground">Max Price</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                        <Input
                            type="number"
                            value={localValue[1]}
                            onChange={(e) => handleInputChange(1, e.target.value)}
                            className="pl-7 h-9"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
