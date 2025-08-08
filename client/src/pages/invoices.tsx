import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Eye, Download, Calendar } from "lucide-react";
import { Invoice } from "@shared/schema";
import ThermalReceipt from "@/components/thermal-receipt";

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  // Filtrar facturas por término de búsqueda
  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientRtn.includes(searchTerm)
  );

  const handleViewReceipt = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowReceipt(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando facturas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <FileText className="text-primary mr-3" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Facturas Guardadas</h1>
              <p className="text-gray-600">Historial de todas las facturas generadas</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {invoices.length}
            </div>
            <div className="text-sm text-gray-500">Facturas Totales</div>
          </div>
        </div>

        {/* Búsqueda */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Search className="text-gray-500" size={20} />
              <Input
                placeholder="Buscar por número de factura, cliente o RTN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                data-testid="input-search-invoices"
              />
              <Badge variant="outline" className="text-sm">
                {filteredInvoices.length} de {invoices.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Facturas */}
        <div className="grid grid-cols-1 gap-4">
          {filteredInvoices.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? "No se encontraron facturas" : "No hay facturas guardadas"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? "Intenta con otros términos de búsqueda" : "Las facturas aparecerán aquí cuando las generes"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(invoice.createdAt!).toLocaleDateString('es-HN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-gray-900">
                          {invoice.clientName}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          RTN: {invoice.clientRtn}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500">Subtotal Gravado</div>
                        <div className="font-medium">L. {invoice.subtotalTaxable}</div>
                        <div className="text-sm text-gray-500">ISV: L. {invoice.isv}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="text-xl font-bold text-green-600">
                          L. {invoice.total}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReceipt(invoice)}
                        data-testid={`button-view-invoice-${invoice.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrintReceipt}
                        data-testid={`button-print-invoice-${invoice.id}`}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Imprimir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal de Recibo */}
        {showReceipt && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-medium">Recibo Térmico</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintReceipt}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Imprimir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReceipt(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <ThermalReceipt 
                  invoiceData={{
                    ...selectedInvoice,
                    client: {
                      clientName: selectedInvoice.clientName,
                      clientRtn: selectedInvoice.clientRtn
                    },
                    items: [] // En una implementación completa, cargaríamos los items
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}