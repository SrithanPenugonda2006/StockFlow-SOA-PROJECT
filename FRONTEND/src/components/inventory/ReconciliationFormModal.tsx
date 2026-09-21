import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Inventory, ReconciliationRequest } from '../../types/inventory';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

const reconcileSchema = z.object({
  actualQuantity: z.number().min(0, 'Actual count must be non-negative'),
  reason: z.string().min(3, 'Reason is required for audit trails'),
});

type ReconcileFormData = z.infer<typeof reconcileSchema>;

interface ReconciliationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: ReconciliationRequest) => Promise<void>;
  inventoryItem?: Inventory | null;
  isLoading?: boolean;
}

export const ReconciliationFormModal: React.FC<ReconciliationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  inventoryItem,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReconcileFormData>({
    resolver: zodResolver(reconcileSchema),
    defaultValues: {
      actualQuantity: inventoryItem ? inventoryItem.quantity : 0,
      reason: 'Physical Audit Discrepancy',
    },
  });

  if (!inventoryItem) return null;

  const actualQty = watch('actualQuantity') || 0;
  const difference = actualQty - inventoryItem.quantity;

  const handleFormSubmit = async (data: ReconcileFormData) => {
    await onSubmit({
      productId: inventoryItem.productId,
      warehouseId: inventoryItem.warehouseId,
      actualQuantity: data.actualQuantity,
      reason: data.reason,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Audit & Reconciliation"
      subtitle={`Reconcile physical stock count against database records (Product #${inventoryItem.productId})`}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center text-xs">
          <div>
            <span className="text-slate-500 block uppercase font-bold">System Record</span>
            <span className="text-lg font-bold text-slate-100">{inventoryItem.quantity}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold">Physical Count</span>
            <span className="text-lg font-bold text-indigo-400">{actualQty}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold">Variance</span>
            <span
              className={`text-lg font-bold ${
                difference === 0
                  ? 'text-slate-400'
                  : difference > 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {difference > 0 ? `+${difference}` : difference}
            </span>
          </div>
        </div>

        <Input
          label="Actual Physical Stock Count"
          type="number"
          required
          {...register('actualQuantity', { valueAsNumber: true })}
          error={errors.actualQuantity?.message}
        />

        <Select
          label="Reconciliation Audit Reason"
          options={[
            { value: 'Physical Audit Discrepancy', label: 'Monthly Physical Audit Discrepancy' },
            { value: 'Damaged Goods Removal', label: 'Damaged / Expired Goods Removal' },
            { value: 'Shrinkage & Theft Loss', label: 'Stock Shrinkage / Theft Loss' },
            { value: 'Supplier Stock Correction', label: 'Supplier Receipt Correction' },
            { value: 'Other Audit Adjustment', label: 'Other Audit Adjustment' },
          ]}
          {...register('reason')}
          error={errors.reason?.message}
        />

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Confirm Stock Audit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
