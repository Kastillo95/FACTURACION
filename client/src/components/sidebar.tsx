import { FileText, BarChart3, Settings, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/IMG-20250624-WA0043_1754679298693.jpg";

export default function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    { path: "/", label: "Nueva Factura", icon: Home },
    { path: "/reports", label: "Reportes", icon: BarChart3 },
    { path: "/settings", label: "Configuración", icon: Settings }
  ];

  return (
    <div className="w-64 bg-primary text-white flex-shrink-0 relative fixed h-full">
      <div className="p-6">
        {/* Logo and Business Info */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-3 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src={logoImage} 
              alt="CARWASH PEÑA BLANCA Logo" 
              className="w-full h-full object-cover"
              data-testid="business-logo"
            />
          </div>
          <h1 className="text-xl font-bold">CARWASH</h1>
          <p className="text-sm text-blue-200">PEÑA BLANCA</p>
          <p className="text-xs text-blue-300 mt-1">
            RTN: <span data-testid="business-rtn">08011987654321</span>
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  data-testid={`nav-${item.path.replace('/', '') || 'home'}`}
                  className={`flex items-center w-full px-4 py-3 text-sm rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-blue-800 text-white"
                      : "text-blue-200 hover:text-white hover:bg-blue-800"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Business Contact Info */}
      <div className="absolute bottom-0 left-0 right-0 w-64 p-4 text-xs text-blue-300 border-t border-blue-700">
        <p data-testid="business-address">
          📍 Peña Blanca, Cortés
        </p>
        <p>Frente a Cielos y Pisos</p>
        <p data-testid="business-phone">
          📞 9464-8987
        </p>
        <div className="text-xs mt-2 font-bold">HORARIOS:</div>
        <div className="text-xs">Lun-Sáb: 8AM-5PM</div>
        <div className="text-xs">Dom: 8AM-3PM</div>
      </div>
    </div>
  );
}
