
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  ShoppingBag,
  Tag,
  // Settings,
  Home,
  LogOut,
  FolderTree,
  BarChart
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const AdminSidebar = () => {
  const { logout } = useStore();
  const location = useLocation();
  
  const navItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: <FolderTree className="h-5 w-5" />,
    },
    {
      name: 'Coupons',
      path: '/admin/coupons',
      icon: <Tag className="h-5 w-5" />,
    },
    {
      name: 'Sales Analytics',
      path: '/admin/analytics',
      icon: <BarChart className="h-5 w-5" />,
    },
    // {
    //   name: 'Settings',
    //   path: '/admin/settings',
    //   icon: <Settings className="h-5 w-5" />,
    // },
  ];
  
  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    if (path !== '/admin' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  return (
    <div className="bg-navy text-white h-screen flex flex-col w-64 fixed left-0 top-0 z-50">
      <div className="p-4 border-b border-navy-800 flex items-center justify-center h-16">
        <Link to="/admin" className="text-2xl font-bold">
          JOKROUP ADMIN
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-4 py-3 rounded-md transition-colors
                ${isActive(item.path) 
                  ? 'bg-white text-navy' 
                  : 'text-white hover:bg-navy-800 hover:text-white'
                }
              `}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-navy-800">
        <div className="flex flex-col gap-2">
          <Link to="/">
            <Button 
              variant="outline" 
              className="w-full justify-start border-white/20 text-black hover:bg-navy-800"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Store
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full justify-start border-white/20 text-black hover:bg-navy-800"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
