import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductGrid from './ProductGrid';

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch featured products
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/product/list?newArrival=false&bestSeller=false'); // Adjust to your FastAPI URL
        const data = await response.json();
        setFeaturedProducts(data); // Setting featured products if necessary
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };
    
const fetchNewArrivals = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/product/new-arrivals');
    const data = await response.json();
    console.log('New Arrivals data:', data);
    setNewArrivals(data);
  } catch (error) {
    console.error('Error fetching new arrival products:', error);
  }
};




    // Fetch best seller products
    const fetchBestSellers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/product/list?bestSeller=true');
        const data = await response.json();
        setBestSellers(data);
      } catch (error) {
        console.error('Error fetching best seller products:', error);
      }
    };

    // Fetch all categories of products
    fetchFeaturedProducts();
    fetchNewArrivals();
    fetchBestSellers();
  }, []);

  return (
    <div className="py-12">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Discover Our Collection</h2>
        
        <Tabs defaultValue="featured" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="new">New Arrivals</TabsTrigger>
              <TabsTrigger value="bestseller">Best Sellers</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Featured Products Tab */}
          <TabsContent value="featured">
            <ProductGrid products={featuredProducts} title=""/>
          </TabsContent>

          {/* New Arrivals Tab */}
          <TabsContent value="new">
            <ProductGrid products={newArrivals} title="" />
          </TabsContent>
          
          {/* Best Sellers Tab */}
          <TabsContent value="bestseller">
            <ProductGrid products={bestSellers}title="" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeaturedProducts;
