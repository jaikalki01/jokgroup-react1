import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ProductGrid from '@/components/ProductGrid';

type CouponResponse = {
  code: string;
  description: string;
  discount_type: string; // e.g. "percent" or "flat"
  discount_value: number;
  minimum_purchase: number;
  valid_from: string;
  valid_to: string;
  max_uses: number;
  active: boolean;
  id: number;
  used_count: number;
};





const CartPage = () => {
  const navigate = useNavigate();
  const { state, updateCartItem, removeFromCart, clearCart } = useStore();
  const { cart, products } = state;
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | null>(null);


  // Get cart items with full product details
  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product !== undefined);

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.product?.discountPrice || item.product?.price || 0;
    return total + price * item.quantity;
  }, 0);

  const shipping = subtotal > 999 ? 0 : 150; // Free shipping above ₹999
  let discountAmount = 0;

// Assuming discount can be a percentage, flat, or fixed discount
const calculateTotal = (subtotal: number, shipping: number, discount: number, discountType: 'percentage' | 'flat' | 'fixed' | null) => {
  let discountAmount = 0;

  // Ensure the discount and discountType are valid before calculating
  if (discount > 0 && discountType) {
    if (discountType === 'percentage') {
      // Percentage discount - calculate based on subtotal and shipping
      discountAmount = (subtotal + shipping) * (discount / 100);
    } else if (discountType === 'flat' || discountType === 'fixed') {
      // Flat or Fixed discount - deduct the discount directly
      discountAmount = discount;
    }
  }

  // Ensure the total doesn't go below zero
  const total = Math.max(0, subtotal + shipping - discountAmount);
  return total;
};

  // Final total after applying the discount
  const total = subtotal + shipping - discount; // ✅ subtracts discount


  console.log("Shipping:", shipping);
  console.log("Total after discount:", total);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    updateCartItem(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };
  const handleApplyCoupon = async () => {
    setIsApplyingCoupon(true);
  
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/coupon/?code=${couponCode.trim().toUpperCase()}`);
      const responseData = await res.json();
  
      console.log("Coupon API Response:", responseData);
  
      // Validate response
      if (!Array.isArray(responseData) || responseData.length === 0) {
        throw new Error("Invalid coupon");
      }
  
      const coupon = responseData.find((c: any) => c.code === couponCode.trim().toUpperCase());
  
      if (!coupon) {
        throw new Error("Coupon not found");
      }
  
      const now = new Date();
      const from = new Date(coupon.valid_from);
      const to = new Date(coupon.valid_to);
  
      console.log("NOW:", now);
      console.log("VALID FROM:", from);
      console.log("VALID TO:", to);
      console.log("ACTIVE:", coupon.active);
  
      if (!coupon.active || now < from || now > to) {
        throw new Error("Coupon is not currently valid");
      }
  
      if (subtotal < coupon.minimum_purchase) {
        throw new Error(`Minimum purchase of ₹${coupon.minimum_purchase} required`);
      }
  
      // Calculate and apply discount
      let discount = 0;
      if (coupon.discount_type === "percentage") {
        discount = (subtotal * coupon.discount_value) / 100;
      } else if (coupon.discount_type === "amount") {
        discount = coupon.discount_value;
      }
  
      setDiscount(discount);
  
      toast({
        title: 'Success',
        description: `Coupon applied! You saved ₹${discount.toFixed(0)}`,
      });
  
    } catch (err: any) {
      console.error("Coupon error:", err.message);
      toast({
        title: 'Error',
        description: err.message || 'Invalid coupon code',
        variant: 'destructive',
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty. Add items before checkout.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Order Placed',
      description: 'Your order has been placed successfully!',
    });

    clearCart();
    navigate('/');
  };

  const recommendedProducts = products
    .filter(p => p.featured || p.bestSeller)
    .slice(0, 4);

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  if (cartItems.length === 0) {
    return (
      <div className="container px-4 py-12">
        <div className="text-center py-8">
          <div className="flex justify-center mb-6">
            <ShoppingCart className="h-16 w-16 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild size="lg">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6">Recommended for You</h3>
          <ProductGrid products={products} title="" />
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4">ID</th> {/* New ID column */}
                    <th className="text-left py-4">Product</th>
                    <th className="text-left py-4">Product Details</th> {/* New Product Details column */}
                    <th className="text-center py-4">Quantity</th>
                    <th className="text-right py-4">Price</th>
                    <th className="text-right py-4">Total</th>
                    <th className="py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => {
                    const product = item.product as Product;
                    const price = product.discountPrice || product.price;
                    const itemTotal = price * item.quantity;

                    let imagesArray: string[] = [];
                    try {
                      imagesArray =
                        typeof product.images === "string"
                          ? JSON.parse(product.images)
                          : product.images;
                    } catch (e) {
                      console.error("Error parsing product images:", e);
                    }
                    const firstImage = imagesArray[0]
                      ? `http://localhost:8000/${imagesArray[0].replace(/^\/+/, "")}`
                      : "/placeholder.svg";

                    return (
                      <tr key={item.id} className="border-b">
                        <td className="py-4">{product.id}</td> {/* Show product ID */}
                        <td className="py-4">
                          <Link to={`/product/${product.id}`}>
                            <img
                              src={firstImage}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded mr-4"
                            />
                          </Link>
                        </td>
                        <td className="py-4">
                          <Link
                            to={`/product/${product.id}`}
                            className="font-medium hover:text-navy hover:underline"
                          >
                            {product.name}
                          </Link>
                          <div className="text-sm text-gray-500 mt-1">
                            <span
                              className="inline-block w-3 h-3 rounded-full mr-1"
                              style={{
                                backgroundColor:
                                  item.color === "light-blue" ? "lightblue" : item.color,
                              }}
                            ></span>
                            {item.color}, {item.size}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center border rounded-md max-w-[100px] mx-auto">
                            <button
                              className="px-3 py-1 text-gray-600 hover:text-navy"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <div className="w-8 text-center">{item.quantity}</div>
                            <button
                              className="px-3 py-1 text-gray-600 hover:text-navy"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          {formatPrice(price)}
                          {product.discountPrice && (
                            <div className="text-sm text-gray-400 line-through">
                              {formatPrice(product.price)}
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-right font-medium">
                          {formatPrice(itemTotal)}
                        </td>
                        <td className="py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Button asChild variant="outline">
                <Link to="/products">Continue Shopping</Link>
              </Button>
              <Button 
                variant="outline" 
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => clearCart()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              {discount > 0 && (
  <div className="flex justify-between">
    <span className="text-gray-600">Discount</span>
    <span className="text-green-600">- {formatPrice(discount)}</span>
  </div>
)}

            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <div className="mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                  variant="outline"
                >
                  Apply
                </Button>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Secure checkout powered by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
