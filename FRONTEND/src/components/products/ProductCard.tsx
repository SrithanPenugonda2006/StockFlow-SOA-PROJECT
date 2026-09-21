import React from 'react';
import { Package, ShoppingCart, Info, Edit, Trash2 } from 'lucide-react';
import { Product } from '../../types/product';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  isAdmin?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group text-left">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl group-hover:scale-105 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <Badge variant="purple" size="sm">
            {product.category || 'General'}
          </Badge>
        </div>

        <h4 className="text-base font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
          {product.name}
        </h4>
        <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {product.sku}</p>
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {product.description || 'No description available for this product item.'}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Price</span>
          <span className="text-lg font-black text-emerald-400">{formatCurrency(product.price)}</span>
        </div>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewDetails(product)}
              leftIcon={<Info className="w-3.5 h-3.5" />}
            >
              Details
            </Button>
          )}

          {onAddToCart && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAddToCart(product)}
              leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          )}

          {isAdmin && onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit Product"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(product)}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
