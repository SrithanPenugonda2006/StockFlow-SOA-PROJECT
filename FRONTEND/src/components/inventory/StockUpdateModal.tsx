import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Inventory, InventoryCreateDTO } from '../../types/inventory';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const stockSchema = z.object({
  quantity: z.number().min(0, 'Quantity cannot be negative'),
});

type StockFormData = z.infer<typeof stockSchema>;

interface StockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: InventoryCreateDTO) => Promise<void>;
  inventoryItem?: Inventory | null;
  isLoading?: boolean;
}

export const StockUpdateModal: React.FC<StockUpdateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  inventoryItem,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      quantity: 0,
    },
  });

  useEffect(() => {
    if (inventoryItem) {
      reset({ quantity: inventoryItem.quantity });
    }
  }, [inventoryItem, reset]);

  if (!inventoryItem) return null;

  const handleFormSubmit = async (data: StockFormData) => {
    await onSubmit({
      productId: inventoryItem.productId,
      warehouseId: inventoryItem.warehouseId,
      quantity: data.quantity,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Warehouse Inventory"
      subtitle={`Adjust stock level for Product #${inventoryItem.productId} in Warehouse #${inventoryItem.warehouseId}`}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <div className="bg-[#F7F8FA] p-4 rounded-xl border border-gray-200 flex justify-between text-xs">
          <div>
            <span className="text-gray-400 block">Current Total Stock</span>
            <span className="text-lg font-bold text-gray-900">{inventoryItem.quantity}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Reserved</span>
            <span className="text-lg font-bold text-gray-700">{inventoryItem.reservedQuantity}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Available</span>
            <span className="text-lg font-bold text-gray-900">{inventoryItem.availableQuantity}</span>
          </div>
        </div>

        <Input
          label="New Total Stock Quantity"
          type="number"
          required
          {...register('quantity', { valueAsNumber: true })}
          error={errors.quantity?.message}
        />

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Save Stock Quantity
          </Button>
        </div>
      </form>
    </Modal>
  );
};
