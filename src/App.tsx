// This comment is for triggering GitHub Pages redeploy

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeToggle } from "@/components/ThemeToggle"; // ✅ Add ThemeToggle

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Global toasters */}
      <Toaster />
      <Sonner />

      {/* ✅ Logo - top-left corner */}
      <div className="absolute top-4 left-6 flex items-center gap-2 z-50">
        <img
          src={`${import.meta.env.BASE_URL}TekFrameworks.png`}
          alt="TekFrameworks Logo"
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* ✅ Theme toggle - top-right corner */}
      <ThemeToggle />

      {/* Main app routes */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>

      {/* ✅ Footer */}
      <footer className="text-center text-sm text-muted-foreground py-6 border-t border-border mt-8">
        © 2025 <span className="font-semibold text-primary">Tekframeworks</span>. All Rights Reserved.
      </footer>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
