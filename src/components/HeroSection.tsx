
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <div className="relative h-[70vh] text-white">
      <div className="" />
      
      <div className="absolute inset-0 bg-[url('/jokgroup-banner.jpg')] bg-cover bg-right bg-no-repeat" />
      
      <div className="container relative z-20 h-full flex flex-col justify-center px-4 md:px-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">New Season Arrivals</h1>
          <p className="text-lg md:text-xl mb-6 text-gray-200">
            Discover the latest trends and elevate your style with our new collection.
          </p>
          <div className="flex space-x-4">
            <Button asChild size="lg" variant="outline" className="border-white text-navy hover:bg-white/10">
              <Link to="/products">Shop Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-navy hover:bg-white/10">
              <Link to="/new-arrivals">New Arrivals</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
