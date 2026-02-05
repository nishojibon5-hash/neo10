import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import UserProfile from "./pages/UserProfile";
import Placeholder from "./pages/Placeholder";
import Marketplace from "./pages/Marketplace";
import MarketplaceCreate from "./pages/MarketplaceCreate";
import MarketplaceItem from "./pages/MarketplaceItem";
import AdsCreate from "./pages/AdsCreate";
import AdsDashboard from "./pages/AdsDashboard";
import Messages from "./pages/Messages";
import Friends from "./pages/Friends";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Splash from "./pages/Splash";
import RequireAuth from "./lib/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/profile/edit" element={<RequireAuth><ProfileEdit /></RequireAuth>} />
          <Route path="/u/:id" element={<UserProfile />} />
          <Route path="/friends" element={<RequireAuth><Friends /></RequireAuth>} />
          <Route path="/videos" element={<RequireAuth><Placeholder title="Videos" /></RequireAuth>} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path="/create" element={<RequireAuth><Placeholder title="Create" /></RequireAuth>} />
          <Route path="/marketplace/create" element={<RequireAuth><MarketplaceCreate /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<RequireAuth><Placeholder title="Search" /></RequireAuth>} />
          <Route path="/ads/create" element={<RequireAuth><AdsCreate /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><Placeholder title="Admin Panel" /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Placeholder title="Settings" /></RequireAuth>} />
          <Route path="/ads/dashboard" element={<RequireAuth><AdsDashboard /></RequireAuth>} />
          <Route path="/marketplace/item/:id" element={<MarketplaceItem />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
