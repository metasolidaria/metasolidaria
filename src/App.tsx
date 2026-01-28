import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import GroupPage from "./pages/GroupPage";
import ResetPassword from "./pages/ResetPassword";
import AdminPartners from "./pages/AdminPartners";
import AdminUsers from "./pages/AdminUsers";
import AdminGroups from "./pages/AdminGroups";
import AdminInvitations from "./pages/AdminInvitations";
import AdminEntities from "./pages/AdminEntities";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { InstallPWAPrompt } from "./components/InstallPWAPrompt";

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
          <Route path="/grupo/:id" element={<GroupPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/parceiros" element={<AdminPartners />} />
          <Route path="/admin/usuarios" element={<AdminUsers />} />
          <Route path="/admin/grupos" element={<AdminGroups />} />
          <Route path="/admin/convites" element={<AdminInvitations />} />
          <Route path="/admin/entidades" element={<AdminEntities />} />
          <Route path="/perfil" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <InstallPWAPrompt />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
