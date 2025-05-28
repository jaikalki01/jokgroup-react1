import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductGrid from './ProductGrid';

const FeaturedProducts = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    // Always fetch all products on mount
    const fetchAllProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/product/list');
        const data = await response.json();
        setAllProducts(Array.isArray(data) ? data : data.products || []);
      } catch (error) {
        console.error('Error fetching all products:', error);
      }
    };
    fetchAllProducts();
  }, []);

  // Fetch new arrivals, best sellers only when their tab is selected (lazy loading)
  useEffect(() => {
    if (tab === 'new' && newArrivals.length === 0) {
      const fetchNewArrivals = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/v1/product/new-arrivals');
          const data = await response.json();
          setNewArrivals(Array.isArray(data) ? data : data.products || []);
        } catch (error) {
          console.error('Error fetching new arrival products:', error);
        }
      };
      fetchNewArrivals();
    }
    if (tab === 'bestseller' && bestSellers.length === 0) {
      const fetchBestSellers = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/v1/product/list?bestSeller=true');
          const data = await response.json();
          setBestSellers(Array.isArray(data) ? data : data.products || []);
        } catch (error) {
          console.error('Error fetching best seller products:', error);
        }
      };
      fetchBestSellers();
    }
  }, [tab, newArrivals.length, bestSellers.length]);

  return (
    <div className="py-12">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Discover Our Collection</h2>
        
        <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="new">New Arrivals</TabsTrigger>
              <TabsTrigger value="bestseller">Best Sellers</TabsTrigger>
            </TabsList>
          </div>
          
          {/* All Products Tab */}
          <TabsContent value="all">
            <ProductGrid products={allProducts} title="" />
          </TabsContent>

          {/* New Arrivals Tab */}
          <TabsContent value="new">
            <ProductGrid products={newArrivals} title="" />
          </TabsContent>
          
          {/* Best Sellers Tab */}
          <TabsContent value="bestseller">
            <ProductGrid products={bestSellers} title="" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeaturedProducts;
