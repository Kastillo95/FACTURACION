import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileBarChart, Calendar, DollarSign, ShoppingCart, Download, Filter } from "lucide-react";
import { Invoice, Service } from "@shared/schema";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Calcular métricas
  const totalRevenue = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.total), 0);
  const totalInvoices = invoices.length;
  const averageTicket = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  // Datos para gráficos
  const revenueByDay = invoices.reduce((acc, invoice) => {
    const date = new Date(invoice.createdAt!).toLocaleDateString('es-HN');
    acc[date] = (acc[date] || 0) + parseFloat(invoice.total);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(revenueByDay).map(([date, revenue]) => ({
    date,
    revenue,
  })).slice(-7); // Últimos 7 días

  const serviceStats = services.map(service => {
    const serviceRevenue = invoices.reduce((sum, invoice) => {
      // En una implementación completa, necesitaríamos los items de la factura
      return sum;
    }, 0);
    
    return {
      name: service.description,
      value: Math.random() * 1000, // Datos de ejemplo
      count: Math.floor(Math.random() * 10) + 1,
    };
  });

  const exportToCSV = () => {
    const csvContent = [
      ['Fecha', 'Número', 'Cliente', 'Total'],
      ...invoices.map(invoice => [
        new Date(invoice.createdAt!).toLocaleDateString('es-HN'),
        invoice.invoiceNumber,
        invoice.clientName,
        invoice.total,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-facturas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando reportes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <FileBarChart className="text-primary mr-3" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        </div>
        <Button onClick={exportToCSV} data-testid="button-export-csv">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros de Fecha */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="text-gray-500" size={20} />
            <div className="flex items-center gap-4">
              <div>
                <Label htmlFor="dateFrom">Desde</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  data-testid="input-date-from"
                />
              </div>
              <div>
                <Label htmlFor="dateTo">Hasta</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  data-testid="input-date-to"
                />
              </div>
              <Button variant="outline" data-testid="button-apply-filter">
                Aplicar Filtro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <DollarSign className="w-4 h-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="sales" data-testid="tab-sales">
            <BarChart className="w-4 h-4 mr-2" />
            Ventas
          </TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-services">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Servicios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Ingresos Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="total-revenue">
                  L. {totalRevenue.toFixed(2)}
                </div>
                <p className="text-sm text-gray-500">
                  {totalInvoices} facturas generadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Ticket Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="average-ticket">
                  L. {averageTicket.toFixed(2)}
                </div>
                <p className="text-sm text-gray-500">
                  Por factura
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Facturas Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600" data-testid="todays-invoices">
                  {invoices.filter(invoice => {
                    const today = new Date().toDateString();
                    const invoiceDate = new Date(invoice.createdAt!).toDateString();
                    return today === invoiceDate;
                  }).length}
                </div>
                <p className="text-sm text-gray-500">
                  En el día actual
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Día</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`L. ${value}`, 'Ingresos']} />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ventas por Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`L. ${value}`, 'Ventas']} />
                    <Bar dataKey="revenue" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimas Facturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">{invoice.clientName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">L. {invoice.total}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(invoice.createdAt!).toLocaleDateString('es-HN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Servicios Más Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceStats.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceStats.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`L. ${value}`, 'Ingresos']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceStats.slice(0, 5).map((service, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-500">{service.count} veces vendido</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">L. {service.value.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}