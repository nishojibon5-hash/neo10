import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, memo } from "react";
import RequireAuth from "./lib/RequireAuth";

const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
));

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Placeholder = lazy(() => import("./pages/Placeholder"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const MarketplaceCreate = lazy(() => import("./pages/MarketplaceCreate"));
const MarketplaceItem = lazy(() => import("./pages/MarketplaceItem"));
const AdsCreate = lazy(() => import("./pages/AdsCreate"));
const AdsDashboard = lazy(() => import("./pages/AdsDashboard"));
const Messages = lazy(() => import("./pages/Messages"));
const Friends = lazy(() => import("./pages/Friends"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Splash = lazy(() => import("./pages/Splash"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Index />
              </RequireAuth>
            }
          />
          <Route path="/splash" element={<Splash />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <RequireAuth>
                <ProfileEdit />
              </RequireAuth>
            }
          />
          <Route path="/u/:id" element={<UserProfile />} />
          <Route
            path="/friends"
            element={
              <RequireAuth>
                <Friends />
              </RequireAuth>
            }
          />
          <Route
            path="/videos"
            element={
              <RequireAuth>
                <Placeholder title="Videos" />
              </RequireAuth>
            }
          />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <Notifications />
              </RequireAuth>
            }
          />
          <Route
            path="/messages"
            element={
              <RequireAuth>
                <Messages />
              </RequireAuth>
            }
          />
          <Route
            path="/create"
            element={
              <RequireAuth>
                <Placeholder title="Create" />
              </RequireAuth>
            }
          />
          <Route
            path="/marketplace/create"
            element={
              <RequireAuth>
                <MarketplaceCreate />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/search"
            element={
              <RequireAuth>
                <Placeholder title="Search" />
              </RequireAuth>
            }
          />
          <Route
            path="/ads/create"
            element={
              <RequireAuth>
                <AdsCreate />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <Placeholder title="Admin Panel" />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Placeholder title="Settings" />
              </RequireAuth>
            }
          />
          <Route
            path="/ads/dashboard"
            element={
              <RequireAuth>
                <AdsDashboard />
              </RequireAuth>
            }
          />
          <Route path="/marketplace/item/:id" element={<MarketplaceItem />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
