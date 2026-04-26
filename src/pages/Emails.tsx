import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { emails as initial } from "@/data/mock";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Archive, Reply, Search, Send, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Emails() {
  const [emails, setEmails] = useState(initial);
  const [activeId, setActiveId] = useState(emails[0]?.id);
  const [search, setSearch] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState("");

  const filtered = emails.filter(e =>
    [e.from, e.subject, e.preview].some(s => s.toLowerCase().includes(search.toLowerCase()))
  );
  const active = emails.find(e => e.id === activeId);

  const remove = (id: string) => {
    setEmails(emails.filter(e => e.id !== id));
    if (activeId === id) setActiveId(emails[0]?.id);
    toast.success("Email deleted");
  };

  const sendReply = () => {
    if (!reply.trim()) return;
    toast.success(`Reply sent to ${active?.from}`);
    setReply(""); setReplyOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Emails" description="Manage your inbox and reply directly." />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        <div className="glass-card flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 bg-secondary/40" placeholder="Search emails" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(e => (
              <button
                key={e.id}
                onClick={() => { setActiveId(e.id); setEmails(prev => prev.map(x => x.id === e.id ? { ...x, read: true } : x)); }}
                className={cn(
                  "w-full text-left p-4 border-b border-border/60 hover:bg-secondary/40 transition-colors",
                  activeId === e.id && "bg-primary/5 border-l-2 border-l-primary",
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs gold-bg text-primary-foreground">{e.from.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className={cn("text-sm truncate", !e.read && "font-bold")}>{e.from}</div>
                      <div className="text-[10px] text-muted-foreground shrink-0">{e.date.split(" ")[1]}</div>
                    </div>
                    <div className={cn("text-sm truncate", !e.read ? "text-foreground font-medium" : "text-muted-foreground")}>{e.subject}</div>
                    <div className="text-xs text-muted-foreground truncate">{e.preview}</div>
                  </div>
                  {!e.read && <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />}
                </div>
              </button>
            ))}
            {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No emails found</div>}
          </div>
        </div>

        <div className="glass-card flex flex-col overflow-hidden">
          {active ? (
            <>
              <div className="p-5 border-b border-border flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-semibold mb-2 truncate">{active.subject}</h2>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback className="gold-bg text-primary-foreground text-xs">{active.from.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{active.from}</div>
                      <div className="text-xs text-muted-foreground truncate">{active.fromEmail} • {active.date}</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon"><Star className={cn("h-4 w-4", active.starred && "fill-primary text-primary")} /></Button>
                  <Button variant="ghost" size="icon"><Archive className="h-4 w-4" /></Button>
                  <DeleteConfirm
                    trigger={<Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                    title="Delete this email?"
                    onConfirm={() => remove(active.id)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{active.body}</div>
              </div>

              <div className="border-t border-border p-4">
                {!replyOpen ? (
                  <Button onClick={() => setReplyOpen(true)} className="gold-bg text-primary-foreground"><Reply className="h-4 w-4 mr-2" /> Reply</Button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground">Replying to <strong className="text-foreground">{active.from}</strong></div>
                    <Textarea rows={5} value={reply} onChange={e => setReply(e.target.value)} placeholder="Write your reply..." autoFocus />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => { setReplyOpen(false); setReply(""); }}>Cancel</Button>
                      <Button onClick={sendReply} className="gold-bg text-primary-foreground"><Send className="h-4 w-4 mr-2" /> Send reply</Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-muted-foreground text-sm">Select an email to read</div>
          )}
        </div>
      </div>
    </div>
  );
}
