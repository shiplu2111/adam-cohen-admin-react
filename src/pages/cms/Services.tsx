import { useState } from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCms, Service } from "@/hooks/use-cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Plus, Sparkles, Trash2, Loader2, X, ExternalLink, AlertCircle } from "lucide-react";
import * as Lucide from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const isEmoji = (str: string) => {
  const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
  return emojiRegex.test(str);
};

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  if (!name) return null;

  if (isEmoji(name)) {
    return <span className={className}>{name}</span>;
  }

  const IconComponent = (Lucide as any)[name];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  return <AlertCircle className={cn(className, "text-destructive")} />;
};

export default function Services() {
  const { items, isLoading, create, update, remove } = useCms<Service>("services");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);

  const openNew = () => {
    setEditing({
      name: "",
      price: 0,
      active: true,
      bookings: 0,
      description: "",
      icon: "",
      tag: "",
      link: "",
      outcome: "",
      features: []
    });
    setOpen(true);
  };

  const save = async () => {
    if (!editing?.name) { toast.error("Name required"); return; }
    try {
      if (editing.id) await update(editing as Service);
      else await create(editing);
      setOpen(false);
    } catch (e) { }
  };

  const addFeature = () => {
    setEditing(prev => prev ? { ...prev, features: [...(prev.features || []), ""] } : prev);
  };

  const updateFeature = (index: number, value: string) => {
    setEditing(prev => {
      if (!prev) return prev;
      const newFeatures = [...(prev.features || [])];
      newFeatures[index] = value;
      return { ...prev, features: newFeatures };
    });
  };

  const removeFeature = (index: number) => {
    setEditing(prev => {
      if (!prev) return prev;
      const newFeatures = [...(prev.features || [])];
      newFeatures.splice(index, 1);
      return { ...prev, features: newFeatures };
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Configure the services you offer to clients. Fields automatically sync with the website."
        actions={<Button onClick={openNew} className="gold-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> New service</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            {items.map(s => (
              <div key={s.id} className="glass-card p-5 group hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl gold-bg grid place-items-center text-primary-foreground">
                    <DynamicIcon name={s.icon || "Sparkles"} className="h-5 w-5" />
                  </div>
                  <Switch checked={s.active} onCheckedChange={v => update({ id: s.id, active: v })} />
                </div>
                <div className="font-display font-semibold text-lg">{s.name}</div>
                {s.tag && <div className="text-xs text-primary/70 uppercase tracking-wider">{s.tag}</div>}

                <div className="font-display text-2xl font-bold gold-text mt-1">${Number(s.price).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.bookings} bookings</div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(s); setOpen(true); }}><Edit className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                  <DeleteConfirm
                    trigger={<Button size="sm" variant="outline" className="text-destructive border-destructive/30"><Trash2 className="h-3.5 w-3.5" /></Button>}
                    title={`Delete "${s.name}"?`}
                    onConfirm={() => remove(s.id)}
                  />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit service" : "New service"}</DialogTitle></DialogHeader>
          <ScrollArea className="flex-grow pr-4">
            {editing && (
              <div className="space-y-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Name (Title)</Label><Input value={editing.name || ""} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Strategic Consulting" /></div>
                  <div className="space-y-2"><Label>Price (USD)</Label><Input type="number" value={editing.price || 0} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Icon/Emoji (Optional)</Label>
                      <a
                        href="https://v0.lucide.dev/icons"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        Lucide Icons <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={editing.icon || ""}
                        onChange={e => setEditing({ ...editing, icon: e.target.value })}
                        placeholder="e.g. Sparkles or 📈"
                        className="flex-1"
                      />
                      <div className="w-10 h-10 border border-border rounded-md flex items-center justify-center bg-secondary/30 shrink-0">
                        <DynamicIcon name={editing.icon || ""} className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2"><Label>Tag (Optional)</Label><Input value={editing.tag || ""} onChange={e => setEditing({ ...editing, tag: e.target.value })} placeholder="e.g. FOUNDATION" /></div>
                </div>

                <div className="space-y-2">
                  <Label>Details Page Link (Optional)</Label>
                  <Input value={editing.link || ""} onChange={e => setEditing({ ...editing, link: e.target.value })} placeholder="e.g. /services/consulting" />
                </div>

                <div className="space-y-2"><Label>Description</Label><Textarea value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} placeholder="Briefly describe the service..." /></div>

                <div className="space-y-2"><Label>Expected Outcome</Label><Input value={editing.outcome || ""} onChange={e => setEditing({ ...editing, outcome: e.target.value })} placeholder="e.g. 2x revenue growth over 6 months" /></div>

                <div className="space-y-3">
                  <Label>Features / Benefits</Label>
                  <div className="space-y-2">
                    {(editing.features || []).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input value={feature} onChange={e => updateFeature(idx, e.target.value)} placeholder="e.g. Bi-weekly strategy sessions" />
                        <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeFeature(idx)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Feature
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2"><Switch checked={editing.active ?? true} onCheckedChange={v => setEditing({ ...editing, active: v })} /><Label>Active and visible</Label></div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="pt-4 border-t mt-auto">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="gold-bg text-primary-foreground">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
