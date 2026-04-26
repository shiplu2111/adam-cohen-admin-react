import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCms, Podcast } from "@/hooks/use-cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Edit, Headphones, Plus, Trash2, Loader2, Upload, FileAudio, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function Podcasts() {
  const { items, isLoading, create, update, remove } = useCms<Podcast>("podcasts");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const filtered = items.filter(p =>
    [p.title, p.host, p.guest || ""].some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const openNew = () => { setEditing({ title: "", host: "", duration: "", plays: 0, link: "", category: "", episode_number: "", description: "", published_at: new Date().toISOString().slice(0, 10) }); setOpen(true); };

  const save = async () => {
    if (!editing?.title) return;
    try {
      if (editing.audio_file) {
        // Use direct axios call to track upload progress
        const formData = new FormData();
        Object.entries(editing).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'audio_file') {
            formData.append(key, value as string);
          }
        });
        formData.append('audio_file', editing.audio_file);

        setUploadProgress(0);
        const endpoint = editing.id ? `/podcasts/${editing.id}` : `/podcasts`;
        if (editing.id) formData.append('_method', 'PUT');

        await api.post(endpoint, formData, {
          onUploadProgress: (e) => {
            if (e.total) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          },
        });

        setUploadProgress(null);
        queryClient.invalidateQueries({ queryKey: ["podcasts"] });
      } else {
        // No file — use the standard hook
        const { audio_file, ...rest } = editing;
        if (editing.id) await update(rest);
        else await create(rest);
      }

      setOpen(false);
      toast.success("Saved");
    } catch (e) {
      setUploadProgress(null);
      toast.error("Failed to save episode.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Podcasts"
        description="Episodes published to the Adam Cohen Today channel."
        actions={<Button onClick={openNew} className="gold-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> New episode</Button>}
      />

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Title</TableHead><TableHead>Host</TableHead><TableHead>Duration</TableHead><TableHead>Plays</TableHead><TableHead>Published</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
            ) : (
              <>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3"><div className="h-8 w-8 rounded gold-bg grid place-items-center"><Headphones className="h-4 w-4 text-primary-foreground" /></div>{p.title}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.host}</TableCell>
                    <TableCell className="text-muted-foreground">{p.duration}</TableCell>
                    <TableCell className="font-medium">{p.plays.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.published_at}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(p); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        <DeleteConfirm
                          trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                          title={`Delete episode?`}
                          onConfirm={() => remove(p.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit episode" : "New episode"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
              <div className="space-y-2"><Label>Title</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Episode Number</Label><Input value={editing.episode_number || ""} onChange={e => setEditing({ ...editing, episode_number: e.target.value })} placeholder="EP.142" /></div>
                <div className="space-y-2"><Label>Category / Tag</Label><Input value={editing.category || ""} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="FINANCE" /></div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="An deep dive into macroeconomic trends..." />
              </div>

              <div className="space-y-2">
                <Label>Audio file {editing.audio_file && <span className="text-primary">(Selected: {editing.audio_file.name})</span>}</Label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors">
                  <div className="h-10 w-10 rounded-full gold-bg grid place-items-center">
                    <Upload className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="text-sm font-medium">Drop your MP3/WAV here</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><FileAudio className="h-3 w-3" /> Max 200MB · MP3, WAV, M4A</div>
                  <input type="file" accept="audio/*" className="hidden" onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setEditing({ ...editing, audio_file: e.target.files[0] });
                    }
                  }} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Host</Label><Input value={editing.host} onChange={e => setEditing({ ...editing, host: e.target.value })} /></div>
                <div className="space-y-2"><Label>Duration</Label><Input value={editing.duration || ""} onChange={e => setEditing({ ...editing, duration: e.target.value })} placeholder="42:18 / 52m" /></div>
                <div className="space-y-2"><Label>Plays</Label><Input type="number" value={editing.plays} onChange={e => setEditing({ ...editing, plays: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Published</Label><Input type="date" value={editing.published_at?.split('T')[0] || ''} onChange={e => setEditing({ ...editing, published_at: e.target.value })} /></div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-3 sm:flex-col">
            {uploadProgress !== null && (
              <div className="w-full space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Uploading audio file...
                  </span>
                  <span className={uploadProgress === 100 ? "text-green-500 flex items-center gap-1" : "text-primary"}>
                    {uploadProgress === 100 ? (
                      <><CheckCircle2 className="h-3 w-3" /> Done</>
                    ) : `${uploadProgress}%`}
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${uploadProgress}%`,
                      background: uploadProgress === 100
                        ? "hsl(var(--green-500, 142 71% 45%))"
                        : "linear-gradient(90deg, #D4AF37, #C19B2E)",
                    }}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={uploadProgress !== null}>Cancel</Button>
              <Button onClick={save} className="gold-bg text-primary-foreground" disabled={uploadProgress !== null}>
                {uploadProgress !== null ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</> : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
