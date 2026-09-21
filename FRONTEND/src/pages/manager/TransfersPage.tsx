import React, { useEffect, useState } from "react";
import { StockTransfer, StockTransferRequest } from "../../types/inventory";
import { Warehouse } from "../../types/warehouse";
import { Product } from "../../types/product";
import { inventoryApi } from "../../api/inventoryApi";
import { warehouseApi } from "../../api/warehouseApi";
import { productApi } from "../../api/productApi";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { Pagination } from "../../components/common/Pagination";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../utils/formatters";
import { ArrowLeftRight, Plus, RefreshCw, CheckCircle } from "lucide-react";

export const TransfersPage: React.FC = () => {
  const { showToast } = useToast();
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sourceWhId, setSourceWhId] = useState<number | "">("");
  const [destWhId, setDestWhId] = useState<number | "">("");
  const [productId, setProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transRes, whRes, prodRes] = await Promise.all([
        inventoryApi.getTransfers(),
        warehouseApi.getWarehouses(),
        productApi.getProducts({ page: 0, size: 100 }),
      ]);
      setTransfers(transRes || []);
      setWarehouses(whRes || []);
      setProducts(prodRes?.content || []);
    } catch (err: any) {
      showToast("error", "Error Loading Transfers", extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(transfers.length / pageSize) || 1;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [transfers.length, currentPage]);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceWhId || !destWhId || !productId || quantity <= 0) {
      showToast("warning", "Missing Fields", "Please fill in all required transfer fields.");
      return;
    }
    if (sourceWhId === destWhId) {
      showToast("warning", "Invalid Warehouse", "Source and Destination warehouse cannot be the same.");
      return;
    }

    setIsSubmitting(true);
    try {
      const req: StockTransferRequest = {
        sourceWarehouseId: Number(sourceWhId),
        destinationWarehouseId: Number(destWhId),
        productId: Number(productId),
        quantity: Number(quantity),
        notes,
      };
      await inventoryApi.createTransfer(req);
      showToast("success", "Transfer Requested", "Stock transfer initiated successfully.");
      setIsModalOpen(false);
      setSourceWhId("");
      setDestWhId("");
      setProductId("");
      setQuantity(1);
      setNotes("");
      fetchData();
    } catch (err: any) {
      showToast("error", "Transfer Failed", extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await inventoryApi.approveTransfer(id);
      showToast("success", "Transfer Approved", "Stock transfer request approved.");
      fetchData();
    } catch (err: any) {
      showToast("error", "Approval Failed", extractErrorMessage(err));
    }
  };

  const handleDispatch = async (id: number) => {
    try {
      await inventoryApi.dispatchTransfer(id);
      showToast("success", "Transfer Dispatched", "Goods are in transit.");
      fetchData();
    } catch (err: any) {
      showToast("error", "Dispatch Failed", extractErrorMessage(err));
    }
  };

  const handleReceive = async (id: number) => {
    try {
      await inventoryApi.receiveTransfer(id);
      showToast("success", "Transfer Received", "Stock balance added to destination warehouse.");
      fetchData();
    } catch (err: any) {
      showToast("error", "Receive Failed", extractErrorMessage(err));
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransfers = transfers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="flex flex-col gap-6 text-left">
      <PageHeader
        title="Stock Transfers"
        subtitle="Inter-warehouse stock allocations, transit status tracking, and fulfillments."
        actions={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={fetchData} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Refresh
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Create Transfer
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#666666]" />
          <p className="text-sm font-medium">Loading stock transfers...</p>
        </div>
      ) : transfers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-semibold text-gray-600">No stock transfers found</p>
          <p className="text-xs text-gray-400 mt-1">Click "Create Transfer" to initiate an inter-warehouse transfer.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-800">
              <thead className="bg-[#F7F8FA] border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Transfer Ref</th>
                  <th className="px-5 py-3.5">Source Warehouse</th>
                  <th className="px-5 py-3.5">Destination Warehouse</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {paginatedTransfers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-100/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#666666]">{t.transferNumber}</td>
                    <td className="px-5 py-4 font-semibold text-gray-800">{t.sourceWarehouseName || `WH #${t.sourceWarehouseId}`}</td>
                    <td className="px-5 py-4 font-semibold text-gray-800">{t.destinationWarehouseName || `WH #${t.destinationWarehouseId}`}</td>
                    <td className="px-5 py-4 font-bold text-gray-900">{t.quantity} Units</td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          t.status === "RECEIVED"
                            ? "emerald"
                            : t.status === "DISPATCHED"
                            ? "purple"
                            : t.status === "APPROVED"
                            ? "indigo"
                            : "amber"
                        }
                        size="sm"
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {t.status === "REQUESTED" && (
                          <Button size="sm" variant="secondary" onClick={() => handleApprove(t.id)}>
                            Approve
                          </Button>
                        )}
                        {t.status === "APPROVED" && (
                          <Button size="sm" variant="primary" onClick={() => handleDispatch(t.id)}>
                            Dispatch
                          </Button>
                        )}
                        {t.status === "DISPATCHED" && (
                          <Button size="sm" variant="primary" onClick={() => handleReceive(t.id)}>
                            Receive Stock
                          </Button>
                        )}
                        {t.status === "RECEIVED" && (
                          <span className="text-xs text-gray-900 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50/50">
            <Pagination
              totalItems={transfers.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* CREATE TRANSFER MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Inter-Warehouse Transfer"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTransfer} className="flex flex-col gap-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Source Warehouse <span className="text-gray-900">*</span>
              </label>
              <select
                value={sourceWhId}
                onChange={(e) => setSourceWhId(Number(e.target.value))}
                className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl text-sm text-gray-900 p-3"
                required
              >
                <option value="">Select Source</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Destination Warehouse <span className="text-gray-900">*</span>
              </label>
              <select
                value={destWhId}
                onChange={(e) => setDestWhId(Number(e.target.value))}
                className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl text-sm text-gray-900 p-3"
                required
              >
                <option value="">Select Destination</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.location})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Product <span className="text-gray-900">*</span>
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(Number(e.target.value))}
                className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl text-sm text-gray-900 p-3"
                required
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName || p.name} ({p.skuCode || p.sku})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes / Reason</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Stock rebalance for Q3 sales promo"
              className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl text-sm text-gray-900 p-3"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
