import AdminLayout from '@/components/admin/AdminLayout';
import { useStore } from '@/contexts/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingBag, Tag, TrendingUp } from 'lucide-react';

// Define TypeScript interfaces for your data types
interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  in_stock: boolean;
  images?: string | string[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

interface Coupon {
  id: string;
  active: boolean;
  // Add other coupon properties as needed
}

interface WishlistItem {
  productId: string;
  // Add other wishlist properties as needed
}

const AdminDashboard = () => {
  const { state } = useStore();
  
  // Safely destructure with defaults and ensure arrays
  const {
    products: rawProducts,
    wishlist: rawWishlist,
    users: rawUsers,
    coupons: rawCoupons,
  } = state || {};

  // Ensure all values are arrays
  const products = Array.isArray(rawProducts) ? rawProducts : [];
  const wishlist = Array.isArray(rawWishlist) ? rawWishlist : [];
  const users = Array.isArray(rawUsers) ? rawUsers : [];
  const coupons = Array.isArray(rawCoupons) ? rawCoupons : [];

  // Helper function to parse product images
  const parseProductImages = (images: string | string[] | undefined): string[] => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse images JSON:", e);
      return [];
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Jokroup admin dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              {products.filter(p => p.in_stock).length} in stock
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              {users.filter(u => u.role === 'user').length} customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Tag className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {coupons.filter(c => c.active).length}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {coupons.length} total coupons
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Wishlisted</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{wishlist.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              Across {new Set(wishlist.map(w => w.productId)).size} products
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => {
                const images = parseProductImages(product.images);
                const firstImage = images[0];
                
                return (
                  <div key={product.id} className="flex items-center">
                    <div className="flex items-center gap-3">
                      {firstImage && (
                        <img
                          src={`http://localhost:8000/${firstImage.replace(/^\/+/, '')}`}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        ₹{(product.discountPrice || product.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.in_stock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-4 bg-gray-100 flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-navy text-white">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;