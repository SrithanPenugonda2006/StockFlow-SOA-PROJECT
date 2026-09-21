import React, { useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Pagination } from "../../components/common/Pagination";
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

interface PermissionRow {
  module: string;
  admin: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  manager: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  customer: { view: boolean; create: boolean; edit: boolean; delete: boolean };
}

export const AccessControlPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const permissions: PermissionRow[] = [
    {
      module: "Dashboard Overview",
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: false, edit: false, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: "Products Catalog",
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: true, edit: true, delete: false },
      customer: { view: true, create: false, edit: false, delete: false },
    },
    {
      module: "Warehouses",
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: false, edit: false, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: "Inventory (Assigned Warehouses)",
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: true, edit: true, delete: true },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: "Orders & Fulfillment",
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: true, edit: true, delete: false },
      customer: { view: true, create: true, edit: false, delete: false },
    },
    {
      module: "Stock Operations (In/Out/Adjust)",
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: true, edit: true, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: "Inter-Warehouse Transfers",
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: true, edit: true, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: "Procurement & Purchase Orders",
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: true, edit: true, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: "Security Audit Logs",
      admin: { view: true, create: false, edit: false, delete: false },
      manager: { view: false, create: false, edit: false, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: "Manager Administration",
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: false, create: false, edit: false, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPermissions = permissions.slice(startIndex, startIndex + pageSize);

  const renderCheck = (val: boolean) =>
    val ? (
      <CheckCircle2 className="w-4 h-4 text-gray-900 mx-auto" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-400 mx-auto" />
    );

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Role-Based Access Control Matrix"
        subtitle="Comprehensive privilege specification mapping system roles to operational API endpoints."
      />

      <Card title="System Module Access Permissions Matrix">
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-900">
              <thead className="bg-[#F7F8FA] border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Module Name</th>
                  <th className="px-5 py-3.5 text-center">ADMIN Access</th>
                  <th className="px-5 py-3.5 text-center">MANAGER Access</th>
                  <th className="px-5 py-3.5 text-center">CUSTOMER Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedPermissions.map((perm, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900">{perm.module}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <Badge variant="purple">Full CRUD</Badge>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-3 text-xs">
                        <span title="View">{renderCheck(perm.manager.view)}</span>
                        <span title="Create">{renderCheck(perm.manager.create)}</span>
                        <span title="Edit">{renderCheck(perm.manager.edit)}</span>
                        <span title="Delete">{renderCheck(perm.manager.delete)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-3 text-xs">
                        <span title="View">{renderCheck(perm.customer.view)}</span>
                        <span title="Create">{renderCheck(perm.customer.create)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            totalItems={permissions.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
    </div>
  );
};
