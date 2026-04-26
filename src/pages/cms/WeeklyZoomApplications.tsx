import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import {
  CheckCircle2, XCircle, Eye, Trash2, Search, Loader2,
  Users, Clock, ThumbsDown, Mail, Phone, Building, Video,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { formatDistanceToNow, format } from "date-fns";

type Status = "all" | "pending" | "approved" | "rejected";

interface Application {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  background?: string;
  why_join: string;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
  reviewed_at?: string;
  reviewer?: { name: string };
  created_at: string;
}

const STATUS_STYLES = {
  pending:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_ICONS = {
  pending:  Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

export default function WeeklyZoomApplications() {
  const [tab, setTab] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  // Detail / approve / reject dialogs
  const [detailApp, setDetailApp] = useState<Application | null>(null);
  const [rejectApp, setRejectApp] = useState<Application | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (tab !== "all") params.status = tab;
      if (search) params.search = search;
      const res = await api.get("/weekly-zoom-applications", { params });
      setApplications(res.data.data.data ?? res.data.data);
      setCounts(res.data.counts);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => {
    const t = setTimeout(fetchApplications, 300);
    return () => clearTimeout(t);
  }, [fetchApplications]);

  const approve = async (app: Application) => {
    setActionLoading(true);
    try {
      await api.post(`/weekly-zoom-applications/${app.id}/approve`);
      toast.success(`${app.name} approved! Confirmation email sent.`);
      fetchApplications();
      setDetailApp(null);
    } catch {
      toast.error("Failed to approve application");
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    if (!rejectApp) return;
    setActionLoading(true);
    try {
      await api.post(`/weekly-zoom-applications/${rejectApp.id}/reject`, { admin_notes: rejectNotes });
      toast.success(`${rejectApp.name}'s application has been rejected.`);
      fetchApplications();
      setRejectApp(null);
      setRejectNotes("");
      setDetailApp(null);
    } catch {
      toast.error("Failed to reject application");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteApp = async (id: number) => {
    try {
      await api.delete(`/weekly-zoom-applications/${id}`);
      toast.success("Application deleted");
      fetchApplications();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const TABS: { id: Status; label: string; count: number }[] = [
    { id: "all",      label: "All",      count: counts.all },
    { id: "pending",  label: "Pending",  count: counts.pending },
    { id: "approved", label: "Approved", count: counts.approved },
    { id: "rejected", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Zoom Applications"
        description="Review, approve, or reject applicants for the Weekly Zoom coaching group."
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total",    count: counts.all,      color: "text-foreground",   bg: "bg-secondary/50" },
          { label: "Pending",  count: counts.pending,  color: "text-amber-400",    bg: "bg-amber-500/10" },
          { label: "Approved", count: counts.approved, color: "text-green-400",    bg: "bg-green-500/10" },
          { label: "Rejected", count: counts.rejected, color: "text-red-400",      bg: "bg-red-500/10" },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={cn("glass-card p-5 flex flex-col", bg)}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <p className={cn("text-3xl font-display font-bold", color)}>{count}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 border border-border">
          {TABS.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                tab === id ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              {count > 0 && (
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                  id === "pending" && "bg-amber-500/15 text-amber-400",
                  id === "approved" && "bg-green-500/15 text-green-400",
                  id === "rejected" && "bg-red-500/15 text-red-400",
                  id === "all" && "bg-primary/15 text-primary",
                )}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, company..."
            className="pl-9 w-72"
          />
        </div>
      </div>

      {/* Applications table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <Users className="h-12 w-12 mb-3 opacity-20" />
            <p>No applications found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Applicant</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Company</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Applied</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {applications.map((app) => {
                  const StatusIcon = STATUS_ICONS[app.status];
                  return (
                    <tr key={app.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium">{app.name}</p>
                          <p className="text-xs text-muted-foreground">{app.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{app.company || "—"}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border", STATUS_STYLES[app.status])}>
                          <StatusIcon className="h-3 w-3" />{app.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => setDetailApp(app)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {app.status === "pending" && (
                            <>
                              <Button
                                size="sm" variant="ghost"
                                className="h-8 px-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 text-xs"
                                onClick={() => approve(app)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm" variant="ghost"
                                className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                                onClick={() => { setRejectApp(app); setRejectNotes(""); }}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          <DeleteConfirm
                            trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>}
                            title="Delete this application?"
                            onConfirm={() => deleteApp(app.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!detailApp} onOpenChange={(o) => !o && setDetailApp(null)}>
        <DialogContent className="sm:max-w-[560px]">
          {detailApp && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  {detailApp.name}'s Application
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border", STATUS_STYLES[detailApp.status])}>
                    {detailApp.status}
                  </span>
                  {detailApp.reviewed_at && (
                    <span className="text-xs text-muted-foreground">
                      Reviewed {format(new Date(detailApp.reviewed_at), "MMM d, yyyy")}
                      {detailApp.reviewer && ` by ${detailApp.reviewer.name}`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 text-primary" />{detailApp.email}
                  </div>
                  {detailApp.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-primary" />{detailApp.phone}
                    </div>
                  )}
                  {detailApp.company && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="h-3.5 w-3.5 text-primary" />{detailApp.company}
                    </div>
                  )}
                </div>

                {detailApp.background && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Background</Label>
                    <p className="text-sm bg-secondary/40 rounded-lg p-3 leading-relaxed">{detailApp.background}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Why They Want to Join</Label>
                  <p className="text-sm bg-secondary/40 rounded-lg p-3 leading-relaxed">{detailApp.why_join}</p>
                </div>

                {detailApp.admin_notes && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Admin Notes</Label>
                    <p className="text-sm bg-secondary/40 rounded-lg p-3 leading-relaxed">{detailApp.admin_notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                {detailApp.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                      onClick={() => { setRejectApp(detailApp); setRejectNotes(""); }}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" /> Reject
                    </Button>
                    <Button
                      className="gold-bg text-primary-foreground"
                      onClick={() => approve(detailApp)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      Approve & Send Email
                    </Button>
                  </>
                )}
                {detailApp.status !== "pending" && (
                  <Button variant="outline" onClick={() => setDetailApp(null)}>Close</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectApp} onOpenChange={(o) => !o && setRejectApp(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <XCircle className="h-5 w-5" /> Reject Application
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              You're about to reject <strong>{rejectApp?.name}</strong>'s application. A notification email will be sent to them.
            </p>
            <div className="space-y-2">
              <Label>Feedback / Notes <span className="text-muted-foreground text-xs">(optional — included in rejection email)</span></Label>
              <Textarea
                rows={4}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="e.g. The group is currently full. We encourage you to apply again in 3 months..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectApp(null)}>Cancel</Button>
            <Button
              className="bg-red-500/80 hover:bg-red-500 text-white"
              onClick={reject}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              Reject & Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
