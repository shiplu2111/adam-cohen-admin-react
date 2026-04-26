import { Link, Outlet } from "react-router-dom";
import { Hexagon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AuthLayout() {
  const { settings } = useAuth();

  const siteName = settings?.site.name || "Adam Cohen Today";
  const nameParts = siteName.split(' ');
  const firstPart = nameParts[0];
  const restPart = nameParts.slice(1).join(' ');

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden surface-gradient">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, hsl(var(--gold) / 0.18), transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--gold) / 0.12), transparent 50%)"
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl overflow-hidden bg-secondary/30 border border-border/50 flex items-center justify-center">
              {settings?.site.logo ? (
                <img src={settings.site.logo} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <Hexagon className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <div className="font-display font-bold text-xl">
                {firstPart}<span className="gold-text"> {restPart}</span>
              </div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                {settings?.site.tagline || "Admin Suite"}
              </div>
            </div>
          </Link>

          <div className="max-w-md">
            <div className="gold-badge mb-6 inline-block">Premium Operations</div>
            <h1 className="font-display text-5xl font-bold leading-[1.1] mb-4">
              Run your <span className="gold-text">{siteName}</span> business with precision.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              A polished command center for projects, podcasts, testimonials, communications, and your team — all in one place.
            </p>
          </div>

          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} {siteName}. All rights reserved.</div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
