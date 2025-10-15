import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import CalculatorPage from "@/pages/CalculatorPage";
import ResultsPage from "@/pages/ResultsPage";
import Logo from "@/assets/tekframeworks-logo.png";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 border-b bg-background/70 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <img
                  src={Logo}
                  alt="TekFrameworks Logo"
                  className="h-12 w-auto" // ⬅️ Increased logo size (previously h-8 or h-10)
                />
                <h1 className="text-xl font-semibold">CarbonSense v5</h1>
              </div>
              <ModeToggle />
            </header>

            {/* Main content */}
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                <Route path="/results" element={<ResultsPage />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="text-center py-4 text-sm text-muted-foreground border-t">
              © {new Date().getFullYear()} TekFrameworks. All rights reserved.
            </footer>
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
