import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import FeaturedProducts from '@/components/FeaturedProducts';
import PromoSection from '@/components/PromoSection';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, ShoppingBag, Settings } from 'lucide-react';

const Index = () => {
  const { state } = useStore();
  const { isLoggedIn } = state;
  
  // State to store fetched data
  const [products, setProducts] = useState<any[]>([]);
  
  useEffect(() => {
    // Fetch data from your FastAPI backend
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/product/list'); // Replace with your FastAPI endpoint
        const data = await response.json();
        setProducts(data); // Update state with fetched data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchProducts(); // Call the fetch function
  }, []); // Empty array means this runs once when the component mounts
  
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {isLoggedIn && (
        <div className="container mx-auto my-8 px-4">
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">My Account</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/account/profile" className="flex flex-col items-center bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                  <User className="h-8 w-8 mb-3 text-navy" />
                  <h3 className="font-medium">My Profile</h3>
                  <p className="text-sm text-gray-500 text-center mt-2">Manage your personal information</p>
                </Link>
                
                <Link to="/account/orders" className="flex flex-col items-center bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                  <ShoppingBag className="h-8 w-8 mb-3 text-navy" />
                  <h3 className="font-medium">My Orders</h3>
                  <p className="text-sm text-gray-500 text-center mt-2">Track your order history</p>
                </Link>
                
                <Link to="/account/settings" className="flex flex-col items-center bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="h-8 w-8 mb-3 text-navy" />
                  <h3 className="font-medium">Account Settings</h3>
                  <p className="text-sm text-gray-500 text-center mt-2">Manage your account preferences</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <CategorySection />
      <FeaturedProducts />

      {/* Render fetched product data */}
      <div className="container mx-auto my-8 px-4">
        <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="p-4 border rounded-lg">
                 <img
    src={
      product.images
        ? Array.isArray(product.images)
          ? `http://localhost:8000/${product.images[0].replace(/^\/+/, '')}`
          : `http://localhost:8000/${JSON.parse(product.images)[0].replace(/^\/+/, '')}`
        : "/placeholder.png"
    }
    alt={product.name}
    className="w-full h-48 object-cover"
  />
                <h3 className="text-xl mt-2">Name:   {product.name}</h3>
                <p className="text-gray-500">Description:  {product.description}</p>
                <p className="text-lg font-semibold">Price: {product.price}</p>
              </div>
            ))
          ) : (
            <p>Loading products...</p>
          )}
        </div>
      </div>

      <PromoSection />
    </div>
  );
};

export default Index;
