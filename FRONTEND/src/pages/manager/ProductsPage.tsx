import React, { useEffect, useState } from "react";
import { Plus, Search, RefreshCw } from "lucide-react";
import { Product, ProductCreateDTO } from "../../types/product";
import { productApi } from "../../api/productApi";
import { ProductTable } from "../../components/products/ProductTable";
import { ProductFormModal } from "../../components/products/ProductFormModal";
import { ProductDetailModal } from "../../components/products/ProductDetailModal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Pagination } from "../../components/common/Pagination";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../utils/formatters";

export const ProductsPage: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();

  const isAdmin = role === "ADMIN";
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
      const res = await productApi.getProducts({ page: currentPage, size: 10, name: searchName || undefined });
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      showToast("error", "Error Loading Catalog", extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

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
      showToast("error", "Save Error", extractErrorMessage(err));
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
      showToast("error", "Delete Error", extractErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <PageHeader
        title="Catalog Products Management"
        subtitle="Create, edit, and maintain global SKU catalog details."
        actions={
          canAdd ? (
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

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
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
        pageSize={10}
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
    </div>
  );
};
