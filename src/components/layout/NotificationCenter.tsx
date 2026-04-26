import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { getEcho } from "@/lib/echo";
import { toast } from "@/components/ui/sonner";

interface AdminNotification {
  id: string;
  type: string;
  data: {
    type: string;
    application_id?: number;
    applicant_name?: string;
    applicant_email?: string;
    message: string;
  };
  read_at: string | null;
  created_at: string;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data);
      setUnreadCount(res.data.unread_count);
    } catch {
      // Silent — don't break UI if notifications fail
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time listener via Echo
  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const setupEcho = async () => {
      const echo = await getEcho();
      if (!echo || !mounted) return;

      const channel = echo.private(`App.Models.User.${user.id}`);
      
      channel.notification((notification: any) => {
          if (!mounted) return;
          console.log("Real-time notification arrived:", notification);
          
          // Show Toast
          const message = notification.message || notification.data?.message || "New activity notification";
          const type = notification.type || notification.data?.type;

          toast.success(message, {
            description: "Go to notifications for more details",
            action: {
              label: "View",
              onClick: () => {
                if (type === "new_application") {
                  navigate("/weekly-zoom/applications");
                } else if (type === "new_contact_inquiry") {
                  navigate("/contacts");
                }
              }
            }
          });

          // Refresh list and count
          fetchNotifications();
        });

      return () => {
        echo.leave(`App.Models.User.${user.id}`);
      };
    };

    let cleanup: (() => void) | undefined;
    setupEcho().then(res => cleanup = res);

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, [user?.id, fetchNotifications, navigate]);

  const markRead = async (id: string) => {
    await api.post(`/notifications/${id}/read`).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await api.post("/notifications/read-all").catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    setUnreadCount(0);
  };

  const handleClick = async (n: AdminNotification) => {
    if (!n.read_at) await markRead(n.id);
    setOpen(false);
    if (n.data.type === "new_application") {
      navigate("/weekly-zoom/applications");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#D4AF37] text-black text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-display font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/70 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      "w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border/40 last:border-0",
                      !n.read_at && "bg-primary/[0.04]",
                    )}
                  >
                    <div className={cn("mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      !n.read_at ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>
                      <Video className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug line-clamp-2">{n.data.message}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read_at && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-border bg-secondary/30">
                <button
                  onClick={() => { setOpen(false); navigate("/weekly-zoom/applications"); }}
                  className="text-xs text-primary hover:text-primary/70 transition-colors"
                >
                  View all applications →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
