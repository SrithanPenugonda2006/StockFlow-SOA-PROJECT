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
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col justify-between group text-left">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-3 bg-[#F5F5F5] border border-[#E5E5E5] text-[#666666] rounded-xl group-hover:scale-105 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <Badge variant="purple" size="sm">
            {product.category || 'General'}
          </Badge>
        </div>

        <h4 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-[#666666] transition-colors">
          {product.name}
        </h4>
        <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {product.sku}</p>
        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
          {product.description || 'No description available for this product item.'}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Price</span>
          <span className="text-lg font-black text-gray-900">{formatCurrency(product.price)}</span>
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
              className="p-2 text-gray-500 hover:text-[#666666] hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit Product"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(product)}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
