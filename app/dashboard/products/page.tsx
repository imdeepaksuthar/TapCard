'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { compressProductImage } from '../../../lib/compressImage';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  is_active: boolean;
  created_at: string;
}

// Each uploaded image has a display URL and a storage path
interface UploadedImage {
  url: string;   // full URL for display (e.g. http://localhost:8000/storage/...)
  path: string;  // relative path stored in DB (e.g. media/images/uuid.jpg)
}

export default function ProductsPage() {
  const { user } = useAuth();
  // Changed to true permanently as requested so users can manage products
  const isAdmin = true;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc', 'name-asc'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToView, setProductToView] = useState<Product | null>(null);

  // Import CSV states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importErrorsList, setImportErrorsList] = useState<string[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState<UploadedImage[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);

  // Upload/Saving states
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product card image carousel index per product
  const [carouselIndex, setCarouselIndex] = useState<Record<number, number>>({});

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

  const openImportModal = () => {
    setIsImportModalOpen(true);
    setImportFile(null);
    setImportError(null);
    setImportSuccess(null);
    setImportErrorsList([]);
    if (importFileInputRef.current) importFileInputRef.current.value = '';
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      setImportError('Please select a CSV file.');
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);
    setImportErrorsList([]);

    const fd = new FormData();
    fd.append('file', importFile);

    try {
      const response = await apiFetch<{ message: string; imported_count: number; errors: string[] }>('/api/products/import', {
        method: 'POST',
        body: fd,
      });

      setImportSuccess(response.message || `Successfully imported ${response.imported_count} products.`);
      
      if (response.errors && response.errors.length > 0) {
        setImportErrorsList(response.errors);
      }

      // Refresh products list
      const data = await apiFetch<{ products: Product[] }>('/api/products');
      setProducts(data.products);

      // Reset file
      setImportFile(null);
      if (importFileInputRef.current) importFileInputRef.current.value = '';
    } catch (err) {
      const errMsg = (err as Error).message || 'Failed to import products';
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.errors) {
          setImportErrorsList(parsed.errors);
          setImportError(parsed.message || 'Validation errors occurred.');
        } else {
          setImportError(errMsg);
        }
      } catch {
        setImportError(errMsg);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "name,price,description,is_active,images\n"
      + "NFC Smart Business Card,499.00,Elevate your networking with our premium NFC-enabled business card.,true,https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80\n"
      + "Classic Wooden Digital Card,799.00,A eco-friendly natural wood card with dynamic smart sharing capability.,true,https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80\n"
      + "Metal RFID Protection Card,1499.00,Ultra-premium laser engraved matte black metal smart card.,false,\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFormName('');
    setFormPrice('');
    setFormDescription('');
    setFormImages([]);
    setFormIsActive(true);
    setFormError(null);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormDescription(product.description || '');
    setFormIsActive(product.is_active);
    setFormError(null);
    // Reconstruct UploadedImage objects from the stored URLs
    // The backend returns full URLs in the images[] array
    const existing: UploadedImage[] = (product.images || []).map(url => ({
      url,
      path: url, // when editing, use the URL directly as path too
    }));
    setFormImages(existing);
    setIsModalOpen(true);
  };

  // Upload multiple files at once
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate sizes
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setFormError(`"${file.name}" exceeds the 10MB limit.`);
        return;
      }
    }

    setFormError(null);
    setUploadingCount(prev => prev + files.length);

    // Compress then upload all files concurrently
    const uploadPromises = files.map(async (file) => {
      const compressed = await compressProductImage(file);
      const fd = new FormData();
      fd.append('file', compressed);
      fd.append('type', 'image');
      fd.append('context', 'product');
      try {
        const data = await apiFetch<{ url: string; path: string }>('/api/upload', {
          method: 'POST',
          body: fd,
        });
        return { url: data.url, path: data.path } as UploadedImage;
      } catch {
        return null;
      } finally {
        setUploadingCount(prev => prev - 1);
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter((r): r is UploadedImage => r !== null);
    if (successful.length < files.length) {
      setFormError(`${files.length - successful.length} image(s) failed to upload.`);
    }
    setFormImages(prev => [...prev, ...successful]);

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setFormImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) { setFormError('Product name is required'); return; }
    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum < 0) { setFormError('Please enter a valid price (minimum 0)'); return; }

    setIsSaving(true);
    setFormError(null);

    // Send full URLs to backend — the backend stores them as-is in the images[] JSON column
    const payload = {
      name: formName.trim(),
      price: priceNum,
      description: formDescription.trim() || null,
      images: formImages.map(img => img.url),
      is_active: formIsActive,
    };

    try {
      if (editingProduct) {
        const response = await apiFetch<{ product: Product }>(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setProducts(prev => prev.map(p => (p.id === editingProduct.id ? response.product : p)));
      } else {
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

  const handleToggleStatus = async (product: Product) => {
    // Optimistic update
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
    try {
      await apiFetch<{ product: Product }>(`/api/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...product, is_active: !product.is_active }),
      });
    } catch (err) {
      // Revert on failure
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: product.is_active } : p));
      alert((err as Error).message || 'Failed to update status');
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/products/${productToDelete.id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err) {
      alert((err as Error).message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCarouselIdx = (id: number) => carouselIndex[id] ?? 0;
  const setCarouselIdx = (id: number, idx: number) =>
    setCarouselIndex(prev => ({ ...prev, [id]: idx }));

  const filteredAndSortedProducts = products
    .filter((p) => {
      if (filterStatus === 'active' && !p.is_active) return false;
      if (filterStatus === 'inactive' && p.is_active) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price-desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      // 'newest' (default)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Products</h1>
            <p className="text-gray-400 mt-2">Manage and organize your product catalog.</p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3">
              <button
                onClick={openImportModal}
                className="flex items-center gap-2 bg-[#0B1528]/50 backdrop-blur-xl border border-white/10 hover:border-white/20 text-gray-300 font-medium py-2.5 px-5 rounded-2xl transition-all duration-300 active:scale-95 shadow-lg cursor-pointer"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import CSV
              </button>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-2.5 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/30 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </div>
          )}
        </div>

        {/* Toolbar */}
        {!isLoading && !error && products.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 bg-[#0B1528]/50 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-lg">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0F1C35]/80 border border-white/5 hover:border-white/10 focus:border-blue-500/50 rounded-2xl pl-12 pr-4 py-3 text-white text-sm outline-none transition-all duration-300 shadow-inner"
              />
            </div>

            {/* Filters & Sorting */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#0F1C35]/80 border border-white/5 hover:border-white/10 focus:border-blue-500/50 rounded-2xl px-5 py-3 text-sm font-semibold text-gray-300 outline-none transition-all duration-300 appearance-none pr-10 relative cursor-pointer shadow-inner"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
              >
                <option value="all" className="bg-[#0F1C35]">All Status</option>
                <option value="active" className="bg-[#0F1C35]">Active Only</option>
                <option value="inactive" className="bg-[#0F1C35]">Inactive Only</option>
              </select>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#0F1C35]/80 border border-white/5 hover:border-white/10 focus:border-blue-500/50 rounded-2xl px-5 py-3 text-sm font-semibold text-gray-300 outline-none transition-all duration-300 appearance-none pr-10 relative cursor-pointer shadow-inner"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
              >
                <option value="newest" className="bg-[#0F1C35]">Newest First</option>
                <option value="price-asc" className="bg-[#0F1C35]">Price: Low to High</option>
                <option value="price-desc" className="bg-[#0F1C35]">Price: High to Low</option>
                <option value="name-asc" className="bg-[#0F1C35]">Name: A to Z</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
      {error && !isLoading && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}
      {!isLoading && !error && products.length === 0 && (
        <div className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center shadow-xl">
          <p className="text-gray-400">No products available yet. Check back soon!</p>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && products.length > 0 && filteredAndSortedProducts.length === 0 && (
        <div className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center mt-6 shadow-xl">
          <svg className="w-16 h-16 text-gray-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <h3 className="text-xl font-bold text-white tracking-tight">No products found</h3>
          <p className="text-gray-400 mt-2">Try adjusting your filters or search query.</p>
          <button 
            onClick={() => { setSearchQuery(''); setFilterStatus('all'); setSortBy('newest'); }}
            className="mt-6 text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {!isLoading && filteredAndSortedProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredAndSortedProducts.map((product, index) => {
            const rawImgs = product.images || [];
            const imgs = rawImgs.map((img: string) => 
              img && (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:'))
                ? img
                : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'
            );
            const ci = getCarouselIdx(product.id);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative group"
              >
                {/* Status toggle badge with switch */}
                {isAdmin && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/10">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${product.is_active ? 'text-green-400' : 'text-gray-400'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(product); }}
                      className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors duration-300 outline-none ${product.is_active ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                      <motion.div
                        layout
                        className="bg-white w-3 h-3 rounded-full shadow-md"
                        animate={{ x: product.is_active ? 16 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                )}

                {/* Image carousel */}
                <div className="aspect-video w-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 relative overflow-hidden">
                  {imgs.length > 0 ? (
                    <>
                      <img
                        src={imgs[ci]}
                        alt={`${product.name} image ${ci + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      {/* Carousel dots */}
                      {imgs.length > 1 && (
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                          {imgs.map((_, i) => (
                            <button
                              key={i}
                              onClick={e => { e.stopPropagation(); setCarouselIdx(product.id, i); }}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${i === ci ? 'bg-white w-3' : 'bg-white/40'}`}
                            />
                          ))}
                        </div>
                      )}
                      {/* Prev/Next arrows */}
                      {imgs.length > 1 && (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); setCarouselIdx(product.id, (ci - 1 + imgs.length) % imgs.length); }}
                            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setCarouselIdx(product.id, (ci + 1) % imgs.length); }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                          </button>
                        </>
                      )}
                      {/* Image count badge */}
                      {imgs.length > 1 && (
                        <span className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {ci + 1}/{imgs.length}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-blue-400/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{product.name}</h3>
                  {product.description ? (
                    <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">{product.description}</p>
                  ) : (
                    <div className="mb-4 flex-1" />
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <>
                          <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 rounded-lg transition-colors border border-white/5" title="Edit Product">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => setProductToDelete(product)} className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors border border-white/5" title="Delete Product">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )}
                      <button onClick={() => setProductToView(product)} className="text-sm bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-lg border border-white/10 transition-all duration-300">View</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
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
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
                {formError && (
                  <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">{formError}</div>
                )}

                {/* ─── Multi-Image Upload ─── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Product Images <span className="text-gray-600 normal-case font-normal">(up to 10)</span>
                    </label>
                    {formImages.length < 10 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingCount > 0}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Add more
                      </button>
                    )}
                  </div>

                  {/* Upload zone — shown when no images yet */}
                  {formImages.length === 0 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-[#070D1A]/50 hover:bg-[#070D1A]/80 group"
                    >
                      {uploadingCount > 0 ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                          <span className="text-xs text-gray-400 font-medium">Uploading {uploadingCount} image(s)...</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-3">
                          <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Click to upload product images</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG supported · Max 10MB per image · Select multiple</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image thumbnail grid */}
                  {formImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {formImages.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group/img bg-[#070D1A]">
                          <img src={img.url} alt={`Product image ${i + 1}`} className="w-full h-full object-cover" />
                          {/* Main badge on first image */}
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-blue-500/80 backdrop-blur text-white px-1.5 py-0.5 rounded-full">MAIN</span>
                          )}
                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                      {/* Add more tile */}
                      {formImages.length < 10 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingCount > 0}
                          className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/50 flex flex-col items-center justify-center gap-1 transition-colors bg-[#070D1A]/50 hover:bg-[#070D1A] disabled:opacity-50"
                        >
                          {uploadingCount > 0 ? (
                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                          ) : (
                            <>
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                              <span className="text-[10px] text-gray-500">Add</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFilesChange}
                    accept="image/*"
                    multiple
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
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 text-sm">₹</span>
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
                  <label htmlFor="prod-desc" className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Description</label>
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
                    <p className="text-xs text-gray-400">Determine if this product is visible to customers.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 outline-none ${formIsActive ? 'bg-blue-500' : 'bg-gray-700'}`}
                  >
                    <motion.div
                      layout
                      className="bg-white w-4 h-4 rounded-full shadow-md"
                      animate={{ x: formIsActive ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
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
                    disabled={isSaving || uploadingCount > 0}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProductToDelete(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0B1528] border border-red-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative p-6 z-10 space-y-6"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Product</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Are you sure you want to delete <span className="font-semibold text-white">"{productToDelete.name}"</span>?
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setProductToDelete(null)} disabled={isDeleting} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all duration-300">Cancel</button>
                <button onClick={confirmDeleteProduct} disabled={isDeleting} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-lg shadow-red-500/20">
                  {isDeleting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Product Modal */}
      <AnimatePresence>
        {productToView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProductToView(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0B1528] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-start bg-[#070D1A]">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{productToView.name}</h2>
                  <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    ₹{productToView.price.toFixed(2)}
                  </p>
                </div>
                <button onClick={() => setProductToView(null)} className="text-gray-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                {/* Images */}
                {productToView.images && productToView.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {productToView.images.map((img, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden bg-black/50 border border-white/5">
                        <img src={img} alt={`${productToView.name} ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-40 bg-black/20 rounded-xl flex items-center justify-center border border-white/5">
                    <p className="text-gray-500 text-sm">No images available.</p>
                  </div>
                )}
                
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                  <div className="bg-[#070D1A]/50 border border-white/5 rounded-xl p-4 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {productToView.description || <span className="text-gray-500 italic">No description provided.</span>}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${productToView.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {productToView.is_active ? 'Currently Active' : 'Currently Inactive'}
                  </div>
                  <span>&bull;</span>
                  <div>Added {new Date(productToView.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 flex justify-end bg-[#070D1A]">
                <button onClick={() => setProductToView(null)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all duration-300">
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import CSV Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsImportModalOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0B1528] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#070D1A]">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Bulk Import Products
                </h2>
                <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleImportCSV} className="flex-1 overflow-y-auto p-6 space-y-6">
                {importError && (
                  <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm whitespace-pre-wrap">{importError}</div>
                )}
                
                {importSuccess && (
                  <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-sm whitespace-pre-wrap">{importSuccess}</div>
                )}

                {importErrorsList.length > 0 && (
                  <div className="space-y-1.5 p-4 rounded-xl border border-red-500/15 bg-red-500/5 max-h-40 overflow-y-auto">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Detailed Row Failures:</p>
                    <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                      {importErrorsList.map((err, i) => <li key={i} className="leading-relaxed">{err}</li>)}
                    </ul>
                  </div>
                )}

                {/* Instructions */}
                <div className="p-4 bg-[#070D1A]/50 border border-white/5 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">CSV Format Instructions</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Ensure your columns match these exact headers:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5"><code className="text-blue-400 font-bold">name</code> <span className="text-gray-500">(Required)</span></div>
                    <div className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5"><code className="text-blue-400 font-bold">price</code> <span className="text-gray-500">(Required, numeric)</span></div>
                    <div className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5"><code className="text-blue-400 font-bold">description</code> <span className="text-gray-500">(Optional)</span></div>
                    <div className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5"><code className="text-blue-400 font-bold">is_active</code> <span className="text-gray-500">(Optional, true/false)</span></div>
                    <div className="col-span-2 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5"><code className="text-blue-400 font-bold">images</code> <span className="text-gray-500">(Optional, comma-separated URLs)</span></div>
                  </div>

                  <button
                    type="button"
                    onClick={downloadSampleCSV}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition animate-pulse"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Sample template CSV
                  </button>
                </div>

                {/* File Upload Zone */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Upload CSV File</label>
                  <div
                    onClick={() => importFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-[#070D1A]/50 hover:bg-[#070D1A]/85 group ${
                      importFile ? 'border-blue-500/50' : 'border-white/10 hover:border-blue-500/30'
                    }`}
                  >
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        {importFile ? (
                          <p className="text-sm font-semibold text-blue-400 truncate max-w-xs">{importFile.name}</p>
                        ) : (
                          <p className="text-sm font-semibold text-white">Select product catalog CSV</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Only .csv or .txt files accepted · Max 2MB</p>
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={importFileInputRef}
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    accept=".csv,text/plain"
                    className="hidden"
                  />
                </div>

                {/* Footer buttons */}
                <div className="pt-4 border-t border-white/5 flex justify-end gap-3 bg-[#0B1528]">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all duration-300"
                    disabled={isImporting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-blue-500/10 flex items-center gap-2"
                    disabled={isImporting || !importFile}
                  >
                    {isImporting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                    Import Products
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}