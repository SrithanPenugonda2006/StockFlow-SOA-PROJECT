import React from "react";
import { Product } from "../../types/product";
import { Modal } from "../common/Modal";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Calendar, DollarSign, QrCode, Tag, Award } from "lucide-react";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  if (!product) return null;

  const sku = product.skuCode || product.sku;
  const name = product.productName || product.name;
  const sellingPrice = product.sellingPrice !== undefined ? product.sellingPrice : product.price;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Specifications & Details"
      subtitle={`SKU: ${sku}`}
    >
      <div className="space-y-5 text-left">
        {/* Header Product Info Card */}
        <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-gray-200 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white leading-tight">{name}</h3>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-[#666666] block">SKU: {sku}</span>
              {product.barcode && (
                <span className="font-mono text-xs font-semibold text-gray-500 block flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> Barcode: {product.barcode}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant="purple" size="md">{product.category}</Badge>
            {product.brand && (
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-gray-700" /> {product.brand}
              </span>
            )}
          </div>
        </div>

        {/* Financial Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-[#F7F8FA]/60 border border-gray-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-gray-500" /> Unit Cost
            </span>
            <span className="text-base font-bold text-gray-800">{formatCurrency(product.unitCost || 0)}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F8FA]/60 border border-gray-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-gray-900" /> Selling Price
            </span>
            <span className="text-lg font-black text-gray-900">{formatCurrency(sellingPrice || 0)}</span>
          </div>
        </div>

        {/* Date & Additional Meta */}
        <div className="p-3.5 rounded-xl bg-[#F7F8FA]/60 border border-gray-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#666666]" /> Created Date
          </span>
          <span className="text-xs font-semibold text-gray-800">{formatDate(product.createdAt)}</span>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-3 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
