
import { useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import UserLayout from '@/components/user/UserLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

const AccountSettingsPage = () => {
  const { state } = useStore();
  const { currentUser } = state;
  
  const [notifications, setNotifications] = useState({
    email: true,
    offers: true,
    updates: false,
  });
  
  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would update the password here
    toast({
      title: "Password Updated",
      description: "Your password has been updated successfully.",
    });
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                />
              </div>
              
              <Button type="submit">Update Password</Button>
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
