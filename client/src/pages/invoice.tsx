import { useState, useCallback } from "react";
import InvoiceForm from "@/components/invoice-form";
import ThermalReceipt from "@/components/thermal-receipt";
import InventoryModal from "@/components/inventory-modal";

export default function InvoicePage() {
  const [showInventory, setShowInventory] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const handleInvoiceChange = useCallback((invoice: any) => {
    setInvoiceData(invoice);
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sistema de Facturación
          </h2>
          <p className="text-gray-600">
            Crear nueva factura para servicios de lavado
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <InvoiceForm 
              onInvoiceChange={handleInvoiceChange}
            />
          </div>
          
          <div className="lg:col-span-1">
            <ThermalReceipt 
              invoiceData={invoiceData}
            />
          </div>
        </div>
      </div>

      <InventoryModal 
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
      />
    </div>
  );
}
