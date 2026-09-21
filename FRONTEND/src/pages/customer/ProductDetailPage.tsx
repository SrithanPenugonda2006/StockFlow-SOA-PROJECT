import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Building2, ShoppingCart, ArrowLeft, ShieldCheck, Warehouse as WarehouseIcon } from 'lucide-react';
import { Product } from '../../types/product';
import { Inventory } from '../../types/inventory';
import { Warehouse } from '../../types/warehouse';
import { productApi } from '../../api/productApi';
import { inventoryApi } from '../../api/inventoryApi';
import { warehouseApi } from '../../api/warehouseApi';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [warehouses, setWarehouses] = useState<Record<number, Warehouse>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const prod = await productApi.getProductById(Number(id));
        setProduct(prod);

        const invList = await inventoryApi.getInventoryByProduct(Number(id));
        setInventories(invList || []);

        const whList = await warehouseApi.getWarehouses();
        const map: Record<number, Warehouse> = {};
        (whList || []).forEach((w) => {
          map[w.id] = w;
        });
        setWarehouses(map);
      } catch (err) {
        console.error('Error fetching detail:', err);
        showToast('error', 'Product Not Found', 'Unable to retrieve details.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#D4D4D4] border-t-transparent rounded-full animate-spin" />
        <span>Loading product specs & multi-warehouse inventory breakdown...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-gray-500">
        <p>Product not found.</p>
        <Button onClick={() => navigate('/customer/products')} className="mt-4">
          Return to Products Catalog
        </Button>
      </div>
    );
  }

  const totalAvailable = inventories.reduce((sum, inv) => sum + inv.availableQuantity, 0);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      maxAvailable: totalAvailable,
    });
    showToast('success', 'Added to Cart', `${product.name} added to your shopping cart.`);
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/customer/products')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main info */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#F5F5F5] border border-[#E5E5E5] text-[#666666] rounded-2xl">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <Badge variant="purple" size="sm">
                  {product.category}
                </Badge>
                <h1 className="text-2xl font-black text-gray-500 mt-1">{product.name}</h1>
                <span className="text-xs font-mono text-gray-500">SKU: {product.sku}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mt-6">{product.description}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-gray-400 block">Unit Price</span>
              <span className="text-3xl font-black text-gray-900">{formatCurrency(product.price)}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              disabled={totalAvailable <= 0}
              leftIcon={<ShoppingCart className="w-5 h-5" />}
            >
              {totalAvailable > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>

        {/* Right Multi-Warehouse Breakdown */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
            <WarehouseIcon className="w-5 h-5 text-[#666666]" />
            <h3 className="text-base font-bold text-gray-900">Multi-Warehouse Stock</h3>
          </div>

          <div className="divide-y divide-gray-100/80">
            {inventories.length > 0 ? (
              inventories.map((inv) => {
                const wh = warehouses[inv.warehouseId];
                return (
                  <div key={inv.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-800 text-xs block">
                        {wh ? wh.name : `Warehouse #${inv.warehouseId}`}
                      </span>
                      <span className="text-[10px] text-gray-400">{wh ? wh.location : 'Facility'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-gray-900">{inv.availableQuantity}</span>
                      <span className="text-[10px] text-gray-400 block">Available</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                No inventory records initialized across physical warehouses yet.
              </div>
            )}
          </div>

          <div className="p-3.5 bg-[#F7F8FA] rounded-xl border border-gray-200 text-xs text-gray-500 flex items-center gap-2.5 mt-auto">
            <ShieldCheck className="w-4 h-4 text-gray-900 shrink-0" />
            <span>Pessimistic lock stock allocation guarantees exact availability.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
