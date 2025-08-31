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
import Login from "./pages/Login";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/u/:id" element={<UserProfile />} />
          <Route path="/friends" element={<Placeholder title="Friends" />} />
          <Route path="/videos" element={<Placeholder title="Videos" />} />
          <Route path="/marketplace" element={<Placeholder title="Marketplace" />} />
          <Route path="/notifications" element={<Placeholder title="Notifications" />} />
          <Route path="/messages" element={<Placeholder title="Messenger" />} />
          <Route path="/create" element={<Placeholder title="Create" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Placeholder title="Search" />} />
          <Route path="/ads/create" element={<Placeholder title="Create Ads" />} />
          <Route path="/admin" element={<Placeholder title="Admin Panel" />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
