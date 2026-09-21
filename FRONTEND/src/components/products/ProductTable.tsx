import React from "react";
import { Product } from "../../types/product";
import { DataTable, Column } from "../common/DataTable";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { formatCurrency } from "../../utils/formatters";
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
  const allowEdit = canEdit !== undefined ? canEdit : (isAdmin || !!onEdit);
  const allowDelete = canDelete !== undefined ? canDelete : isAdmin;

  const columns: Column<Product>[] = [
    {
      header: "Product Name",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <span className="font-bold text-gray-900 block">{row.productName || row.name}</span>
          {row.description && <span className="text-xs text-gray-500 line-clamp-1">{row.description}</span>}
        </div>
      ),
    },
    {
      header: "SKU",
      accessorKey: "sku",
      cell: (row) => <span className="font-mono text-xs text-[#666666] font-semibold">{row.skuCode || row.sku}</span>,
    },
    {
      header: "Barcode",
      accessorKey: "barcode",
      cell: (row) => (
        <span className="font-mono text-xs text-gray-600">
          {row.barcode ? row.barcode : "-"}
        </span>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => <Badge variant="purple" size="sm">{row.category}</Badge>,
    },
    {
      header: "Brand",
      accessorKey: "brand",
      cell: (row) => <span className="text-xs text-gray-600">{row.brand || "-"}</span>,
    },
    {
      header: "Unit Cost",
      accessorKey: "unitCost",
      cell: (row) => <span className="text-xs font-semibold text-gray-600">{formatCurrency(row.unitCost || 0)}</span>,
    },
    {
      header: "Selling Price",
      accessorKey: "price",
      cell: (row) => <span className="font-bold text-gray-900">{formatCurrency(row.sellingPrice || row.price || 0)}</span>,
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
              <Eye className="w-4 h-4 text-gray-500 hover:text-[#666666]" />
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
              <Edit className="w-4 h-4 text-gray-500 hover:text-gray-700" />
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
              <Trash2 className="w-4 h-4 text-gray-500 hover:text-gray-900" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={products} keyExtractor={(row) => row.id} isLoading={isLoading} />;
};
