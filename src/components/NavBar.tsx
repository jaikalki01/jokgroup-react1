
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { categories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  Search,
  X,
  LogOut,
  ShoppingBag,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NavBar = () => {
  const { state, dispatch, logout } = useStore();
  const { cart, isLoggedIn, currentUser } = state;
  const [searchValue, setSearchValue] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_SEARCH_QUERY', payload: searchValue });
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background shadow-sm">
      <div className="container flex h-16 items-center px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-navy mr-6">
          JOKROUP
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 ml-6">
          {categories.map((category) => (
            <DropdownMenu key={category.id}>
              <DropdownMenuTrigger className="flex items-center gap-1 outline-none">
                <span className="hover:text-navy transition-colors">
                  {category.name}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white">
                <DropdownMenuLabel>{category.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {category.subcategories?.map((subcategory) => (
                  <DropdownMenuItem key={subcategory.id} asChild>
                    <Link
                      to={`/category/${subcategory.slug}`}
                      className="cursor-pointer hover:bg-secondary"
                    >
                      {subcategory.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Desktop Right Section */}
        <div className="ml-auto hidden md:flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Wishlist</span>
                  </Link>
                </DropdownMenuItem>
                {currentUser?.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Link to="/wishlist">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar (desktop) */}
      {isSearchOpen && (
        <div className="absolute inset-x-0 top-16 bg-background p-4 shadow-md transition-all duration-300 ease-in-out z-50 hidden md:block">
          <div className="container">
            <form onSubmit={handleSearch} className="flex items-center">
              <Input
                type="search"
                placeholder="Search products..."
                className="flex-1"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Button type="submit" className="ml-2">
                Search
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(false)}
                className="ml-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-background z-30 md:hidden">
          <div className="container p-4">
            <form onSubmit={handleSearch} className="flex items-center mb-6">
              <Input
                type="search"
                placeholder="Search products..."
                className="flex-1"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Button type="submit" className="ml-2">
                Search
              </Button>
            </form>

            <nav className="flex flex-col space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="font-semibold text-lg">{category.name}</div>
                  <div className="ml-4 space-y-2">
                    {category.subcategories?.map((subcategory) => (
                      <Link
                        key={subcategory.id}
                        to={`/category/${subcategory.slug}`}
                        className="block text-muted-foreground hover:text-navy"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-6 flex justify-around">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="flex flex-col items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-6 w-6 mb-1" />
                    <span className="text-sm">Profile</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex flex-col items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-6 w-6 mb-1" />
                  <span className="text-sm">Login</span>
                </Link>
              )}

              <Link
                to="/wishlist"
                className="flex flex-col items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Heart className="h-6 w-6 mb-1" />
                <span className="text-sm">Wishlist</span>
              </Link>

              <Link
                to="/cart"
                className="flex flex-col items-center relative"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-6 w-6 mb-1" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">
                    {totalItems}
                  </span>
                )}
                <span className="text-sm">Cart</span>
              </Link>
            </div>

            <Button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full mt-6"
              variant="outline"
            >
              Close Menu
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
