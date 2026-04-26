import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCms, Project } from "@/hooks/use-cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Edit, Plus, Search, Trash2, Loader2, Upload, MapPin, BarChart3, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

const statusVariant = (s: string) => s === "Live" ? "bg-success/15 text-success border-success/30" : s === "In Progress" ? "bg-info/15 text-info border-info/30" : "bg-muted text-muted-foreground border-border";

export default function Projects() {
  const { items, isLoading, create, update, remove } = useCms<Project>("projects");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const filtered = items.filter(p =>
    (statusFilter === "all" || p.status === statusFilter) &&
    [p.title, p.client, p.category || "", p.location || ""].some(s => s?.toLowerCase().includes(search.toLowerCase()))
  );

  const openNew = () => { 
    setEditing({ title: "", client: "", status: "Live", category: "PRIVATE EQUITY EXIT", location: "", metric: "", description: "", date: new Date().toISOString().slice(0, 10), order: 0 }); 
    setOpen(true); 
  };

  const save = async () => {
    if (!editing?.title) { toast.error("Title required"); return; }
    try {
      if (editing.thumbnail_file) {
        const formData = new FormData();
        Object.entries(editing).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'thumbnail_file') {
            const val = typeof value === 'boolean' ? (value ? '1' : '0') : value as string;
            formData.append(key, val);
          }
        });
        formData.append('thumbnail_file', editing.thumbnail_file);
        
        if (editing.id) formData.append('_method', 'PUT');
        
        setUploadProgress(0);
        const endpoint = editing.id ? `/projects/${editing.id}` : `/projects`;
        
        await api.post(endpoint, formData, {
          onUploadProgress: (e) => {
            if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        
        setUploadProgress(null);
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      } else {
        const { thumbnail_file, ...rest } = editing;
        if (editing.id) await update(rest);
        else await create(rest);
      }
      
      setOpen(false);
      toast.success("Saved successfully");
    } catch (e) {
      setUploadProgress(null);
      toast.error("Failed to save project");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your portfolio and dynamic case studies."
        actions={<Button onClick={openNew} className="gold-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add project</Button>}
      />

      <div className="glass-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Live">Live</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Project</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-[#D4AF37]" /></TableCell></TableRow>
              ) : (
                <>
                  {filtered.map(p => (
                    <TableRow key={p.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden border border-white/5 flex-shrink-0">
                            {p.thumbnail ? <img src={p.thumbnail} className="w-full h-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground/30" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm truncate">{p.title}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-2 w-2" /> {p.location || "No location"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <div className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1">
                            <BarChart3 className="h-2.5 w-2.5" /> {p.metric || "N/A"}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{p.client}</div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold bg-white/5">{p.category}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-[10px]", statusVariant(p.status))}>{p.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10" onClick={() => { setEditing(p); setOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                          <DeleteConfirm
                            trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>}
                            title={`Delete "${p.title}"?`}
                            onConfirm={() => remove(p.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No projects found</TableCell></TableRow>}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Project" : "New Project"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-4">
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border group-hover:border-[#D4AF37]/50 transition-colors cursor-pointer relative">
                    {editing.thumbnail || (editing.thumbnail_file && URL.createObjectURL(editing.thumbnail_file)) ? (
                      <img src={editing.thumbnail || (editing.thumbnail_file ? URL.createObjectURL(editing.thumbnail_file) : "")} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <span className="text-sm text-muted-foreground">Upload Project Header</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setEditing({ ...editing, thumbnail_file: file, thumbnail: null });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Title</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Quantum Tower" /></div>
                <div className="space-y-2"><Label>Location</Label><Input value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })} placeholder="AUSTIN, TX" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Metric / Result</Label><Input value={editing.metric} onChange={e => setEditing({ ...editing, metric: e.target.value })} placeholder="33% IRR" /></div>
                <div className="space-y-2"><Label>Client</Label><Input value={editing.client} onChange={e => setEditing({ ...editing, client: e.target.value })} placeholder="Apex Global" /></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Category</Label>
                  <Input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="PRIVATE EQUITY EXIT" />
                </div>
                <div className="space-y-2"><Label>Status</Label>
                  <Select value={editing.status} onValueChange={v => setEditing({ ...editing, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["Draft", "In Progress", "Live"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} /></div>
              </div>

              <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Describe the project objective and results..." /></div>
              
              {uploadProgress !== null && (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                    <span>Uploading Assets</span>
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
              {uploadProgress !== null ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
