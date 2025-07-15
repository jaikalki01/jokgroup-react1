
import { useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import UserLayout from '@/components/user/UserLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';
import { BASE_URL } from '@/api/api';

const AccountSettingsPage = () => {
  const { state } = useStore();
  const { currentUser } = state;
  
  const [notifications, setNotifications] = useState({
    email: true,
    offers: true,
    updates: false,
  });

  // Add state for password fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Add loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get token from current user
      const token = currentUser?.token;
      
      if (!token) {
        toast({
          title: "Error",
          description: "You must be logged in to change your password.",
          variant: "destructive"
        });
        return;
      }
      
      // Make API call to change password
      await axios.post(
        `${BASE_URL}/users/change-password`,
        {
         old_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Reset form fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggle = (name: string) => {
    setNotifications(prev => ({ 
      ...prev, 
      [name]: !prev[name as keyof typeof notifications] 
    }));
  };
  
  return (
    <UserLayout>
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how we contact you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive order updates via email</p>
                </div>
                <Switch 
                  checked={notifications.email}
                  onCheckedChange={() => handleToggle('email')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Special Offers</h4>
                  <p className="text-sm text-gray-500">Receive special offers and discounts</p>
                </div>
                <Switch 
                  checked={notifications.offers}
                  onCheckedChange={() => handleToggle('offers')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Product Updates</h4>
                  <p className="text-sm text-gray-500">Get notified about new products</p>
                </div>
                <Switch 
                  checked={notifications.updates}
                  onCheckedChange={() => handleToggle('updates')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Delete Account</CardTitle>
            <CardDescription>Permanently delete your account and all data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. This action cannot be undone.
            </p>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default AccountSettingsPage;
