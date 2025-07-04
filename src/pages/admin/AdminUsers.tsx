import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  UserPlus,
  UserX,
  User,
  UserCog,
  Mail
} from 'lucide-react';

interface Address {
  id: string;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  default: boolean;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Marked as optional since we might not want to expose this
  role: string;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/users');
        
        // Ensure we have an array of users
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid API response format');
        }
        
        setUsers(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      fullName.includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      user.role.toLowerCase().includes(searchTermLower)
    );
  });
  
  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };
  
  const handleAddUser = () => {
    toast({
      title: 'Add User',
      description: 'This feature is not implemented in the demo.',
    });
  };
  
  const handleEditUser = (userId: string) => {
    toast({
      title: 'Edit User',
      description: `Editing user ${userId}. This feature is not implemented in the demo.`,
    });
  };
  
  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };
  
  const handleEmailUser = (userId: string) => {
    toast({
      title: 'Email User',
      description: `Emailing user ${userId}. This feature is not implemented in the demo.`,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading users...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-600">Manage your users</p>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
            
            <Button onClick={handleAddUser}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => {
                const defaultAddress = user.addresses.find(addr => addr.default) || user.addresses[0];
                
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
                          {user.avatar ? (
                            <img
                              src={user.avatar.startsWith('http') ? user.avatar : `http://127.0.0.1:8000${user.avatar}`}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-navy text-white text-xs">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {defaultAddress && (
                        <div className="text-sm">
                          {defaultAddress.line1}, {defaultAddress.city}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditUser(user.id)}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEmailUser(user.id)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-1">No users found</h3>
                      <p className="text-gray-500">
                        Try adjusting your search or add a new user.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstUser + 1} to{' '}
              {Math.min(indexOfLastUser, filteredUsers.length)} of{' '}
              {filteredUsers.length} users
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;