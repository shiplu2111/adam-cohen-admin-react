import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Shield, Mail, Briefcase, Sparkles, Mic, Star,
  MessageSquare, Settings, ChevronDown, Hexagon, FileText, BarChart3, Globe,
  Wrench, Video, CalendarDays, PhoneCall, Facebook, Twitter, Instagram, Linkedin, Youtube, MonitorPlay
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCms } from "@/hooks/use-cms";

interface NavItem {
  label: string;
  icon: any;
  to?: string;
  badge?: string;
  permission?: string;
  children?: { label: string; to: string; permission?: string }[];
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, to: "/" },
      { label: "Analytics", icon: BarChart3, to: "/analytics", permission: "read settings" },
    ],
  },
  {
    section: "Adam Cohen Today Content",
    items: [
      { label: "Projects", icon: Briefcase, to: "/projects", permission: "read projects" },
      { label: "Services", icon: Sparkles, to: "/services", permission: "read services" },
      { label: "Podcasts", icon: Mic, to: "/podcasts", permission: "read podcasts" },
      { label: "Cohen TV", icon: MonitorPlay, to: "/cohen-tv", permission: "read content" },
      { label: "Podcast Guests", icon: Users, to: "/podcast-registrations", permission: "read content" },
      { label: "Testimonials", icon: Star, to: "/testimonials", permission: "read testimonials" },
      { label: "Contact Inquiries", icon: MessageSquare, to: "/contacts", badge: "3", permission: "read contacts" },
    ],
  },
  {
    section: "Engagement",
    items: [
      {
        label: "Weekly Zoom", icon: Video, permission: "read content", children: [
          { label: "Settings & Content", to: "/weekly-zoom" },
          { label: "Applications", to: "/weekly-zoom/applications" },
        ],
      },
      { label: "Upcoming Events", icon: CalendarDays, to: "/events", badge: "4", permission: "read content" },
      { label: "Book a Call", icon: PhoneCall, to: "/book-a-call", permission: "read content" },
    ],
  },
  {
    section: "Communication",
    items: [
      { label: "Emails", icon: Mail, to: "/emails", badge: "2", permission: "read settings" },
      { label: "Subscribers", icon: Users, to: "/subscribers", permission: "manage content" },
      {
        label: "Pages", icon: FileText, permission: "manage content", children: [
          { label: "Homepage", to: "/pages" },
          { label: "About Page", to: "/pages/about" },
        ]
      },
    ],
  },
  {
    section: "Access",
    items: [
      { label: "Employees", icon: Users, to: "/employees", permission: "read employees" },
      { label: "Roles & Permissions", icon: Shield, to: "/roles", permission: "read roles" },
    ],
  },
  {
    section: "System",
    items: [
      {
        label: "Settings", icon: Settings, permission: "read settings", children: [

          { label: "Website", to: "/settings/website" },
          { label: "Contact Info", to: "/settings/contact" },
          { label: "Email (SMTP)", to: "/settings/email" },
          { label: "Pusher", to: "/settings/pusher" },
          { label: "Notifications", to: "/settings/notifications" },
        ]
      },
      { label: "Integrations", icon: Globe, to: "/integrations", permission: "read settings" },
      { label: "Maintenance", icon: Wrench, to: "/maintenance", permission: "read settings" },
    ],
  },
];

export function Sidebar({ collapsed, mobileOpen, onMobileClose }: { collapsed: boolean; mobileOpen: boolean; onMobileClose: () => void }) {
  const location = useLocation();
  const { hasPermission, settings } = useAuth();

  const isInGroup = (children?: { to: string }[]) => children?.some(c => location.pathname.startsWith(c.to));

  const { items: contacts } = useCms<any>("contact-inquiries");
  const newContactsCount = contacts.filter(c => c.status === "new").length;

  const [pendingApps, setPendingApps] = useState(0);
  useEffect(() => {
    import("@/lib/axios").then(({ default: api }) => {
      const load = () => api.get("/weekly-zoom-applications", { params: { status: "pending" } })
        .then(r => setPendingApps(r.data.counts?.pending ?? 0)).catch(() => { });
      load();
      const id = setInterval(load, 30_000);
      return () => clearInterval(id);
    });
  }, []);

  const filteredNav = NAV.map(group => ({
    ...group,
    items: group.items.map(item => {
      if (item.to === "/contacts") {
        return { ...item, badge: newContactsCount > 0 ? String(newContactsCount) : undefined };
      }
      if (item.children) {
        return {
          ...item,
          children: item.children.map(c =>
            c.to === "/weekly-zoom/applications" && pendingApps > 0
              ? { ...c, badge: String(pendingApps) }
              : c,
          ),
        };
      }
      return item;
    }).filter(item => !item.permission || hasPermission(item.permission))
  })).filter(group => group.items.length > 0);

  const content = (
    <div className={cn("h-full flex flex-col bg-sidebar border-r border-sidebar-border transition-[width] duration-300", collapsed ? "w-[72px]" : "w-[260px]")}>
      <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border shrink-0">
        <div className="h-9 w-9 rounded-xl overflow-hidden grid place-items-center shrink-0 bg-secondary/30 border border-border/50">
          {settings?.site.logo ? (
            <img src={settings.site.logo} alt="Logo" className="h-full w-full object-contain" />
          ) : (
            <Hexagon className="h-5 w-5 text-primary" />
          )}
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-display font-bold text-base leading-tight">
              {settings?.site.name ? (
                <>
                  {settings.site.name.split(' ')[0]}
                  <span className="gold-text"> {settings.site.name.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>Adam<span className="gold-text"> Cohen Today</span></>
              )}
            </div>
            <div className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              {settings?.site.tagline || "Admin Suite"}
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-6">
        {filteredNav.map(group => (
          <div key={group.section}>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {group.section}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map(item => (
                <NavGroup key={item.label} item={item} collapsed={collapsed} defaultOpen={isInGroup(item.children)} onClick={onMobileClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
              <a key={i} href="#" aria-label="social" className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        ) : (
          <div>
            <div className="px-2 mb-2 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">Follow us</div>
            <div className="flex items-center gap-1">
              {[
                { Icon: Facebook, label: "Facebook", href: "#" },
                { Icon: Instagram, label: "Instagram", href: "#" },
                { Icon: Twitter, label: "Twitter", href: "#" },
                { Icon: Linkedin, label: "LinkedIn", href: "#" },
                { Icon: Youtube, label: "YouTube", href: "#" },
              ].map(({ Icon, label, href }) => (
                <a key={label} href={href} aria-label={label} className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block sticky top-0 h-screen z-30">{content}</aside>
      <div className={cn("md:hidden fixed inset-0 z-50 transition-opacity", mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onMobileClose} />
        <div className={cn("absolute left-0 top-0 h-full transition-transform", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          {content}
        </div>
      </div>
    </>
  );
}

function NavGroup({ item, collapsed, defaultOpen, onClick }: { item: NavItem; collapsed: boolean; defaultOpen?: boolean; onClick: () => void }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors")}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </>
          )}
        </button>
        {!collapsed && open && (
          <div className="ml-7 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
            {item.children.map(c => (
              <NavLink
                key={c.to}
                to={c.to}
                onClick={onClick}
                className={({ isActive }) => cn(
                  "flex items-center justify-between py-1.5 px-2 rounded-md text-[13px] text-muted-foreground hover:text-foreground transition-colors",
                  isActive && "text-primary font-medium"
                )}
              >
                <span>{c.label}</span>
                {(c as any).badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400">{(c as any).badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to!}
      end={item.to === "/"}
      onClick={onClick}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors relative",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-r before:bg-primary"
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="flex-1">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/15 text-primary">{item.badge}</span>
      )}
    </NavLink>
  );
}
