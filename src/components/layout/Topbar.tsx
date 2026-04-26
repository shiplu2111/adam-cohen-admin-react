import { Menu, Moon, Sun, Search, LogOut, User, Settings, Mail } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationCenter } from "./NotificationCenter";

export function Topbar({ onToggleSidebar, onMobileMenu }: { onToggleSidebar: () => void; onMobileMenu: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name.split(" ").map(p => p[0]).slice(0, 2).join("") ?? "AM";

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="h-full flex items-center gap-3 px-4 md:px-6">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenu}>
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:flex" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden md:flex items-center max-w-md w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search anything..." className="pl-9 bg-secondary/40 border-border/60 h-9" />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">⌘K</kbd>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1 ml-auto">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>

          <NotificationCenter />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 ml-2 pl-2 pr-1 py-1 rounded-full hover:bg-secondary transition-colors">
                <Avatar className="h-8 w-8 ring-2 ring-primary/30">
                  <AvatarFallback className="gold-bg text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left pr-1">
                  <div className="text-xs font-semibold leading-tight">{user?.name}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{user?.role}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="font-semibold">{user?.name}</div>
                <div className="text-xs text-muted-foreground font-normal">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}><User className="h-4 w-4 mr-2" /> Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/emails")}><Mail className="h-4 w-4 mr-2" /> Inbox</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings/general")}><Settings className="h-4 w-4 mr-2" /> Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => { logout(); navigate("/login"); }}
              >
                <LogOut className="h-4 w-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
