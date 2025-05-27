import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/cat/list');
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          setCategories([]);
          setError('Categories data is not available');
        }
      } catch (err) {
        setCategories([]);
        setError('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="py-12 bg-cream">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Shop by Category</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative h-64 overflow-hidden rounded-lg shadow-md transition-transform hover:-translate-y-1"
            >
              {/* Category Image */}
              <img
                src={
                  category.image?.startsWith('http')
                    ? category.image
                    : category.image
                    ? category.image.startsWith('/static/')
                      ? `http://localhost:8000${category.image}`
                      : `http://localhost:8000/static/products/${category.image.replace(/^\/+/, '')}`
                    : '/placeholder.svg'
                }
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = 'cloth-bg.jpg')}
              />
              <div className="absolute inset-0 bg-navy opacity-40 group-hover:opacity-30 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded text-center">
                  <h3 className="text-xl font-semibold text-navy">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {category.subcategories?.length} Collections
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
