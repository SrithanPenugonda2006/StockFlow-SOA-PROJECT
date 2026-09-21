import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderTree,
  Layers,
  Award,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  X,
  AlertCircle,
  Building2,
  CheckCircle2,
  Globe,
  Tag,
  Package,
} from 'lucide-react';
import { categoryBrandApi } from '../../api/categoryBrandApi';
import { productApi } from '../../api/productApi';
import { CategoryItem, BrandItem } from '../../types/categoryBrand';
import { Pagination } from '../common/Pagination';
import { Product } from '../../types/product';

interface CategoriesBrandsViewProps {
  onSelectCategory?: (category: string) => void;
}

export const CategoriesBrandsView: React.FC<CategoriesBrandsViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'BRANDS'>('CATEGORIES');
  
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search queries
  const [categorySearch, setCategorySearch] = useState('');
  const [catPage, setCatPage] = useState(1);
  const [brandPage, setBrandPage] = useState(1);
  const [brandSearch, setBrandSearch] = useState('');

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [brandForm, setBrandForm] = useState({ name: '', country: '', status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE', description: '' });
  
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [catsRes, brandsRes, prodsRes] = await Promise.all([
        categoryBrandApi.getCategories(),
        categoryBrandApi.getBrands(),
        productApi.getProducts({ size: 100 }),
      ]);
      setCategories(catsRes || []);
      setBrands(brandsRes || []);
      setProducts(prodsRes?.content || []);
    } catch (err) {
      console.error('Failed to load categories & brands data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filtered lists
  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, categorySearch]);

  const filteredBrands = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.country && b.country.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q))
    );
  }, [brands, brandSearch]);

  // Metric calculations
  const totalCatalogSkus = products.length;
  const productsWithCategory = products.filter((p) => p.category && p.category.trim() !== '').length;
  const categoryCoveragePct = totalCatalogSkus > 0 ? Math.round((productsWithCategory / totalCatalogSkus) * 100) : 0;

  // Category Modal Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    setFormError('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description || '' });
    setFormError('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!categoryForm.name.trim()) {
      setFormError('Category Name is required.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingCategory) {
        await categoryBrandApi.updateCategory(editingCategory.id, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
        });
      } else {
        await categoryBrandApi.createCategory({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
        });
      }
      setIsCategoryModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to save category');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Brand Modal Handlers
  const handleOpenAddBrand = () => {
    setEditingBrand(null);
    setBrandForm({ name: '', country: '', status: 'ACTIVE', description: '' });
    setFormError('');
    setIsBrandModalOpen(true);
  };

  const handleOpenEditBrand = (brand: BrandItem) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name,
      country: brand.country || '',
      status: brand.status || 'ACTIVE',
      description: brand.description || '',
    });
    setFormError('');
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!brandForm.name.trim()) {
      setFormError('Brand Name is required.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingBrand) {
        await categoryBrandApi.updateBrand(editingBrand.id, {
          name: brandForm.name.trim(),
          country: brandForm.country.trim() || undefined,
          status: brandForm.status,
          description: brandForm.description.trim() || undefined,
        });
      } else {
        await categoryBrandApi.createBrand({
          name: brandForm.name.trim(),
          country: brandForm.country.trim() || undefined,
          status: brandForm.status,
          description: brandForm.description.trim() || undefined,
        });
      }
      setIsBrandModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to save brand');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-[#666666]" />
            Categories & Brands
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize product classification hierarchies, brand definitions, and metadata tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-white hover:bg-gray-100 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {activeTab === 'CATEGORIES' ? (
            <button
              onClick={handleOpenAddCategory}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          ) : (
            <button
              onClick={handleOpenAddBrand}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </button>
          )}
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/60 border border-gray-200 rounded-2xl p-5 flex items-center justify-between backdrop-blur-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Categories</p>
            <h3 className="text-2xl font-bold text-gray-500 mt-1">{categories.length}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
            <FolderTree className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white/60 border border-gray-200 rounded-2xl p-5 flex items-center justify-between backdrop-blur-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Catalog SKUs</p>
            <h3 className="text-2xl font-bold text-gray-500 mt-1">{totalCatalogSkus}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F5F5F5] text-[#666666] border border-gray-400/20">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white/60 border border-gray-200 rounded-2xl p-5 flex items-center justify-between backdrop-blur-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Coverage</p>
            <h3 className="text-2xl font-bold text-gray-500 mt-1">{categoryCoveragePct}%</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-900/10 text-gray-900 border border-gray-900/20">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/80 border border-gray-200 w-fit">
        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'CATEGORIES'
              ? 'bg-[#111111] text-white '
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Product Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('BRANDS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'BRANDS'
              ? 'bg-[#111111] text-white '
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Brand Partners ({brands.length})
        </button>
      </div>

      {/* TAB 1: PRODUCT CATEGORIES */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-4">
          {/* Search Toolbar */}
          <div className="p-4 rounded-2xl bg-white/60 border border-gray-200">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => { setCategorySearch(e.target.value); setCatPage(1); }}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              />
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="p-12 text-center text-gray-500 bg-white/60 rounded-2xl border border-gray-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#666666] mb-2" />
              Loading product categories...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-white/60 rounded-2xl border border-gray-200">
              <FolderTree className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="font-semibold text-gray-500">No categories found</p>
              {categorySearch.trim() ? (
                <p className="text-xs text-gray-400 mt-1">Try clearing your search filters.</p>
              ) : (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-3">Create your first product category to organize your catalog.</p>
                  <button
                    onClick={handleOpenAddCategory}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#111111] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.slice((catPage - 1) * 5, catPage * 5).map((cat) => (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl bg-white/60 border border-gray-200 hover:border-[#D4D4D4]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-[#666666] shrink-0" />
                        {cat.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F5F5F5] text-[#111111] border border-[#D4D4D4]/20 whitespace-nowrap">
                        {cat.productCount} SKUs
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 leading-relaxed line-clamp-3 min-h-[3rem]">
                      {cat.description || 'No description provided for this category.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-end">
                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="px-3 py-1.5 rounded-lg bg-[#F7F8FA] hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#666666]" />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination totalItems={filteredCategories.length} currentPage={catPage} pageSize={5} onPageChange={setCatPage} />
        </div>
      )}

      {/* TAB 2: BRAND PARTNERS */}
      {activeTab === 'BRANDS' && (
        <div className="space-y-4">
          {/* Search Toolbar */}
          <div className="p-4 rounded-2xl bg-white/60 border border-gray-200">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search brands..."
                value={brandSearch}
                onChange={(e) => { setBrandSearch(e.target.value); setBrandPage(1); }}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              />
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="p-12 text-center text-gray-500 bg-white/60 rounded-2xl border border-gray-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#666666] mb-2" />
              Loading brand partners...
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-white/60 rounded-2xl border border-gray-200">
              <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="font-semibold text-gray-500">No brands found</p>
              {brandSearch.trim() ? (
                <p className="text-xs text-gray-400 mt-1">Try clearing your search filters.</p>
              ) : (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-3">Create your first brand partner to associate with products.</p>
                  <button
                    onClick={handleOpenAddBrand}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#111111] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Brand
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="p-5 rounded-2xl bg-white/60 border border-gray-200 hover:border-[#D4D4D4]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#666666] shrink-0" />
                        {brand.name}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          brand.status === 'ACTIVE'
                            ? 'bg-gray-900/10 text-gray-900 border border-gray-900/20'
                            : 'bg-gray-900/10 text-gray-900 border border-gray-900/20'
                        }`}
                      >
                        {brand.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 mt-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>Country: <strong className="text-gray-900">{brand.country || 'N/A'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>Catalog Products: <strong className="text-[#666666] font-bold">{brand.productCount}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-end">
                    <button
                      onClick={() => handleOpenEditBrand(brand)}
                      className="px-3 py-1.5 rounded-lg bg-[#F7F8FA] hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#666666]" />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination totalItems={filteredBrands.length} currentPage={brandPage} pageSize={5} onPageChange={setBrandPage} />
        </div>
      )}

      {/* MODAL 1: ADD / EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F7F8FA]/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#F7F8FA]/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <p className="text-xs text-gray-500">Specify category classification details.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 text-gray-500 hover:text-white hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 rounded-xl bg-gray-100 border border-gray-800 text-gray-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Electronics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="e.g. Computing, displays & consumer electronics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-gray-500 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition-all flex items-center gap-2"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT BRAND */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F7F8FA]/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#F7F8FA]/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                  </h3>
                  <p className="text-xs text-gray-500">Specify brand partner metadata.</p>
                </div>
              </div>
              <button
                onClick={() => setIsBrandModalOpen(false)}
                className="p-2 text-gray-500 hover:text-white hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 rounded-xl bg-gray-100 border border-gray-800 text-gray-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  placeholder="e.g. Apple"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    value={brandForm.country}
                    onChange={(e) => setBrandForm({ ...brandForm, country: e.target.value })}
                    placeholder="e.g. United States"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={brandForm.status}
                    onChange={(e) => setBrandForm({ ...brandForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={brandForm.description}
                  onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                  placeholder="e.g. Consumer electronics & computing brand"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-gray-500 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition-all flex items-center gap-2"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {editingBrand ? 'Save Changes' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
