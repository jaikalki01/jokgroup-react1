
import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingBag, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const UserSidebar = () => {
  const location = useLocation();
  
  const navItems: SidebarItem[] = [
    {
      name: 'My Profile',
      path: '/account/profile',
      icon: <User className="h-5 w-5" />,
    },
    {
      name: 'My Orders',
      path: '/account/orders',
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      name: 'Account Settings',
      path: '/account/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Card className="w-full md:w-64 p-4">
      <h2 className="text-lg font-medium mb-4">My Account</h2>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center px-4 py-3 rounded-md transition-colors
              ${isActive(item.path) 
                ? 'bg-navy text-white' 
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            {item.icon}
            <span className="ml-3">{item.name}</span>
          </Link>
        ))}
      </nav>
    </Card>
  );
};

export default UserSidebar;
