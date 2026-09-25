import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product, ProductCreateDTO } from '../../types/product';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { categoryBrandApi } from '../../api/categoryBrandApi';
import { CategoryItem, BrandItem } from '../../types/categoryBrand';

const productSchema = z.object({
  sku: z.string().min(1, 'SKU Code is required'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'Product Name is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  unitCost: z
    .number({ invalid_type_error: 'Unit cost must be a valid number' })
    .min(0, 'Unit cost must be non-negative'),
  price: z
    .number({ invalid_type_error: 'Selling price must be a valid number' })
    .min(0, 'Selling price must be non-negative'),
  initialStock: z
    .number({ invalid_type_error: 'Initial stock must be a valid number' })
    .int('Initial stock must be an integer')
    .min(0, 'Initial stock must be non-negative'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCreateDTO) => Promise<void>;
  product?: Product | null;
  isLoading?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading = false,
}) => {
  const isEditing = !!product;
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      categoryBrandApi.getCategories().then((cats) => setCategories(cats || [])).catch(() => {});
      categoryBrandApi.getBrands().then((b) => setBrands(b || [])).catch(() => {});
    }
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      barcode: '',
      name: '',
      category: '',
      brand: '',
      unitCost: 100.0,
      price: 149.99,
      initialStock: 50,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        sku: product.skuCode || product.sku || '',
        barcode: product.barcode || '',
        name: product.productName || product.name || '',
        category: product.category || (categories.length > 0 ? categories[0].name : 'Electronics'),
        brand: product.brand || (brands.length > 0 ? brands[0].name : 'Apple'),
        unitCost: product.unitCost !== undefined ? Number(product.unitCost) : 100.0,
        price: product.sellingPrice !== undefined ? Number(product.sellingPrice) : Number(product.price || 0),
        initialStock: product.initialStock !== undefined ? Number(product.initialStock) : 0,
      });
    } else {
      reset({
        sku: '',
        barcode: '',
        name: '',
        category: categories.length > 0 ? categories[0].name : 'Electronics',
        brand: brands.length > 0 ? brands[0].name : 'Apple',
        unitCost: 100.0,
        price: 149.99,
        initialStock: 50,
      });
    }
  }, [product, reset, categories, brands]);

  const handleFormSubmit = async (data: ProductFormData) => {
    const payload: ProductCreateDTO = {
      sku: data.sku.trim(),
      skuCode: data.sku.trim(),
      barcode: data.barcode?.trim() || undefined,
      name: data.name.trim(),
      productName: data.name.trim(),
      category: data.category.trim(),
      brand: data.brand?.trim() || undefined,
      unitCost: data.unitCost,
      price: data.price,
      sellingPrice: data.price,
      initialStock: data.initialStock,
      description: product?.description || '',
    };
    await onSubmit(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Catalog Product' : 'Add New Product to Catalog'}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5 text-left">
        {/* ROW 1: SKU Code (50%) | Barcode (50%) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="SKU Code"
            placeholder="PROD-SKU-01"
            required
            {...register('sku')}
            error={errors.sku?.message}
          />
          <Input
            label="Barcode"
            placeholder="885909743019"
            {...register('barcode')}
            error={errors.barcode?.message}
          />
        </div>

        {/* ROW 2: Product Name (100%) */}
        <div>
          <Input
            label="Product Name"
            placeholder="Enterprise Wireless Mouse"
            required
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        {/* ROW 3: Category (50%) | Brand (50%) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Category <span className="text-gray-900">*</span>
            </label>
            <select
              className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl text-sm text-gray-900 p-3 focus:outline-none focus:ring-2 focus:ring-gray-900/20/30 focus:border-[#D4D4D4]/80 transition-all"
              {...register('category')}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="text-xs text-gray-900 font-medium">{errors.category.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Brand
            </label>
            <select
              className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl text-sm text-gray-900 p-3 focus:outline-none focus:ring-2 focus:ring-gray-900/20/30 focus:border-[#D4D4D4]/80 transition-all"
              {...register('brand')}
            >
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
            {errors.brand && (
              <span className="text-xs text-gray-900 font-medium">{errors.brand.message}</span>
            )}
          </div>
        </div>

        {/* ROW 4: Unit Cost (₹) (33%) | Selling Price (₹) (33%) | Initial Stock (33%) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Unit Cost (₹)"
            type="number"
            step="0.01"
            placeholder="100.00"
            required
            {...register('unitCost', { valueAsNumber: true })}
            error={errors.unitCost?.message}
          />
          <Input
            label="Selling Price (₹)"
            type="number"
            step="0.01"
            placeholder="149.99"
            required
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
          />
          <Input
            label="Initial Stock"
            type="number"
            step="1"
            placeholder="50"
            required
            {...register('initialStock', { valueAsNumber: true })}
            error={errors.initialStock?.message}
          />
        </div>

        {/* HORIZONTAL DIVIDER */}
        <div className="border-t border-gray-200 my-2" />

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
