import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Bell, Globe, Mail, MapPin, Settings as SettingsIcon, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/settings/website", label: "Website", icon: Globe },
  { to: "/settings/contact", label: "Contact info", icon: MapPin },
  { to: "/settings/email", label: "Email (SMTP)", icon: Mail },
  { to: "/settings/pusher", label: "Pusher", icon: Zap },
  { to: "/settings/notifications", label: "Notifications", icon: Bell },
];

export default function SettingsLayout() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage workspace configuration and integrations." />
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <nav className="glass-card p-2 h-fit">
          {TABS.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </NavLink>
          ))}
        </nav>
        <div><Outlet /></div>
      </div>
    </div>
  );
}
