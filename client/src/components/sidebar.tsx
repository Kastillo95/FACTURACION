import { FileText, BarChart3, Settings, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/IMG-20250624-WA0043_1754679298693.jpg";

export default function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    { path: "/", label: "Nueva Factura", icon: Home },
    { path: "/invoices", label: "Facturas", icon: FileText },
    { path: "/reports", label: "Reportes", icon: BarChart3 },
    { path: "/settings", label: "Configuración", icon: Settings }
  ];

  return (
    <div className="w-full bg-white shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      {/* Header Principal */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo y Empresa */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 shadow-md">
            <img 
              src={logoImage} 
              alt="CARWASH PEÑA BLANCA Logo" 
              className="w-full h-full object-cover"
              data-testid="business-logo"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">CARWASH PEÑA BLANCA</h1>
            <p className="text-sm text-gray-500">
              RTN: <span data-testid="business-rtn" className="font-mono">08011987654321</span>
            </p>
          </div>
        </div>

        {/* Navigation Menu Horizontal */}
        <nav className="flex space-x-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  data-testid={`nav-${item.path.replace('/', '') || 'home'}`}
                  className={`flex items-center px-6 py-3 text-sm rounded-full transition-all duration-200 cursor-pointer group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-2 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Business Contact Info */}
        <div className="text-right text-xs text-gray-500">
          <p data-testid="business-address" className="flex items-center justify-end mb-1">
            <span className="mr-1">📍</span>
            Peña Blanca, Cortés
          </p>
          <p data-testid="business-phone" className="flex items-center justify-end">
            <span className="mr-1">📞</span>
            9464-8987
          </p>
          <div className="text-xs mt-1 font-semibold text-gray-600">Lun-Sáb: 8AM-5PM | Dom: 8AM-3PM</div>
        </div>
      </div>
    </div>
  );
}
