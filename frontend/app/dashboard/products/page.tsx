'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null);
  const [formIsActive, setFormIsActive] = useState(true);

  // Upload/Saving states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirm Modal states
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiFetch<{ products: Product[] }>('/api/products');
        setProducts(data.products);
      } catch (e) {
        setError((e as Error).message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormDescription('');
    setFormImage(null);
    setFormImageUrl(null);
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormDescription(product.description || '');
    setFormImage(product.image);
    setFormImageUrl(product.image_url);
    setFormIsActive(product.is_active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setFormError('Image size must be less than 10MB');
      return;
    }

    setIsUploadingImage(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');

    try {
      const data = await apiFetch<{ url: string; path: string }>('/api/upload', {
        method: 'POST',
        body: formData,
      });
      setFormImage(data.path);
      setFormImageUrl(data.url);
    } catch (err) {
      setFormError((err as Error).message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      setFormError('Product name is required');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Please enter a valid price (minimum 0)');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      name: formName.trim(),
      price: priceNum,
      description: formDescription.trim() || null,
      image: formImage,
      is_active: formIsActive,
    };

    try {
      if (editingProduct) {
        // Update product
        const response = await apiFetch<{ product: Product }>(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setProducts(prev =>
          prev.map(p => (p.id === editingProduct.id ? response.product : p))
        );
      } else {
        // Add new product
        const response = await apiFetch<{ product: Product }>('/api/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setProducts(prev => [response.product, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError((err as Error).message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err) {
      alert((err as Error).message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-400 text-sm">Browse the latest products from Card Setu.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add Product
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-12 text-center">
          <p className="text-gray-400">No products available yet. Check back soon!</p>
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 flex flex-col relative group"
            >
              {/* Active/Inactive Status Badge for Admin */}
              {isAdmin && (
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-md shadow-sm z-10 ${
                  product.is_active 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              )}

              <div className="aspect-video w-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center overflow-hidden relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <svg className="w-12 h-12 text-blue-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                )}
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">
                    {product.description}
                  </p>
                )}
                {!product.description && (
                  <div className="mb-4 flex-1" />
                )}
                
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    ${product.price.toFixed(2)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-gray-400 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 rounded-lg transition-colors border border-white/5"
                          title="Edit Product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors border border-white/5"
                          title="Delete Product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </>
                    )}
                    <button className="text-sm bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-lg border border-white/10 transition-all duration-300">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0B1528] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#070D1A]">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
                {formError && (
                  <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
                    {formError}
                  </div>
                )}

                {/* Image Upload Area */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Product Image
                  </label>
                  <div 
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-[#070D1A]/50 hover:bg-[#070D1A]/80 aspect-video relative group overflow-hidden"
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                        <span className="text-xs text-gray-400 font-medium">Uploading image...</span>
                      </div>
                    ) : formImageUrl ? (
                      <>
                        <img 
                          src={formImageUrl} 
                          alt="Product preview" 
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <span className="text-white text-sm font-medium bg-blue-600/80 px-4 py-2 rounded-xl backdrop-blur-sm">
                            Change Image
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/10">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Click to upload product image</p>
                          <p className="text-xs text-gray-500">Supports PNG, JPG (Max 10MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="prod-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="prod-name"
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Card Setu Premium NFC Card"
                    required
                    className="w-full bg-[#070D1A] border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-300"
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label htmlFor="prod-price" className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 text-sm">$</span>
                    <input
                      id="prod-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formPrice}
                      onChange={e => setFormPrice(e.target.value)}
                      placeholder="0.00"
                      required
                      className="w-full bg-[#070D1A] border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-xl pl-8 pr-4 py-3 text-white text-sm outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="prod-desc" className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Description
                  </label>
                  <textarea
                    id="prod-desc"
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Provide a detailed description of the product..."
                    rows={4}
                    className="w-full bg-[#070D1A] border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-300 resize-none"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#070D1A]/50 border border-white/5 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-white">Active Status</p>
                    <p className="text-xs text-gray-400">Determine if this product is visible to public customers.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 outline-none ${
                      formIsActive ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    <motion.div
                      layout
                      className="bg-white w-4 h-4 rounded-full shadow-md"
                      animate={{ x: formIsActive ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Buttons (Internal to form box, not footer to stay inside overflow) */}
                <div className="pt-4 border-t border-white/5 flex justify-end gap-3 bg-[#0B1528]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all duration-300"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-blue-500/10 flex items-center gap-2"
                    disabled={isSaving || isUploadingImage}
                  >
                    {isSaving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Dialog Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0B1528] border border-red-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative p-6 z-10 space-y-6"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Product</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Are you sure you want to delete <span className="font-semibold text-white">"{productToDelete.name}"</span>? 
                    This action cannot be undone and will remove the product permanently.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setProductToDelete(null)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all duration-300"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-lg shadow-red-500/20"
                  disabled={isDeleting}
                >
                  {isDeleting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}