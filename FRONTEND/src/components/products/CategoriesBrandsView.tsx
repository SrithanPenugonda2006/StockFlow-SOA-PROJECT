import React, { useEffect, useMemo, useState } from 'react';
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
  Globe,
  Package,
  Trash2,
} from 'lucide-react';

import { categoryBrandApi } from '../../api/categoryBrandApi';
import { productApi } from '../../api/productApi';
import { CategoryItem, BrandItem } from '../../types/categoryBrand';
import { Product } from '../../types/product';
import { Pagination } from '../common/Pagination';

interface CategoriesBrandsViewProps {
  onSelectCategory?: (category: string) => void;
}

const PAGE_SIZE = 6;

export const CategoriesBrandsView: React.FC<CategoriesBrandsViewProps> = ({
  onSelectCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'BRANDS'>(
    'CATEGORIES'
  );

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and pagination
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [catPage, setCatPage] = useState(1);
  const [brandPage, setBrandPage] = useState(1);

  // Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState<CategoryItem | null>(null);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);

  // Form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  const [brandForm, setBrandForm] = useState<{
    name: string;
    country: string;
    status: 'ACTIVE' | 'INACTIVE';
    description: string;
  }>({
    name: '',
    country: '',
    status: 'ACTIVE',
    description: '',
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<BrandItem | null>(null);
  const [deleteError, setDeleteError] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [formError, setFormError] = useState('');

  // ------------------------------------------------------------
  // FETCH DATA
  // ------------------------------------------------------------

  const fetchAllData = async () => {
    setLoading(true);

    try {
      const [catsRes, brandsRes, prodsRes] = await Promise.all([
        categoryBrandApi.getCategories(),
        categoryBrandApi.getBrands(),
        productApi.getProducts({ size: 100 }),
      ]);

      setCategories(Array.isArray(catsRes) ? catsRes : []);
      setBrands(Array.isArray(brandsRes) ? brandsRes : []);
      setProducts(Array.isArray(prodsRes?.content) ? prodsRes.content : []);
    } catch (err) {
      console.error('Failed to load categories & brands data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ------------------------------------------------------------
  // FILTERED DATA
  // ------------------------------------------------------------

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => {
      const name = category.name?.toLowerCase() || '';
      const description = category.description?.toLowerCase() || '';

      return (
        name.includes(query) ||
        description.includes(query)
      );
    });
  }, [categories, categorySearch]);

  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();

    if (!query) {
      return brands;
    }

    return brands.filter((brand) => {
      const name = brand.name?.toLowerCase() || '';
      const country = brand.country?.toLowerCase() || '';
      const description = brand.description?.toLowerCase() || '';

      return (
        name.includes(query) ||
        country.includes(query) ||
        description.includes(query)
      );
    });
  }, [brands, brandSearch]);

  // ------------------------------------------------------------
  // PAGINATED DATA
  // ------------------------------------------------------------

  const paginatedCategories = useMemo(() => {
    const startIndex = (catPage - 1) * PAGE_SIZE;

    return filteredCategories.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredCategories, catPage]);

  const paginatedBrands = useMemo(() => {
    const startIndex = (brandPage - 1) * PAGE_SIZE;

    return filteredBrands.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredBrands, brandPage]);

  // ------------------------------------------------------------
  // KEEP CURRENT PAGE VALID
  // ------------------------------------------------------------

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredCategories.length / PAGE_SIZE)
    );

    if (catPage > totalPages) {
      setCatPage(totalPages);
    }
  }, [filteredCategories.length, catPage]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredBrands.length / PAGE_SIZE)
    );

    if (brandPage > totalPages) {
      setBrandPage(totalPages);
    }
  }, [filteredBrands.length, brandPage]);

  // ------------------------------------------------------------
  // METRICS
  // ------------------------------------------------------------

  const totalCatalogSkus = products.length;

  const productsWithCategory = products.filter(
    (product) =>
      typeof product.category === 'string' &&
      product.category.trim() !== ''
  ).length;

  const categoryCoveragePct =
    totalCatalogSkus > 0
      ? Math.round(
        (productsWithCategory / totalCatalogSkus) * 100
      )
      : 0;

  // ------------------------------------------------------------
  // CATEGORY MODAL
  // ------------------------------------------------------------

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
    });
    setFormError('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (category: CategoryItem) => {
    setEditingCategory(category);

    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
    });

    setFormError('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setFormError('');

    const name = categoryForm.name.trim();
    const description = categoryForm.description.trim();

    if (!name) {
      setFormError('Category Name is required.');
      return;
    }

    setFormSubmitting(true);

    try {
      if (editingCategory) {
        await categoryBrandApi.updateCategory(editingCategory.id, {
          name,
          description: description || undefined,
        });
      } else {
        await categoryBrandApi.createCategory({
          name,
          description: description || undefined,
        });
      }

      setIsCategoryModalOpen(false);
      setEditingCategory(null);

      await fetchAllData();
    } catch (err: any) {
      if (!err?.response) {
        setFormError("Network or server connection error. Please try again.");
      } else {
        const status = err.response.status;
        const data = err.response.data;
        if (status === 409) {
          setFormError(typeof data?.message === "string" ? data.message : "Category '" + name + "' already exists.");
        } else if (status === 400) {
          if (typeof data?.message === "string") {
            setFormError(data.message);
          } else if (typeof data?.message === "object" && data.message !== null) {
            const firstErr = Object.values(data.message)[0];
            setFormError(typeof firstErr === "string" ? firstErr : "Invalid category details.");
          } else {
            setFormError("Invalid category details.");
          }
        } else if (status === 401) {
          setFormError("Your session has expired. Please sign in again.");
        } else if (status === 403) {
          setFormError("You do not have permission to create categories.");
        } else if (status === 404) {
          setFormError(typeof data?.message === "string" ? data.message : "Category not found.");
        } else if (status === 500) {
          setFormError("Unable to create the category. Please try again.");
        } else {
          setFormError(typeof data?.message === "string" ? data.message : err?.message || "Failed to save category.");
        }
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // BRAND MODAL
  // ------------------------------------------------------------

  const handleOpenAddBrand = () => {
    setEditingBrand(null);

    setBrandForm({
      name: '',
      country: '',
      status: 'ACTIVE',
      description: '',
    });

    setFormError('');
    setIsBrandModalOpen(true);
  };

  const handleOpenEditBrand = (brand: BrandItem) => {
    setEditingBrand(brand);

    setBrandForm({
      name: brand.name || '',
      country: brand.country || '',
      status: brand.status || 'ACTIVE',
      description: brand.description || '',
    });

    setFormError('');
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setFormError('');

    const name = brandForm.name.trim();
    const country = brandForm.country.trim();
    const description = brandForm.description.trim();

    if (!name) {
      setFormError('Brand Name is required.');
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        name,
        country: country || undefined,
        status: brandForm.status,
        description: description || undefined,
      };

      if (editingBrand) {
        await categoryBrandApi.updateBrand(
          editingBrand.id,
          payload
        );
      } else {
        await categoryBrandApi.createBrand(payload);
      }

      setIsBrandModalOpen(false);
      setEditingBrand(null);

      await fetchAllData();
    } catch (err: any) {
      if (!err?.response) {
        setFormError("Network or server connection error. Please try again.");
      } else {
        const status = err.response.status;
        const data = err.response.data;
        if (status === 409) {
          setFormError(typeof data?.message === "string" ? data.message : "Brand '" + name + "' already exists.");
        } else if (status === 400) {
          if (typeof data?.message === "string") {
            setFormError(data.message);
          } else if (typeof data?.message === "object" && data.message !== null) {
            const firstErr = Object.values(data.message)[0];
            setFormError(typeof firstErr === "string" ? firstErr : "Invalid brand details.");
          } else {
            setFormError("Invalid brand details.");
          }
        } else if (status === 401) {
          setFormError("Your session has expired. Please sign in again.");
        } else if (status === 403) {
          setFormError("You do not have permission to create brands.");
        } else if (status === 404) {
          setFormError(typeof data?.message === "string" ? data.message : "Brand not found.");
        } else if (status === 500) {
          setFormError("Unable to create the brand. Please try again.");
        } else {
          setFormError(typeof data?.message === "string" ? data.message : err?.message || "Failed to save brand.");
        }
      }
    } finally {
      setFormSubmitting(false);
    }
  };


  // ------------------------------------------------------------
  // DELETE HANDLERS
  // ------------------------------------------------------------

  const handleOpenDeleteCategory = (category: CategoryItem) => {
    setDeletingCategory(category);
    setDeleteError("");
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      await categoryBrandApi.deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
      await fetchAllData();
    } catch (err: any) {
      if (!err?.response) {
        setDeleteError("Network or server connection error. Please try again.");
      } else {
        const status = err.response.status;
        const data = err.response.data;
        if (status === 409) {
          setDeleteError(typeof data?.message === "string" ? data.message : `Category '${deletingCategory.name}' cannot be deleted because products are assigned to it.`);
        } else if (status === 403) {
          setDeleteError("You do not have permission to delete categories.");
        } else if (status === 404) {
          setDeleteError("Category no longer exists.");
          setDeletingCategory(null);
          await fetchAllData();
        } else {
          setDeleteError(typeof data?.message === "string" ? data.message : err?.message || "Failed to delete category.");
        }
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDeleteBrand = (brand: BrandItem) => {
    setDeletingBrand(brand);
    setDeleteError("");
  };

  const handleConfirmDeleteBrand = async () => {
    if (!deletingBrand) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      await categoryBrandApi.deleteBrand(deletingBrand.id);
      setDeletingBrand(null);
      await fetchAllData();
    } catch (err: any) {
      if (!err?.response) {
        setDeleteError("Network or server connection error. Please try again.");
      } else {
        const status = err.response.status;
        const data = err.response.data;
        if (status === 409) {
          setDeleteError(typeof data?.message === "string" ? data.message : `Brand '${deletingBrand.name}' cannot be deleted because products are assigned to it.`);
        } else if (status === 403) {
          setDeleteError("You do not have permission to delete brands.");
        } else if (status === 404) {
          setDeleteError("Brand no longer exists.");
          setDeletingBrand(null);
          await fetchAllData();
        } else {
          setDeleteError(typeof data?.message === "string" ? data.message : err?.message || "Failed to delete brand.");
        }
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // ------------------------------------------------------------
  // SEARCH HANDLERS
  // ------------------------------------------------------------

  const handleCategorySearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCategorySearch(event.target.value);
    setCatPage(1);
  };

  const handleBrandSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBrandSearch(event.target.value);
    setBrandPage(1);
  };

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <div className="space-y-6 text-left">
      {/* ======================================================
          HEADER
      ======================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-[#000000]">
            <FolderTree className="h-7 w-7 text-[#000000]" />
            Categories & Brands
          </h1>

          <p className="mt-1 text-sm text-[#525252]">
            Organize product classification hierarchies, brand
            definitions, and metadata tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAllData}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 transition-colors hover:bg-[#F5F5F5] hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''
                }`}
            />
          </button>

          {activeTab === 'CATEGORIES' ? (
            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="flex items-center gap-2 rounded-xl bg-[#111111] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2A2A2A]"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddBrand}
              className="flex items-center gap-2 rounded-xl bg-[#111111] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2A2A2A]"
            >
              <Plus className="h-4 w-4" />
              Add Brand
            </button>
          )}
        </div>
      </div>

      {/* ======================================================
          KPI CARDS
      ======================================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Categories */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white/60 p-5 backdrop-blur-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Product Categories
            </p>

            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {categories.length}
            </h3>
          </div>

          <div className="rounded-xl border border-gray-200 bg-[#F5F5F5] p-3.5 text-[#404040]">
            <FolderTree className="h-6 w-6" />
          </div>
        </div>

        {/* Catalog SKUs */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white/60 p-5 backdrop-blur-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Catalog SKUs
            </p>

            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {totalCatalogSkus}
            </h3>
          </div>

          <div className="rounded-xl border border-gray-200 bg-[#F5F5F5] p-3.5 text-[#404040]">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        {/* Category Coverage */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white/60 p-5 backdrop-blur-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Category Coverage
            </p>

            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {categoryCoveragePct}%
            </h3>
          </div>

          <div className="rounded-xl border border-gray-200 bg-[#F5F5F5] p-3.5 text-[#404040]">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ======================================================
          TABS
      ======================================================= */}
      <div className="flex w-fit items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('CATEGORIES')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${activeTab === 'CATEGORIES'
            ? 'bg-[#111111] text-white'
            : 'text-gray-500 hover:bg-[#F5F5F5] hover:text-gray-900'
            }`}
        >
          Product Categories ({categories.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BRANDS')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${activeTab === 'BRANDS'
            ? 'bg-[#111111] text-white'
            : 'text-gray-500 hover:bg-[#F5F5F5] hover:text-gray-900'
            }`}
        >
          Brand Partners ({brands.length})
        </button>
      </div>

      {/* ======================================================
          CATEGORIES TAB
      ======================================================= */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="rounded-2xl border border-gray-200 bg-white/60 p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={handleCategorySearchChange}
                className="w-full rounded-xl border border-gray-200 bg-[#F7F8FA] py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white/60 p-12 text-center text-gray-500">
              <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-[#666666]" />
              Loading product categories...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white/60 p-12 text-center">
              <FolderTree className="mx-auto mb-3 h-10 w-10 text-gray-400" />

              <p className="font-semibold text-gray-600">
                No categories found
              </p>

              {categorySearch.trim() ? (
                <p className="mt-1 text-xs text-gray-400">
                  Try clearing your search filters.
                </p>
              ) : (
                <div className="mt-3">
                  <p className="mb-3 text-xs text-gray-400">
                    Create your first product category to
                    organize your catalog.
                  </p>

                  <button
                    type="button"
                    onClick={handleOpenAddCategory}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex flex-col justify-between space-y-4 rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] p-5 shadow-xs transition-all hover:border-[#D4D4D4]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onSelectCategory?.(category.name)
                          }
                          className="flex min-w-0 items-center gap-2 text-left cursor-pointer"
                        >
                          <FolderTree className="h-4 w-4 shrink-0 text-[#404040]" />

                          <h3 className="truncate text-base font-bold text-[#000000]">
                            {category.name}
                          </h3>
                        </button>

                        <span className="whitespace-nowrap rounded-full border border-[#E5E5E5] bg-[#F5F5F5] px-2.5 py-0.5 text-xs font-bold text-[#000000]">
                          {category.productCount ?? 0} SKUs
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-3 min-h-[3rem] text-xs leading-relaxed text-[#525252]">
                        {category.description ||
                          'No description provided for this category.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-[#E5E5E5] pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenEditCategory(category)
                        }
                        className="flex items-center gap-1.5 rounded-lg border border-[#D4D4D4] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#262626] transition-colors hover:bg-[#F5F5F5] hover:text-[#000000] cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-[#000000]" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenDeleteCategory(category)
                        }
                        className="flex items-center gap-1.5 rounded-lg border border-[#D4D4D4] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#262626] transition-colors hover:bg-[#111111] hover:text-[#FFFFFF] cursor-pointer"
                        title={category.productCount > 0 ? `Cannot delete category with ${category.productCount} products` : "Delete Category"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                totalItems={filteredCategories.length}
                currentPage={catPage}
                pageSize={PAGE_SIZE}
                onPageChange={setCatPage}
              />
            </>
          )}
        </div>
      )}

      {/* ======================================================
          BRANDS TAB
      ======================================================= */}
      {activeTab === 'BRANDS' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="rounded-2xl border border-gray-200 bg-white/60 p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

              <input
                type="text"
                placeholder="Search brands..."
                value={brandSearch}
                onChange={handleBrandSearchChange}
                className="w-full rounded-xl border border-gray-200 bg-[#F7F8FA] py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white/60 p-12 text-center text-gray-500">
              <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-[#666666]" />
              Loading brand partners...
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white/60 p-12 text-center">
              <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-400" />

              <p className="font-semibold text-gray-600">
                No brands found
              </p>

              {brandSearch.trim() ? (
                <p className="mt-1 text-xs text-gray-400">
                  Try clearing your search filters.
                </p>
              ) : (
                <div className="mt-3">
                  <p className="mb-3 text-xs text-gray-400">
                    Create your first brand partner to associate
                    with products.
                  </p>

                  <button
                    type="button"
                    onClick={handleOpenAddBrand}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Brand
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex flex-col justify-between space-y-4 rounded-2xl border border-gray-200 bg-white/60 p-5 transition-all hover:border-gray-300"
                  >
                    <div>
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <Building2 className="h-4 w-4 shrink-0 text-[#666666]" />

                          <h3 className="truncate text-base font-bold text-gray-900">
                            {brand.name}
                          </h3>
                        </div>

                        <span className="whitespace-nowrap rounded-full border border-gray-200 bg-[#F5F5F5] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-900">
                          {brand.status}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 shrink-0 text-gray-500" />

                          <span>
                            Country:{' '}
                            <strong className="text-gray-900">
                              {brand.country || 'N/A'}
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 shrink-0 text-gray-500" />

                          <span>
                            Catalog Products:{' '}
                            <strong className="font-bold text-gray-900">
                              {brand.productCount ?? 0}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {brand.description && (
                        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-gray-500">
                          {brand.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenEditBrand(brand)
                        }
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-[#F7F8FA] px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-[#666666]" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenDeleteBrand(brand)
                        }
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-[#F7F8FA] px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-[#111111] hover:text-white cursor-pointer"
                        title={brand.productCount > 0 ? `Cannot delete brand with ${brand.productCount} products` : "Delete Brand"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                totalItems={filteredBrands.length}
                currentPage={brandPage}
                pageSize={PAGE_SIZE}
                onPageChange={setBrandPage}
              />
            </>
          )}
        </div>
      )}

      {/* ======================================================
          CATEGORY MODAL
      ======================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#F7F8FA] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-gray-200 bg-white p-2.5 text-[#404040]">
                  <FolderTree className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingCategory
                      ? 'Edit Category'
                      : 'Add New Category'}
                  </h3>

                  <p className="text-xs text-gray-500">
                    Specify category classification details.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
                aria-label="Close category modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSaveCategory}
              className="space-y-4 p-6"
            >
              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 p-3.5 text-xs text-gray-900">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Category Name *
                </label>

                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm({
                      ...categoryForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Electronics"
                  className="w-full rounded-xl border border-gray-200 bg-[#F7F8FA] px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(event) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="e.g. Computing, displays & consumer electronics"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-[#F7F8FA] px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setIsCategoryModalOpen(false)
                  }
                  className="rounded-xl border border-gray-200 bg-[#F7F8FA] px-4 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formSubmitting && (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  )}

                  {editingCategory
                    ? 'Save Changes'
                    : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          BRAND MODAL
      ======================================================= */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#F7F8FA] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-gray-200 bg-white p-2.5 text-[#404040]">
                  <Building2 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingBrand
                      ? 'Edit Brand'
                      : 'Add New Brand'}
                  </h3>

                  <p className="text-xs text-gray-500">
                    Specify brand partner metadata.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
                aria-label="Close brand modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSaveBrand}
              className="space-y-4 p-6"
            >
              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 p-3.5 text-xs text-gray-900">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Brand Name *
                </label>

                <input
                  type="text"
                  required
                  value={brandForm.name}
                  onChange={(event) =>
                    setBrandForm({
                      ...brandForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Apple"
                  className="w-full rounded-xl border border-gray-200 bg-[#F7F8FA] px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Country
                  </label>

                  <input
                    type="text"
                    value={brandForm.country}
                    onChange={(event) =>
                      setBrandForm({
                        ...brandForm,
                        country: event.target.value,
                      })
                    }
                    placeholder="e.g. United States"
                    className="w-full rounded-xl border border-gray-200 bg-[#F7F8FA] px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Status
                  </label>

                  <select
                    value={brandForm.status}
                    onChange={(event) =>
                      setBrandForm({
                        ...brandForm,
                        status: event.target.value as
                          | 'ACTIVE'
                          | 'INACTIVE',
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-[#F7F8FA] px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={brandForm.description}
                  onChange={(event) =>
                    setBrandForm({
                      ...brandForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="e.g. Consumer electronics & computing brand"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-[#F7F8FA] px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="rounded-xl border border-gray-200 bg-[#F7F8FA] px-4 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formSubmitting && (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  )}

                  {editingBrand
                    ? 'Save Changes'
                    : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CATEGORY CONFIRMATION MODAL */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#F7F8FA] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-gray-200 bg-white p-2.5 text-[#111111]">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Category?</h3>
                  <p className="text-xs text-gray-500">Confirm removal of category classification.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {deleteError && (
                <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 p-3.5 text-xs text-gray-900">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <p className="text-sm text-gray-700">
                Are you sure you want to delete <strong className="text-gray-900">&quot;{deletingCategory.name}&quot;</strong>? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                  className="rounded-xl border border-gray-200 bg-[#F7F8FA] px-4 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteCategory}
                  className="flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isDeleting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE BRAND CONFIRMATION MODAL */}
      {deletingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#F7F8FA] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-gray-200 bg-white p-2.5 text-[#111111]">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Brand?</h3>
                  <p className="text-xs text-gray-500">Confirm removal of brand partner.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeletingBrand(null)}
                className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {deleteError && (
                <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 p-3.5 text-xs text-gray-900">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <p className="text-sm text-gray-700">
                Are you sure you want to delete <strong className="text-gray-900">&quot;{deletingBrand.name}&quot;</strong>? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setDeletingBrand(null)}
                  className="rounded-xl border border-gray-200 bg-[#F7F8FA] px-4 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteBrand}
                  className="flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isDeleting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Delete Brand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
