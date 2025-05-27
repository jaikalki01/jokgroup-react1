
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { state } = useStore();
  const { isLoggedIn, currentUser } = state;
  
  useEffect(() => {
    // Check if user is admin
    if (!isLoggedIn || currentUser?.role !== 'admin') {
      navigate('/login');
    }
  }, [isLoggedIn, currentUser, navigate]);
  
  if (!isLoggedIn || currentUser?.role !== 'admin') {
    return null;
  }
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminSidebar />
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
