import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCms, ContactInquiry } from "@/hooks/use-cms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Reply, Trash2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function Contacts() {
  const { items, isLoading, update, remove } = useCms<ContactInquiry>("contact-inquiries");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyingInquiry, setReplyingInquiry] = useState<ContactInquiry | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleOpenReply = (inquiry: ContactInquiry) => {
    setReplyingInquiry(inquiry);
    setReplyMessage("");
    setReplyOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyingInquiry || !replyMessage.trim()) return;

    setIsSending(true);
    try {
      await api.post(`/contact-inquiries/${replyingInquiry.id}/reply`, {
        message: replyMessage
      });
      toast.success("Reply sent successfully");
      setReplyOpen(false);
      // Status update is handled via cache invalidation if using useCms update, 
      // but here we call custom API, so manually refresh if needed or use update(status)
      update({ id: replyingInquiry.id, status: "replied" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Contact Inquiries" description="Messages submitted via the public contact form." />

      <div className="glass-card p-4">
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Subject</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
              ) : (
                <>
                  {items.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        <div>{c.name}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">{c.service}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.email}</TableCell>
                      <TableCell>
                        <div className="truncate max-w-[200px]" title={c.message}>
                          {c.subject || "Quick Inquiry"}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{c.created_at?.split('T')[0]}</TableCell>
                      <TableCell>
                        {c.status === "new"
                          ? <Badge className="bg-primary/15 text-primary border-primary/30" variant="outline">New</Badge>
                          : <Badge variant="outline" className="bg-success/15 text-success border-success/30">Replied</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-primary hover:bg-primary/10" 
                            onClick={() => handleOpenReply(c)}
                            title="Reply"
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <DeleteConfirm
                            trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                            title="Delete this inquiry?"
                            onConfirm={() => remove(c.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No inquiries found</TableCell></TableRow>}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Reply to {replyingInquiry?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-secondary/30 text-sm border border-border/50">
              <p className="font-semibold text-primary mb-1">Original Message:</p>
              <p className="text-muted-foreground italic">"{replyingInquiry?.message}"</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Reply</label>
              <Textarea 
                placeholder="Type your professional response here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyOpen(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendReply} 
              disabled={isSending || !replyMessage.trim()}
              className="gold-bg text-primary-foreground min-w-[120px]"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
