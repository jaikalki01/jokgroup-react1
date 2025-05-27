import { Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { ShoppingCart, Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/ProductGrid';

const WishlistPage = () => {
  const { state, removeFromWishlist, addToCart } = useStore();
  const { wishlist, products, isLoggedIn } = state;

  // Get products in wishlist
  const wishlistProducts = wishlist
    .map(item => products.find(p => p.id === item.productId))
    .filter(Boolean);

  // Get recommended products (for empty wishlist)
  const recommendedProducts = products
    .filter(p => p.featured || p.bestSeller)
    .slice(0, 4);

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(product, 1, product.colors[0], product.sizes[0]);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
  };

  // Not logged in view
  if (!isLoggedIn) {
    return (
      <div className="container px-4 py-12">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Please Login</h2>
          <p className="text-gray-500 mb-6">
            You need to login to view your wishlist.
          </p>
          <Button asChild size="lg">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Empty wishlist view
  if (wishlistProducts.length === 0) {
    return (
      <div className="container px-4 py-12">
        <div className="text-center py-8">
          <div className="flex justify-center mb-6">
            <Heart className="h-16 w-16 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-500 mb-6">
            Save items you like for later by clicking the heart icon on any product.
          </p>
          <Button asChild size="lg">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6">Recommended for You</h3>
          <ProductGrid products={recommendedProducts}title="" />
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4">ID</th>
                <th className="text-left py-4">Product</th>
                <th className="text-left py-4">Name</th> {/* Added Name column */}
                <th className="text-right py-4">Price</th>
                <th className="text-center py-4">Stock Status</th>
                <th className="text-right py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wishlistProducts.map(product => {
                if (!product) return null;

                const price = product.discountPrice || product.price;

                let imageUrl = "/placeholder.svg";
                try {
                  const images = Array.isArray(product.images)
                    ? product.images
                    : JSON.parse(product.images);
                  if (images.length > 0) {
                    imageUrl = `http://127.0.0.1:8000/${images[0].replace(/^\/+/, '')}`;
                  }
                } catch (err) {
                  console.error("Error parsing product images:", err);
                }

                return (
                  <tr key={product.id} className="border-b">
                    <td className="py-4">{product.id}</td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <Link to={`/product/${product.id}`}>
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded mr-4"
                          />
                        </Link>
                      </div>
                    </td>
                    <td className="py-4">
                      <Link
                        to={`/product/${product.id}`}
                        className="font-medium hover:text-navy hover:underline"
                      >
                        {product.name}
                      </Link>
                      <div className="text-sm text-gray-500 mt-1">
                        {product.category}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="font-medium">
                        ₹{price.toLocaleString('en-IN')}
                      </div>
                      {product.discountPrice && (
                        <div className="text-sm text-gray-400 line-through">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {product.in_stock ? (
                        <span className="text-green-600">In Stock</span>
                      ) : (
                        <span className="text-red-500">Out of Stock</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromWishlist(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={!product.in_stock}
                          onClick={() => handleAddToCart(product.id)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
