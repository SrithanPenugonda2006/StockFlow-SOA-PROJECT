import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  Server,
  Layers,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Boxes,
  ArrowRightLeft,
  ShoppingBag,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

export const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does inter-warehouse stock transfer work?',
      a: 'A stock transfer creates a formal request between a source and destination warehouse. Upon approval, stock is held in transit during the DISPATCH status. Once received at the destination, the inventory quantities automatically update for both locations.',
    },
    {
      q: 'How are low stock and reorder points calculated?',
      a: 'Smart Inventory calculates safety stock based on lead time days, historical daily demand, and minimum buffer thresholds. When available stock drops below the reorder point, an alert is triggered and a recommended purchase order quantity is computed.',
    },
    {
      q: 'What happens during an Inventory Reconciliation?',
      a: 'Reconciliation allows authorized managers to sync physical warehouse counts with system data. Any variance is recorded as a RECONCILIATION transaction with timestamp, auditor details, and reason code for audit logging compliance.',
    },
    {
      q: 'How do microservices communicate in StockFlow?',
      a: 'The frontend sends requests through the API Gateway (Port 8080), which routes traffic using Eureka Service Discovery to Auth Service (8081), Product Service (8082), Inventory Service (8083), and Order Service (8084).',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
          <HelpCircle className="w-7 h-7 text-[#666666]" />
          StockFlow System Guide & Documentation
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Operational workflows, microservice topology, and feature documentation.
        </p>
      </div>

      {/* Core Features Quick Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white/60 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2.5 text-[#666666] font-bold text-base">
            <ArrowRightLeft className="w-5 h-5" />
            Inter-Warehouse Transfers
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Move stock between physical locations using 4-stage lifecycle tracking: Requested → Approved → Dispatched → Received.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/60 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2.5 text-[#666666] font-bold text-base">
            <ShoppingBag className="w-5 h-5" />
            Vendor Procurement & POs
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Issue purchase orders to verified suppliers, manage item lines, and automate stock intake upon vendor delivery.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/60 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2.5 text-[#666666] font-bold text-base">
            <FileCheck2 className="w-5 h-5" />
            Stock Reconciliation Audit
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Conduct physical inventory audits and adjust system stock with mandatory audit trail logging and reason codes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/60 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2.5 text-[#666666] font-bold text-base">
            <Sparkles className="w-5 h-5" />
            Smart Inventory Intelligence
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Real-time calculation of Safety Stock, Reorder Points, Overstock risks, and Dead Stock identification.
          </p>
        </div>
      </div>

      {/* Microservices Topology Architecture Section */}
      <div className="p-6 rounded-2xl bg-white/60 border border-gray-200 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Server className="w-5 h-5 text-[#666666]" />
          Backend Microservices Architecture Topology
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[#F7F8FA]/80 border border-gray-200">
            <span className="font-bold text-gray-900 text-xs block">API Gateway</span>
            <span className="text-[11px] text-[#666666] font-mono block">Port 8080</span>
            <p className="text-[11px] text-gray-500 mt-1">Central JWT auth routing & rate limiting.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F8FA]/80 border border-gray-200">
            <span className="font-bold text-gray-900 text-xs block">Auth Service</span>
            <span className="text-[11px] text-[#666666] font-mono block">Port 8081</span>
            <p className="text-[11px] text-gray-500 mt-1">User identity, role RBAC, OTP verification.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F8FA]/80 border border-gray-200">
            <span className="font-bold text-gray-900 text-xs block">Product Service</span>
            <span className="text-[11px] text-[#666666] font-mono block">Port 8082</span>
            <p className="text-[11px] text-gray-500 mt-1">Catalog master data, SKU, Barcode, Pricing.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F8FA]/80 border border-gray-200">
            <span className="font-bold text-gray-900 text-xs block">Inventory Service</span>
            <span className="text-[11px] text-[#666666] font-mono block">Port 8083</span>
            <p className="text-[11px] text-gray-500 mt-1">Warehouse stock, transfers, procurement, audit.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F8FA]/80 border border-gray-200">
            <span className="font-bold text-gray-900 text-xs block">Order Service</span>
            <span className="text-[11px] text-[#666666] font-mono block">Port 8084</span>
            <p className="text-[11px] text-gray-500 mt-1">Customer order processing & stock reservation.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F8FA]/80 border border-gray-200">
            <span className="font-bold text-gray-900 text-xs block">Eureka Registry</span>
            <span className="text-[11px] text-[#666666] font-mono block">Port 8761</span>
            <p className="text-[11px] text-gray-500 mt-1">Dynamic microservice name resolution.</p>
          </div>
        </div>
      </div>

      {/* Accordion FAQ */}
      <div className="p-6 rounded-2xl bg-white/60 border border-gray-200 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#666666]" />
          Frequently Asked Questions (FAQ)
        </h2>

        <div className="space-y-2 pt-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#F7F8FA]/60 border border-gray-200 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-4 py-3 text-left font-semibold text-sm text-gray-800 flex items-center justify-between hover:text-white"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#666666]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-3 text-xs text-gray-500 border-t border-gray-200 pt-2 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
