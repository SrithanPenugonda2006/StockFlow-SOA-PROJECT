import React from "react";
import { Product } from "../../types/product";
import { DataTable, Column } from "../common/DataTable";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Eye, Edit, Trash2 } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  isAdmin?: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading = false,
  onEdit,
  onDelete,
  onViewDetails,
  canEdit,
  canDelete,
  isAdmin = false,
}) => {
  // Allow explicitly passed canEdit/canDelete, or fall back to isAdmin if not specified
  const allowEdit = canEdit !== undefined ? canEdit : (isAdmin || !!onEdit);
  const allowDelete = canDelete !== undefined ? canDelete : isAdmin;

  const columns: Column<Product>[] = [
    {
      header: "Product Name",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-100 block">{row.name}</span>
          <span className="text-xs text-slate-400 line-clamp-1">{row.description}</span>
        </div>
      ),
    },
    {
      header: "SKU",
      accessorKey: "sku",
      cell: (row) => <span className="font-mono text-xs text-indigo-400 font-semibold">{row.sku}</span>,
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => <Badge variant="purple" size="sm">{row.category}</Badge>,
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (row) => <span className="font-bold text-emerald-400">{formatCurrency(row.price)}</span>,
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: (row) => <span className="text-xs text-slate-400">{formatDate(row.createdAt)}</span>,
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(row)}
              title="View Product Details"
              aria-label={`View product details for ${row.name}`}
            >
              <Eye className="w-4 h-4 text-slate-400 hover:text-indigo-400" />
            </Button>
          )}
          {allowEdit && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row)}
              title="Edit Product"
              aria-label={`Edit product ${row.name}`}
            >
              <Edit className="w-4 h-4 text-slate-400 hover:text-amber-400" />
            </Button>
          )}
          {allowDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row)}
              title="Delete Product"
              aria-label={`Delete product ${row.name}`}
            >
              <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-400" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={products} keyExtractor={(row) => row.id} isLoading={isLoading} />;
};
