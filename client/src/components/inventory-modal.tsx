import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Package, FileSpreadsheet, Download, Edit, Trash2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Service } from "@shared/schema";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InventoryModal({ isOpen, onClose }: InventoryModalProps) {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch services
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio.",
        variant: "destructive",
      });
    },
  });

  // Create/Update service mutation
  const saveServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      if (editingService) {
        return await apiRequest("PUT", `/api/services/${editingService.id}`, serviceData);
      } else {
        return await apiRequest("POST", "/api/services", serviceData);
      }
    },
    onSuccess: () => {
      toast({
        title: editingService ? "Servicio actualizado" : "Servicio creado",
        description: `El servicio ha sido ${editingService ? 'actualizado' : 'creado'} correctamente.`,
      });
      setEditingService(null);
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `No se pudo ${editingService ? 'actualizar' : 'crear'} el servicio.`,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Funcionalidad en desarrollo",
        description: "La importación desde Excel estará disponible pronto.",
      });
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Código,Descripción,Precio,Categoría,Gravable,Stock\n" +
      "LAV003,Lavado Express,80.00,Lavado,true,-1\n" +
      "DET001,Aspirado de Alfombras,50.00,Detailing,true,-1\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plantilla_servicios.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
  };

  const handleDeleteService = (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar este servicio?")) {
      deleteServiceMutation.mutate(id);
    }
  };

  const handleSaveService = (formData: FormData) => {
    const serviceData = {
      code: formData.get("code") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      category: formData.get("category") as string,
      taxable: formData.get("taxable") === "true",
      stock: parseInt(formData.get("stock") as string) || -1,
    };

    saveServiceMutation.mutate(serviceData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="text-secondary mr-3" size={24} />
            Gestión de Inventario
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Excel Import Section */}
          <Card>
            <CardContent className="p-4 bg-blue-50">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <FileSpreadsheet className="text-green-600 mr-2" size={20} />
                Importar desde Excel
              </h3>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="flex-1"
                  data-testid="input-excel-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadTemplate}
                  data-testid="button-download-template"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Plantilla
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Formato requerido: Código, Descripción, Precio, Categoría, Gravable, Stock
              </p>
            </CardContent>
          </Card>

          {/* Services/Products Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Código</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Descripción</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Precio</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Categoría</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Stock</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Cargando servicios...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No hay servicios registrados. Agregue el primer servicio.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id}>
                      <td className="px-4 py-3 text-sm">{service.code}</td>
                      <td className="px-4 py-3 text-sm">{service.description}</td>
                      <td className="px-4 py-3 text-sm text-right">L. {service.price}</td>
                      <td className="px-4 py-3 text-sm">{service.category}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        {service.stock === -1 ? "∞" : service.stock}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditService(service)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                          data-testid={`button-edit-service-${service.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600 hover:text-red-800"
                          data-testid={`button-delete-service-${service.id}`}
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

          {/* Add New Service Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setEditingService({} as Service)}
              data-testid="button-add-new-service"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Nuevo Servicio
            </Button>
          </div>

          {/* Service Form Modal */}
          {editingService && (
            <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingService.id ? 'Editar Servicio' : 'Nuevo Servicio'}
                  </DialogTitle>
                </DialogHeader>
                <form action={handleSaveService} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Código</Label>
                    <Input
                      id="code"
                      name="code"
                      defaultValue={editingService.code || ""}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      name="description"
                      defaultValue={editingService.description || ""}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingService.price || ""}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={editingService.category || ""}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock (-1 para ilimitado)</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      defaultValue={editingService.stock ?? -1}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="taxable"
                      name="taxable"
                      value="true"
                      defaultChecked={editingService.taxable ?? true}
                    />
                    <Label htmlFor="taxable">Gravable (ISV)</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingService(null)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={saveServiceMutation.isPending}
                    >
                      {editingService.id ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
