import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Product, User, CartItem, WishlistItem, Coupon } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { products, users, coupons } from '@/api/api';
import axios from 'axios';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '@/auth/authService';

interface StoreState {
  products: Product[];
  filteredProducts: Product[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  currentUser: User | null;
  isLoggedIn: boolean;
  searchQuery: string;
  users: User[];
  coupons: Coupon[];
  filters: {
    categories: string[];
    subcategories:string[];
    priceRange: [number, number];
    colors: string[];
    sizes: string[];
  };
  loading: boolean;
  authError: string | null;
}

type StoreAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_FILTERED_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_ITEM'; payload: CartItem }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_WISHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING_STATE'; payload: boolean }
  | { type: 'SET_AUTH_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<StoreState['filters']> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_COUPONS'; payload: Coupon[] };

  const initialState: StoreState = {
    products: [],
    filteredProducts: [],
    cart: [],
    wishlist: [],
    currentUser: null,
    isLoggedIn: false,
    searchQuery: '',
    users: [],
    coupons: [],
    filters: {
      categories: [],
      subcategories: [], // ✅ Add this line
      priceRange: [0, 5000],
      colors: [],
      sizes: [],
    },
    loading: false,
    authError: null,
  };
  

const getItemFromStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return null;
  }
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const storeReducer = (state: StoreState, action: StoreAction): StoreState => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    
    case 'SET_FILTERED_PRODUCTS':
      return { ...state, filteredProducts: action.payload };
    
    case 'SET_USER':
      return { ...state, currentUser: action.payload, isLoggedIn: action.payload !== null };
    
    case 'SET_COUPONS':
      return { ...state, coupons: action.payload };
    
    case 'SET_LOADING_STATE':
      return { ...state, loading: action.payload };
    
    case 'SET_AUTH_ERROR':
      return { ...state, authError: action.payload };
    
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => 
        item.productId === action.payload.productId && 
        item.color === action.payload.color && 
        item.size === action.payload.size
      );

      let newCart;
      if (existingItem) {
        newCart = state.cart.map(item => 
          item.id === existingItem.id 
            ? { ...item, quantity: item.quantity + action.payload.quantity } 
            : item
        );
      } else {
        newCart = [...state.cart, action.payload];
      }

      saveToStorage('cart', newCart);
      return { ...state, cart: newCart };
    }

    case 'REMOVE_FROM_CART': {
      const newCart = state.cart.filter(item => item.id !== action.payload);
      saveToStorage('cart', newCart);
      return { ...state, cart: newCart };
    }

    case 'UPDATE_CART_ITEM': {
      const newCart = state.cart.map(item => 
        item.id === action.payload.id ? action.payload : item
      );
      saveToStorage('cart', newCart);
      return { ...state, cart: newCart };
    }

    case 'CLEAR_CART':
      localStorage.removeItem('cart');
      return { ...state, cart: [] };

    case 'ADD_TO_WISHLIST': {
      const productId = action.payload;
      const exists = state.wishlist.some(item => item.productId === productId);

      if (exists) {
        return state;
      }

      const newWishlist = [...state.wishlist, { id: Date.now().toString(), productId }];
      saveToStorage('wishlist', newWishlist);
      return { ...state, wishlist: newWishlist };
    }

    case 'REMOVE_FROM_WISHLIST': {
      const newWishlist = state.wishlist.filter(item => item.productId !== action.payload);
      saveToStorage('wishlist', newWishlist);
      return { ...state, wishlist: newWishlist };
    }

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload }
      };

    case 'RESET_FILTERS':
      return { 
        ...state, 
        filters: initialState.filters,
        searchQuery: ''
      };

    default:
      return state;
  }
};

interface StoreContextType {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
  addToCart: (product: Product, quantity: number, color: string, size: string) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  applyFilters: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        dispatch({ type: 'SET_LOADING_STATE', payload: true });

        const [productsData, usersData, couponsData] = await Promise.all([
          products().catch(e => {
            console.error('Failed to fetch products:', e);
            return [];
          }),
          users().catch(e => {
            console.error('Failed to fetch users:', e);
            return [];
          }),
          coupons().catch(e => {
            console.error('Failed to fetch coupons:', e);
            return [];
          })
        ]);

        dispatch({ type: 'SET_PRODUCTS', payload: productsData });
        dispatch({ type: 'SET_FILTERED_PRODUCTS', payload: productsData });
        dispatch({ type: 'SET_COUPONS', payload: couponsData });

        const currentUser = getItemFromStorage('currentUser');
        if (currentUser) {
          dispatch({ type: 'SET_USER', payload: currentUser });
        }

        const cart = getItemFromStorage('cart') || [];
        const wishlist = getItemFromStorage('wishlist') || [];

        cart.forEach((item: CartItem) => dispatch({ type: 'ADD_TO_CART', payload: item }));
        wishlist.forEach((item: WishlistItem) => dispatch({ type: 'ADD_TO_WISHLIST', payload: item.productId }));

      } catch (error) {
        console.error('Initialization error:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize application data',
          variant: 'destructive',
        });
      } finally {
        dispatch({ type: 'SET_LOADING_STATE', payload: false });
      }
    };

    fetchInitialData();
  }, []);

  const applyFilters = useCallback(() => {
    const { searchQuery, filters, products } = state;
    
    let filtered = [...products];
    
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.category)
      );
    }

    filtered = filtered.filter(product => {
      const price = product.discountPrice || product.price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    if (filters.colors.length > 0) {
      filtered = filtered.filter(product => 
        product.colors.some(color => filters.colors.includes(color))
      );
    }

    if (filters.sizes.length > 0) {
      filtered = filtered.filter(product => 
        product.sizes.some(size => filters.sizes.includes(size))
      );
    }

    dispatch({ type: 'SET_FILTERED_PRODUCTS', payload: filtered });
  }, [state.products, state.searchQuery, state.filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const addToCart = (product: Product, quantity: number, color: string, size: string) => {
    const newCartItem: CartItem = {
      id: Date.now().toString(),
      productId: product.id,
      quantity,
      color,
      size,
    };
    dispatch({ type: 'ADD_TO_CART', payload: newCartItem });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const updateCartItem = (id: string, quantity: number) => {
    const updatedItem = state.cart.find(item => item.id === id);
    if (updatedItem) {
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { ...updatedItem, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const addToWishlist = (productId: string) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: productId });
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  };

  const isInWishlist = (productId: string) => {
    return state.wishlist.some(item => item.productId === productId);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: true });
      const user = await apiLogin(email, password);
      dispatch({ type: 'SET_USER', payload: user });
      saveToStorage('currentUser', user);
      toast({ title: 'Logged in successfully' });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_AUTH_ERROR', payload: 'Invalid credentials' });
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING_STATE', payload: false });
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: true });
      const user = await apiRegister(firstName, lastName, email, password);
      dispatch({ type: 'SET_USER', payload: user });
      saveToStorage('currentUser', user);
      toast({ title: 'Registered successfully' });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_AUTH_ERROR', payload: 'Registration failed' });
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING_STATE', payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    dispatch({ type: 'SET_USER', payload: null });
    toast({ title: 'Logged out', description: 'You have successfully logged out.' });
  };

  return (
    <StoreContext.Provider value={{
      state,
      dispatch,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      login,
      register,
      logout,
      applyFilters,
    }}>
      {children}
    </StoreContext.Provider>
  );
};



// Custom Hook for using store context
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
