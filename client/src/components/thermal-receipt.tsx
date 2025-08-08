import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Printer } from "lucide-react";
import logoImage from "@assets/IMG-20250624-WA0043_1754679298693.jpg";

interface ThermalReceiptProps {
  invoiceData?: {
    invoiceNumber: string;
    client: {
      clientName: string;
      clientRtn: string;
    };
    items: Array<{
      description: string;
      price: number;
      quantity: number;
      subtotal: number;
    }>;
    calculations: {
      subtotalExempt: string;
      subtotalTaxable: string;
      isv: string;
      total: string;
    };
  } | null;
}

export default function ThermalReceipt({ invoiceData }: ThermalReceiptProps) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-HN');
  const formattedTime = currentDate.toLocaleTimeString('es-HN');

  const handlePrint = () => {
    // In a real application, this would integrate with thermal printer
    const receiptContent = document.getElementById('thermal-receipt-content');
    if (receiptContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Factura ${invoiceData?.invoiceNumber || ''}</title>
              <style>
                body { 
                  font-family: 'Courier New', monospace; 
                  width: 58mm; 
                  margin: 0; 
                  padding: 0; 
                  font-size: 12px; 
                }
                .text-center { text-align: center; }
                .text-bold { font-weight: bold; }
                .border-top { border-top: 1px solid #000; padding-top: 8px; margin-top: 8px; }
                .flex { display: flex; justify-content: space-between; }
              </style>
            </head>
            <body>
              ${receiptContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Receipt className="text-secondary mr-3" size={20} />
          Vista Previa
        </h3>

        {/* Thermal Receipt Mockup (58mm width) */}
        <div className="mx-auto" style={{ width: '320px' }}>
          <div 
            id="thermal-receipt-content"
            className="bg-white border border-gray-300 text-xs leading-tight thermal-receipt"
            style={{ fontFamily: "'Courier New', monospace" }}
            data-testid="thermal-receipt-preview"
          >
            {/* Receipt Header */}
            <div className="text-center p-3 border-b">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden bg-white flex items-center justify-center">
                <img 
                  src={logoImage} 
                  alt="CARWASH PEÑA BLANCA Logo" 
                  className="w-full h-full object-cover"
                  data-testid="receipt-logo"
                />
              </div>
              <div className="font-bold text-sm mb-1">CARWASH PEÑA BLANCA</div>
              <div className="text-xs">Peña Blanca, Cortés</div>
              <div className="text-xs">Frente a Cielos y Pisos</div>
              <div className="text-xs">Tel: 9464-8987</div>
              <div className="text-xs mt-1">
                RTN: <span data-testid="receipt-business-rtn">08011987654321</span>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="p-3 text-xs">
              <div className="flex justify-between mb-1">
                <span>Factura:</span>
                <span data-testid="receipt-invoice-number">
                  {invoiceData?.invoiceNumber || '---'}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Fecha:</span>
                <span data-testid="receipt-date">{formattedDate}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Hora:</span>
                <span data-testid="receipt-time">{formattedTime}</span>
              </div>
              <div className="mt-2">
                <div>
                  Cliente: <span data-testid="receipt-client-name">
                    {invoiceData?.client?.clientName || 'Sin especificar'}
                  </span>
                </div>
                <div>
                  RTN: <span data-testid="receipt-client-rtn">
                    {invoiceData?.client?.clientRtn || '---'}
                  </span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="border-t p-3">
              <div className="font-bold mb-2 text-xs">SERVICIOS:</div>
              {invoiceData?.items && invoiceData.items.length > 0 ? (
                invoiceData.items.map((item, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between">
                      <span className="flex-1 pr-2">
                        {item.description}
                      </span>
                      <span>{item.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {item.quantity} x L. {item.price.toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="mb-2 text-gray-500">
                  No hay servicios seleccionados
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t p-3">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal Exento:</span>
                  <span>
                    L. <span data-testid="receipt-subtotal-exempt">
                      {invoiceData?.calculations?.subtotalExempt || '0.00'}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal Gravado:</span>
                  <span>
                    L. <span data-testid="receipt-subtotal-taxable">
                      {invoiceData?.calculations?.subtotalTaxable || '0.00'}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ISV (15%):</span>
                  <span>
                    L. <span data-testid="receipt-isv">
                      {invoiceData?.calculations?.isv || '0.00'}
                    </span>
                  </span>
                </div>
                <div className="border-t pt-1 mt-2 flex justify-between font-bold">
                  <span>TOTAL:</span>
                  <span>
                    L. <span data-testid="receipt-total">
                      {invoiceData?.calculations?.total || '0.00'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-3 text-center">
              <div className="mb-2">¡Gracias por su preferencia!</div>
              <div className="text-xs">Factura generada por</div>
              <div className="text-xs">Sistema CARWASH v1.0</div>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <Button
          onClick={handlePrint}
          className="w-full mt-4 bg-green-600 hover:bg-green-700"
          data-testid="button-print-receipt"
        >
          <Printer className="w-4 h-4 mr-2" />
          Imprimir Ticket
        </Button>
      </CardContent>
    </Card>
  );
}
