import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCms, TimelineEvent, Achievement, AboutHero, AboutDifference } from "@/hooks/use-cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, History, Plus, Star, Trash2, Loader2, GripVertical, Trophy, Sparkles, Target, Quote, Layers } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AboutManager() {
  const { items: timeline, isLoading: isTimelineLoading, create: createTimeline, update: updateTimeline, remove: removeTimeline, reorder: reorderTimeline } = useCms<TimelineEvent>("timeline");
  const { items: achievements, isLoading: isAchievementsLoading, create: createAchievement, update: updateAchievement, remove: removeAchievement } = useCms<Achievement>("achievements");
  const { items: heroItems, update: updateHero, isMutating: isHeroUpdating } = useCms<AboutHero>("about-hero");
  const { items: differences, isLoading: isDiffLoading, create: createDiff, update: updateDiff, remove: removeDiff, reorder: reorderDiff } = useCms<AboutDifference>("about-differences");

  const hero = heroItems[0] || {};
  const [heroForm, setHeroForm] = useState<Partial<AboutHero>>(hero);
  const [heroFile, setHeroFile] = useState<File | null>(null);

  const [open, setOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<Partial<TimelineEvent> | null>(null);
  
  const [achOpen, setAchOpen] = useState(false);
  const [editingAch, setEditingAch] = useState<Partial<Achievement> | null>(null);

  const [diffOpen, setDiffOpen] = useState(false);
  const [editingDiff, setEditingDiff] = useState<Partial<AboutDifference> | null>(null);

  // Sync heroForm when heroItems load
  useEffect(() => {
    if (heroItems[0]) {
      setHeroForm(heroItems[0]);
    }
  }, [heroItems]);

  const handleHeroSave = async () => {
    try {
      const formData = new FormData();
      formData.append("label", heroForm.label || "");
      formData.append("title_main", heroForm.title_main || "");
      formData.append("title_gold", heroForm.title_gold || "");
      formData.append("description", heroForm.description || "");
      formData.append("active", (heroForm.active ?? true) ? "1" : "0");
      
      formData.append("vision_label", heroForm.vision_label || "");
      formData.append("vision_title_main", heroForm.vision_title_main || "");
      formData.append("vision_title_gold", heroForm.vision_title_gold || "");
      formData.append("vision_content_1", heroForm.vision_content_1 || "");
      formData.append("vision_content_2", heroForm.vision_content_2 || "");
      formData.append("quote_text", heroForm.quote_text || "");
      formData.append("quote_attribution", heroForm.quote_attribution || "");
      
      formData.append("diff_label", heroForm.diff_label || "");
      formData.append("diff_title_main", heroForm.diff_title_main || "");
      formData.append("diff_title_gold", heroForm.diff_title_gold || "");

      if (heroFile) formData.append("image_file", heroFile);

      await updateHero(formData as any);
      setHeroFile(null);
    } catch (e) {}
  };

  const openNewTimeline = () => {
    setEditingTimeline({ year_or_age: "", title: "", is_notable: false, order: timeline.length });
    setOpen(true);
  };

  const openNewDiff = () => {
    setEditingDiff({ title: "", description: "", active: true, order: differences.length });
    setDiffOpen(true);
  };

  const handleDiffSave = async () => {
    if (!editingDiff) return;
    try {
      if (editingDiff.id) {
        await updateDiff(editingDiff as AboutDifference);
      } else {
        await createDiff(editingDiff as AboutDifference);
      }
      setDiffOpen(false);
      setEditingDiff(null);
    } catch (e) {}
  };

  const openNewAch = () => {
    setEditingAch({ value: "", label: "", description: "", active: true, order: achievements.length });
    setAchOpen(true);
  };

  const handleAchSave = async () => {
    if (!editingAch?.value || !editingAch?.label) {
        toast.error("Value and Label required");
        return;
    }
    try {
      if (editingAch.id) await updateAchievement(editingAch as Achievement);
      else await createAchievement(editingAch as Achievement);
      setAchOpen(false);
    } catch (e) {}
  };

  const saveTimeline = async () => {
    if (!editingTimeline?.year_or_age || !editingTimeline?.title) {
        toast.error("Year and Title required");
        return;
    }
    try {
      if (editingTimeline.id) await updateTimeline(editingTimeline as TimelineEvent);
      else await createTimeline(editingTimeline as TimelineEvent);
      setOpen(false);
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="About Page Manager"
        description="Manage your chronological timeline and business achievements milestones."
      />

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="hero" className="flex items-center gap-2 px-6">
            <Sparkles className="h-4 w-4" /> Hero Section
          </TabsTrigger>
          <TabsTrigger value="vision" className="flex items-center gap-2 px-6">
            <Target className="h-4 w-4" /> Vision & Quote
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2 px-6">
            <History className="h-4 w-4" /> Chronicles
          </TabsTrigger>
          <TabsTrigger value="differences" className="flex items-center gap-2 px-6">
            <Layers className="h-4 w-4" /> Differentiation
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2 px-6">
            <Trophy className="h-4 w-4" /> Milestones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6 outline-none">
          <div className="glass-card p-6 border-primary/20">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><Sparkles className="h-5 w-5 gold-text" /> Hero Configuration</h3>
            
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Branding Label</Label>
                  <Input placeholder="e.g. The Man Behind The Mission" value={heroForm.label || ""} onChange={e => setHeroForm({ ...heroForm, label: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Main Title Part</Label>
                    <Input placeholder="e.g. The Story Behind" value={heroForm.title_main || ""} onChange={e => setHeroForm({ ...heroForm, title_main: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Gold Title Part</Label>
                    <Input placeholder="e.g. Adam Cohen" value={heroForm.title_gold || ""} onChange={e => setHeroForm({ ...heroForm, title_gold: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Hero description..." rows={4} value={heroForm.description || ""} onChange={e => setHeroForm({ ...heroForm, description: e.target.value })} />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Switch checked={heroForm.active ?? true} onCheckedChange={v => setHeroForm({ ...heroForm, active: v })} />
                  <Label>Visible on Website</Label>
                </div>
                <Button onClick={handleHeroSave} disabled={isHeroUpdating} className="gold-bg text-primary-foreground w-full mt-4">
                  {isHeroUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Save Hero Section
                </Button>
              </div>

              <div className="space-y-4">
                <Label>Portrait Image</Label>
                <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-border aspect-[4/5] bg-muted/30">
                  {heroFile || heroForm.image ? (
                    <img 
                      src={heroFile ? URL.createObjectURL(heroFile) : heroForm.image} 
                      alt="Hero Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Plus className="h-12 w-12 mb-2 opacity-20" />
                      <span>Upload Portrait</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && setHeroFile(e.target.files[0])}
                  />
                  {(heroFile || heroForm.image) && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 pointer-events-none">
                       <p className="text-white text-xs font-medium text-center">Click or drag to replace image</p>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">Recommended: 800x1000px JPG/PNG</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vision" className="space-y-6 outline-none">
          <div className="glass-card p-6 border-primary/20">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><Target className="h-5 w-5 gold-text" /> Vision & Leadership</h3>
            
            <div className="grid lg:grid-cols-2 gap-8 mb-8 border-b border-border pb-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Vision Label</Label>
                  <Input placeholder="e.g. The North Star" value={heroForm.vision_label || ""} onChange={e => setHeroForm({ ...heroForm, vision_label: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vision Title (Main)</Label>
                    <Input placeholder="e.g. Vision &" value={heroForm.vision_title_main || ""} onChange={e => setHeroForm({ ...heroForm, vision_title_main: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vision Title (Gold)</Label>
                    <Input placeholder="e.g. Leadership" value={heroForm.vision_title_gold || ""} onChange={e => setHeroForm({ ...heroForm, vision_title_gold: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Vision Paragraph 1</Label>
                    <Textarea placeholder="First paragraph..." rows={3} value={heroForm.vision_content_1 || ""} onChange={e => setHeroForm({ ...heroForm, vision_content_1: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label>Vision Paragraph 2</Label>
                    <Textarea placeholder="Second paragraph..." rows={3} value={heroForm.vision_content_2 || ""} onChange={e => setHeroForm({ ...heroForm, vision_content_2: e.target.value })} />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><Quote className="h-5 w-5 gold-text" /> Featured Quote</h3>
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Quote Text</Label>
                  <Textarea placeholder="The featured quote..." rows={4} value={heroForm.quote_text || ""} onChange={e => setHeroForm({ ...heroForm, quote_text: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Quote Attribution</Label>
                  <Input placeholder="e.g. Adam Cohen" value={heroForm.quote_attribution || ""} onChange={e => setHeroForm({ ...heroForm, quote_attribution: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <div className="glass-card p-8 border-l-4 border-primary bg-primary/5 max-w-sm italic text-muted-foreground">
                    "{heroForm.quote_text || "Quote preview..."}"
                    <div className="mt-4 font-bold not-italic text-foreground">— {heroForm.quote_attribution || "Attribution"}</div>
                 </div>
              </div>
            </div>

            <Button onClick={handleHeroSave} disabled={isHeroUpdating} className="gold-bg text-primary-foreground w-full">
              {isHeroUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Save Vision & Quote
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6 outline-none">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2"><History className="h-5 w-5 gold-text" /> Chronicles Timeline</h3>
            <Button onClick={openNewTimeline} className="gold-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Milestone</Button>
          </div>
          
          {isTimelineLoading ? (
            <div className="h-32 flex items-center justify-center glass-card"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <TimelineList 
              items={timeline} 
              onReorder={reorderTimeline}
              onEdit={(event) => { setEditingTimeline(event); setOpen(true); }}
              onDelete={(id) => removeTimeline(id)}
            />
          )}
        </TabsContent>

        <TabsContent value="differences" className="space-y-6 outline-none">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Layers className="h-5 w-5 gold-text" /> Differentiation</h3>
            <Button onClick={openNewDiff} className="gold-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Card</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {differences.sort((a,b) => a.order - b.order).map((diff) => (
              <div key={diff.id} className="glass-card p-6">
                <h4 className="font-bold text-lg mb-2">{diff.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{diff.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditingDiff(diff); setDiffOpen(true); }}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
                  <DeleteConfirm
                    trigger={<Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                    title="Delete card?"
                    onConfirm={() => removeDiff(diff.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6 outline-none">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Trophy className="h-5 w-5 gold-text" /> Business Milestones</h3>
            <Button onClick={openNewAch} className="gold-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Achievement</Button>
          </div>

          {isAchievementsLoading ? (
            <div className="h-32 flex items-center justify-center glass-card"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.sort((a,b) => a.order - b.order).map((ach) => (
                <div key={ach.id} className={cn("glass-card p-6 relative group transition-all", !ach.active && "opacity-60")}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 gold-bg rounded-lg grid place-items-center text-primary-foreground">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingAch(ach); setAchOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <DeleteConfirm
                        trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                        title="Delete achievement?"
                        onConfirm={() => removeAchievement(ach.id)}
                      />
                    </div>
                  </div>
                  <div className="text-3xl font-display font-bold gold-text mb-1">{ach.value}</div>
                  <div className="font-semibold text-lg">{ach.label}</div>
                  <p className="text-sm text-muted-foreground mt-2">{ach.description}</p>
                </div>
              ))}
              {achievements.length === 0 && <div className="col-span-full text-center py-12 glass-card text-muted-foreground border-dashed">No business achievements added yet.</div>}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Timeline Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTimeline?.id ? "Edit Milestone" : "New Milestone"}</DialogTitle></DialogHeader>
          {editingTimeline && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Year / Age</Label><Input placeholder="e.g. 2024" value={editingTimeline.year_or_age} onChange={e => setEditingTimeline({ ...editingTimeline, year_or_age: e.target.value })} /></div>
                  <div className="col-span-2 space-y-2"><Label>Title</Label><Input placeholder="Milestone title" value={editingTimeline.title} onChange={e => setEditingTimeline({ ...editingTimeline, title: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Details about this achievement..." rows={3} value={editingTimeline.description} onChange={e => setEditingTimeline({ ...editingTimeline, description: e.target.value })} /></div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="space-y-0.5"><Label className="text-sm">Notable Milestone</Label><div className="text-xs text-muted-foreground">Highlight this with a star and special styling</div></div>
                <Switch checked={editingTimeline.is_notable} onCheckedChange={v => setEditingTimeline({ ...editingTimeline, is_notable: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveTimeline} className="gold-bg text-primary-foreground">Save Milestone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Achievement Dialog */}
      <Dialog open={achOpen} onOpenChange={setAchOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAch?.id ? "Edit Milestone" : "Add New Milestone"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Value (e.g. 500M+)</Label>
              <Input value={editingAch?.value || ""} onChange={e => setEditingAch({ ...editingAch, value: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Label (e.g. Assets Managed)</Label>
              <Input value={editingAch?.label || ""} onChange={e => setEditingAch({ ...editingAch, label: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Short highlight..." rows={2} value={editingAch?.description || ""} onChange={e => setEditingAch({ ...editingAch, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editingAch?.active ?? true} onCheckedChange={v => setEditingAch({ ...editingAch, active: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAchOpen(false)}>Cancel</Button>
            <Button onClick={handleAchSave} className="gold-bg text-primary-foreground">Save Milestone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Differentiation Dialog */}
      <Dialog open={diffOpen} onOpenChange={setDiffOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingDiff?.id ? "Edit Differentiation Card" : "Add New Card"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title (e.g. Discipline)</Label>
              <Input value={editingDiff?.title || ""} onChange={e => setEditingDiff({ ...editingDiff, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Explain this differentiator..." rows={3} value={editingDiff?.description || ""} onChange={e => setEditingDiff({ ...editingDiff, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editingDiff?.active ?? true} onCheckedChange={v => setEditingDiff({ ...editingDiff, active: v })} />
              <Label>Visible</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiffOpen(false)}>Cancel</Button>
            <Button onClick={handleDiffSave} className="gold-bg text-primary-foreground">Save Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimelineList({ items, onReorder, onEdit, onDelete }: { items: TimelineEvent[], onReorder: (ids: string[]) => void, onEdit: (e: TimelineEvent) => void, onDelete: (id: string) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems.map(i => i.id));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 gap-3">
          {items.sort((a,b) => a.order - b.order).map((event) => (
            <SortableTimelineItem key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} />
          ))}
          {items.length === 0 && <div className="text-center py-12 glass-card text-muted-foreground border-dashed">No timeline events added yet.</div>}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableTimelineItem({ event, onEdit, onDelete }: { event: TimelineEvent, onEdit: (e: TimelineEvent) => void, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("glass-card p-4 flex items-center gap-4 group", isDragging && "opacity-50 ring-2 ring-primary bg-sidebar-accent")}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground"><GripVertical className="h-5 w-5" /></div>
      <div className="w-20 text-center shrink-0">
          <div className="text-sm font-bold gold-text">{event.year_or_age}</div>
          {event.is_notable && <div className="text-[10px] uppercase font-bold text-primary mt-0.5 flex items-center justify-center gap-0.5"><Star className="h-2 w-2 fill-current" /> Notable</div>}
      </div>
      <div className="flex-1 min-w-0 border-l border-border pl-4">
        <div className="font-semibold text-foreground">{event.title}</div>
        <div className="text-sm text-muted-foreground truncate">{event.description}</div>
      </div>
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(event)}><Edit className="h-4 w-4" /></Button>
        <DeleteConfirm
          trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>}
          title="Delete milestone?"
          onConfirm={() => onDelete(event.id)}
        />
      </div>
    </div>
  );
}

