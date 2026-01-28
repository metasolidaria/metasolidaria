import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import { InstallPWAPrompt } from "./components/InstallPWAPrompt";

// Lazy load non-critical routes to reduce initial bundle size
const GroupPage = lazy(() => import("./pages/GroupPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminPartners = lazy(() => import("./pages/AdminPartners"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminGroups = lazy(() => import("./pages/AdminGroups"));
const AdminInvitations = lazy(() => import("./pages/AdminInvitations"));
const AdminEntities = lazy(() => import("./pages/AdminEntities"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes cache
    },
  },
});

// Prefetch critical data for faster initial load
const prefetchCriticalData = async () => {
  // Prefetch hero stats
  queryClient.prefetchQuery({
    queryKey: ["heroStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_stats_public")
        .select("*")
        .single();
      if (error) throw error;
      return {
        totalGroups: Number(data?.total_groups) || 0,
        totalUsers: Number(data?.total_users) || 0,
        totalGoals: Number(data?.total_goals) || 0,
      };
    },
  });

  // Prefetch impact stats
  queryClient.prefetchQuery({
    queryKey: ["impactStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("impact_stats_public")
        .select("*");
      if (error) throw error;

      const donationsByType = {
        alimentos: 0,
        livros: 0,
        roupas: 0,
        cobertores: 0,
        sopas: 0,
        brinquedos: 0,
        higiene: 0,
        outro: 0,
      };

      let totalDonations = 0;
      data?.forEach((row: { donation_type: string; total_amount: number }) => {
        const amount = Number(row.total_amount) || 0;
        totalDonations += amount;
        const type = row.donation_type as keyof typeof donationsByType;
        if (type && donationsByType.hasOwnProperty(type)) {
          donationsByType[type] = amount;
        }
      });

      return { totalDonations, donationsByType };
    },
  });
};

// Start prefetching immediately
prefetchCriticalData();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/grupo/:id" element={<Suspense fallback={<PageLoader />}><GroupPage /></Suspense>} />
          <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
          <Route path="/admin/parceiros" element={<Suspense fallback={<PageLoader />}><AdminPartners /></Suspense>} />
          <Route path="/admin/usuarios" element={<Suspense fallback={<PageLoader />}><AdminUsers /></Suspense>} />
          <Route path="/admin/grupos" element={<Suspense fallback={<PageLoader />}><AdminGroups /></Suspense>} />
          <Route path="/admin/convites" element={<Suspense fallback={<PageLoader />}><AdminInvitations /></Suspense>} />
          <Route path="/admin/entidades" element={<Suspense fallback={<PageLoader />}><AdminEntities /></Suspense>} />
          <Route path="/perfil" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
        </Routes>
        <InstallPWAPrompt />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
