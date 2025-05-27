import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const AdminCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({ id: '', name: '', slug: '', image: null as File | null });
  const [subcategoryData, setSubcategoryData] = useState({ id: '', name: '', slug: '', category_id: '' });
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [subcategoryMode, setSubcategoryMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/cat/list');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load categories.', variant: 'destructive' });
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'category' | 'sub') => {
    const { name, value } = e.target;
    if (target === 'category') setFormData(prev => ({ ...prev, [name]: value }));
    else setSubcategoryData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form data on dialog open for add
  const openAddCategoryDialog = () => {
    setFormData({ id: '', name: '', slug: '', image: null });
    setIsAddCategoryOpen(true);
  };

  // Reset form data on dialog open for edit
  const openEditCategoryDialog = (cat: any) => {
    setFormData({ id: cat.id, name: cat.name, slug: cat.slug, image: null }); // reset image, user must reupload if needed
    setIsEditCategoryOpen(true);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', formData.name);
    form.append('slug', formData.slug);
    if (formData.image) form.append('image', formData.image);

    try {
      const res = await fetch('http://localhost:8000/api/v1/cat/create', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Add failed');
      toast({ title: 'Success', description: 'Category added.' });
      fetchCategories();
      setIsAddCategoryOpen(false);
      setFormData({ id: '', name: '', slug: '', image: null });
    } catch {
      toast({ title: 'Error', description: 'Failed to add category.', variant: 'destructive' });
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', formData.name);
    form.append('slug', formData.slug);
    if (formData.image) form.append('image', formData.image);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/cat/update/${formData.id}`, {
        method: 'PUT',
        body: form,
      });
      if (!res.ok) throw new Error('Update failed');
      toast({ title: 'Updated', description: 'Category updated.' });
      fetchCategories();
      setIsEditCategoryOpen(false);
      setFormData({ id: '', name: '', slug: '', image: null });
    } catch {
      toast({ title: 'Error', description: 'Failed to update category.', variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/cat/delete/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast({ title: 'Deleted', description: 'Category deleted.' });
      fetchCategories();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete category.', variant: 'destructive' });
    }
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = subcategoryMode === 'add' ? 'POST' : 'PUT';
    const endpoint =
      subcategoryMode === 'add'
        ? 'http://localhost:8000/api/v1/cat/subcategory/create'
        : `http://localhost:8000/api/v1/cat/sub/update/${subcategoryData.id}`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subcategoryData),
      });
      if (!res.ok) throw new Error('Subcategory save failed');
      toast({ title: 'Success', description: 'Subcategory saved.' });
      fetchCategories();
      setIsSubcategoryDialogOpen(false);
      setSubcategoryData({ id: '', name: '', slug: '', category_id: '' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save subcategory.', variant: 'destructive' });
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (!confirm('Delete subcategory?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/cat/sub/delete/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete subcategory failed');
      toast({ title: 'Deleted', description: 'Subcategory deleted.' });
      fetchCategories();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete subcategory.', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Category Management</h1>
        <p className="text-muted-foreground">Manage categories and subcategories</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 flex justify-between gap-4 flex-wrap">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={openAddCategoryDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Image</TableHead> {/* New Image column */}
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCategories.map((cat) => (
            <React.Fragment key={cat.id}>
              <TableRow>
                <TableCell>{cat.id}</TableCell>
                <TableCell>
                  <img
                    src={`http://localhost:8000/static/${cat.image}`}
                    alt={cat.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                </TableCell>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.slug}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditCategoryDialog(cat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedCategoryId(
                          expandedCategoryId === cat.id ? null : cat.id
                        )
                      }
                    >
                      {expandedCategoryId === cat.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSubcategoryMode('add');
                        setSubcategoryData({ id: '', name: '', slug: '', category_id: String(cat.id) });
                        setIsSubcategoryDialogOpen(true);
                      }}
                    >
                      Add Subcategory
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {expandedCategoryId === cat.id && cat.subcategories?.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cat.subcategories.map((sub: any) => (
                            <TableRow key={sub.id}>
                              <TableCell>{sub.id}</TableCell>
                              <TableCell>{sub.name}</TableCell>
                              <TableCell>{sub.slug}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSubcategoryMode('edit');
                                      setSubcategoryData({
                                        id: sub.id,
                                        name: sub.name,
                                        slug: sub.slug,
                                        category_id: String(sub.category_id),
                                      });
                                      setIsSubcategoryDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600"
                                    onClick={() => handleDeleteSubcategory(sub.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={(open) => {
        setIsAddCategoryOpen(open);
        if (!open) setFormData({ id: '', name: '', slug: '', image: null });
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange(e, 'category')}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange(e, 'category')}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Image</Label>
              <Input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={(open) => {
        setIsEditCategoryOpen(open);
        if (!open) setFormData({ id: '', name: '', slug: '', image: null });
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCategory} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange(e, 'category')}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                name="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange(e, 'category')}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Image (leave empty to keep current)</Label>
              <Input
                type="file"
                id="edit-image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Subcategory Dialog */}
      <Dialog open={isSubcategoryDialogOpen} onOpenChange={(open) => {
        setIsSubcategoryDialogOpen(open);
        if (!open) setSubcategoryData({ id: '', name: '', slug: '', category_id: '' });
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{subcategoryMode === 'add' ? 'Add Subcategory' : 'Edit Subcategory'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSubcategory} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="sub-name">Name</Label>
              <Input
                id="sub-name"
                name="name"
                value={subcategoryData.name}
                onChange={(e) => handleInputChange(e, 'sub')}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-slug">Slug</Label>
              <Input
                id="sub-slug"
                name="slug"
                value={subcategoryData.slug}
                onChange={(e) => handleInputChange(e, 'sub')}
                required
              />
            </div>
            {/* Hidden or disabled category_id input to avoid user editing */}
            <Input
              type="hidden"
              name="category_id"
              value={subcategoryData.category_id}
              readOnly
            />
            <DialogFooter>
              <Button type="submit">{subcategoryMode === 'add' ? 'Add' : 'Update'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategories;
