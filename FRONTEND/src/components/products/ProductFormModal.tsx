import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product, ProductCreateDTO } from '../../types/product';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  price: z.number().positive('Price must be greater than 0'),
  category: z.string().min(2, 'Category is required'),
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      price: 0,
      category: 'Electronics',
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        category: product.category,
      });
    } else {
      reset({
        name: '',
        description: '',
        sku: '',
        price: 0,
        category: 'Electronics',
      });
    }
  }, [product, reset]);

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Catalog Product' : 'Add New Catalog Product'}
      subtitle="Fill in product details for catalog registration"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <Input
          label="Product Name"
          placeholder="e.g. Wireless Ergonomic Mouse"
          required
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          label="SKU Code"
          placeholder="e.g. MOUSE-WM-90"
          required
          {...register('sku')}
          error={errors.sku?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price (₹)"
            type="number"
            step="0.01"
            placeholder="59.99"
            required
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
          />

          <Input
            label="Category"
            placeholder="e.g. Electronics"
            required
            {...register('category')}
            error={errors.category?.message}
          />
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/80 transition-all"
            placeholder="Provide catalog description..."
            {...register('description')}
          />
          {errors.description && (
            <span className="text-xs text-rose-400 font-medium">{errors.description.message}</span>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
