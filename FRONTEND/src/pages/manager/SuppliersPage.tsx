import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  AlertCircle,
  Building2,
  User,
} from 'lucide-react';
import { Pagination } from '../../components/common/Pagination';
import { inventoryApi } from '../../api/inventoryApi';
import { Supplier } from '../../types/inventory';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    rating: 5,
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getSuppliers();
      setSuppliers(data || []);
    } catch (err: any) {
      console.error('Failed to fetch suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.code) {
      setErrorMsg('Supplier Name and Code are required.');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryApi.createSupplier(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        code: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        status: 'ACTIVE',
        rating: 5,
      });
      fetchSuppliers();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to register supplier');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredSuppliers = suppliers.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.code.toLowerCase().includes(query) ||
      (s.contactName && s.contactName.toLowerCase().includes(query)) ||
      (s.email && s.email.toLowerCase().includes(query))
    );
  });

  const activeCount = suppliers.filter((s) => s.status === 'ACTIVE').length;
  const inactiveCount = suppliers.filter((s) => s.status === 'INACTIVE').length;

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-[#666666]" />
            Supplier Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Maintain verified vendor registries, contact info, and supplier performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSuppliers}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-white hover:bg-gray-100 transition-colors"
            title="Refresh Suppliers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Supplier
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Registered Vendors</span>
            <div className="p-2 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{suppliers.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Suppliers</span>
            <div className="p-2 rounded-xl bg-gray-900/10 text-gray-900 border border-gray-900/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{activeCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inactive Suppliers</span>
            <div className="p-2 rounded-xl bg-gray-900/10 text-gray-900 border border-gray-900/20">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{inactiveCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white/60 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search suppliers by name, code, contact, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          />
        </div>
      </div>

      {/* Grid of Supplier Cards */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white/60 rounded-2xl border border-gray-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#666666] mb-2" />
          Loading supplier directory...
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-white/60 rounded-2xl border border-gray-200">
          <Truck className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="font-semibold text-gray-500">No Suppliers Registered</p>
          <p className="text-xs text-gray-400 mt-1">Register suppliers to initiate purchase order fulfillment.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedSuppliers.map((s) => (
              <div
              key={s.id}
              className="p-5 rounded-2xl bg-white/60 border border-gray-200 hover:border-[#D4D4D4]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#666666] shrink-0" />
                      {s.name}
                    </h3>
                    <span className="text-xs text-[#666666] font-mono font-medium block mt-0.5">
                      {s.code}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      s.status === 'ACTIVE'
                        ? 'bg-gray-900/10 text-gray-900 border border-gray-900/20'
                        : 'bg-gray-900/10 text-gray-900 border border-gray-900/20'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  {s.contactName && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>{s.contactName}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <a href={`mailto:${s.email}`} className="text-[#666666] hover:underline truncate">
                        {s.email}
                      </a>
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.address && (
                    <div className="flex items-start gap-2 pt-1 text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{s.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Rating */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>Vendor Rating</span>
                <div className="flex items-center gap-1 text-gray-700 font-bold">
                  <Star className="w-3.5 h-3.5 fill-gray-700" />
                  <span>{s.rating ? `${s.rating}.0` : '5.0'}</span>
                </div>
              </div>
            </div>
            ))}
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
            <Pagination
              totalItems={filteredSuppliers.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Modal: Add Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F7F8FA]/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#F7F8FA]/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Add New Supplier</h3>
                  <p className="text-xs text-gray-500">Register a new vendor for inventory procurement.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-500 hover:text-white hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-gray-100 border border-gray-800 text-gray-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apex Global Logistics"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Supplier Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. SUP-101"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. orders@apexglobal.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Physical Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Plot 42, Industrial Zone, Bengaluru"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-gray-500 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition-all flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Register Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
