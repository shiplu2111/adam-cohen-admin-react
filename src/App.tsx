import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";

import Login from "@/pages/auth/Login";

import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Profile from "@/pages/Profile";
import Employees from "@/pages/Employees";
import Roles from "@/pages/Roles";
import Emails from "@/pages/Emails";
import WeeklyZoomManager from "@/pages/cms/WeeklyZoomManager";
import WeeklyZoomApplications from "@/pages/cms/WeeklyZoomApplications";
import LiveEventsManager from "@/pages/cms/LiveEventsManager";
import Events from "@/pages/Events";
import BookACall from "@/pages/BookACall";

import Projects from "@/pages/cms/Projects";
import Services from "@/pages/cms/Services";
import Podcasts from "@/pages/cms/Podcasts";
import CohenTvManager from "@/pages/cms/CohenTvManager";
import Testimonials from "@/pages/cms/Testimonials";
import Contacts from "@/pages/cms/Contacts";
import SubscriberManager from "@/pages/cms/SubscriberManager";
import HomepageManager from "@/pages/cms/HomepageManager";
import AboutManager from "@/pages/cms/AboutManager";

import SettingsLayout from "@/pages/settings/SettingsLayout";
import { WebsiteSettings, EmailSettings, PusherSettings, NotificationSettings, ContactSettings } from "@/pages/settings/SettingsPages";

import Placeholder from "@/pages/Placeholder";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
              </Route>

              {/* Dashboard */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />

                <Route path="/projects" element={<Projects />} />
                <Route path="/services" element={<Services />} />
                <Route path="/podcasts" element={<Podcasts />} />
                <Route path="/cohen-tv" element={<CohenTvManager />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/subscribers" element={<SubscriberManager />} />

                <Route path="/emails" element={<Emails />} />
                <Route path="/weekly-zoom" element={<WeeklyZoomManager />} />
                <Route path="/weekly-zoom/applications" element={<WeeklyZoomApplications />} />
                <Route path="/events" element={<LiveEventsManager />} />
                <Route path="/book-a-call" element={<BookACall />} />
                <Route path="/pages" element={<HomepageManager />} />
                <Route path="/pages/about" element={<AboutManager />} />
                <Route path="/pages/drafts" element={<Placeholder title="Page Drafts" />} />
                <Route path="/pages/trash" element={<Placeholder title="Page Trash" />} />

                <Route path="/employees" element={<Employees />} />
                <Route path="/roles" element={<Roles />} />

                <Route path="/integrations" element={<Placeholder title="Integrations" description="Connect Apex Ascend with your favorite tools." />} />
                <Route path="/maintenance" element={<Placeholder title="Maintenance" description="Backups, cache, queues, logs." />} />

                <Route path="/settings" element={<SettingsLayout />}>
                  <Route index element={<Navigate to="/settings/website" replace />} />
                  <Route path="website" element={<WebsiteSettings />} />
                  <Route path="contact" element={<ContactSettings />} />
                  <Route path="email" element={<EmailSettings />} />
                  <Route path="pusher" element={<PusherSettings />} />
                  <Route path="notifications" element={<NotificationSettings />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
