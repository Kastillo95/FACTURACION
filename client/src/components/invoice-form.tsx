import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileText, Save, RefreshCw, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Service } from "@shared/schema";

const invoiceFormSchema = z.object({
  clientRtn: z.string().min(14, "RTN debe tener 14 dígitos").max(14, "RTN debe tener 14 dígitos"),
  clientName: z.string().min(2, "Nombre es requerido"),
});

interface InvoiceItem {
  serviceId: string;
  description: string;
  price: number;
  quantity: number;
  subtotal: number;
  taxable: boolean;
}

interface InvoiceFormProps {
  onInvoiceChange?: (invoice: any) => void;
}

export default function InvoiceForm({ onInvoiceChange }: InvoiceFormProps) {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const lastInvoiceDataRef = useRef<string>("");

  const form = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientRtn: "",
      clientName: "",
    },
  });

  // Fetch services
  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Fetch next invoice number
  const { data: nextNumberData } = useQuery({
    queryKey: ["/api/invoices/next-number"],
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: { client: any; items: InvoiceItem[] }) => {
      return await apiRequest("POST", "/api/invoices", data);
    },
    onSuccess: (response) => {
      const data = response.json();
      toast({
        title: "Factura creada exitosamente",
        description: "La factura ha sido generada correctamente.",
      });
      clearForm();
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la factura. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  // RTN validation mutation
  const validateRtnMutation = useMutation({
    mutationFn: async (rtn: string) => {
      return await apiRequest("POST", "/api/validate-rtn", { rtn });
    },
  });

  useEffect(() => {
    if (nextNumberData?.invoiceNumber) {
      setInvoiceNumber(nextNumberData.invoiceNumber);
    }
  }, [nextNumberData]);

  useEffect(() => {
    const calculations = calculateTotals();
    const clientValues = form.getValues();
    const invoiceData = {
      invoiceNumber,
      client: clientValues,
      items: invoiceItems,
      calculations,
    };
    
    // Only call onInvoiceChange if data has actually changed
    const dataString = JSON.stringify(invoiceData);
    if (dataString !== lastInvoiceDataRef.current) {
      lastInvoiceDataRef.current = dataString;
      onInvoiceChange?.(invoiceData);
    }
  }, [invoiceItems, invoiceNumber]);

  const calculateTotals = () => {
    let subtotalExempt = 0;
    let subtotalTaxable = 0;

    invoiceItems.forEach(item => {
      if (item.taxable) {
        subtotalTaxable += item.subtotal;
      } else {
        subtotalExempt += item.subtotal;
      }
    });

    const isv = subtotalTaxable * 0.15; // 15% ISV for Honduras
    const total = subtotalExempt + subtotalTaxable + isv;

    return {
      subtotalExempt: subtotalExempt.toFixed(2),
      subtotalTaxable: subtotalTaxable.toFixed(2),
      isv: isv.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const addService = () => {
    if (services.length > 0) {
      const firstService = services[0];
      const newItem: InvoiceItem = {
        serviceId: firstService.id,
        description: firstService.description,
        price: parseFloat(firstService.price),
        quantity: 1,
        subtotal: parseFloat(firstService.price),
        taxable: firstService.taxable,
      };
      setInvoiceItems([...invoiceItems, newItem]);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === "serviceId") {
      const service = services.find(s => s.id === value);
      if (service) {
        updatedItems[index].description = service.description;
        updatedItems[index].price = parseFloat(service.price);
        updatedItems[index].taxable = service.taxable;
        updatedItems[index].subtotal = parseFloat(service.price) * updatedItems[index].quantity;
      }
    }

    if (field === "quantity" || field === "price") {
      updatedItems[index].subtotal = updatedItems[index].price * updatedItems[index].quantity;
    }

    setInvoiceItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const clearForm = () => {
    form.reset();
    setInvoiceItems([]);
    queryClient.invalidateQueries({ queryKey: ["/api/invoices/next-number"] });
  };

  const onSubmit = async (data: z.infer<typeof invoiceFormSchema>) => {
    if (invoiceItems.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un servicio.",
        variant: "destructive",
      });
      return;
    }

    const invoiceData = {
      client: data,
      items: invoiceItems,
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  const handleRtnBlur = async () => {
    const rtn = form.getValues("clientRtn");
    if (rtn && rtn.length === 14) {
      validateRtnMutation.mutate(rtn);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <FileText className="text-secondary mr-3" size={20} />
          Nueva Factura
        </h3>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Invoice Number */}
          <div>
            <Label>Número de Factura</Label>
            <Input
              value={invoiceNumber}
              readOnly
              className="bg-gray-50"
              data-testid="input-invoice-number"
            />
          </div>

          {/* Client Information */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Información del Cliente</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientRtn">RTN del Cliente *</Label>
                <Input
                  id="clientRtn"
                  placeholder="0000000000000"
                  {...form.register("clientRtn")}
                  onBlur={handleRtnBlur}
                  data-testid="input-client-rtn"
                />
                {form.formState.errors.clientRtn && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.clientRtn.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="clientName">Nombre del Cliente *</Label>
                <Input
                  id="clientName"
                  placeholder="Nombre completo del cliente"
                  {...form.register("clientName")}
                  data-testid="input-client-name"
                />
                {form.formState.errors.clientName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.clientName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">Servicios</h4>
              <Button
                type="button"
                onClick={addService}
                disabled={servicesLoading || services.length === 0}
                data-testid="button-add-service"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Servicio
              </Button>
            </div>

            {/* Service Items Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Descripción</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Precio</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Cant.</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Subtotal</th>
                    <th className="w-12 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoiceItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No hay servicios agregados. Haga clic en "Agregar Servicio" para comenzar.
                      </td>
                    </tr>
                  ) : (
                    invoiceItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <Select
                            value={item.serviceId}
                            onValueChange={(value) => updateItem(index, "serviceId", value)}
                          >
                            <SelectTrigger className="border-0 focus:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          L. {item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                            className="w-16 text-center border-0 focus:ring-0"
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          L. {item.subtotal.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
                            data-testid={`button-remove-item-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax Calculations */}
          <div className="border-t pt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Desglose de Impuestos</h4>
              <div className="space-y-2 text-sm">
                {(() => {
                  const calculations = calculateTotals();
                  return (
                    <>
                      <div className="flex justify-between">
                        <span>Subtotal (Exento)</span>
                        <span data-testid="text-subtotal-exempt">L. {calculations.subtotalExempt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subtotal (Gravado)</span>
                        <span data-testid="text-subtotal-taxable">L. {calculations.subtotalTaxable}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ISV (15%)</span>
                        <span data-testid="text-isv">L. {calculations.isv}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total a Pagar</span>
                        <span data-testid="text-total">L. {calculations.total}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              type="submit" 
              disabled={createInvoiceMutation.isPending}
              className="bg-secondary hover:bg-red-700"
              data-testid="button-generate-invoice"
            >
              <Printer className="w-4 h-4 mr-2" />
              Generar Factura
            </Button>
            <Button type="button" className="bg-primary hover:bg-blue-800">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={clearForm}
              data-testid="button-clear-form"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
