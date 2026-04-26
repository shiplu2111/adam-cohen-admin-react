import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  useCms,
  WeeklyZoomExpectation,
  WeeklyZoomInclude,
  WeeklyZoomSchedule,
  WeeklyZoomSetting,
  WeeklyZoomTestimonial,
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
  Edit,
  Plus,
  Trash2,
  Loader2,
  Video,
  Calendar,
  Clock,
  Copy,
  ExternalLink,
  KeyRound,
  User,
  Zap,
  Target,
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle2,
  ListChecks,
  Star,
  Award,
  Lightbulb,
  Rocket,
  Globe,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

// ─── Icon map ────────────────────────────────────────────────────────────────
const ICON_OPTIONS = [
  { key: "target", Icon: Target, label: "Target" },
  { key: "message-square", Icon: MessageSquare, label: "Message" },
  { key: "trending-up", Icon: TrendingUp, label: "Trending Up" },
  { key: "users", Icon: Users, label: "Users" },
  { key: "zap", Icon: Zap, label: "Zap" },
  { key: "video", Icon: Video, label: "Video" },
  { key: "check-circle", Icon: CheckCircle2, label: "Check" },
  { key: "star", Icon: Star, label: "Star" },
  { key: "award", Icon: Award, label: "Award" },
  { key: "lightbulb", Icon: Lightbulb, label: "Lightbulb" },
  { key: "rocket", Icon: Rocket, label: "Rocket" },
  { key: "globe", Icon: Globe, label: "Globe" },
  { key: "heart", Icon: Heart, label: "Heart" },
  { key: "calendar", Icon: Calendar, label: "Calendar" },
  { key: "clock", Icon: Clock, label: "Clock" },
];

function IconComponent({ iconKey, className }: { iconKey: string; className?: string }) {
  const found = ICON_OPTIONS.find((o) => o.key === iconKey);
  const Icon = found?.Icon ?? Zap;
  return <Icon className={className} />;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = "session" | "expectations" | "includes" | "schedule" | "testimonials";

const TABS: { id: Tab; label: string; icon: typeof Video }[] = [
  { id: "session",      label: "Session Info",   icon: Video },
  { id: "expectations", label: "What to Expect", icon: Target },
  { id: "includes",     label: "Included",       icon: ListChecks },
  { id: "schedule",     label: "Schedule",       icon: Calendar },
  { id: "testimonials", label: "Testimonials",   icon: Star },
];

const TAG_OPTIONS = ["Core", "Optional", "Bonus", "Always", "New"];

export default function WeeklyZoomManager() {
  const [activeTab, setActiveTab] = useState<Tab>("session");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Zoom Manager"
        description="Manage all content shown on the Weekly Zoom public page."
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

      {activeTab === "session"      && <SessionTab />}
      {activeTab === "expectations" && <ExpectationsTab />}
      {activeTab === "includes"     && <IncludesTab />}
      {activeTab === "schedule"     && <ScheduleTab />}
      {activeTab === "testimonials" && <TestimonialsTab />}
    </div>
  );
}

// ─── SESSION INFO TAB ─────────────────────────────────────────────────────────
function SessionTab() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: settings, isLoading } = useQuery<WeeklyZoomSetting>({
    queryKey: ["weekly-zoom-settings"],
    queryFn: async () => {
      const res = await api.get("/weekly-zoom-settings");
      return res.data.data as WeeklyZoomSetting;
    },
  });

  const [form, setForm] = useState<WeeklyZoomSetting | null>(null);
  const current = form ?? settings;

  const copy = (val: string, lbl: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`${lbl} copied`);
  };

  const save = async () => {
    if (!current) return;
    setSaving(true);
    try {
      await api.post("/weekly-zoom-settings", current);
      queryClient.invalidateQueries({ queryKey: ["weekly-zoom-settings"] });
      toast.success("Session settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const set = (key: keyof WeeklyZoomSetting, value: any) =>
    setForm((prev) => ({ ...(prev ?? settings!), [key]: value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-card p-6 space-y-6">
        <div>
          <h3 className="font-display font-semibold text-lg">Session Details</h3>
          <p className="text-sm text-muted-foreground">Shown on the public Weekly Zoom page.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Page Title</Label>
            <Input value={current?.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Host Name</Label>
            <Input value={current?.host ?? ""} onChange={(e) => set("host", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Session Day</Label>
            <Input
              value={current?.session_day ?? ""}
              onChange={(e) => set("session_day", e.target.value)}
              placeholder="Every Wednesday"
            />
          </div>
          <div className="space-y-2">
            <Label>Session Time</Label>
            <Input
              value={current?.session_time ?? ""}
              onChange={(e) => set("session_time", e.target.value)}
              placeholder="12:00 PM EST"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Zoom Link</Label>
            <div className="flex gap-2">
              <Input
                value={current?.zoom_link ?? ""}
                onChange={(e) => set("zoom_link", e.target.value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copy(current?.zoom_link ?? "", "Zoom link")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Meeting ID</Label>
            <Input
              value={current?.meeting_id ?? ""}
              onChange={(e) => set("meeting_id", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Passcode</Label>
            <Input
              value={current?.passcode ?? ""}
              onChange={(e) => set("passcode", e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={current?.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-widest">
            Hero Stats (shown in header)
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sessions / Year</Label>
              <Input
                value={current?.sessions_per_year ?? ""}
                onChange={(e) => set("sessions_per_year", e.target.value)}
                placeholder="52"
              />
            </div>
            <div className="space-y-2">
              <Label>Active Members</Label>
              <Input
                value={current?.active_members ?? ""}
                onChange={(e) => set("active_members", e.target.value)}
                placeholder="500+"
              />
            </div>
            <div className="space-y-2">
              <Label>Min / Session</Label>
              <Input
                value={current?.minutes_per_session ?? ""}
                onChange={(e) => set("minutes_per_session", e.target.value)}
                placeholder="90"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => setForm(null)} disabled={saving}>
            Reset
          </Button>
          <Button className="gold-bg text-primary-foreground" onClick={save} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Preview card */}
      <div className="glass-card p-6 space-y-4">
        <div className="aspect-video rounded-xl gold-bg grid place-items-center">
          <Video className="h-14 w-14 text-primary-foreground" />
        </div>
        <div>
          <h4 className="font-display font-semibold">{current?.title ?? "Weekly Zoom"}</h4>
          <p className="text-sm text-muted-foreground">Hosted by {current?.host ?? "Adam Cohen"}</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {current?.session_day ?? "—"}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {current?.session_time ?? "—"}
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            ID: {current?.meeting_id ?? "—"}
          </div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Passcode: {current?.passcode ?? "—"}
          </div>
        </div>
        {current?.zoom_link && (
          <Button asChild className="w-full gold-bg text-primary-foreground">
            <a href={current.zoom_link} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> Open Zoom
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── EXPECTATIONS TAB ─────────────────────────────────────────────────────────
function ExpectationsTab() {
  const { items, isLoading, create, update, remove } = useCms<WeeklyZoomExpectation>(
    "weekly-zoom-expectations",
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<WeeklyZoomExpectation> | null>(null);

  const openNew = () => {
    setEditing({ icon_key: "zap", title: "", description: "", order: 0, active: true });
    setOpen(true);
  };

  const save = async () => {
    if (!editing?.title) { toast.error("Title is required"); return; }
    try {
      if ((editing as WeeklyZoomExpectation).id) await update(editing);
      else await create(editing);
      setOpen(false);
    } catch { toast.error("Failed to save"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gold-bg text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add Card
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center glass-card border-dashed">
            <Target className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No cards yet. Add your first one!</p>
          </div>
        ) : items.map((item) => (
          <div key={item.id} className="glass-card p-5 space-y-3 group hover:border-[#D4AF37]/40 transition-all duration-300 relative">
            {!item.active && (
              <div className="absolute top-0 right-0 bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">HIDDEN</div>
            )}
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
                title="Delete this card?"
                onConfirm={() => remove(item.id)}
              />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>{(editing as WeeklyZoomExpectation)?.id ? "Edit Card" : "New Card"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-5 gap-2">
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
                <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Hot Seat Coaching" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Order</Label>
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

// ─── INCLUDES TAB ─────────────────────────────────────────────────────────────
function IncludesTab() {
  const { items, isLoading, create, update, remove } = useCms<WeeklyZoomInclude>("weekly-zoom-includes");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<WeeklyZoomInclude> | null>(null);

  const openNew = () => { setEditing({ text: "", order: 0, active: true }); setOpen(true); };

  const save = async () => {
    if (!editing?.text) { toast.error("Text is required"); return; }
    try {
      if ((editing as WeeklyZoomInclude).id) await update(editing);
      else await create(editing);
      setOpen(false);
    } catch { toast.error("Failed to save"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gold-bg text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>

      <div className="glass-card p-6 space-y-2">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>
        ) : items.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center border border-dashed rounded-xl">
            <ListChecks className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
            <p className="text-muted-foreground text-sm">No items yet.</p>
          </div>
        ) : items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-3 px-4 rounded-lg bg-secondary/40 border border-border/40 group hover:border-[#D4AF37]/30 transition-all">
            <CheckCircle2 className={cn("h-4 w-4 flex-shrink-0", item.active ? "text-primary" : "text-muted")} />
            <span className={cn("flex-1 text-sm", !item.active && "line-through text-muted-foreground")}>{item.text}</span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Switch checked={item.active} onCheckedChange={(v) => update({ id: item.id, active: v })} />
              <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" onClick={() => { setEditing(item); setOpen(true); }}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <DeleteConfirm
                trigger={<Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>}
                title="Delete this item?"
                onConfirm={() => remove(item.id)}
              />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>{(editing as WeeklyZoomInclude)?.id ? "Edit Item" : "New Item"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Text</Label>
                <Input value={editing.text ?? ""} onChange={(e) => setEditing({ ...editing, text: e.target.value })} placeholder="52 live Zoom sessions per year" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Order</Label>
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

// ─── SCHEDULE TAB ─────────────────────────────────────────────────────────────
function ScheduleTab() {
  const { items, isLoading, create, update, remove } = useCms<WeeklyZoomSchedule>("weekly-zoom-schedules");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<WeeklyZoomSchedule> | null>(null);

  const openNew = () => { setEditing({ label: "", day: "", time: "", tag: "Core", order: 0, active: true }); setOpen(true); };

  const save = async () => {
    if (!editing?.label) { toast.error("Label is required"); return; }
    if (!editing?.day)   { toast.error("Day is required"); return; }
    if (!editing?.time)  { toast.error("Time is required"); return; }
    try {
      if ((editing as WeeklyZoomSchedule).id) await update(editing);
      else await create(editing);
      setOpen(false);
    } catch { toast.error("Failed to save"); }
  };

  const tagColor: Record<string, string> = {
    Core:     "bg-primary/10 text-primary border-primary/20",
    Optional: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Bonus:    "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Always:   "bg-green-500/10 text-green-400 border-green-500/20",
    New:      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gold-bg text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add Row
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>
        ) : items.length === 0 ? (
          <div className="col-span-full h-32 flex flex-col items-center justify-center glass-card border-dashed">
            <Calendar className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
            <p className="text-muted-foreground text-sm">No schedule rows yet.</p>
          </div>
        ) : items.map((item) => (
          <div key={item.id} className="glass-card p-5 flex items-start gap-4 group hover:border-[#D4AF37]/40 transition-all duration-300 relative">
            {!item.active && (
              <div className="absolute top-0 right-0 bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">HIDDEN</div>
            )}
            <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-display font-bold text-sm">{item.label}</p>
                <span className={cn("text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border", tagColor[item.tag] ?? tagColor.Core)}>
                  {item.tag}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{item.day}</p>
              <p className="text-xs text-primary font-semibold mt-1">{item.time}</p>
            </div>
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" onClick={() => { setEditing(item); setOpen(true); }}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <DeleteConfirm
                trigger={<Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>}
                title="Delete this schedule row?"
                onConfirm={() => remove(item.id)}
              />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader><DialogTitle>{(editing as WeeklyZoomSchedule)?.id ? "Edit Row" : "New Row"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input value={editing.label ?? ""} onChange={(e) => setEditing({ ...editing, label: e.target.value })} placeholder="Live Session" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Input value={editing.day ?? ""} onChange={(e) => setEditing({ ...editing, day: e.target.value })} placeholder="Every Wednesday" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input value={editing.time ?? ""} onChange={(e) => setEditing({ ...editing, time: e.target.value })} placeholder="12:00 PM EST" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tag</Label>
                  <Select value={editing.tag ?? "Core"} onValueChange={(v) => setEditing({ ...editing, tag: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TAG_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input type="number" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.active ?? true} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                <Label>Active / Visible</Label>
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
  const { items, isLoading, create, update, remove } = useCms<WeeklyZoomTestimonial>("weekly-zoom-testimonials");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<WeeklyZoomTestimonial> | null>(null);

  const openNew = () => {
    setEditing({ name: "", title: "", sessions: "", quote: "", rating: 5, order: 0, active: true });
    setOpen(true);
  };

  const save = async () => {
    if (!editing?.name)  { toast.error("Name is required"); return; }
    if (!editing?.quote) { toast.error("Quote is required"); return; }
    try {
      if ((editing as WeeklyZoomTestimonial).id) await update(editing);
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
          <div className="col-span-full h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center glass-card border-dashed">
            <Star className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No testimonials yet. Add your first one!</p>
          </div>
        ) : items.map((t) => (
          <div key={t.id} className="glass-card p-6 space-y-4 group hover:border-[#D4AF37]/40 transition-all duration-300 relative">
            {!t.active && (
              <div className="absolute top-0 right-0 bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">HIDDEN</div>
            )}
            <div className="flex items-start justify-between">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("h-3.5 w-3.5", i < t.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-muted")} />
                ))}
              </div>
              <Switch checked={t.active} onCheckedChange={(v) => update({ id: t.id, active: v })} />
            </div>
            <p className="text-sm italic leading-relaxed text-foreground/80 line-clamp-4">"{t.quote}"</p>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{t.name}</div>
                {t.title    && <div className="text-[11px] text-muted-foreground truncate">{t.title}</div>}
                {t.sessions && <div className="text-[11px] text-primary truncate">{t.sessions}</div>}
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
          <DialogHeader><DialogTitle>{(editing as WeeklyZoomTestimonial)?.id ? "Edit Testimonial" : "New Testimonial"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Member Name</Label>
                  <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Marcus T." />
                </div>
                <div className="space-y-2">
                  <Label>Title / Location</Label>
                  <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Real Estate Investor, Florida" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Membership Since</Label>
                  <Input value={editing.sessions ?? ""} onChange={(e) => setEditing({ ...editing, sessions: e.target.value })} placeholder="Member since 2023" />
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
                <Textarea rows={4} value={editing.quote ?? ""} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} placeholder="Write the member's testimonial here..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Order</Label>
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
