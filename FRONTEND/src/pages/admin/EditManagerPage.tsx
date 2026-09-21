import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { adminApi, Manager } from '../../api/adminApi';
import { warehouseApi } from '../../api/warehouseApi';
import { Warehouse } from '../../types/warehouse';
import { User, Mail, Phone, ShieldCheck, Warehouse as WarehouseIcon, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const EditManagerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [manager, setManager] = useState<Manager | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<number[]>([]);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        const mgrId = parseInt(id, 10);
        const [mgr, whList] = await Promise.all([
          adminApi.getManagerById(mgrId),
          warehouseApi.getWarehouses().catch(() => [
            { id: 1, name: 'Hyderabad Central Hub', location: 'Hyderabad' },
            { id: 2, name: 'Bengaluru Logistics Park', location: 'Bengaluru' },
          ]),
        ]);

        setManager(mgr);
        setFullName(mgr.fullName || mgr.username);
        setEmail(mgr.email);
        setPhone(mgr.phone || '');
        setStatus(mgr.status);
        if (mgr.assignedWarehouses) {
          setSelectedWarehouseIds(mgr.assignedWarehouses.map((w) => w.warehouseId));
        }
        setWarehouses(whList);
      } catch (err: any) {
        console.error('Failed to load manager for editing:', err);
        setErrorMsg(err.message || 'Failed to fetch manager profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleWarehouse = (wId: number) => {
    if (selectedWarehouseIds.includes(wId)) {
      if (selectedWarehouseIds.length === 1) {
        setErrorMsg('At least one warehouse must be assigned.');
        return;
      }
      setSelectedWarehouseIds(selectedWarehouseIds.filter((item) => item !== wId));
    } else {
      setSelectedWarehouseIds([...selectedWarehouseIds, wId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !manager) return;

    setErrorMsg(null);
    setEmailFieldError(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (selectedWarehouseIds.length === 0) {
      setErrorMsg('At least one warehouse must be assigned.');
      return;
    }

    setIsSubmitting(true);

    try {
      await adminApi.updateManager(manager.id, {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: 'MANAGER',
        status,
        warehouseIds: selectedWarehouseIds,
      });

      setSuccessMsg('Manager updated successfully!');
      setTimeout(() => {
        navigate('/admin/managers');
      }, 1200);
    } catch (err: any) {
      console.error('Failed to update manager:', err);
      const apiMsg = err.response?.data?.message || err.message || 'Failed to update manager.';
      if (err.response?.status === 409 || apiMsg.toLowerCase().includes('email')) {
        setEmailFieldError('This email address is already registered.');
      } else {
        setErrorMsg(apiMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm animate-pulse max-w-5xl mx-auto">
        Loading manager details for editing...
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl mx-auto text-left">
        <Button variant="outline" onClick={() => navigate('/admin/managers')} className="w-fit flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Managers</span>
        </Button>
        <div className="p-6 rounded-xl bg-gray-100 border border-gray-800 text-gray-900">
          Manager not found.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/admin/managers')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </Button>
      </div>

      <PageHeader
        title={`Edit Manager: ${manager.fullName}`}
        subtitle={`Update account profile and warehouse assignment policies for @${manager.username}.`}
      />

      {errorMsg && (
        <div className="p-4 rounded-xl bg-gray-100 border border-gray-800 text-gray-900 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-gray-100 border border-gray-800 text-gray-900 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Card 1: Personal Details */}
        <Card title="Personal Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#D4D4D4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailFieldError(null);
                  }}
                  className={`w-full bg-[#F7F8FA] border rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none ${
                    emailFieldError ? 'border-gray-900' : 'border-gray-200 focus:border-[#D4D4D4]'
                  }`}
                />
              </div>
              {emailFieldError && (
                <span className="text-xs text-gray-900 mt-1 block font-medium">{emailFieldError}</span>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#D4D4D4]"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Configuration & Status */}
        <Card title="Role & Status Configuration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Assigned Role</label>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F8FA] border border-gray-200 text-gray-800">
                <ShieldCheck className="w-5 h-5 text-gray-700 shrink-0" />
                <div>
                  <span className="font-bold text-sm block">MANAGER</span>
                  <span className="text-xs text-gray-500">Operational warehouse access rights</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#D4D4D4]"
              >
                <option value="ACTIVE">Active (Access enabled)</option>
                <option value="INACTIVE">Inactive (Access disabled)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Card 3: Warehouse Access */}
        <Card title="Warehouse Assignment Permissions">
          <p className="text-xs text-gray-500 mb-4">
            Select one or more warehouses this manager is authorized to monitor and operate.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {warehouses.map((w) => {
              const isSelected = selectedWarehouseIds.includes(w.id);
              return (
                <div
                  key={w.id}
                  onClick={() => toggleWarehouse(w.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#111111]/10 border-[#D4D4D4]/50 text-gray-900'
                      : 'bg-[#F7F8FA] border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 rounded border-gray-300 bg-white text-[#111111] focus:ring-gray-900/20"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <WarehouseIcon className="w-4 h-4 text-[#666666] shrink-0" />
                      <span className="font-bold text-sm text-gray-900">{w.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">{w.location}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/managers')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
