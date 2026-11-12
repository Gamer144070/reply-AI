import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Package,
  RotateCcw,
  Sparkles,
  Check,
  Globe2,
  Calendar,
  User,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react';
import { BusinessProfile, PrintableDocument, PackingSlipItem } from '../types';
import { SAMPLE_PRINTABLE_DOCUMENTS } from '../data/defaultData';

interface PrintingStudioViewProps {
  businessProfile: BusinessProfile;
}

export const PrintingStudioView: React.FC<PrintingStudioViewProps> = ({
  businessProfile,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'packing_slip' | 'care_card' | 'return_label'>('packing_slip');
  const [orderNumber, setOrderNumber] = useState('ORD-8841-DE');
  const [customerName, setCustomerName] = useState('Lukas Schneider');
  const [customerAddress, setCustomerAddress] = useState('Maximilianstraße 14, 80539 München, Germany');
  const [destinationCountry, setDestinationCountry] = useState('Germany');
  const [orderDate, setOrderDate] = useState('November 11, 2026');
  const [items, setItems] = useState<PackingSlipItem[]>([
    { sku: 'POT-MUG-OAT', name: 'Handcrafted Oatmeal Speckled Stoneware Mug', quantity: 2, unitPrice: '$28.00' },
    { sku: 'POT-BOWL-RAMEN', name: 'Kinoko Speckled Stoneware Ramen Bowl (18cm)', quantity: 1, unitPrice: '$38.00' },
  ]);
  const [customsNote, setCustomsNote] = useState('Commercial Merchandise - Ceramic Tableware (HS Code: 6912.00). Declared value: $94.00 USD.');
  const [specialInstructions, setSpecialInstructions] = useState('Fragile ceramic parcel. Handle with care. Microwave and dishwasher safe.');

  const handlePrint = () => {
    window.print();
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { sku: `SKU-${Date.now().toString().slice(-4)}`, name: 'New Product Item', quantity: 1, unitPrice: '$25.00' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof PackingSlipItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleLoadSample = (doc: PrintableDocument) => {
    setSelectedTemplate(doc.type);
    setOrderNumber(doc.orderNumber);
    setCustomerName(doc.customerName);
    setCustomerAddress(doc.customerAddress);
    setDestinationCountry(doc.destinationCountry);
    setOrderDate(doc.orderDate);
    setItems(doc.items);
    if (doc.customsNote) setCustomsNote(doc.customsNote);
    if (doc.specialInstructions) setSpecialInstructions(doc.specialInstructions);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              International Printing Services
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · Packing Slips, Care Cards & Return Labels
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Generate clean, professional print documents formatted for international shipping
            and thermal label printers. Includes customs declarations, care instructions,
            and store return policies.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Template Selector & Sample Buttons */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-1">
            Document Type:
          </span>
          {[
            { id: 'packing_slip', label: 'International Packing Slip', icon: Package },
            { id: 'care_card', label: 'Product Care & Thank-You Card', icon: FileText },
            { id: 'return_label', label: 'Return Authorization Slip', icon: RotateCcw },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id as any)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5 border ${
                  selectedTemplate === t.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950 dark:border-blue-400 dark:text-blue-300 font-semibold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Preset:
          </span>
          {SAMPLE_PRINTABLE_DOCUMENTS.map((doc, idx) => (
            <button
              key={doc.orderNumber}
              onClick={() => handleLoadSample(doc)}
              className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
            >
              #{idx + 1} ({doc.destinationCountry})
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Editor on Left, Live Printable Paper on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Document Order Details
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Order Date
                </label>
                <input
                  type="text"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Destination Address
              </label>
              <textarea
                rows={2}
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Line items */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Line Items ({items.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs"
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      placeholder="Item name"
                      className="flex-1 text-xs p-1 bg-white dark:bg-slate-900 border rounded"
                    />
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                      className="w-12 text-xs p-1 bg-white dark:bg-slate-900 border rounded text-center"
                    />
                    <input
                      type="text"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, 'unitPrice', e.target.value)}
                      className="w-16 text-xs p-1 bg-white dark:bg-slate-900 border rounded text-right font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Customs Note */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Customs / Tax Notice
              </label>
              <input
                type="text"
                value={customsNote}
                onChange={(e) => setCustomsNote(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Care / Handling Notes
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Live Printable Document Sheet (7 cols) */}
        <div className="lg:col-span-7 print:col-span-12">
          <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl border border-slate-300 shadow-md font-sans text-xs space-y-6 max-w-2xl mx-auto print:shadow-none print:border-none print:p-0">
            {/* Store Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {businessProfile.businessName || 'Your Store Name'}
                </h2>
                <div className="text-[11px] text-slate-600 mt-1">
                  {businessProfile.businessCategory || 'Artisanal Studio'}
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  {businessProfile.contactDetails}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  {selectedTemplate === 'packing_slip'
                    ? 'PACKING SLIP'
                    : selectedTemplate === 'care_card'
                    ? 'CARE INSTRUCTION CARD'
                    : 'RETURN AUTHORIZATION'}
                </div>
                <div className="text-xs font-mono font-semibold text-slate-700 mt-1">
                  Order: {orderNumber}
                </div>
                <div className="text-[11px] text-slate-500">Date: {orderDate}</div>
              </div>
            </div>

            {/* Recipient & Destination Grid */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Ship To:
                </div>
                <div className="font-bold text-sm text-slate-900">{customerName}</div>
                <div className="text-xs text-slate-700 whitespace-pre-wrap mt-0.5">
                  {customerAddress}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Dispatch From:
                </div>
                <div className="font-bold text-xs text-slate-900">
                  {businessProfile.businessName} Dispatch Depot
                </div>
                <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Delivery Policy: {businessProfile.deliveryPolicy.slice(0, 110)}...
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-2">
                Enclosed Items & Quantities
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-[10px] uppercase font-bold text-slate-500">
                    <th className="py-2">SKU</th>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => (
                    <tr key={idx} className="text-xs">
                      <td className="py-2 font-mono text-[11px] text-slate-600">{item.sku}</td>
                      <td className="py-2 font-medium text-slate-900">{item.name}</td>
                      <td className="py-2 text-center font-bold">{item.quantity}</td>
                      <td className="py-2 text-right font-mono">{item.unitPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Customs Note Banner */}
            {customsNote && (
              <div className="p-3 bg-slate-100 rounded border border-slate-300 text-[11px] text-slate-700 space-y-0.5">
                <span className="font-bold text-slate-900">Cross-Border Customs Declaration:</span>
                <p>{customsNote}</p>
              </div>
            )}

            {/* Product Care Instructions & Return Terms */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-[11px]">
              <div>
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">
                  Care & Handling:
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {specialInstructions || businessProfile.productInformation}
                </p>
              </div>

              <div>
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">
                  Returns & Support:
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {businessProfile.returnPolicy}
                </p>
              </div>
            </div>

            {/* Footer Signature */}
            <div className="text-center pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
              <p className="font-medium text-slate-800">
                Thank you for supporting {businessProfile.businessName || 'independent makers'}!
              </p>
              <p>For questions regarding this delivery, please contact {businessProfile.contactDetails}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
