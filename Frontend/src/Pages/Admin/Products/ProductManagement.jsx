import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../Layouts/SideBar';
import Header from '../Layouts/Header';
import axiosInstance from '../../../api/axiosInstance';
import { useToast } from '../../../Toast/ToastContext';

export default function ProductManagement() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stockSort, setStockSort] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const itemsPerPage = 5;

  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/categories');
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/api/products');
      if (response.success) {
        const productsArray = response.data?.products || [];
        const mappedProducts = productsArray.map(p => ({
          ...p,
          id: p._id || p.id,
          stock: p.quantity || 0,
          status: p.quantity === 0 ? 'Out of Stock' : (p.quantity < 20 ? 'Low Stock' : 'In Stock'),
          displayCategory: Array.isArray(p.category) ? p.category[0] : (p.category || 'Uncategorized'),
          displayImage: Array.isArray(p.image) ? p.image[0] : (p.image || '')
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const processedProducts = useMemo(() => {
    let result = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (stockSort === 'out-of-stock') {
      result.sort((a, b) => {
        if (a.stock === 0 && b.stock !== 0) return -1;
        if (a.stock !== 0 && b.stock === 0) return 1;
        return a.stock - b.stock;
      });
    } else if (stockSort === 'low-stock') {
      result.sort((a, b) => {
        const aLow = a.stock > 0 && a.stock < 20;
        const bLow = b.stock > 0 && b.stock < 20;
        if (aLow && !bLow) return -1;
        if (!aLow && bLow) return 1;
        return a.stock - b.stock;
      });
    } else if (stockSort === 'in-stock') {
      result.sort((a, b) => b.stock - a.stock);
    }

    return result;
  }, [products, searchTerm, stockSort]);

  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedProducts.slice(indexOfFirstItem, indexOfLastItem);

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock < 20).length,
    inStock: products.filter(p => p.stock >= 20).length
  };

  const formatDate = () => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };
  const handleDelete = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      const response = await axiosInstance.delete(`/api/products/${deleteModal.id}`);
      if (response.success) {
        showToast('Product deleted successfully', 'success');
        fetchProducts();
        setDeleteModal({ isOpen: false, id: null, name: '' });
      }
    } catch (error) {
      showToast(error.error?.message || error.message || 'Failed to delete product', 'error');
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex font-inter">
      <SideBar />
      <main className="flex-1 lg:ml-72 bg-slate-50 min-h-screen">
        <Header title="Product Management" subtitle="Manage and organize your product catalog" />
        <div className="p-8 max-w-8xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Catalog Overview</span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Product Management</h1>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
              <CalendarIcon className="w-4 h-4" />
              {formatDate()}
            </div>
          </header>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              label="Total Products"
              value={stats.total}
              trend="+12% from last month"
              color="blue"
              icon={<PackageIcon />}
            />
            <StatCard
              label="Out of Stock"
              value={stats.outOfStock}
              trend="Urgent restock needed"
              color="red"
              icon={<AlertCircleIcon />}
              isWarning={stats.outOfStock > 0}
            />
            <StatCard
              label="Low Quantity (<20)"
              value={stats.lowStock}
              trend="Inventory risk identified"
              color="amber"
              icon={<AlertTriangleIcon />}
            />
            <StatCard
              label="In Stock"
              value={stats.inStock}
              trend="Optimal inventory levels"
              color="emerald"
              icon={<CheckCircleIcon />}
            />
          </section>

          {/* Action */}
          <section className="flex flex-col lg:flex-row justify-between items-center mb-6">
            <div className="relative w-full lg:max-w-xl">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Search by name, code, or category..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <ActionButton icon={<FilterIcon />}>Filter</ActionButton>
              <ActionButton icon={<DownloadIcon />}>Export CSV</ActionButton>
              <div className="relative group">
                <select
                  value={stockSort}
                  onChange={(e) => { setStockSort(e.target.value); setCurrentPage(1); }}
                  className="appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none cursor-pointer shadow-sm"
                >
                  <option value="">Sort by Status</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="in-stock">In Stock</option>
                </select>
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-blue-500 transition-colors">
                  <FilterIcon className="w-4 h-4" />
                </div>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-blue-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <button
                onClick={() => navigate('/add-product')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                <PlusIcon className="w-5 h-5" />
                Add Product
              </button>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                <PlusIcon className="w-5 h-5" />
                Add Category
              </button>
            </div>
          </section>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-bottom border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Product Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Code</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Stock Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Catalog...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? currentItems.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden ring-1 ring-slate-200 shadow-sm">
                            {product.displayImage ? (
                              <img
                                src={product.displayImage.startsWith('http') || product.displayImage.startsWith('/uploads') ? (product.displayImage.startsWith('http') ? product.displayImage : `http://localhost:5000${product.displayImage}`) : product.displayImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/150?text=Error';
                                }}
                              />
                            ) : (
                              <PackageIcon className="w-6 h-6 text-slate-500" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{product.name}</span>
                            <span className="text-xs text-slate-500">{product.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{product.displayCategory}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-tighter">{product.code}</td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={product.status} stock={product.stock} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <IconButton icon={<EyeIcon />} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100" title='View' onClick={() => navigate('/add-product', { state: { product, mode: 'view' } })} />
                          <IconButton icon={<EditIcon />} className=" text-yellow-600 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100" title='Edit' onClick={() => navigate('/add-product', { state: { product, mode: 'edit' } })} />
                          <IconButton icon={<TrashIcon />} className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100" onClick={() => handleDelete(product.id, product.name)} title='Delete' />
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-slate-500 font-medium">
                        No products found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <footer className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-slate-50/30 border-t border-slate-100 gap-4">
              <div className="text-sm text-slate-500 font-medium">
                Showing <span className="text-slate-900">{indexOfFirstItem + 1}</span> to <span className="text-slate-900">{Math.min(indexOfLastItem, processedProducts.length)}</span> of <span className="text-slate-900">{processedProducts.length}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <PageButton onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                  <ChevronLeftIcon className="w-4 h-4" />
                </PageButton>
                {[...Array(totalPages)].map((_, i) => (
                  <PageButton
                    key={i + 1}
                    active={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PageButton>
                ))}
                <PageButton onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
                  <ChevronRightIcon className="w-4 h-4" />
                </PageButton>
              </div>
            </footer>
          </div>
        </div>
      </main>

        <AddCategoryModal 
          isOpen={isCategoryModalOpen} 
          onClose={() => setIsCategoryModalOpen(false)} 
          existingCategories={categories}
          refreshCategories={fetchCategories}
        />

        <DeleteConfirmationModal 
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
          onConfirm={confirmDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
        />
    </div>
  );
}

// Sub-components
function StatCard({ label, value, trend, icon, color, isWarning }) {
  const colors = {
    blue: 'border-blue-500 bg-blue-50 text-blue-600',
    red: 'border-red-500 bg-red-50 text-red-600',
    amber: 'border-amber-500 bg-amber-50 text-amber-600',
    emerald: 'border-emerald-500 bg-emerald-50 text-emerald-600',
  };

  return (
    <div className={`relative bg-white p-6 rounded-2xl border-l-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${colors[color]}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color].split(' ')[1]}`}>
          {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
      <div className={`text-xs font-bold ${isWarning ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
        {trend}
      </div>
    </div>
  );
}

function StatusBadge({ status, stock }) {
  const styles = {
    'In Stock': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'Low Stock': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'Out of Stock': 'bg-red-50 text-red-700 ring-red-600/20',
  };

  return (
    <div className={`inline-flex flex-col px-3 py-1.5 rounded-lg ring-1 ring-inset ${styles[status]}`}>
      <span className="text-[10px] font-black uppercase tracking-wider">{status}</span>
      <span className="text-[9px] font-bold opacity-80">{stock} units left</span>
    </div>
  );
}

function ActionButton({ children, icon }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
      {React.cloneElement(icon, { className: "w-4 h-4" })}
      {children}
    </button>
  );
}

function IconButton({ icon, className, ...props }) {
  return (
    <button className={`p-2 rounded-lg transition-all active:scale-90 ${className}`} {...props}>
      {React.cloneElement(icon, { className: `w-5 h-5 ${className?.includes('text-') ? '' : 'text-slate-500'}` })}
    </button>
  );
}

function PageButton({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all shadow-sm
        ${active ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-90'}
      `}
    >
      {children}
    </button>
  );
}

function AddCategoryModal({ isOpen, onClose, existingCategories, refreshCategories }) {
  const { showToast } = useToast();
  const [newCategory, setNewCategory] = useState('');
  const [main, setMain] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [images, setImages] = useState([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    try {
      const response = await axiosInstance.post('/api/categories', { name: newCategory, main, images });
      if (response.success) {
        showToast('Category added successfully', 'success');
        setNewCategory('');
        setMain(false);
        setImages([]);
        refreshCategories();
      }
    } catch (error) {
      showToast(error.error?.message || error.message || 'Failed to add category', 'error');
    }
  };

  const handleEdit = async (id) => {
    if (!editValue.trim()) return;
    try {
      const response = await axiosInstance.put(`/api/categories/${id}`, { name: editValue });
      if (response.success) {
        showToast('Category updated successfully', 'success');
        setEditingId(null);
        refreshCategories();
      }
    } catch (error) {
      showToast(error.error?.message || error.message || 'Failed to update category', 'error');
    }
  };

  const handleDelete = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      const response = await axiosInstance.delete(`/api/categories/${deleteModal.id}`);
      if (response.success) {
        showToast('Category deleted successfully', 'success');
        refreshCategories();
        setDeleteModal({ isOpen: false, id: null, name: '' });
      }
    } catch (error) {
      showToast(error.error?.message || error.message || 'Failed to delete category', 'error');
    }
  };
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsProcessingImages(true);
    let processedCount = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
        processedCount++;
        if (processedCount === files.length) {
          setIsProcessingImages(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900">Manage Categories</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Organize your catalog</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <XIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">New Category Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Electronics, Fashion..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
              />
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Main Category</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMain(!main)}
                className={`w-10 h-5 rounded-full transition-all duration-300 relative ${main ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${main ? 'left-6' : 'left-1'}`} />
              </button>
              {main && (
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                    Upload Image
                    <input type="file" onChange={handleImageUpload} className="hidden" multiple accept="image/*" />
                  </label>
                  {images && images.length > 0 && (
                    <span className="text-xs text-slate-500 font-medium">{images.length} selected</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Existing Categories</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {existingCategories && existingCategories.length > 0 ? existingCategories.map((cat) => (
                <div key={cat._id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  {editingId === cat._id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleEdit(cat._id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEdit(cat._id)}
                      autoFocus
                      className="flex-1 px-2 py-1 rounded bg-white border border-blue-300 outline-none text-sm font-bold"
                    />
                  ) : (
                    <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingId(cat._id);
                        setEditValue(cat.name);
                      }}
                      className="p-1.5 text-yellow-500 hover:text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-all"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id, cat.name)}
                      className="p-1.5 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500 italic text-center">No categories yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all">
            Close
          </button>
        </div>
      </div>
      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${deleteModal.name}"? This will affect all products in this category.`}
      />
    </div>
  );
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95">Delete</button>
        </div>
      </div>
    </div>
  );
}

// Icons
const CalendarIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const PackageIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const AlertCircleIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const AlertTriangleIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const CheckCircleIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const SearchIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const FilterIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const DownloadIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const EditIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const PlusIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
// const MoreVerticalIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>;
const ChevronLeftIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const EyeIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const XIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const TrashIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;