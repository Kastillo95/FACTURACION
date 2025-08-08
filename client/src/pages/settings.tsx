import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, Store, FileText, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import InventoryModal from "@/components/inventory-modal";
import { Service } from "@shared/schema";

const businessInfoSchema = z.object({
  businessName: z.string().min(2, "Nombre del negocio es requerido"),
  address: z.string().min(5, "Dirección es requerida"),
  phone: z.string().min(8, "Teléfono es requerido"),
  rtn: z.string().length(14, "RTN debe tener 14 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

const taxSettingsSchema = z.object({
  isvRate: z.number().min(0).max(100, "Tasa ISV debe estar entre 0 y 100"),
  includeIsvInPrices: z.boolean(),
  defaultTaxable: z.boolean(),
});

const receiptSettingsSchema = z.object({
  receiptHeader: z.string().optional(),
  receiptFooter: z.string().optional(),
  showLogo: z.boolean(),
  paperWidth: z.enum(["58mm", "80mm"]),
});

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business");
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const businessForm = useForm<z.infer<typeof businessInfoSchema>>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: "CARWASH PEÑA BLANCA",
      address: "Peña Blanca, Cortés, Frente a Cielos y Pisos",
      phone: "9464-8987",
      rtn: "08011987654321",
      email: "",
    },
  });

  const taxForm = useForm<z.infer<typeof taxSettingsSchema>>({
    resolver: zodResolver(taxSettingsSchema),
    defaultValues: {
      isvRate: 15,
      includeIsvInPrices: true,
      defaultTaxable: true,
    },
  });

  const receiptForm = useForm<z.infer<typeof receiptSettingsSchema>>({
    resolver: zodResolver(receiptSettingsSchema),
    defaultValues: {
      receiptHeader: "",
      receiptFooter: "¡Gracias por su preferencia!",
      showLogo: true,
      paperWidth: "58mm",
    },
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const saveBusinessInfo = useMutation({
    mutationFn: async (data: z.infer<typeof businessInfoSchema>) => {
      // En una implementación real, esto se guardaría en la base de datos
      localStorage.setItem("businessInfo", JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La información del negocio ha sido actualizada.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    },
  });

  const saveTaxSettings = useMutation({
    mutationFn: async (data: z.infer<typeof taxSettingsSchema>) => {
      localStorage.setItem("taxSettings", JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "Las configuraciones de impuestos han sido actualizadas.",
      });
    },
  });

  const saveReceiptSettings = useMutation({
    mutationFn: async (data: z.infer<typeof receiptSettingsSchema>) => {
      localStorage.setItem("receiptSettings", JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "Las configuraciones del recibo han sido actualizadas.",
      });
    },
  });

  const onBusinessSubmit = (data: z.infer<typeof businessInfoSchema>) => {
    saveBusinessInfo.mutate(data);
  };

  const onTaxSubmit = (data: z.infer<typeof taxSettingsSchema>) => {
    saveTaxSettings.mutate(data);
  };

  const onReceiptSubmit = (data: z.infer<typeof receiptSettingsSchema>) => {
    saveReceiptSettings.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Settings className="text-primary mr-3" size={32} />
        <h1 className="text-3xl font-bold text-gray-900">Configuraciones</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business" data-testid="tab-business">
            <Store className="w-4 h-4 mr-2" />
            Negocio
          </TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">
            <Database className="w-4 h-4 mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="taxes" data-testid="tab-taxes">
            <FileText className="w-4 h-4 mr-2" />
            Impuestos
          </TabsTrigger>
          <TabsTrigger value="receipts" data-testid="tab-receipts">
            <FileText className="w-4 h-4 mr-2" />
            Recibos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Información del Negocio</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Nombre del Negocio *</Label>
                    <Input
                      id="businessName"
                      {...businessForm.register("businessName")}
                      data-testid="input-business-name"
                    />
                    {businessForm.formState.errors.businessName && (
                      <p className="text-red-500 text-sm mt-1">
                        {businessForm.formState.errors.businessName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="rtn">RTN *</Label>
                    <Input
                      id="rtn"
                      {...businessForm.register("rtn")}
                      data-testid="input-business-rtn"
                    />
                    {businessForm.formState.errors.rtn && (
                      <p className="text-red-500 text-sm mt-1">
                        {businessForm.formState.errors.rtn.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      {...businessForm.register("phone")}
                      data-testid="input-business-phone"
                    />
                    {businessForm.formState.errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {businessForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...businessForm.register("email")}
                      data-testid="input-business-email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Dirección *</Label>
                  <Textarea
                    id="address"
                    {...businessForm.register("address")}
                    data-testid="input-business-address"
                  />
                  {businessForm.formState.errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {businessForm.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={saveBusinessInfo.isPending}
                  data-testid="button-save-business"
                >
                  {saveBusinessInfo.isPending ? "Guardando..." : "Guardar Información"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Servicios y Productos</h3>
                    <p className="text-gray-600">
                      Gestiona los servicios y productos disponibles
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowInventoryModal(true)}
                    data-testid="button-manage-inventory"
                  >
                    Gestionar Inventario
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {services.filter(s => s.category === 'Servicios').length}
                    </div>
                    <div className="text-sm text-gray-600">Servicios</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {services.filter(s => s.category === 'Productos').length}
                    </div>
                    <div className="text-sm text-gray-600">Productos</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {services.filter(s => s.stock !== -1 && s.stock !== null && s.stock < 10).length}
                    </div>
                    <div className="text-sm text-gray-600">Stock Bajo</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Impuestos</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={taxForm.handleSubmit(onTaxSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="isvRate">Tasa de ISV (%)</Label>
                  <Input
                    id="isvRate"
                    type="number"
                    step="0.01"
                    {...taxForm.register("isvRate", { valueAsNumber: true })}
                    data-testid="input-isv-rate"
                  />
                  {taxForm.formState.errors.isvRate && (
                    <p className="text-red-500 text-sm mt-1">
                      {taxForm.formState.errors.isvRate.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeIsvInPrices"
                    {...taxForm.register("includeIsvInPrices")}
                    data-testid="switch-include-isv"
                  />
                  <Label htmlFor="includeIsvInPrices">
                    Los precios incluyen ISV
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="defaultTaxable"
                    {...taxForm.register("defaultTaxable")}
                    data-testid="switch-default-taxable"
                  />
                  <Label htmlFor="defaultTaxable">
                    Productos gravados por defecto
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  disabled={saveTaxSettings.isPending}
                  data-testid="button-save-tax-settings"
                >
                  {saveTaxSettings.isPending ? "Guardando..." : "Guardar Configuración"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Recibos</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={receiptForm.handleSubmit(onReceiptSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="receiptHeader">Encabezado Personalizado</Label>
                  <Textarea
                    id="receiptHeader"
                    placeholder="Texto adicional para el encabezado del recibo"
                    {...receiptForm.register("receiptHeader")}
                    data-testid="input-receipt-header"
                  />
                </div>

                <div>
                  <Label htmlFor="receiptFooter">Pie de Página</Label>
                  <Textarea
                    id="receiptFooter"
                    {...receiptForm.register("receiptFooter")}
                    data-testid="input-receipt-footer"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showLogo"
                    {...receiptForm.register("showLogo")}
                    data-testid="switch-show-logo"
                  />
                  <Label htmlFor="showLogo">
                    Mostrar logo en el recibo
                  </Label>
                </div>

                <div>
                  <Label htmlFor="paperWidth">Ancho del Papel</Label>
                  <select
                    id="paperWidth"
                    {...receiptForm.register("paperWidth")}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    data-testid="select-paper-width"
                  >
                    <option value="58mm">58mm (Estándar)</option>
                    <option value="80mm">80mm (Ancho)</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  disabled={saveReceiptSettings.isPending}
                  data-testid="button-save-receipt-settings"
                >
                  {saveReceiptSettings.isPending ? "Guardando..." : "Guardar Configuración"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showInventoryModal && (
        <InventoryModal
          isOpen={showInventoryModal}
          onClose={() => setShowInventoryModal(false)}
        />
      )}
    </div>
  );
}