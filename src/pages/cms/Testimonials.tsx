import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCms, Testimonial } from "@/hooks/use-cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Plus, Star, Trash2, Loader2, Upload, User, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

export default function Testimonials() {
  const { items, isLoading, create, update, remove } = useCms<Testimonial>("testimonials");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const openNew = () => { 
    setEditing({ author: "", role: "", rating: 5, text: "", approved: true, order: 0 }); 
    setOpen(true); 
  };

  const save = async () => {
    if (!editing?.author) { toast.error("Author required"); return; }
    try {
      if (editing.avatar_file) {
        const formData = new FormData();
        Object.entries(editing).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'avatar_file') {
            const val = typeof value === 'boolean' ? (value ? '1' : '0') : value as string;
            formData.append(key, val);
          }
        });
        formData.append('avatar_file', editing.avatar_file);
        
        if (editing.id) formData.append('_method', 'PUT');
        
        setUploadProgress(0);
        const endpoint = editing.id ? `/testimonials/${editing.id}` : `/testimonials`;
        
        await api.post(endpoint, formData, {
          onUploadProgress: (e) => {
            if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        
        setUploadProgress(null);
        queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      } else {
        const { avatar_file, ...rest } = editing;
        if (editing.id) await update(rest);
        else await create(rest);
      }
      
      setOpen(false);
      toast.success("Saved");
    } catch (e) {
      setUploadProgress(null);
      toast.error("Failed to save");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        description="Client praise to feature on the public site."
        actions={<Button onClick={openNew} className="gold-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> New testimonial</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>
        ) : items.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center glass-card border-dashed">
            <User className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No testimonials found. Add your first one!</p>
          </div>
        ) : (
          <>
            {items.map(t => (
              <div key={t.id} className="glass-card p-6 space-y-4 group hover:border-[#D4AF37]/40 transition-all duration-300 relative overflow-hidden">
                {!t.approved && <div className="absolute top-0 right-0 bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">UNAPPROVED</div>}
                <div className="flex items-start justify-between">
                  <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={cn("h-3.5 w-3.5", i < t.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-muted")} />)}</div>
                  <Switch checked={t.approved} onCheckedChange={v => update({ id: t.id, approved: v })} />
                </div>
                <div className="relative">
                  <p className="text-sm italic leading-relaxed text-foreground/80 line-clamp-4">"{t.text}"</p>
                </div>
                <div className="flex items-center justify-between pt-5 border-t border-white/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#D4AF37]/20">
                      {t.avatar ? <img src={t.avatar} className="w-full h-full object-cover" /> : <User className="h-5 w-5 text-[#D4AF37]/50" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">{t.author}</div>
                      <div className="text-[11px] text-muted-foreground truncate uppercase tracking-wider">{t.role}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" onClick={() => { setEditing(t); setOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                    <DeleteConfirm
                      trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>}
                      title="Delete testimonial?"
                      onConfirm={() => remove(t.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Testimonial" : "New Testimonial"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-5 py-4">
              <div className="flex justify-center mb-2">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border group-hover:border-primary/50 transition-colors">
                    {editing.avatar || (editing.avatar_file && URL.createObjectURL(editing.avatar_file)) ? (
                      <img src={editing.avatar || (editing.avatar_file ? URL.createObjectURL(editing.avatar_file) : "")} className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setEditing({ ...editing, avatar_file: file, avatar: null });
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg border border-background">
                    <Upload className="h-3 w-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Author Name</Label><Input value={editing.author} onChange={e => setEditing({ ...editing, author: e.target.value })} placeholder="John Doe" /></div>
                <div className="space-y-2"><Label>Role / Company</Label><Input value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} placeholder="CEO, TechCorp" /></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Select value={String(editing.rating)} onValueChange={v => setEditing({ ...editing, rating: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[5, 4, 3, 2, 1].map(n => <SelectItem key={n} value={String(n)}>{n} Stars</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: Number(e.target.value) })} /></div>
              </div>

              <div className="space-y-2"><Label>Testimonial Quote</Label><Textarea rows={4} value={editing.text} onChange={e => setEditing({ ...editing, text: e.target.value })} placeholder="Write the client's feedback here..." /></div>
              <div className="flex items-center gap-2 px-1"><Switch checked={editing.approved} onCheckedChange={v => setEditing({ ...editing, approved: v })} /><Label className="cursor-pointer">Approved & Visible on Website</Label></div>
              
              {uploadProgress !== null && (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                    <span>Uploading Avatar</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={uploadProgress !== null}>Cancel</Button>
            <Button onClick={save} className="gold-bg text-primary-foreground" disabled={uploadProgress !== null}>
              {uploadProgress !== null ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
