import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import InvoicePage from "@/pages/invoice";
import SettingsPage from "@/pages/settings";
import ReportsPage from "@/pages/reports";
import Sidebar from "@/components/sidebar";

function Router() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Switch>
          <Route path="/" component={InvoicePage} />
          <Route path="/invoice" component={InvoicePage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/reports" component={ReportsPage} />
          <Route component={() => <div className="p-8 text-center">404 - Página no encontrada</div>} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
