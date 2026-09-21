import React from "react";
import { Product } from "../../types/product";
import { Modal } from "../common/Modal";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Package, Tag, Calendar, DollarSign, FileText } from "lucide-react";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Specifications & Details"
      subtitle={`SKU: ${product.sku}`}
    >
      <div className="space-y-5 text-left">
        {/* Header Product Info Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white leading-tight">{product.name}</h3>
            <span className="font-mono text-xs font-semibold text-indigo-400 block">{product.sku}</span>
          </div>
          <Badge variant="purple" size="md">{product.category}</Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Unit Price
            </span>
            <span className="text-lg font-black text-emerald-400">{formatCurrency(product.price)}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Created Date
            </span>
            <span className="text-xs font-semibold text-slate-200">{formatDate(product.createdAt)}</span>
          </div>
        </div>

        {/* Description Section */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" /> Description
          </span>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {product.description || "No description provided."}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
