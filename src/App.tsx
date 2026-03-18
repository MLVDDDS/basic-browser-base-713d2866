import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

const Toaster = lazy(() =>
  import("@/components/ui/toaster").then((module) => ({ default: module.Toaster }))
);
const Sonner = lazy(() =>
  import("@/components/ui/sonner").then((module) => ({ default: module.Toaster }))
);
const ScrollToTop = lazy(() =>
  import("./components/ScrollToTop").then((module) => ({ default: module.ScrollToTop }))
);
const AnimatedRoutes = lazy(() =>
  import("./components/AnimatedRoutes").then((module) => ({ default: module.AnimatedRoutes }))
);
const BottomNav = lazy(() =>
  import("./components/layout/BottomNav").then((module) => ({ default: module.BottomNav }))
);

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Suspense fallback={null}>
            <Toaster />
            <Sonner />
            <ScrollToTop />
            <AnimatedRoutes />
            <BottomNav />
          </Suspense>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
