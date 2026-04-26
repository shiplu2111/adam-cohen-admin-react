import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  useCms,
  LiveEvent,
  LiveEventFeature,
  LiveEventTicketTier,
  LiveEventTestimonial,
} from "@/hooks/use-cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit, Plus, Trash2, Loader2, Calendar, MapPin, Ticket,
  Star, Mic, Lightbulb, Network, Users, Trophy, Award,
  Zap, Target, Rocket, Globe, CheckCircle2, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Icon options for features ────────────────────────────────────────────────
const ICON_OPTIONS = [
  { key: "mic", Icon: Mic, label: "Mic" },
  { key: "lightbulb", Icon: Lightbulb, label: "Lightbulb" },
  { key: "network", Icon: Network, label: "Network" },
  { key: "users", Icon: Users, label: "Users" },
  { key: "trophy", Icon: Trophy, label: "Trophy" },
  { key: "star", Icon: Star, label: "Star" },
  { key: "award", Icon: Award, label: "Award" },
  { key: "zap", Icon: Zap, label: "Zap" },
  { key: "target", Icon: Target, label: "Target" },
  { key: "rocket", Icon: Rocket, label: "Rocket" },
  { key: "globe", Icon: Globe, label: "Globe" },
  { key: "calendar", Icon: Calendar, label: "Calendar" },
];

function IconComponent({ iconKey, className }: { iconKey: string; className?: string }) {
  const found = ICON_OPTIONS.find((o) => o.key === iconKey);
  const Icon = found?.Icon ?? Mic;
  return <Icon className={className} />;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = "events" | "features" | "tickets" | "testimonials";

const TABS: { id: Tab; label: string; icon: typeof Calendar }[] = [
  { id: "events", label: "Upcoming Events", icon: Calendar },
  { id: "features", label: "Event Features", icon: Mic },
  { id: "tickets", label: "Ticket Tiers", icon: Ticket },
  { id: "testimonials", label: "Testimonials", icon: Star },
];

const STATUS_OPTIONS = ["Registration Open", "Early Bird", "Coming Soon", "Sold Out", "Past"];

export default function LiveEventsManager() {
  const [activeTab, setActiveTab] = useState<Tab>("events");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Events Manager"
        description="Manage upcoming events, features, ticket tiers, and testimonials shown on the website."
      />

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-secondary/50 border border-border w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === id
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "events" && <EventsTab />}
      {activeTab === "features" && <FeaturesTab />}
      {activeTab === "tickets" && <TicketsTab />}
      {activeTab === "testimonials" && <TestimonialsTab />}
    </div>
  );
}

// ─── EVENTS TAB ───────────────────────────────────────────────────────────────
function EventsTab() {
  const { items, isLoading, create, update, remove } = useCms<LiveEvent>("live-events");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LiveEvent> | null>(null);

  const openNew = () => {
    setEditing({ title: "", location: "", date: "", theme: "", spots: "", status: "Registration Open", register_url: "", order: 0, active: true });
    setOpen(true);
  };

  const save = async () => {
    if (!editing?.title) { toast.error("Title is required"); return; }
    try {
      if ((editing as LiveEvent).id) await update(editing);
      else await create(editing);
      setOpen(false);
    } catch { toast.error("Failed to save"); }
  };

  const statusColor: Record<string, string> = {
    "Registration Open": "bg-green-500/10 text-green-400 border-green-500/20",
    "Early Bird": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Coming Soon": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Sold Out": "bg-destructive/10 text-destructive border-destructive/20",
    "Past": "bg-secondary text-muted-foreground border-border",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gold-bg text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add Event
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>
        ) : items.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center glass-card border-dashed">
            <Calendar className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No events yet. Add your first one!</p>
          </div>
        ) : items.map((evt) => (
          <div key={evt.id} className="glass-card p-6 group hover:border-[#D4AF37]/40 transition-all duration-300 relative">
            {!evt.active && (
              <div className="absolute top-0 right-0 bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">HIDDEN</div>
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={cn("text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border", statusColor[evt.status] ?? statusColor["Coming Soon"])}>
                    {evt.status}
                  </span>
                  {evt.spots && <span className="text-xs text-muted-foreground">{evt.spots}</span>}
                </div>
                <h3 className="text-xl font-display font-bold mb-1">{evt.title}</h3>
                {evt.theme && <p className="text-sm text-muted-foreground italic mb-3">"{evt.theme}"</p>}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {evt.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />{evt.location}
                    </span>
                  )}
                  {evt.date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />{evt.date}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={evt.active} onCheckedChange={(v) => update({ id: evt.id, active: v })} />
                <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" onClick={() => { setEditing(evt); setOpen(true); }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <DeleteConfirm
                  trigger={<Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>}
                  title="Delete this event?"
                  onConfirm={() => remove(evt.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader><DialogTitle>{(editing as LiveEvent)?.id ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Event Title</Label>
                <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="The ACT Summit 2025" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Miami, Florida" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input value={editing.date ?? ""} onChange={(e) => setEditing({ ...editing, date: e.target.value })} placeholder="September 19–20, 2025" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Theme / Subtitle</Label>
                <Input value={editing.theme ?? ""} onChange={(e) => setEditing({ ...editing, theme: e.target.value })} placeholder="Scale, Capital & Legacy" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Spots</Label>
                  <Input value={editing.spots ?? ""} onChange={(e) => setEditing({ ...editing, spots: e.target.value })} placeholder="200 Seats" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editing.status ?? "Registration Open"} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Register URL <span className="text-muted-foreground text-xs">(leave blank to use /contact)</span></Label>
                <Input value={editing.register_url ?? ""} onChange={(e) => setEditing({ ...editing, register_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input type="number" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={editing.active ?? true} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                  <Label>Active / Visible</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="gold-bg text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── FEATURES TAB ─────────────────────────────────────────────────────────────
function FeaturesTab() {
  const { items, isLoading, create, update, remove } = useCms<LiveEventFeature>("live-event-features");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LiveEventFeature> | null>(null);

  const openNew = () => {
    setEditing({ icon_key: "mic", title: "", description: "", order: 0, active: true });
    setOpen(true);
  };

  const save = async () => {
    if (!editing?.title) { toast.error("Title is required"); return; }
    try {
      if ((editing as LiveEventFeature).id) await update(editing);
      else await create(editing);
      setOpen(false);
    } catch { toast.error("Failed to save"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gold-bg text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add Feature
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>
        ) : items.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center glass-card border-dashed">
            <Mic className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No features yet.</p>
          </div>
        ) : items.map((item) => (
          <div key={item.id} className="glass-card p-5 space-y-3 group hover:border-[#D4AF37]/40 transition-all duration-300 relative">
            {!item.active && <div className="absolute top-0 right-0 bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">HIDDEN</div>}
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <IconComponent iconKey={item.icon_key} className="w-5 h-5" />
              </div>
              <Switch checked={item.active} onCheckedChange={(v) => update({ id: item.id, active: v })} />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm">{item.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{item.description}</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2 border-t border-border/30">
              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" onClick={() => { setEditing(item); setOpen(true); }}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <DeleteConfirm
                trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>}
                title="Delete this feature?"
                onConfirm={() => remove(item.id)}
              />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>{(editing as LiveEventFeature)?.id ? "Edit Feature" : "New Feature"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map(({ key, Icon, label }) => (
                    <button key={key} title={label} onClick={() => setEditing({ ...editing, icon_key: key })}
                      className={cn("h-10 rounded-lg border flex items-center justify-center transition-all",
                        editing.icon_key === key ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Keynote Presentations" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input type="number" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={editing.active ?? true} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="gold-bg text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TICKETS TAB ──────────────────────────────────────────────────────────────
function TicketsTab() {
  const { items, isLoading, create, update, remove } = useCms<LiveEventTicketTier>("live-event-ticket-tiers");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LiveEventTicketTier> | null>(null);
  const [perkInput, setPerkInput] = useState("");

  const openNew = () => {
    setEditing({ name: "", price: "", tag: "", description: "", perks: [], cta: "Register Interest", highlight: false, order: 0, active: true });
    setOpen(true);
  };

  const addPerk = () => {
    if (!perkInput.trim()) return;
    setEditing((prev) => ({ ...prev, perks: [...(prev?.perks ?? []), perkInput.trim()] }));
    setPerkInput("");
  };

  const removePerk = (i: number) => {
    setEditing((prev) => ({ ...prev, perks: (prev?.perks ?? []).filter((_, idx) => idx !== i) }));
  };

  const save = async () => {
    if (!editing?.name) { toast.error("Name is required"); return; }
    if (!editing?.price) { toast.error("Price is required"); return; }
    try {
      if ((editing as LiveEventTicketTier).id) await update(editing);
      else await create(editing);
      setOpen(false);
    } catch { toast.error("Failed to save"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gold-bg text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add Tier
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>
        ) : items.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center glass-card border-dashed">
            <Ticket className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No ticket tiers yet.</p>
          </div>
        ) : items.map((tier) => (
          <div key={tier.id} className={cn("glass-card p-6 flex flex-col relative group hover:border-[#D4AF37]/40 transition-all duration-300", tier.highlight && "border-primary/40 shadow-[0_0_30px_rgba(212,175,55,0.1)]")}>
            {!tier.active && <div className="absolute top-0 right-0 bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">HIDDEN</div>}
            {tier.tag && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-[#D4AF37] text-black text-[10px] font-bold tracking-widest uppercase">
                <Star className="w-2.5 h-2.5 fill-black" />{tier.tag}
              </div>
            )}
            <Ticket className="w-7 h-7 text-primary mb-3" />
            <h3 className="font-display font-bold text-lg mb-1">{tier.name}</h3>
            <p className="text-2xl font-display font-black text-[#D4AF37] mb-2">{tier.price}</p>
            <p className="text-xs text-muted-foreground mb-4 flex-1">{tier.description}</p>
            <ul className="space-y-1.5 mb-4">
              {(tier.perks ?? []).map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />{p}
                </li>
              ))}
            </ul>
            <p className="text-xs font-semibold text-center py-2 rounded-lg border border-primary/30 text-primary mb-3">{tier.cta}</p>
            <div className="flex items-center justify-between pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Switch checked={tier.active} onCheckedChange={(v) => update({ id: tier.id, active: v })} />
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" onClick={() => { setEditing({ ...tier, perks: tier.perks ?? [] }); setPerkInput(""); setOpen(true); }}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <DeleteConfirm
                  trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>}
                  title="Delete this ticket tier?"
                  onConfirm={() => remove(tier.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{(editing as LiveEventTicketTier)?.id ? "Edit Ticket Tier" : "New Ticket Tier"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tier Name</Label>
                  <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="VIP Experience" />
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: e.target.value })} placeholder="From $2,997" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Badge Tag <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input value={editing.tag ?? ""} onChange={(e) => setEditing({ ...editing, tag: e.target.value })} placeholder="Most Popular" />
                </div>
                <div className="space-y-2">
                  <Label>CTA Button Text</Label>
                  <Input value={editing.cta ?? ""} onChange={(e) => setEditing({ ...editing, cta: e.target.value })} placeholder="Apply for VIP" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Perks</Label>
                <div className="flex gap-2">
                  <Input
                    value={perkInput}
                    onChange={(e) => setPerkInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPerk(); } }}
                    placeholder="Add a perk and press Enter"
                  />
                  <Button type="button" variant="outline" onClick={addPerk}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {(editing.perks ?? []).map((p, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/40 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="flex-1">{p}</span>
                      <button onClick={() => removePerk(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input type="number" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={editing.highlight ?? false} onCheckedChange={(v) => setEditing({ ...editing, highlight: v })} />
                  <Label>Highlighted</Label>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={editing.active ?? true} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="gold-bg text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TESTIMONIALS TAB ─────────────────────────────────────────────────────────
function TestimonialsTab() {
  const { items, isLoading, create, update, remove } = useCms<LiveEventTestimonial>("live-event-testimonials");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LiveEventTestimonial> | null>(null);

  const openNew = () => {
    setEditing({ name: "", title: "", event: "", quote: "", rating: 5, order: 0, active: true });
    setOpen(true);
  };

  const save = async () => {
    if (!editing?.name) { toast.error("Name is required"); return; }
    if (!editing?.quote) { toast.error("Quote is required"); return; }
    try {
      if ((editing as LiveEventTestimonial).id) await update(editing);
      else await create(editing);
      setOpen(false);
    } catch { toast.error("Failed to save"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gold-bg text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>
        ) : items.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center glass-card border-dashed">
            <Star className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No testimonials yet.</p>
          </div>
        ) : items.map((t) => (
          <div key={t.id} className="glass-card p-6 space-y-4 group hover:border-[#D4AF37]/40 transition-all duration-300 relative">
            {!t.active && <div className="absolute top-0 right-0 bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">HIDDEN</div>}
            <div className="flex items-start justify-between">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className={cn("h-3.5 w-3.5", i < t.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-muted")} />)}
              </div>
              <Switch checked={t.active} onCheckedChange={(v) => update({ id: t.id, active: v })} />
            </div>
            <p className="text-sm italic leading-relaxed text-foreground/80 line-clamp-4">"{t.quote}"</p>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{t.name}</div>
                {t.title && <div className="text-[11px] text-muted-foreground truncate">{t.title}</div>}
                {t.event && <div className="text-[11px] text-primary truncate">{t.event}</div>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" onClick={() => { setEditing(t); setOpen(true); }}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <DeleteConfirm
                  trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>}
                  title="Delete this testimonial?"
                  onConfirm={() => remove(t.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{(editing as LiveEventTestimonial)?.id ? "Edit Testimonial" : "New Testimonial"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Kevin R." />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Real Estate Investor, Dallas" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Attended</Label>
                  <Input value={editing.event ?? ""} onChange={(e) => setEditing({ ...editing, event: e.target.value })} placeholder="ACT Summit 2024" />
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Select value={String(editing.rating ?? 5)} onValueChange={(v) => setEditing({ ...editing, rating: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[5, 4, 3, 2, 1].map((n) => <SelectItem key={n} value={String(n)}>{n} Stars</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quote</Label>
                <Textarea rows={4} value={editing.quote ?? ""} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input type="number" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={editing.active ?? true} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="gold-bg text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
