import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, QrCode } from 'lucide-react';
import { batchApi } from '../../api/inventoryApi';
import { BatchItem } from '../../types/batch';
import { Pagination } from '../common/Pagination';

export const BatchesSerialView: React.FC = () => {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const data = await batchApi.getBatches();
      setBatches(data || []);
    } catch (err) {
      console.error('Failed to load batch records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const filteredBatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return batches;
    return batches.filter(
      (b) =>
        b.batchNumber.toLowerCase().includes(q) ||
        (b.serialNumber && b.serialNumber.toLowerCase().includes(q)) ||
        (b.productName && b.productName.toLowerCase().includes(q))
    );
  }, [batches, searchQuery]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'VALID':
        return <span className="text-gray-900 font-bold text-xs uppercase tracking-wider">VALID</span>;
      case 'EXPIRING_SOON':
        return <span className="text-gray-700 font-bold text-xs uppercase tracking-wider">EXPIRING SOON</span>;
      case 'EXPIRED':
        return <span className="text-gray-900 font-bold text-xs uppercase tracking-wider">EXPIRED</span>;
      case 'QUARANTINED':
        return <span className="text-[#666666] font-bold text-xs uppercase tracking-wider">QUARANTINED</span>;
      default:
        return <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#000000] tracking-tight">
          Batches & Serial Number Tracking
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Traceability log for manufacturing batches, serial numbers, component expiry dates, and lot locations.
        </p>
      </div>

      {/* Horizontal Divider */}
      <div className="border-t border-gray-200 my-2" />

      {/* Search / Filter Card */}
      <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Batch #, Serial #, Product..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20 font-mono"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-gray-500">
            Total Tracked Lots: <strong className="text-white text-sm">{loading ? '...' : batches.length}</strong>
          </span>
          <button
            onClick={fetchBatches}
            className="p-2 rounded-xl bg-[#F7F8FA] border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Traceability Table */}
      <div className="rounded-2xl bg-white/60 border border-gray-200 overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#F7F8FA]/80 text-[11px] font-mono font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">BATCH NUMBER</th>
                <th className="px-6 py-4">SERIAL NUMBER</th>
                <th className="px-6 py-4">PRODUCT NAME</th>
                <th className="px-6 py-4">WAREHOUSE</th>
                <th className="px-6 py-4">QTY</th>
                <th className="px-6 py-4">MFG. DATE</th>
                <th className="px-6 py-4">EXPIRY DATE</th>
                <th className="px-6 py-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#666666] mb-2" />
                    Loading batch & serial tracking logs...
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <QrCode className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                    <p className="font-semibold text-gray-500">
                      {searchQuery.trim() ? 'No matching records found' : 'No batch or serial records found'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchQuery.trim()
                        ? 'Try adjusting your search criteria.'
                        : 'Create or receive inventory with batch/serial tracking to view traceability records.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBatches.slice((page - 1) * 5, page * 5).map((b) => (
                  <tr key={b.id} className="hover:bg-gray-100/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-700 whitespace-nowrap">
                      {b.batchNumber}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600 text-xs whitespace-nowrap">
                      {b.serialNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                      {b.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded bg-[#F7F8FA] border border-gray-200 text-xs font-mono font-semibold text-gray-600">
                        {b.warehouseName || `WH-${b.warehouseId}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                      {b.quantity}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                      {b.mfgDate || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                      {b.expiryDate || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(b.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination totalItems={filteredBatches.length} currentPage={page} pageSize={5} onPageChange={setPage} />
    </div>
  );
};
