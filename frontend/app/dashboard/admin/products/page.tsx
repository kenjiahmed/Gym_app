'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  Star,
  StarOff,
  X,
  Save,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  gender: string;
  brand?: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  rating?: number;
  reviewCount: number;
  tags: string[];
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  gender: string;
  brand: string;
  images: string;
  sizes: string;
  colors: string;
  stock: number;
  featured: boolean;
  tags: string;
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: 'tops',
    gender: 'unisex',
    brand: '',
    images: '',
    sizes: 'S, M, L, XL',
    colors: 'Black, White',
    stock: 100,
    featured: false,
    tags: '',
  });

  // Fetch all products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data;
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/products', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to create product', {
        description: error.response?.data?.message,
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to update product', {
        description: error.response?.data?.message,
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const response = await api.put(`/products/${id}`, { featured });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Featured status updated');
    },
    onError: () => {
      toast.error('Failed to update featured status');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'tops',
      gender: 'unisex',
      brand: '',
      images: '',
      sizes: 'S, M, L, XL',
      colors: 'Black, White',
      stock: 100,
      featured: false,
      tags: '',
    });
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      gender: product.gender,
      brand: product.brand || '',
      images: product.images.join(', '),
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      stock: product.stock,
      featured: product.featured,
      tags: product.tags.join(', '),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      images: formData.images.split(',').map((s) => s.trim()).filter((s) => s),
      sizes: formData.sizes.split(',').map((s) => s.trim()).filter((s) => s),
      colors: formData.colors.split(',').map((s) => s.trim()).filter((s) => s),
      tags: formData.tags.split(',').map((s) => s.trim()).filter((s) => s),
      rating: 4.5,
      reviewCount: 0,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProductMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-white text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black mb-2">
            <span className="bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-lime bg-clip-text text-transparent">
              Product Management
            </span>
          </h1>
          <p className="text-gray-400 text-lg">{products.length} products total</p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-neon-pink to-neon-cyan hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <Card className="p-8 bg-gray-900 border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-white">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="mt-2 bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock" className="text-white">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                        className="mt-2 bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category" className="text-white">Category *</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="mt-2 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        required
                      >
                        <option value="tops">Tops</option>
                        <option value="bottoms">Bottoms</option>
                        <option value="sports_bras">Sports Bras</option>
                        <option value="accessories">Accessories</option>
                        <option value="shoes">Shoes</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="gender" className="text-white">Gender *</Label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="mt-2 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        required
                      >
                        <option value="women">Women</option>
                        <option value="men">Men</option>
                        <option value="unisex">Unisex</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="brand" className="text-white">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="images" className="text-white">Image URLs (comma-separated) *</Label>
                    <Textarea
                      id="images"
                      value={formData.images}
                      onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                      rows={2}
                      required
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sizes" className="text-white">Sizes (comma-separated) *</Label>
                      <Input
                        id="sizes"
                        value={formData.sizes}
                        onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                        className="mt-2 bg-gray-800 border-gray-700 text-white"
                        required
                        placeholder="S, M, L, XL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="colors" className="text-white">Colors (comma-separated) *</Label>
                      <Input
                        id="colors"
                        value={formData.colors}
                        onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                        className="mt-2 bg-gray-800 border-gray-700 text-white"
                        required
                        placeholder="Black, White, Blue"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags" className="text-white">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                      placeholder="breathable, compression, moisture-wicking"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="featured" className="text-white cursor-pointer">
                      Mark as Featured
                    </Label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-neon-pink to-neon-cyan hover:opacity-90 transition-opacity"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </Button>
                    <Button
                      type="button"
                      onClick={resetForm}
                      variant="outline"
                      className="border-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden bg-gray-900/50 border-gray-800">
              <div className="aspect-square relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.featured && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-neon-pink to-neon-cyan px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-bold">Featured</span>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-red-400 font-bold">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                {product.brand && (
                  <p className="text-neon-cyan text-sm font-semibold mb-1">{product.brand}</p>
                )}
                <h3 className="text-white font-bold line-clamp-2 mb-2">{product.name}</h3>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-2xl font-bold bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                    ${product.price.toFixed(2)}
                  </p>
                  <span className="text-gray-400 text-sm">Stock: {product.stock}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleFeaturedMutation.mutate({ id: product.id, featured: !product.featured })}
                    variant="outline"
                    className="flex-1 border-gray-700 hover:border-yellow-400"
                    size="sm"
                  >
                    {product.featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => handleEdit(product)}
                    variant="outline"
                    className="flex-1 border-gray-700 hover:border-neon-cyan"
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(product.id, product.name)}
                    variant="outline"
                    className="flex-1 border-gray-700 hover:border-red-400"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="p-12 bg-gray-900/50 border-gray-800 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No products yet. Add your first product to get started.</p>
        </Card>
      )}
    </div>
  );
}
