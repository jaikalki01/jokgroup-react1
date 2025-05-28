import { Product } from "@/types";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  RefreshCw,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [colorImageMap, setColorImageMap] = useState<{ [color: string]: string }>({});
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore();

  const parseStringArray = (data: string | string[]) => {
    if (Array.isArray(data)) return data;
    if (typeof data !== 'string') return [];

    try {
      let parsed = JSON.parse(data);
      while (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      
      // Handle case where it might be an array of arrays
      if (Array.isArray(parsed) && parsed.length === 1 && Array.isArray(parsed[0])) {
        parsed = parsed[0];
      }

      return parsed.map((item: string) => 
        item.replace(/^"+|"+$/g, '').replace(/\\"/g, '')
      ).filter((item: string) => item);
    } catch (error) {
      console.error("Error parsing array:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get<Product>(`http://127.0.0.1:8000/api/v1/product/product/${id}`);
        const productData = res.data;

        // Parse sizes and colors
        productData.sizes = parseStringArray(productData.sizes);
        productData.colors = parseStringArray(productData.colors);

        // Parse images_by_color
        if (productData.images_by_color) {
          try {
            let parsed = productData.images_by_color;
            while (typeof parsed === 'string') {
              parsed = JSON.parse(parsed);
            }
            setColorImageMap(parsed);
          } catch (error) {
            console.error("Failed to parse images_by_color", error);
          }
        }

        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (!product) return;
    const image = colorImageMap[color];
    if (image) {
      const index = product.images.findIndex((img) => img === image);
      if (index !== -1) {
        setSelectedImage(index);
      }
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedColor && product.colors.length > 0) {
      alert("Please select a color");
      return;
    }
    if (!selectedSize && product.sizes.length > 0) {
      alert("Please select a size");
      return;
    }
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  const handleWishlist = () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

  if (loading) {
    return <div className="container px-4 py-12 text-center">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="container px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">Sorry, the product you are looking for does not exist.</p>
        <Link to="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-navy">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-navy">Products</Link>
        <span className="mx-2">/</span>
        <Link to={`/category/${product.category}`} className="hover:text-navy capitalize">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </div>

      {/* Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
<div className="space-y-4">
  <div className="aspect-square rounded-lg overflow-hidden border">
    <img
      src={`http://127.0.0.1:8000${product.images[selectedImage]}`}
      alt={product.name}
      className="w-full h-full object-cover"
    />
  </div>
  <div className="flex gap-2 overflow-x-auto py-2">
    {product.images.map((image, index) => (
      <div
        key={index}
        className={`cursor-pointer border rounded w-20 h-20 flex-shrink-0 ${
          selectedImage === index ? "border-navy border-2" : "border-gray-200"
        }`}
        onClick={() => setSelectedImage(index)}
      >
        <img
          src={`http://127.0.0.1:8000${image}`}
          alt={`${product.name} ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
    ))}
  </div>
</div>




        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            {product.discountPrice ? (
              <>
                <span className="text-2xl font-bold text-navy">{formatPrice(product.discountPrice)}</span>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% Off
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-navy">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-xl">{i < Math.floor(product.rating) ? "★" : "☆"}</span>
              ))}
            </div>
            <span className="text-gray-500">{product.rating} ({product.reviews} reviews)</span>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-full border-2 cursor-pointer"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color ? "#1e3a8a" : "#ccc",
                      boxShadow: selectedColor === color ? "0 0 0 2px #1e3a8a" : "none",
                    }}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Size</h3>
                <button className="text-navy text-sm hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <div
                    key={size}
                    className={`
                      px-4 py-2 border rounded-md text-sm cursor-pointer
                      ${selectedSize === size ? "bg-navy text-white border-navy" : "bg-white text-gray-700 border-gray-300 hover:border-navy"}
                    `}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Quantity</h3>
            <div className="flex items-center border rounded-md w-32">
              <button
                className="px-3 py-2 text-gray-600 hover:text-navy"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <div className="flex-1 text-center">{quantity}</div>
              <button
                className="px-3 py-2 text-gray-600 hover:text-navy"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant={isInWishlist(product.id) ? "outline" : "secondary"}
              onClick={handleWishlist}
            >
              <Heart className="mr-2 h-5 w-5" />
              {isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
            </Button>
          </div>

          {/* Additional Info */}
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <Truck className="w-4 h-4" /> Free Shipping on orders over ₹499
            </li>
            <li className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> 30-Day Return Policy
            </li>
            <li className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Secure Payment
            </li>
            <li className="flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Share this product
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;