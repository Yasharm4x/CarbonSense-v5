// This comment is for triggering GitHub Pages redeploy

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeToggle } from "@/components/ThemeToggle"; // ✅ Theme toggle component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Global toasters */}
      <Toaster />
      <Sonner />

      {/* ✅ Header with logo + theme toggle */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between z-50">
        {/* ✅ Responsive enlarged logo */}
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}TekFrameworks.png`}
            alt="TekFrameworks Logo"
            className="h-12 md:h-14 w-auto object-contain transition-all duration-300"
          />
        </div>

        {/* ✅ Theme toggle aligned on same line */}
        <ThemeToggle />
      </div>

      {/* ✅ Main routes */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Add new routes above NotFound */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>

      {/* ✅ Footer */}
      <footer className="text-center text-sm text-muted-foreground py-6 border-t border-border mt-10">
        © 2025 <span className="font-semibold text-primary">TekFrameworks</span>. All Rights Reserved.
      </footer>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
  </QueryClientProvider>
);

export default App;
