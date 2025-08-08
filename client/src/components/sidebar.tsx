import { Car, FileText, Package, Users, BarChart3, Settings } from "lucide-react";
import logoImage from "@assets/IMG-20250624-WA0043_1754679298693.jpg";

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: "invoicing", label: "Nueva Factura", icon: FileText, active: true },
    { id: "inventory", label: "Inventario", icon: Package },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "reports", label: "Reportes", icon: BarChart3 },
    { id: "settings", label: "Configuración", icon: Settings }
  ];

  return (
    <div className="w-64 bg-primary text-white flex-shrink-0 relative">
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
            const isActive = currentSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                data-testid={`nav-${item.id}`}
                className={`flex items-center w-full px-4 py-3 text-sm rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-800 text-white"
                    : "text-blue-200 hover:text-white hover:bg-blue-800"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
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
      </div>
    </div>
  );
}
