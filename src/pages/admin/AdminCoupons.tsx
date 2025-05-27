import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, Tag, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Coupon } from '@/types';

interface CouponFormValues {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_purchase: number;
  valid_from: string;
  valid_to: string;
  max_uses: number;
  active: boolean;
}

const AdminCoupons = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/coupon/');
        const data = await response.json();
        
        console.log("API Response:", data);  // Log the response to check its structure
  
        if (Array.isArray(data)) {
          const mappedCoupons = data.map((coupon: any) => ({
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discount_type,
            discountValue: coupon.discount_value,
            minimumPurchase: coupon.minimum_purchase,
            validFrom: coupon.valid_from,
            validTo: coupon.valid_to,
            maxUses: coupon.max_uses,
            usedCount: coupon.used_count,
            active: coupon.active,
          }));
          setCoupons(mappedCoupons);
        } else {
          console.error("API response is not an array.");
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };
  
    fetchCoupons();
  }, []);
  
  const filteredCoupons = coupons.filter(coupon => {
    const couponCodeLower = coupon.code.toLowerCase();
    const couponDescLower = coupon.description.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch = (
      couponCodeLower.includes(searchTermLower) ||
      couponDescLower.includes(searchTermLower)
    );

    const matchesStatus = !showActiveOnly || coupon.active;

    return matchesSearch && matchesStatus;
  });

  const sortedCoupons = [...filteredCoupons].sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }
    return a.code.localeCompare(b.code);
  });

  const addForm = useForm<CouponFormValues>({
    defaultValues: {
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      minimum_purchase: 0,
      valid_from: '',
      valid_to: '',
      max_uses: 0,
      active: true,
    },
  });

  const editForm = useForm<CouponFormValues>();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleAddCoupon = async (data: CouponFormValues) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const newCoupon = await response.json();
      setCoupons(prevCoupons => [...prevCoupons, newCoupon]);
      toast({
        title: 'Coupon Added',
        description: `Coupon ${data.code} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error Adding Coupon',
        description: 'There was an error adding the coupon.',
        variant: 'destructive',
      });
    }

    setIsAddDialogOpen(false);
    addForm.reset();
  };

  const handleEditClick = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    editForm.reset({
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discountType,
      discount_value: coupon.discountValue,
      minimum_purchase: coupon.minimumPurchase,
      valid_from: coupon.validFrom,
      valid_to: coupon.validTo,
      max_uses: coupon.maxUses,
      active: coupon.active,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditCoupon = async (data: CouponFormValues) => {
    if (!currentCoupon) return;

    try {
      const updatedCoupon = {
        ...data,
        id: currentCoupon.id,
      };

      const response = await fetch(`http://localhost:8000/api/v1/coupon/${currentCoupon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCoupon),
      });

      if (!response.ok) {
        throw new Error('Failed to update coupon');
      }

      setCoupons(prevCoupons =>
        prevCoupons.map(c =>
          c.id === currentCoupon.id ? {
            ...c,
            code: data.code,
            description: data.description,
            discountType: data.discount_type,
            discountValue: data.discount_value,
            minimumPurchase: data.minimum_purchase,
            validFrom: data.valid_from,
            validTo: data.valid_to,
            maxUses: data.max_uses,
            active: data.active,
          } : c
        )
      );

      toast({
        title: 'Coupon Updated',
        description: `Coupon ${data.code} has been updated successfully.`,
      });

      setIsEditDialogOpen(false);
      setCurrentCoupon(null);
    } catch (error) {
      toast({
        title: 'Error Updating Coupon',
        description: error.message || 'There was an error updating the coupon.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/coupon/${couponId}`, {
        method: 'DELETE',
      });
      setCoupons(prevCoupons => prevCoupons.filter(coupon => coupon.id !== couponId));
      toast({
        title: 'Coupon Deleted',
        description: `Coupon has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Coupon',
        description: 'There was an error deleting the coupon.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleCouponStatus = async (coupon: Coupon) => {
    try {
      const updatedCoupon = { ...coupon, active: !coupon.active };
      await fetch(`http://localhost:8000/api/v1/coupon/${coupon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCoupon),
      });
      setCoupons(prevCoupons =>
        prevCoupons.map(c => (c.id === coupon.id ? updatedCoupon : c))
      );
      toast({
        title: coupon.active ? 'Coupon Deactivated' : 'Coupon Activated',
        description: `Coupon ${coupon.code} has been ${coupon.active ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error Updating Coupon Status',
        description: 'There was an error updating the coupon status.',
        variant: 'destructive',
      });
    }
  };

  const onSubmitAdd = (data: CouponFormValues) => {
    handleAddCoupon(data);
  };

  const onSubmitEdit = (data: CouponFormValues) => {
    handleEditCoupon(data);
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Coupon Management</h1>
        <p className="text-gray-600">Create and manage discount coupons</p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <Input
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button type="submit" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active-only"
                  checked={showActiveOnly}
                  onCheckedChange={setShowActiveOnly}
                />
                <label
                  htmlFor="active-only"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show active only
                </label>
              </div>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add new coupon</DialogTitle>
                  <DialogDescription>
                    Create a new discount coupon for your customers.
                  </DialogDescription>
                </DialogHeader>

                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4 pt-4">
                    <FormField
                      control={addForm.control}
                      name="code"
                      rules={{ required: 'Coupon code is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coupon Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. SUMMER2023" {...field} />
                          </FormControl>
                          <FormDescription>
                            The code customers will enter at checkout.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="description"
                      rules={{ required: 'Description is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Summer discount" {...field} />
                          </FormControl>
                          <FormDescription>
                            A short description of the coupon.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="discount_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addForm.control}
                        name="discount_value"
                        rules={{
                          required: 'Value is required',
                          pattern: {
                            value: /^[0-9]+$/,
                            message: 'Must be a number',
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Value</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 20" {...field} />
                            </FormControl>
                            <FormDescription>
                              The value of the discount (percentage or fixed amount).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="valid_from"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valid From</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addForm.control}
                        name="valid_to"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valid To</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={addForm.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Active</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit">Save Coupon</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Edit Coupon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Modify the coupon details below.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4 pt-4">
              <FormField
                control={editForm.control}
                name="code"
                rules={{ required: 'Coupon code is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SUMMER2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Summer discount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="discount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="discount_value"
                  rules={{
                    required: 'Value is required',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Must be a number',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="minimum_purchase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Purchase</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="max_uses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Uses</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="valid_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="valid_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid To</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCoupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell>{coupon.code}</TableCell>
              <TableCell>{coupon.description}</TableCell>
              <TableCell>
                {coupon.discountValue} {coupon.discountType === 'percentage' ? '%' : '₹'}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {coupon.active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEditClick(coupon)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={coupon.active ? 'secondary' : 'default'}
                    onClick={() => handleToggleCouponStatus(coupon)}
                  >
                    {coupon.active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminLayout>
  );
};

export default AdminCoupons;