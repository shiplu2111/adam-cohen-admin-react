import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCms, HeroSlide, SocialStat } from "@/hooks/use-cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Edit, Image as ImageIcon, Layout, Plus, Trash2, Loader2, GripVertical, Sparkles, Globe } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageCropper } from "@/components/cms/ImageCropper";

export default function HomepageManager() {
  const { items, isLoading, create, update, remove } = useCms<HeroSlide>("hero");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<HeroSlide> | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState<"bg" | "portrait" | null>(null);

  const openNew = () => {
    setEditing({ type: "networking", active: true, order: items.length });
    setBgFile(null);
    setPortraitFile(null);
    setOpen(true);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "bg" | "portrait") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(reader.result as string);
        setCropType(type);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (blob: Blob) => {
    const fileName = cropType === "bg" ? "hero-bg.jpg" : "hero-portrait.jpg";
    const croppedFile = new File([blob], fileName, { type: "image/jpeg" });
    
    if (cropType === "bg") setBgFile(croppedFile);
    if (cropType === "portrait") setPortraitFile(croppedFile);
    
    setCropImage(null);
    setCropType(null);
  };

  const save = async () => {
    try {
      const formData = new FormData();
      if (editing?.id) formData.append("id", editing.id);
      
      Object.entries(editing || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'bg_image' && key !== 'portrait_image') {
          formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
        }
      });

      if (bgFile) formData.append("bg_image_file", bgFile);
      else if (editing?.bg_image) formData.append("bg_image", editing.bg_image);

      if (portraitFile) formData.append("portrait_image_file", portraitFile);
      else if (editing?.portrait_image) formData.append("portrait_image", editing.portrait_image);

      if (editing?.id) {
        await update(formData as any);
      } else {
        await create(formData as any);
      }
      setOpen(false);
      setBgFile(null);
      setPortraitFile(null);
    } catch (e) { }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage Manager"
        description="Configure your website's hero slider and homepage sections."
        actions={<Button onClick={openNew} className="gold-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Slide</Button>}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Layout className="h-5 w-5 gold-text" /> Hero Slider</h3>

        {isLoading ? (
          <div className="h-32 flex items-center justify-center glass-card"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid gap-4">
            {items.map((slide) => (
              <div key={slide.id} className="glass-card p-4 flex items-center gap-4 group">
                <div className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground"><GripVertical className="h-5 w-5" /></div>
                <div className="h-16 w-24 rounded-md bg-muted overflow-hidden relative">
                  {slide.bg_image ? (
                    <img src={slide.bg_image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center"><ImageIcon className="h-6 w-6 text-muted-foreground/20" /></div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px] uppercase font-bold">{slide.type}</Badge>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{slide.title1 || "Untitled Slide"}</div>
                  <div className="text-xs text-muted-foreground truncate">{slide.title2} {slide.title3}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={slide.active} onCheckedChange={(v) => update({ id: slide.id, active: v })} />
                  <div className="flex gap-1 border-l border-border pl-3">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { 
                      setEditing(slide); 
                      setBgFile(null);
                      setPortraitFile(null);
                      setOpen(true); 
                    }}><Edit className="h-4 w-4" /></Button>
                    <DeleteConfirm
                      trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                      title="Delete slide?"
                      onConfirm={() => remove(slide.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="text-center py-12 glass-card text-muted-foreground border-dashed">No slides configured. Add your first hero slide to get started.</div>}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Slide" : "New Hero Slide"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-full space-y-2">
                <Label>Slide Type</Label>
                <Select value={editing.type} onValueChange={(v: any) => setEditing({ ...editing, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="networking">Networking (Red Gradient)</SelectItem>
                    <SelectItem value="taxes">Taxes (Yellow Glow)</SelectItem>
                    <SelectItem value="podcast">Podcast (Orange/Transparent)</SelectItem>
                    <SelectItem value="ads">Ads (Yellow Box)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2"><Label>Main Heading (Line 1)</Label><Input value={editing.title1} onChange={e => setEditing({ ...editing, title1: e.target.value })} /></div>
              <div className="space-y-2"><Label>Heading Line 2</Label><Input value={editing.title2} onChange={e => setEditing({ ...editing, title2: e.target.value })} /></div>
              <div className="space-y-2"><Label>Heading Line 3</Label><Input value={editing.title3} onChange={e => setEditing({ ...editing, title3: e.target.value })} /></div>
              <div className="space-y-2"><Label>Subtext / Line 4</Label><Input value={editing.title4} onChange={e => setEditing({ ...editing, title4: e.target.value })} /></div>

              {editing.type === 'networking' && (
                <>
                  <div className="space-y-2"><Label>Location</Label><Input value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Date Text</Label><Input value={editing.date_text} onChange={e => setEditing({ ...editing, date_text: e.target.value })} /></div>
                </>
              )}

              <div className="space-y-2">
                <Label>Background Image</Label>
                <div className="flex flex-col gap-2">
                  {editing.bg_image && !bgFile && (
                    <img src={editing.bg_image} className="h-20 w-full object-cover rounded-md border" />
                  )}
                  {bgFile && (
                    <div className="h-20 w-full rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      New file selected: {bgFile.name}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input type="file" accept="image/*" onChange={e => onFileSelect(e, "bg")} className="flex-1" />
                    {bgFile && <Button variant="ghost" size="icon" onClick={() => setBgFile(null)}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                  <Input placeholder="Or enter URL" value={editing.bg_image || ''} onChange={e => setEditing({ ...editing, bg_image: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Portrait Image</Label>
                <div className="flex flex-col gap-2">
                  {editing.portrait_image && !portraitFile && (
                    <img src={editing.portrait_image} className="h-20 w-20 object-cover rounded-md border mx-auto" />
                  )}
                  {portraitFile && (
                    <div className="h-20 w-20 rounded-md border bg-muted flex items-center justify-center text-[10px] text-muted-foreground mx-auto text-center p-1">
                      {portraitFile.name}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input type="file" accept="image/*" onChange={e => onFileSelect(e, "portrait")} className="flex-1" />
                    {portraitFile && <Button variant="ghost" size="icon" onClick={() => setPortraitFile(null)}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                  <Input placeholder="Or enter URL" value={editing.portrait_image || ''} onChange={e => setEditing({ ...editing, portrait_image: e.target.value })} />
                </div>
              </div>

              <div className="col-span-full border-t pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={v => setEditing({ ...editing, active: v })} /><Label>Visible on website</Label></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="gold-bg text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ImageCropper
        image={cropImage}
        aspect={cropType === "bg" ? 16 / 7 : 3 / 4}
        title={`Crop ${cropType === "bg" ? "Background" : "Portrait"} Image`}
        onCropComplete={onCropComplete}
        onCancel={() => { setCropImage(null); setCropType(null); }}
      />

      <div className="space-y-4 pt-8 border-t border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 gold-text" /> Engagement Stats</h3>
        <p className="text-sm text-muted-foreground mb-4">Manage the follower counts displayed on your homepage.</p>

        <StatsManager />
      </div>
    </div>
  );
}

function StatsManager() {
  const { items, isLoading, update } = useCms<SocialStat>("social-stats");

  if (isLoading) return <div className="h-20 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((stat) => (
        <div key={stat.id} className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> {stat.platform}
            </span>
            <Switch checked={stat.active} onCheckedChange={(v) => update({ id: stat.id, active: v })} />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Follower Count</Label>
            <div className="flex gap-2">
              <Input
                value={stat.value}
                onChange={(e) => update({ id: stat.id, value: e.target.value })}
                className="h-8 text-sm font-black"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Badge({ variant, className, children }: any) {
  return <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", className)}>{children}</span>
}
