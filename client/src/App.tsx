import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import InvoicePage from "@/pages/invoice";

function Router() {
  return (
    <Switch>
      <Route path="/" component={InvoicePage} />
      <Route path="/invoice" component={InvoicePage} />
      <Route component={() => <div>404 Not Found</div>} />
    </Switch>
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
