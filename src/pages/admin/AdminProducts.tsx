import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axios from 'axios';


interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  category_id: number;
  subcategory_id: number;
  colors: string;
  sizes: string;
  in_stock: boolean;
  rating: number;
  reviews: number;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  images?: string[];
}



const AddProductForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
 const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
const [colorInput, setColorInput] = useState('');
const [sizeInput, setSizeInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    subcategory_id: '',
    colors: '',
    sizes: '',
    in_stock: true,
    rating: '',
    reviews: '',
    featured: false,
    best_seller: false,
    new_arrival: false,
    images: [] as File[],
  });

  interface SubcategoryType {
  id: number;
  name: string;
  slug: string;
  category_id: number;
}

interface CategoryType {
  id: number;
  name: string;
  slug: string;
  image: string;
  subcategories: SubcategoryType[];
}

  const [products, setProducts] = useState<Product[]>([]);
const [categories, setCategories] = useState<CategoryType[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/product/list");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  useEffect(() => {
    fetchProducts();

    fetch("http://localhost:8000/api/v1/cat/list")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Failed to fetch categories", err));

    fetch("http://localhost:8000/api/v1/cat/subcategory/list")
      .then(res => res.json())
      .then(data => setSubcategories(data))
      .catch(err => console.error("Failed to fetch subcategories", err));
  }, []);

const categoryMap = Array.isArray(categories)
  ? Object.fromEntries(categories.map(cat => [cat.id, cat.name]))
  : {};

const allSubcategories = Array.isArray(categories)
  ? categories.flatMap(cat => cat.subcategories ?? [])
  : [];

const subcategoryMap = Object.fromEntries(allSubcategories.map(sub => [sub.id, sub.name]));



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;
    if (type === 'file' && files) {
      setFormData(prev => ({ ...prev, images: Array.from(files) }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      category_id: '',
      subcategory_id: '',
      colors: '',
      sizes: '',
      in_stock: true,
      rating: '',
      reviews: '',
      featured: false,
      best_seller: false,
      new_arrival: false,
      images: [],
    });
    setIsEditing(false);
    setEditingProductId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'images') {
        formData.images.forEach(file => dataToSend.append('images', file));
      } else {
        dataToSend.append(key, String(value));
      }
    });

    try {
      if (isEditing && editingProductId) {
        await axios.put(`http://localhost:8000/api/v1/product/update/${editingProductId}`, dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`http://localhost:8000/api/v1/product/create`, dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      fetchProducts();
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting product:", error);
      setError("Failed to submit product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      discount_price: String(product.discount_price || ''),
      category_id: String(product.category_id),
      subcategory_id: String(product.subcategory_id),
      colors: product.colors,
      sizes: product.sizes,
      in_stock: product.in_stock,
      rating: String(product.rating),
      reviews: String(product.reviews),
      featured: product.featured,
      best_seller: product.best_seller,
      new_arrival: product.new_arrival,
      images: [],
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/product/delete/${productToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(prev => prev.filter(product => product.id !== productToDelete));
        toast.success("Product deleted successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete product');
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product.");
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };



  
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products Management</h1>
          <Button onClick={() => { setIsFormOpen(true); resetForm(); }}>Add New Product</Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subcategory</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
  {product.images && (
    (() => {
    let imagesArray: string[] = [];

  if (typeof product.images === "string") 
      try {
         imagesArray = JSON.parse(product.images);
      } catch (e) {
        console.error("Failed to parse images JSON:", e);
      }
      return imagesArray[0] ? (
        <img
          src={`http://localhost:8000/${imagesArray[0].replace(/^\/+/, '')}`}
          alt={product.name}
          className="w-10 h-10 object-cover rounded"
        />
      ) : null;
    })()
  )}
  {product.name}
</div>

                    </TableCell>
                    <TableCell>{categoryMap[product.category_id]}</TableCell>
                    <TableCell>{subcategoryMap[product.subcategory_id]}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>{product.in_stock ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{product.featured ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>Edit</Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setProductToDelete(product.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Product Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} />
                <Input name="category_id" placeholder="Category Id" value={formData.category_id} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="subcategory_id" placeholder="Subcategory Id" value={formData.subcategory_id} onChange={handleChange} />
              </div>
              <Textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="price" placeholder="Price" type="number" value={formData.price} onChange={handleChange} />
                <Input name="discount_price" placeholder="Discount Price" type="number" value={formData.discount_price} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="sizes" placeholder="Sizes (comma separated)" value={formData.sizes} onChange={handleChange} />
                <Input name="colors" placeholder="Colors (comma separated)" value={formData.colors} onChange={handleChange} />
              </div>
              <div className="flex items-center gap-2">
                <label>
                  <input
                    type="checkbox"
                    name="in_stock"
                    checked={formData.in_stock}
                    onChange={handleChange}
                  />
                  In Stock
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  Featured
                </label>
              </div>
              <div className="flex items-center gap-2">
                <label>
                  <input
                    type="checkbox"
                    name="best_seller"
                    checked={formData.best_seller}
                    onChange={handleChange}
                  />
                  Best Seller
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="new_arrival"
                    checked={formData.new_arrival}
                    onChange={handleChange}
                  />
                  New Arrival
                </label>
              </div>
              <div className="flex gap-2 items-center">
                <label>Images:</label>
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Submitting...' : 'Submit'}
                </Button>
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
            <DialogFooter>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AddProductForm;
