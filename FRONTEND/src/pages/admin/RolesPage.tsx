import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Shield, Check } from 'lucide-react';

export const RolesPage: React.FC = () => {
  const roles = [
    {
      name: 'ADMIN',
      badge: 'purple' as const,
      description: 'Platform Super Administrator with full system control and access to Admin Panel.',
      permissions: [
        'Full Management Access (Products, Warehouses, Inventory, Orders)',
        'Admin Control Center & Microservice Architecture Monitoring',
        'System Reconciliation & Transaction Auditing',
        'Role Allocation & Session Inspection',
      ],
    },
    {
      name: 'MANAGER',
      badge: 'warning' as const,
      description: 'Operations Manager responsible for warehouse inventory and order fulfillment.',
      permissions: [
        'Inventory Stock Allocation & Reconciliation',
        'Low Stock Monitoring & Alerts',
        'Product & Warehouse Catalog Management',
        'Customer Order Processing & Status Tracking',
      ],
    },
    {
      name: 'CUSTOMER',
      badge: 'info' as const,
      description: 'Registered platform customer with access to product catalog and cart checkout.',
      permissions: [
        'Browse Product Catalog & Stock Availability',
        'Add Items to Cart & Place Orders',
        'View Order History & Fulfillment Status',
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Role-Based Access Control (RBAC)"
        subtitle="View platform role definitions, permission matrices, and operational boundaries."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((r, idx) => (
          <Card key={idx} className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#666666]">
                  <Shield className="w-5 h-5" />
                </div>
                <Badge variant={r.badge}>{r.name}</Badge>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{r.name} Role</h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">{r.description}</p>
              
              <div className="border-t border-gray-200 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                  Permissions Matrix
                </span>
                <ul className="space-y-2">
                  {r.permissions.map((p, pIdx) => (
                    <li key={pIdx} className="text-xs text-gray-600 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-gray-900 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
