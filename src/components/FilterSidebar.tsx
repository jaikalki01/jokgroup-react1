import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar = ({ isOpen, onClose }: FilterSidebarProps) => {
  const { state, dispatch } = useStore();
  const { filters } = state;

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [localFilters, setLocalFilters] = useState({
    categories: filters.categories || [],
    subcategories: filters.subcategories || [],
    sizes: filters.sizes || [],
  });
  const [priceRange, setPriceRange] = useState(filters.priceRange);

  const allSizes = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', '26', '28', '30', '32', '34', '36',
    '3-4Y', '5-6Y', '7-8Y', 'ONE SIZE'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          axios.get<any[]>('http://127.0.0.1:8000/api/v1/cat/list'),
          axios.get<any[]>('http://127.0.0.1:8000/api/v1/cat/subcategory/list'),
        ]);
        setCategories(catRes.data);
        setSubcategories(subRes.data);
      } catch (err) {
        console.error('Error loading categories/subcategories:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setLocalFilters({ ...filters });
    setPriceRange(filters.priceRange);
  }, [filters]);

  // Category checkbox handler
  const handleCategoryChange = (slug: string) => {
    const updated = localFilters.categories.includes(slug)
      ? localFilters.categories.filter(c => c !== slug)
      : [...localFilters.categories, slug];
    setLocalFilters({ ...localFilters, categories: updated });
  };

  // Subcategory checkbox handler
  const handleSubcategoryChange = (slug: string) => {
    const updated = localFilters.subcategories.includes(slug)
      ? localFilters.subcategories.filter(s => s !== slug)
      : [...localFilters.subcategories, slug];
    setLocalFilters({ ...localFilters, subcategories: updated });
  };

  const handleSizeChange = (size: string) => {
    const updated = localFilters.sizes.includes(size)
      ? localFilters.sizes.filter(s => s !== size)
      : [...localFilters.sizes, size];
    setLocalFilters({ ...localFilters, sizes: updated });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handleApplyFilters = async () => {
    const query = {
      category: localFilters.categories.join(','),
      subcategory: localFilters.subcategories.join(','),
      size: localFilters.sizes.join(','),
      min_price: priceRange[0],
      max_price: priceRange[1],
    };

    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/product/list', {
        params: query,
      });
      const products = Array.isArray(res.data)
        ? res.data
        : Array.isArray((res.data as { products?: any[] }).products)
          ? (res.data as { products: any[] }).products
          : [];
      dispatch({ type: 'SET_FILTERED_PRODUCTS', payload: products });
      dispatch({
        type: 'SET_FILTERS',
        payload: { ...localFilters, priceRange },
      });
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to fetch filtered products:', err);
    }
  };

  const handleResetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
    if (onClose) onClose();
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:sticky md:top-20 md:h-screen md:translate-x-0 overflow-y-auto
    `}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Categories & Subcategories */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat.slug}`}
                    checked={localFilters.categories.includes(cat.slug)}
                    onCheckedChange={() => handleCategoryChange(cat.slug)}
                  />
                  <Label htmlFor={`cat-${cat.slug}`}>{cat.name}</Label>
                </div>
                <div className="ml-6 space-y-1">
                  {subcategories.filter(sub => sub.category_id === cat.id).map(sub => (
                    <div key={sub.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sub-${sub.slug}`}
                        checked={localFilters.subcategories.includes(sub.slug)}
                        onCheckedChange={() => handleSubcategoryChange(sub.slug)}
                      />
                      <Label htmlFor={`sub-${sub.slug}`}>{sub.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Price Range</h3>
          <Slider
            max={5000}
            step={100}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="mb-2"
          />
          <div className="flex justify-between text-sm">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>

        {/* Sizes */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Sizes</h3>
          <div className="flex flex-wrap gap-2">
            {allSizes.map(size => (
              <div
                key={size}
                className={`px-3 py-1 border rounded-md text-sm cursor-pointer 
                ${localFilters.sizes.includes(size) ? 'bg-navy text-white border-navy' : 'bg-white text-gray-700 border-gray-300 hover:border-navy'}`}
                onClick={() => handleSizeChange(size)}
              >
                {size}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleResetFilters} className="flex-1">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
