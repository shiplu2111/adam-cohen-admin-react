import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCms } from "@/hooks/use-cms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Reply, Trash2, Loader2, Send, Phone, User, Briefcase, Calendar } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface BusinessInquiry {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  status: "pending" | "reviewed" | "contacted";
  created_at: string;
}

export default function BusinessInquiries() {
  const { items, isLoading, update, remove } = useCms<BusinessInquiry>("business-inquiries");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<BusinessInquiry | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpenDetail = (inquiry: BusinessInquiry) => {
    setSelectedInquiry(inquiry);
    setDetailOpen(true);
  };

  const handleUpdateStatus = async (status: BusinessInquiry["status"]) => {
    if (!selectedInquiry) return;
    setIsUpdating(true);
    try {
      await update({ id: selectedInquiry.id, status });
      setSelectedInquiry({ ...selectedInquiry, status });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30" variant="outline">Pending</Badge>;
      case "reviewed":
        return <Badge className="bg-blue-500/15 text-blue-500 border-blue-500/30" variant="outline">Reviewed</Badge>;
      case "contacted":
        return <Badge className="bg-green-500/15 text-green-500 border-green-500/30" variant="outline">Contacted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Business Concierge Inquiries" 
        description="Review strategic requests for digital services and brand management." 
      />

      <div className="glass-card p-4">
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-50" />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {items.map(item => (
                    <TableRow key={item.id} className="group hover:bg-secondary/20 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{item.full_name}</span>
                          <span className="text-xs text-muted-foreground font-normal">{item.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {item.service || "General Inquiry"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-primary hover:bg-primary/10" 
                            onClick={() => handleOpenDetail(item)}
                            title="View Details"
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <DeleteConfirm
                            trigger={
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                            title="Delete this inquiry?"
                            onConfirm={() => remove(item.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-12 italic">
                        No business inquiries found.
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-display">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              Inquiry Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-8 py-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Client Name</p>
                  <p className="text-lg font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> {selectedInquiry.full_name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Service Requested</p>
                  <p className="text-lg font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" /> {selectedInquiry.service || "General Digital Strategy"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Contact Email</p>
                  <p className="text-lg font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" /> {selectedInquiry.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Phone Number</p>
                  <p className="text-lg font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" /> {selectedInquiry.phone || "Not Provided"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Strategic Vision / Message</p>
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 text-foreground/90 leading-relaxed italic">
                  "{selectedInquiry.message}"
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Submitted On
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(selectedInquiry.created_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={selectedInquiry.status === 'pending' ? "bg-amber-500/10 border-amber-500/50" : ""}
                    onClick={() => handleUpdateStatus('pending')}
                    disabled={isUpdating}
                  >
                    Set Pending
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={selectedInquiry.status === 'reviewed' ? "bg-blue-500/10 border-blue-500/50" : ""}
                    onClick={() => handleUpdateStatus('reviewed')}
                    disabled={isUpdating}
                  >
                    Reviewed
                  </Button>
                  <Button 
                    className="gold-bg text-primary-foreground"
                    size="sm"
                    onClick={() => handleUpdateStatus('contacted')}
                    disabled={isUpdating}
                  >
                    {selectedInquiry.status === 'contacted' ? 'Contacted' : 'Mark Contacted'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
