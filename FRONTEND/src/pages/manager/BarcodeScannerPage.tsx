import { formatCurrency } from '../../utils/formatters';
import React, { useState, useEffect } from 'react';
import {
  Barcode as BarcodeIcon,
  Search,
  Printer,
  Package,
  Building2,
  Tag,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { inventoryApi } from '../../api/inventoryApi';
import { warehouseApi } from '../../api/warehouseApi';
import { Product } from '../../types/product';
import { Inventory } from '../../types/inventory';
import { Warehouse } from '../../types/warehouse';

export const BarcodeScannerPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  
  const [scanInput, setScanInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchMsg, setSearchMsg] = useState('');

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, whRes] = await Promise.all([
        productApi.getProducts({ size: 100 }),
        warehouseApi.getWarehouses(),
      ]);
      const list = prodRes?.content || [];
      setProducts(list);
      setWarehouses(whRes || []);
      if (list.length > 0) {
        handleSelectProduct(list[0]);
      }
    } catch (err) {
      console.error('Failed to load products for barcode scanning', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectProduct = async (prod: Product) => {
    setSelectedProduct(prod);
    setSearchMsg('');
    try {
      const inv = await inventoryApi.getInventoryByProduct(prod.id);
      setInventoryList(inv || []);
    } catch (err) {
      setInventoryList([]);
    }
  };

  const handleBarcodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    setSearchMsg('');
    const matched = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === scanInput.trim().toLowerCase()) ||
        (p.sku && p.sku.toLowerCase() === scanInput.trim().toLowerCase()) ||
        p.name.toLowerCase().includes(scanInput.trim().toLowerCase())
    );

    if (matched) {
      handleSelectProduct(matched);
      setScanInput('');
    } else {
      setSearchMsg(`No product matching Barcode or SKU "${scanInput}" was found.`);
    }
  };

  // Helper function to draw dynamic barcode bars based on string
  const renderBarcodeSvg = (codeStr: string) => {
    const code = codeStr || '890123456789';
    const barWidths = [2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3];
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner border border-slate-300">
        <div className="flex items-end h-20 gap-1 px-4 py-2">
          {code.split('').map((char, index) => {
            const width = barWidths[index % barWidths.length];
            const isNarrow = index % 3 === 0;
            return (
              <div
                key={index}
                className={`bg-[#F7F8FA] h-full rounded-sm`}
                style={{ width: `${width * 2}px`, opacity: isNarrow ? 0.75 : 1 }}
              />
            );
          })}
        </div>
        <span className="font-mono text-sm tracking-[0.3em] font-bold text-slate-900 mt-2">
          {code}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <BarcodeIcon className="w-7 h-7 text-[#666666]" />
            Barcode Generator & Scanner Terminal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lookup products via barcode/SKU scanner and print high-resolution inventory labels.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold text-sm transition-all w-fit"
        >
          <Printer className="w-4 h-4" />
          Print Barcode Label
        </button>
      </div>

      {/* Hardware Scanner Lookup Card */}
      <div className="p-6 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm shadow-xl">
        <form onSubmit={handleBarcodeSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <BarcodeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
            <input
              type="text"
              placeholder="Scan Barcode or enter SKU / Product Name..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F7F8FA] border border-gray-200 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#111111] hover:bg-[#111111] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Scan / Search
          </button>
        </form>

        {searchMsg && (
          <p className="mt-3 text-xs font-semibold text-gray-900 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            {searchMsg}
          </p>
        )}
      </div>

      {/* Product Selector Dropdown */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Catalog Item:</span>
        <select
          value={selectedProduct?.id || ''}
          onChange={(e) => {
            const prod = products.find((p) => p.id === Number(e.target.value));
            if (prod) handleSelectProduct(prod);
          }}
          className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku} | Barcode: {p.barcode || 'N/A'})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Product & Barcode Display */}
      {selectedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Printable Barcode Label Card */}
          <div className="p-6 rounded-2xl bg-white/80 border border-[#D4D4D4]/30 backdrop-blur-sm shadow-2xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                <span className="px-2.5 py-1 rounded-md bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20 text-xs font-bold uppercase tracking-wider">
                  Official StockFlow Tag
                </span>
                <span className="text-xs text-gray-500 font-mono">ID #{selectedProduct.id}</span>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedProduct.name}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-6">
                <span>Category: <strong className="text-gray-800">{selectedProduct.category || 'General'}</strong></span>
                <span>•</span>
                <span>Brand: <strong className="text-gray-800">{selectedProduct.brand || 'StockFlow'}</strong></span>
              </div>

              {/* SVG Barcode Render */}
              {renderBarcodeSvg(selectedProduct.barcode || selectedProduct.sku)}

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">SKU Code</span>
                  <span className="text-sm font-mono font-bold text-[#111111]">{selectedProduct.sku}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">Selling Price</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(selectedProduct.price || 0)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-[#F7F8FA] hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Standard Label Tag
            </button>
          </div>

          {/* Warehouse Inventory Stock Breakdown */}
          <div className="p-6 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-[#666666]" />
                Live Stock Across Warehouses
              </h3>

              {inventoryList.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">
                  No warehouse stock records linked to this product.
                </p>
              ) : (
                <div className="space-y-3">
                  {inventoryList.map((inv) => {
                    const wh = warehouses.find((w) => w.id === inv.warehouseId);
                    return (
                      <div
                        key={inv.id}
                        className="p-3.5 rounded-xl bg-[#F7F8FA]/60 border border-gray-200 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-gray-800 text-sm block">
                            {wh?.name || `Warehouse #${inv.warehouseId}`}
                          </span>
                          <span className="text-xs text-gray-500">
                            {wh?.city ? `${wh.city}, ${wh.state || ''}` : 'Primary Storage'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-gray-900 block">
                            {inv.availableQuantity} available
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Reserved: {inv.reservedQuantity} | Total: {inv.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-xs text-[#111111]">
              <span className="font-bold block mb-0.5">Quick Stock Scanner Tip</span>
              Use any standard USB/Bluetooth barcode scanner plugged into your terminal to instantly locate items during audit or dispatch operations.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
