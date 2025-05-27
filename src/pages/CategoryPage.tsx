import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductGrid from '@/components/ProductGrid';
import FilterSidebar from '@/components/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  subcategories?: Category[];
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category_id: string;
  subcategory_id?: string;
  createdAt: string;
  rating: number;
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [currentSubCategory, setCurrentSubCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch all categories on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/cat/list')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  // Fetch all subcategories on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/cat/subcategory/list')
      .then(res => res.json())
      .then(data => setSubcategories(data))
      .catch(console.error);
  }, []);

  // When slug changes, find category or subcategory with that slug
  useEffect(() => {
    if (!slug) return;

    // Find category by slug
    const foundCategory = categories.find(cat => cat.slug === slug);
    if (foundCategory) {
      setCurrentCategory(foundCategory);
      setCurrentSubCategory(null);
      setSearchQuery(''); // reset search on category change
      return;
    }

    // Find subcategory by slug
    const foundSubCategory = subcategories.find(sub => sub.slug === slug);
    if (foundSubCategory) {
      setCurrentSubCategory(foundSubCategory);

      // Also find parent category for display if needed
      const parentCategory = categories.find(cat => cat.id === foundSubCategory.category_id);
      setCurrentCategory(parentCategory || null);
      setSearchQuery('');
      return;
    }

    // If no match, clear
    setCurrentCategory(null);
    setCurrentSubCategory(null);
  }, [slug, categories, subcategories]);

  // Fetch products filtered by current category or subcategory
  useEffect(() => {
    if (!currentCategory && !currentSubCategory) {
      setProducts([]);
      return;
    }

    // Build query params for filtering
    const params = new URLSearchParams();
    if (currentSubCategory) {
      params.append('subcategory_id', currentSubCategory.id);
    } else if (currentCategory) {
      params.append('category_id', currentCategory.id);
    }
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    fetch(`http://localhost:8000/api/v1/product/list?${params.toString()}`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(console.error);
  }, [currentCategory, currentSubCategory, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearchQuery);
  };

  const getSortedProducts = () => {
    switch (sortOption) {
      case 'price-low-high':
        return [...products].sort((a, b) => {
          const priceA = a.discountPrice ?? a.price;
          const priceB = b.discountPrice ?? b.price;
          return priceA - priceB;
        });
      case 'price-high-low':
        return [...products].sort((a, b) => {
          const priceA = a.discountPrice ?? a.price;
          const priceB = b.discountPrice ?? b.price;
          return priceB - priceA;
        });
      case 'newest':
        return [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'rating':
        return [...products].sort((a, b) => b.rating - a.rating);
      default:
        return products;
    }
  };

  const sortedProducts = getSortedProducts();

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold capitalize">
          {currentSubCategory?.name || currentCategory?.name || 'Products'}
        </h1>
        <p className="text-gray-500 mt-2">
          Showing {sortedProducts.length} products
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter Sidebar */}
        <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                type="search"
                placeholder="Search products..."
                value={localSearchQuery}
                onChange={e => setLocalSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products */}
          <ProductGrid products={sortedProducts} title="" />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
