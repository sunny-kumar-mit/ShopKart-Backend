import { Truck, Shield, RefreshCw, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over ₹499',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure transactions',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30 days return policy',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated customer service',
  },
];

export function FeaturesBar() {
  return (
    <section className="py-8 bg-muted">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-4 p-4 bg-card rounded-xl"
            >
              <div className="p-3 rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
