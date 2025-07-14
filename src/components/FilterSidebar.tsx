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

  // Provide default values for filters
  const defaultFilters = {
    categories: [],
    subcategories: [],
    colors: [],
    sizes: [],
    priceRange: [0, 5000] as [number, number]
  };

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [localFilters, setLocalFilters] = useState({
    ...defaultFilters,
    ...state.filters
  });
  const [priceRange, setPriceRange] = useState(localFilters.priceRange);

  const allSizes = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', '26', '28', '30', '32', '34', '36',
    '3-4Y', '5-6Y', '7-8Y', 'ONE SIZE'
  ];

  // Define allColors array
  const allColors = [
    'red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'pink', 'purple', 'orange', 'brown', 'light-blue'
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
    if (state.filters) {
      setLocalFilters(prev => ({
        ...defaultFilters,
        ...state.filters
      }));
      setPriceRange(state.filters.priceRange || defaultFilters.priceRange);
    }
  }, [state.filters]);

  // Category checkbox handler
  const handleCategoryChange = (slug: string) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(slug)
        ? prev.categories.filter(c => c !== slug)
        : [...prev.categories, slug]
    }));
  };

  // Subcategory checkbox handler
  const handleSubcategoryChange = (slug: string) => {
    setLocalFilters(prev => ({
      ...prev,
      subcategories: prev.subcategories.includes(slug)
        ? prev.subcategories.filter(s => s !== slug)
        : [...prev.subcategories, slug]
    }));
  };

  const handleColorChange = (color: string) => {
    setLocalFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleSizeChange = (size: string) => {
    setLocalFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handleApplyFilters = async () => {
    try {
      // Prepare query parameters
      const params = new URLSearchParams();

      if (localFilters.categories.length > 0) {
        params.append('categories', localFilters.categories.join(','));
      }

      if (localFilters.subcategories.length > 0) {
        params.append('subcategories', localFilters.subcategories.join(','));
      }

      if (localFilters.colors.length > 0) {
        params.append('colors', localFilters.colors.join(','));
      }

      if (localFilters.sizes.length > 0) {
        params.append('sizes', localFilters.sizes.join(','));
      }

      params.append('min_price', priceRange[0].toString());
      params.append('max_price', priceRange[1].toString());

      const res = await axios.get('http://127.0.0.1:8000/api/v1/product/list', {
        params
      });

      // Update global state
      const products = Array.isArray(res.data)
        ? res.data
        : Array.isArray((res.data as { products?: any[] }).products)
          ? (res.data as { products: any[] }).products
          : [];
      dispatch({ type: 'SET_FILTERED_PRODUCTS', payload: products });

      dispatch({
        type: 'SET_FILTERS',
        payload: {
          ...localFilters,
          priceRange
        }
      });

      onClose();
    } catch (err) {
      console.error('Failed to fetch filtered products:', err);
      // Optionally show error to user
    }
  };

  const handleResetFilters = () => {
    setLocalFilters(defaultFilters);
    setPriceRange(defaultFilters.priceRange);
    dispatch({ type: 'RESET_FILTERS' });
    onClose();
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:translate-x-0 overflow-y-auto
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
            min={0}
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


        {/* Colors */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Colors</h3>
          <div className="flex flex-wrap gap-2">
            {allColors.map(color => (
              <div
                key={color}
                className={`w-8 h-8 rounded-full border cursor-pointer flex items-center justify-center 
                ${localFilters.colors.includes(color) ? 'border-navy ring-2 ring-navy ring-offset-2' : 'border-gray-300'}`}
                style={{ backgroundColor: color === 'light-blue' ? 'lightblue' : color }}
                onClick={() => handleColorChange(color)}
                title={color}
              />
            ))}
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
        <div className="flex gap-3 mt-8 sticky bottom-4 bg-white pt-4 pb-2">
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