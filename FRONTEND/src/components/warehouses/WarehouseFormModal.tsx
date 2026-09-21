import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Warehouse, WarehouseCreateDTO } from '../../types/warehouse';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const warehouseSchema = z.object({
  name: z.string().min(2, 'Warehouse name is required'),
  location: z.string().min(2, 'Location is required'),
  capacity: z.number().optional(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WarehouseCreateDTO) => Promise<void>;
  warehouse?: Warehouse | null;
  isLoading?: boolean;
}

export const WarehouseFormModal: React.FC<WarehouseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  warehouse,
  isLoading = false,
}) => {
  const isEditing = !!warehouse;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: '',
      location: '',
      capacity: 100000,
    },
  });

  useEffect(() => {
    if (warehouse) {
      reset({
        name: warehouse.name,
        location: warehouse.location,
        capacity: warehouse.capacity || 100000,
      });
    } else {
      reset({
        name: '',
        location: '',
        capacity: 100000,
      });
    }
  }, [warehouse, reset]);

  const handleFormSubmit = async (data: WarehouseFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Warehouse' : 'Create Physical Warehouse'}
      subtitle="Register new fulfillment center location and capacity"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <Input
          label="Warehouse Name"
          placeholder="e.g. Hyderabad Central Fulfillment Center"
          required
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          label="Location Address"
          placeholder="e.g. HITEC City, Hyderabad"
          required
          {...register('location')}
          error={errors.location?.message}
        />

        <Input
          label="Storage Capacity (Units)"
          type="number"
          placeholder="100000"
          {...register('capacity', { valueAsNumber: true })}
          error={errors.capacity?.message}
        />

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
