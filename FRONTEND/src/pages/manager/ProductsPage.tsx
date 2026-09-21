import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { productApi } from "../../api/productApi";
import { Product, ProductCreateDTO } from "../../types/product";

import { PageHeader } from "../../components/common/PageHeader";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { ProductTable } from "../../components/products/ProductTable";
import { ProductFormModal } from "../../components/products/ProductFormModal";
import { ProductDetailModal } from "../../components/products/ProductDetailModal";
import { CategoriesBrandsView } from "../../components/products/CategoriesBrandsView";
import { Pagination } from "../../components/common/Pagination";

import { Plus, Search, RefreshCw, Package, Tags } from "lucide-react";

export const ProductsPage: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "all";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const canEdit = role === "ADMIN" || role === "MANAGER";
  const canDelete = role === "ADMIN";
  const canAdd = role === "ADMIN" || role === "MANAGER";

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchName, setSearchName] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productApi.getProducts({ page: currentPage, size: 5, name: searchName || undefined });
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      showToast("error", "Error Loading Catalog", err?.response?.data?.message || err?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "all") {
      fetchProducts();
    }
  }, [currentPage, activeTab]);

  const handleSaveProduct = async (data: ProductCreateDTO) => {
    try {
      if (selectedProduct) {
        await productApi.updateProduct(selectedProduct.id, data);
        showToast("success", "Product Updated", `${data.name} updated successfully.`);
      } else {
        await productApi.createProduct(data);
        showToast("success", "Product Created", `${data.name} created successfully.`);
      }
      fetchProducts();
    } catch (err: any) {
      showToast("error", "Save Error", err?.response?.data?.message || err?.message || "An unexpected error occurred");
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await productApi.deleteProduct(productToDelete.id);
      showToast("success", "Product Deleted", `${productToDelete.name} has been removed.`);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      showToast("error", "Delete Error", err?.response?.data?.message || err?.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <PageHeader
        title="Products Management"
        subtitle="Create, edit, organize categories, and manage product catalog hierarchy."
        actions={
          activeTab === "all" && canAdd ? (
            <Button
              variant="primary"
              onClick={() => {
                setSelectedProduct(null);
                setIsModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Product
            </Button>
          ) : undefined
        }
      />

      {/* Page-level Navigation Tabs */}
      <div className="border-b border-gray-200 pb-1">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 max-w-full">
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-900/20/50 ${
              activeTab === "all"
                ? "bg-[#111111] text-white font-semibold"
                : "bg-white/80 text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 border border-gray-200"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>All Products</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("categories")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-900/20/50 ${
              activeTab === "categories"
                ? "bg-[#111111] text-white font-semibold"
                : "bg-white/80 text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 border border-gray-200"
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>Categories & Brands</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: ALL PRODUCTS */}
      {activeTab === "all" && (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentPage(0);
                fetchProducts();
              }}
              className="flex items-center gap-3 w-full max-w-md"
            >
              <Input
                placeholder="Search by product name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
              <Button variant="secondary" type="submit">
                Search
              </Button>
            </form>

            <Button variant="ghost" onClick={fetchProducts} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Refresh
            </Button>
          </div>

          <ProductTable
            products={products}
            isLoading={isLoading}
            canEdit={canEdit}
            canDelete={canDelete}
            onViewDetails={(p) => setDetailProduct(p)}
            onEdit={(p) => {
              setSelectedProduct(p);
              setIsModalOpen(true);
            }}
            onDelete={(p) => setProductToDelete(p)}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={5} totalItems={totalElements} isZeroBased={true}
            onPageChange={(p) => setCurrentPage(p)}
          />

          <ProductFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSaveProduct}
            product={selectedProduct}
          />

          <ProductDetailModal
            isOpen={!!detailProduct}
            onClose={() => setDetailProduct(null)}
            product={detailProduct}
          />

          <ConfirmDialog
            isOpen={!!productToDelete}
            onClose={() => setProductToDelete(null)}
            onConfirm={handleDeleteProduct}
            title="Delete Catalog Product"
            message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
          />
        </>
      )}

      {/* TAB CONTENT 2: CATEGORIES & BRANDS */}
      {activeTab === "categories" && (
        <CategoriesBrandsView
          onSelectCategory={(catName) => {
            setSearchName(catName);
            handleTabChange("all");
          }}
        />
      )}
    </div>
  );
};
