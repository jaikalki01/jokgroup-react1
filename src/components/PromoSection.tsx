
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PromoSection = () => {
  return (
    <div className="py-12 bg-gradient-to-r from-navy via-navy/90 to-navy/80 text-white">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Special Offer</h2>
            <p className="text-xl mb-6">
              Get up to 30% off on selected items. Limited time offer.
            </p>
            <Button asChild size="lg" className="bg-terracotta hover:bg-terracotta/90">
              <Link to="/products">Shop Now</Link>
            </Button>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg inline-block">
              <div className="text-5xl md:text-6xl font-bold mb-2">30%</div>
              <div className="text-xl">DISCOUNT</div>
              <div className="text-sm mt-2">Use code: WELCOME10</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoSection;
