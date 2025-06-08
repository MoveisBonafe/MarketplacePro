import React from "react";
import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/auth-context";
import { CartProvider } from "./contexts/cart-context";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import StoreCatalog from "@/pages/store-catalog";
import RestaurantCatalog from "@/pages/restaurant-catalog";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/loja" component={StoreCatalog} />
      <Route path="/restaurante" component={RestaurantCatalog} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Hash-based router for GitHub Pages compatibility
const useHashLocation = () => {
  const [loc, setLoc] = React.useState(() => 
    window.location.hash.replace(/^#/, "") || "/"
  );
  
  React.useEffect(() => {
    const handler = () => setLoc(window.location.hash.replace(/^#/, "") || "/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  
  const navigate = React.useCallback((to: string) => {
    window.location.hash = to;
  }, []);
  
  return [loc, navigate];
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router hook={useHashLocation}>
              <AppRouter />
            </Router>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
