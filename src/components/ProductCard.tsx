import { Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { Product } from '@/types';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  const isWishlisted = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast({
        title: 'Removed from Wishlist',
        description: `${product.name} removed from your wishlist.`,
      });
    } else {
      addToWishlist(product.id);
      toast({
        title: 'Added to Wishlist',
        description: `${product.name} added to your wishlist.`,
      });
    }
  };

  const formatPrice = (price?: number | null) => {
    if (price == null || isNaN(price)) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };
const getImageUrl = (img: string) => {
  if (img.startsWith("http")) return img;

  // Remove leading slashes and possible double "static/" prefix
  const cleanPath = img.replace(/^\/+/, '').replace(/^static\//, '');

  return `http://localhost:8000/static/${cleanPath}`;
};

const imageUrl = getImageUrl(product.images[0]);



 // For debugging

  return (
    <div className="product-card flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative overflow-hidden group aspect-square">
        <Link to={`/product/${product.id}`} className="block h-full">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.png';
            }}
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.newArrival && (
              <Badge className="bg-blue-600 text-white">New</Badge>
            )}
            {product.bestSeller && (
              <Badge className="bg-amber-500 text-white">Bestseller</Badge>
            )}
            {product.discountPrice && product.price > 0 && (
              <Badge className="bg-green-600 text-white">
                {Math.round(
                  ((product.price - product.discountPrice) / product.price) * 100
                )}
                % Off
              </Badge>
            )}
          </div>
        </Link>

        {/* Wishlist Button */}
        <Button
          size="icon"
          variant="ghost"
          className={`absolute top-2 right-2 rounded-full w-9 h-9 p-0 ${
            isWishlisted
              ? 'text-rose-500 hover:bg-rose-50'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          onClick={toggleWishlist}
        >
          <Heart
            className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500' : ''}`}
          />
        </Button>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <Link to={`/product/${product.id}`} className="flex-grow">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:underline">
            {product.name}
          </h3>
          <div className="text-gray-500 text-sm mb-2">{product.category}</div>
        </Link>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            {product.discountPrice ? (
              <>
                <span className="font-bold text-gray-900">
                  {formatPrice(product.discountPrice)}
                </span>
                {product.price > 0 && (
                  <span className="text-gray-400 text-sm line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </>
            ) : (
              <span className="font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {product.rating && (
            <div className="flex items-center text-amber-500">
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-xs ml-1">({product.reviews || 0})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;