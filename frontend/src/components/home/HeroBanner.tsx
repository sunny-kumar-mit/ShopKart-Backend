import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  gradient: string;
  image?: string;
}

const banners: Banner[] = [
  {
    id: '1',
    title: 'Mega Electronics Sale',
    subtitle: 'Up to 70% off on Smartphones, Laptops & More',
    cta: 'Shop Now',
    link: '/category/electronics',
    gradient: 'from-blue-900/90 via-blue-800/80 to-indigo-900/80',
    image: 'https://www.electronicsforyou.biz/wp-content/uploads/2019/08/Consumer-Electronics-Appliance_Sept-19.jpg', // Electronics background
  },
  {
    id: '2',
    title: 'Fashion Festival',
    subtitle: 'Flat 50% off on Top Brands',
    cta: 'Explore Fashion',
    link: '/category/fashion',
    gradient: 'from-pink-900/80 via-rose-800/70 to-red-900/80',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop', // Fashion background
  },
  {
    id: '3',
    title: 'Home Makeover Days',
    subtitle: 'Transform your space with exclusive deals',
    cta: 'Discover Deals',
    link: '/category/home-living',
    gradient: 'from-emerald-900/80 via-teal-800/70 to-cyan-900/80',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop', // Home decor background
  },
  {
    id: '4',
    title: 'Beauty Bonanza',
    subtitle: 'Glow up with up to 60% off on Beauty & Care',
    cta: 'Shop Beauty',
    link: '/category/beauty',
    gradient: 'from-purple-900/80 via-fuchsia-800/70 to-pink-900/80',
    image: 'https://www.bonanzasalon.com/wp-content/uploads/2024/04/X2A3100-scaled.jpg',
    // Beauty & cosmetics background
  },
  {
    id: '5',
    title: 'Sports & Fitness Zone',
    subtitle: 'Gear up with the best sports & fitness deals',
    cta: 'Get Active',
    link: '/category/sports',
    gradient: 'from-orange-900/80 via-amber-800/70 to-yellow-900/80',
    image: 'https://framerusercontent.com/images/fKTBjaGZiCXXIiDzNzidU0KX0.webp?width=1360&height=914',
    // Sports & fitness background
  },
  {
    id: '6',
    title: 'Books & Learning Fest',
    subtitle: 'Expand your knowledge with must-read books',
    cta: 'Start Reading',
    link: '/category/books',
    gradient: 'from-slate-900/80 via-gray-800/70 to-zinc-900/80',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2000&auto=format&fit=crop',
    // Books & learning background
  },

];

// Helper Component for Typewriter Effect
const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset when text changes
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50); // Typing speed

    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}<span className="animate-pulse">|</span></span>;
};

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 2800); // Increased slightly to allow typing to finish
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <section className="relative overflow-hidden group">
      <div className="relative h-[300px] md:h-[400px] lg:h-[500px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-in-out",
              index === currentSlide
                ? "opacity-100 translate-x-0"
                : index < currentSlide
                  ? "opacity-0 -translate-x-full"
                  : "opacity-0 translate-x-full"
            )}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay for Text Readability */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r",
                banner.gradient
              )} />
            </div>

            <div className="relative h-full container mx-auto px-4 flex items-center">
              <div className="max-w-2xl text-white animate-slide-up ml-4 md:ml-12">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 drop-shadow-xl tracking-tight leading-tight">
                  {banner.title}
                </h1>
                <p className="text-lg md:text-2xl font-medium mb-8 text-white/90 drop-shadow-md max-w-lg min-h-[32px]">
                  {index === currentSlide && <TypewriterText text={banner.subtitle} />}
                </p>
                <Button
                  variant="default"
                  size="xl"
                  className="font-bold text-lg px-8 py-6 rounded-full shadow-lg shadow-black/20 hover:scale-105 transition-transform bg-white text-black hover:bg-white/90"
                >
                  {banner.cta}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300 shadow-sm",
              index === currentSlide
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/70"
            )}
          />
        ))}
      </div>
    </section>
  );
}
