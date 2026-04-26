import { useState } from "react";
import { useCms, Subscriber } from "@/hooks/use-cms";
import { 
  Mail, Search, Send, Trash2, User, 
  CheckCircle2, XCircle, Loader2, Plus
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function SubscriberManager() {
  const { items: subscribers, isLoading, remove } = useCms<Subscriber>("subscribers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  // Newsletter Form State
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredSubscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubscribers.map(s => s.id));
    }
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) return;

    setIsSending(true);
    try {
      await api.post("/subscribers/send", {
        subject,
        body,
        recipient_ids: selectedIds.length > 0 ? selectedIds : null
      });
      toast.success("Newsletter queued successfully!");
      setShowForm(false);
      setSubject("");
      setBody("");
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send newsletter");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display">Email Subscribers</h2>
          <p className="text-muted-foreground text-sm">Manage your newsletter audience and send updates.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {showForm ? "Cancel" : "Compose Newsletter"}
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-0 border-primary/20 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-4 border-b border-white/5 bg-primary/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">New Newsletter Broadcast</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Rate limited: 1 email per minute</p>
            </div>
          </div>
          <form onSubmit={handleSendNewsletter} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> Subject Line
              </label>
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                placeholder="Updates from Adam Cohen..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> Email Content
              </label>
              <textarea
                required
                rows={10}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all min-h-[250px] placeholder:text-muted-foreground/30 leading-relaxed"
                placeholder="Write your professional update here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                  Target: {selectedIds.length > 0 
                    ? `${selectedIds.length} Selected Individuals`
                    : `Full Audience (${subscribers.length} Active)`}
                </p>
              </div>
              <button
                type="submit"
                disabled={isSending}
                className="btn-primary flex items-center gap-2 min-w-[200px] justify-center h-12 rounded-xl group"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Queue Broadcast <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by email or name..."
              className="input-field pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">
              {selectedIds.length} Selected
            </span>
            <button
              onClick={selectAll}
              className="btn-outline py-2 text-xs"
            >
              {selectedIds.length === filteredSubscribers.length ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 w-12">
                  {/* Select Checkbox handled by selectAll */}
                </th>
                <th className="p-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">Subscriber</th>
                <th className="p-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="p-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">Joined At</th>
                <th className="p-4 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSubscribers.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      className="accent-primary"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold">{s.name || "Anonymous"}</p>
                        <p className="text-sm text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {s.active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-500/10 text-green-500 border border-green-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20">
                        <XCircle className="w-3 h-3" /> Unsubscribed
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {format(new Date(s.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to remove this subscriber?")) {
                          remove(s.id);
                        }
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    No subscribers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
