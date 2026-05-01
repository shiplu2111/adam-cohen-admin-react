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
  Users, Clock, Mail, Phone, Globe, MessageSquare, Send
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { formatDistanceToNow, format } from "date-fns";

type Status = "all" | "pending" | "approved" | "rejected";

interface Registration {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  website_url?: string;
  topic?: string;
  status: "pending" | "approved" | "rejected";
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

export default function PodcastRegistrations() {
  const [tab, setTab] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [detailReg, setDetailReg] = useState<Registration | null>(null);
  const [emailReg, setEmailReg] = useState<Registration | null>(null);
  const [emailData, setEmailData] = useState({ subject: "", message: "" });

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/podcast-registrations");
      let data = res.data.data;
      
      // Client-side filtering for simplicity if API doesn't support it yet
      if (tab !== "all") {
        data = data.filter((r: Registration) => r.status === tab);
      }
      if (search) {
        const s = search.toLowerCase();
        data = data.filter((r: Registration) => 
          r.full_name.toLowerCase().includes(s) || 
          r.email.toLowerCase().includes(s) || 
          r.topic?.toLowerCase().includes(s)
        );
      }
      
      setRegistrations(data);
    } catch {
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(true);
    try {
      await api.put(`/podcast-registrations/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchRegistrations();
      if (detailReg?.id === id) setDetailReg(prev => prev ? { ...prev, status: status as any } : null);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReg = async (id: number) => {
    try {
      await api.delete(`/podcast-registrations/${id}`);
      toast.success("Registration deleted");
      fetchRegistrations();
      setDetailReg(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const sendEmail = async () => {
    if (!emailReg) return;
    setActionLoading(true);
    try {
      await api.post(`/podcast-registrations/${emailReg.id}/send-email`, emailData);
      toast.success("Email sent successfully!");
      setEmailReg(null);
      setEmailData({ subject: "", message: "" });
    } catch {
      toast.error("Failed to send email");
    } finally {
      setActionLoading(false);
    }
  };

  const counts = {
    all: registrations.length,
    pending: registrations.filter(r => r.status === "pending").length,
    approved: registrations.filter(r => r.status === "approved").length,
    rejected: registrations.filter(r => r.status === "rejected").length,
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
        title="Podcast Guest Registrations"
        description="Review and manage applications for guests wanting to join the Adam Cohen Podcast."
      />

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
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email..."
            className="pl-9 w-72"
          />
        </div>
      </div>

      {/* Registrations table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <Users className="h-12 w-12 mb-3 opacity-20" />
            <p>No registrations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Guest</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Applied</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {registrations.map((reg) => {
                  const StatusIcon = STATUS_ICONS[reg.status];
                  return (
                    <tr key={reg.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium">{reg.full_name}</p>
                          <p className="text-xs text-muted-foreground">{reg.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {format(new Date(reg.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border", STATUS_STYLES[reg.status])}>
                          <StatusIcon className="h-3 w-3" />{reg.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => setDetailReg(reg)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:bg-blue-500/10" onClick={() => setEmailReg(reg)}>
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                          <DeleteConfirm
                            trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>}
                            title="Delete this registration?"
                            onConfirm={() => deleteReg(reg.id)}
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
      <Dialog open={!!detailReg} onOpenChange={(o) => !o && setDetailReg(null)}>
        <DialogContent className="sm:max-w-[560px]">
          {detailReg && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Registration Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{detailReg.full_name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-medium flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-primary" /> {detailReg.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <p className="font-medium flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-primary" /> {detailReg.phone || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Website</Label>
                    <p className="font-medium flex items-center gap-1.5">
                      <Globe className="h-3 w-3 text-primary" /> {detailReg.website_url || "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Topic / Background</Label>
                  <p className="text-sm bg-secondary/40 rounded-lg p-3 leading-relaxed border border-border/50">
                    {detailReg.topic || "No details provided."}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Set Status Manually</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn("flex-1", detailReg.status === 'pending' && "bg-amber-500/10 border-amber-500/50 text-amber-400")}
                      onClick={() => updateStatus(detailReg.id, 'pending')}
                    >
                      Pending
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn("flex-1", detailReg.status === 'approved' && "bg-green-500/10 border-green-500/50 text-green-400")}
                      onClick={() => updateStatus(detailReg.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn("flex-1", detailReg.status === 'rejected' && "bg-red-500/10 border-red-500/50 text-red-400")}
                      onClick={() => updateStatus(detailReg.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDetailReg(null)}>Close</Button>
                <Button className="gold-bg text-primary-foreground" onClick={() => setEmailReg(detailReg)}>
                  <Mail className="h-4 w-4 mr-2" /> Send Email
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Email dialog */}
      <Dialog open={!!emailReg} onOpenChange={(o) => !o && setEmailReg(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Send Email to {emailReg?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input 
                value={emailData.subject} 
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})} 
                placeholder="e.g. Your Podcast Application"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea 
                rows={6} 
                value={emailData.message} 
                onChange={(e) => setEmailData({...emailData, message: e.target.value})} 
                placeholder="Write your message here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailReg(null)}>Cancel</Button>
            <Button className="gold-bg text-primary-foreground" onClick={sendEmail} disabled={actionLoading || !emailData.subject || !emailData.message}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
