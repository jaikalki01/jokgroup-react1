
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/contexts/StoreContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

// Pages
import Index from "@/pages/Index";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CategoryPage from "@/pages/CategoryPage";
import CartPage from "@/pages/CartPage";
import WishlistPage from "@/pages/WishlistPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import NotFound from "@/pages/NotFound";

// User Account Pages
import ProfilePage from "@/pages/user/ProfilePage";
import OrdersPage from "@/pages/user/OrdersPage";
import AccountSettingsPage from "@/pages/user/AccountSettingsPage";
import Newarrival from "@/components/user/Newarrival";


// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <StoreProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />


            {/* User Account routes */}
            <Route
              path="/account/profile"
              element={
                <>
                  <NavBar />
                  <main>
                    <ProfilePage />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/account/orders"
              element={
                <>
                  <NavBar />
                  <main>
                    <OrdersPage />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/account/settings"
              element={
                <>
                  <NavBar />
                  <main>
                    <AccountSettingsPage />
                  </main>
                  <Footer />
                </>
              }
            />
            
            {/* Public routes with NavBar and Footer */}
            <Route
              path="/"
              element={
                <>
                  <NavBar />
                  <main>
                    <Index />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/products"
              element={
                <>
                  <NavBar />
                  <main>
                    <ProductsPage />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/product/:id"
              element={
                <>
                  <NavBar />
                  <main>
                    <ProductDetailPage />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/category/:slug"
              element={
                <>
                  <NavBar />
                  <main>
                    <CategoryPage />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/cart"
              element={
                <>
                  <NavBar />
                  <main>
                    <CartPage />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/wishlist"
              element={
                <>
                  <NavBar />
                  <main>
                    <WishlistPage />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/login"
              element={
                <>
                  <NavBar />
                  <main>
                    <LoginPage />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
  path="/new-arrivals"
  element={
    <>
      <NavBar />
      <main>
        <Newarrival />
      </main>
      <Footer />
    </>
  }
/>
            <Route
              path="/register"
              element={
                <>
                  <NavBar />
                  <main>
                    <RegisterPage />
                  </main>
                  <Footer />
                </>
              }
            />
            
            {/* Catch-all route */}
            <Route
              path="*"
              element={
                <>
                  <NavBar />
                  <main>
                    <NotFound />
                  </main>
                  <Footer />
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </StoreProvider>
  </QueryClientProvider>
);

export default App;
