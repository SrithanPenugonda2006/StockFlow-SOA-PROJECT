import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, Table as TableIcon, Filter, RefreshCw } from 'lucide-react';
import { Product } from '../../types/product';
import { productApi } from '../../api/productApi';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductTable } from '../../components/products/ProductTable';
import { Pagination } from '../../components/common/Pagination';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const ProductListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [searchName, setSearchName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productApi.getProducts({
        page: currentPage,
        size: 9,
        name: searchName || undefined,
        category: selectedCategory || undefined,
      });
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (error) {
      console.error('Error loading catalog:', error);
      showToast('error', 'Error Loading Catalog', 'Unable to connect to Product Microservice.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchProducts();
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
    });
    showToast('success', 'Added to Cart', `${product.name} has been added to your shopping cart.`);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Enterprise Stock Catalog</span>
          <h1 className="text-3xl font-black text-white mt-1 tracking-tight">Browse Certified Warehouse Inventory</h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Real-time stock reservation backed by multi-warehouse fulfillment centers and pessimistic lock safety.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 w-full md:w-auto flex-1">
          <Input
            placeholder="Search catalog by product name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full md:max-w-md"
          />
          <Button variant="secondary" type="submit">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            options={[
              { value: '', label: 'All Categories' },
              { value: 'Electronics', label: 'Electronics' },
              { value: 'Hardware', label: 'Hardware' },
              { value: 'Logistics', label: 'Logistics' },
            ]}
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(0);
            }}
            className="w-44"
          />

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <Button variant="ghost" onClick={fetchProducts} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Catalog Render */}
      {viewMode === 'grid' ? (
        isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onViewDetails={(p) => navigate(`/customer/products/${p.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            No products found matching your search.
          </div>
        )
      ) : (
        <ProductTable
          products={products}
          isLoading={isLoading}
          onViewDetails={(p) => navigate(`/customer/products/${p.id}`)}
        />
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={9}
        onPageChange={(p) => setCurrentPage(p)}
      />
    </div>
  );
};
