import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ReactPlayer from "react-player";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  MonitorPlay,
  Link as LinkIcon,
  Users,
  LayoutGrid,
  Settings2,
  ExternalLink,
  Play,
  Calendar,
  Search,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import {
  getCohenTvs,
  createCohenTv,
  updateCohenTv,
  deleteCohenTv,
  CohenTv,
} from "../../api/cohenTv";
import {
  getCohenTvVideos,
  createCohenTvVideo,
  updateCohenTvVideo,
  deleteCohenTvVideo,
  CohenTvVideo,
} from "../../api/cohenTvVideo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  "HLS",
  "DASH",
  "Mux",
  "YouTube",
  "Vimeo",
  "Wistia",
  "Spotify",
  "Twitch",
  "TikTok",
];

type Tab = "channels" | "videos";

export default function CohenTvManager() {
  const [activeTab, setActiveTab] = useState<Tab>("channels");
  const [channels, setChannels] = useState<CohenTv[]>([]);

  const fetchChannels = async () => {
    try {
      const response = await getCohenTvs();
      setChannels(response.data);
    } catch {
      toast.error("Failed to load providers");
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohen TV"
        description="Configure broadcasting platforms and manage video content for Cohen TV."
      />

      <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-secondary/50 border border-border w-fit">
        <button
          onClick={() => setActiveTab("channels")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === "channels"
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings2 className="h-4 w-4" />
          TV Channels
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === "videos"
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          Cohen TV Videos
        </button>
      </div>

      {activeTab === "channels" && (
        <ChannelsTab items={channels} onRefresh={fetchChannels} />
      )}
      {activeTab === "videos" && (
        <VideosTab channels={channels} />
      )}
    </div>
  );
}

// ─── CHANNELS TAB ─────────────────────────────────────────────────────────────
interface ChannelFormData {
  platform_type: string;
  platform_name: string;
  name: string;
  subscribers: string;
  url: string;
  is_published: boolean;
  logo_file?: FileList;
}

function ChannelsTab({ items, onRefresh }: { items: CohenTv[]; onRefresh: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CohenTv | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<ChannelFormData>({
    defaultValues: {
      platform_type: "",
      platform_name: "",
      name: "",
      subscribers: "",
      url: "",
      is_published: true,
    },
  });

  const selectedPlatform = watch("platform_type");
  useEffect(() => {
    if (selectedPlatform) setValue("platform_name", selectedPlatform);
  }, [selectedPlatform, setValue]);

  const onSubmit = async (data: ChannelFormData) => {
    try {
      const formData = new FormData();
      formData.append("platform_name", data.platform_name || "");
      formData.append("name", data.name || "");
      formData.append("subscribers", data.subscribers || "");
      formData.append("url", data.url || "");
      formData.append("is_published", data.is_published ? "1" : "0");
      if (data.logo_file?.length) formData.append("logo_file", data.logo_file[0]);

      if (editingItem) await updateCohenTv(editingItem.id, formData);
      else await createCohenTv(formData);

      toast.success(editingItem ? "Platform updated" : "Platform created");
      setIsModalOpen(false);
      onRefresh();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleEdit = (item: CohenTv) => {
    setEditingItem(item);
    reset({
      platform_type: item.platform_name || "",
      platform_name: item.platform_name || "",
      name: item.name || "",
      subscribers: item.subscribers || "",
      url: item.url || "",
      is_published: item.is_published,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this platform? All associated videos will also be deleted.")) {
      try {
        await deleteCohenTv(id);
        toast.success("Deleted");
        onRefresh();
      } catch {
        toast.error("Failed to delete");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingItem(null);
            reset();
            setIsModalOpen(true);
          }}
          className="gold-bg text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Platform
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/40">
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Subs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No channels configured
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="group border-border hover:bg-secondary/10 transition-colors">
                  <TableCell>
                    <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden">
                      {item.logo ? (
                        <img src={item.logo} className="h-full w-full object-contain" />
                      ) : (
                        <MonitorPlay className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-foreground">{item.platform_name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-foreground border-border">
                      {item.subscribers || "0"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.is_published ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/10">
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Hidden</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-secondary"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-border bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Channel" : "Add New Channel"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform Type</Label>
                <select
                  {...register("platform_type", { required: true })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select...</option>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Platform Name</Label>
                <Input
                  {...register("platform_name")}
                  readOnly
                  className="bg-secondary/50 text-muted-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input {...register("name")} placeholder="e.g. Official Adam Cohen" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subscribers String</Label>
                <Input {...register("subscribers")} placeholder="e.g. 1.2M Subs" />
              </div>
              <div className="space-y-2">
                <Label>Channel Logo</Label>
                <Input
                  type="file"
                  {...register("logo_file")}
                  accept="image/*"
                  className="cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Channel URL</Label>
              <Input {...register("url")} type="url" placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={watch("is_published")}
                onCheckedChange={(v) => setValue("is_published", v)}
              />
              <Label>Publish to Cohen TV</Label>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gold-bg text-primary-foreground hover:bg-yellow-500">
                Save Platform
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── VIDEOS TAB ───────────────────────────────────────────────────────────────
function VideosTab({ channels }: { channels: CohenTv[] }) {
  const [items, setItems] = useState<CohenTvVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CohenTvVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<CohenTvVideo | null>(null);
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<{
    cohen_tv_id: string;
    title: string;
    host: string;
    duration: string;
    date: string;
    link: string;
    type: string;
    order: number;
    is_published: boolean;
    thumbnail_file?: FileList;
  }>({
    defaultValues: {
      cohen_tv_id: "",
      title: "",
      type: "Cohen TV",
      host: "Adam Cohen",
      duration: "",
      date: new Date().toISOString().split("T")[0],
      link: "",
      order: 0,
      is_published: true,
    },
  });

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const response = await getCohenTvVideos();
      setItems(response.data);
    } catch {
      toast.error("Failed to fetch videos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("cohen_tv_id", data.cohen_tv_id);
      formData.append("title", data.title);
      formData.append("type", data.type);
      formData.append("host", data.host);
      formData.append("duration", data.duration);
      formData.append("date", data.date);
      formData.append("link", data.link);
      formData.append("order", String(data.order));
      formData.append("is_published", data.is_published ? "1" : "0");
      if (data.thumbnail_file?.length) {
        formData.append("thumbnail_file", data.thumbnail_file[0]);
      }

      if (editingItem) {
        await updateCohenTvVideo(editingItem.id, formData);
      } else {
        await createCohenTvVideo(formData);
      }

      toast.success(editingItem ? "Video updated" : "Video added");
      setIsModalOpen(false);
      fetchVideos();
    } catch {
      toast.error("Failed to save video");
    }
  };

  const handleEdit = (video: CohenTvVideo) => {
    setEditingItem(video);
    reset({
      cohen_tv_id: String(video.cohen_tv_id),
      title: video.title,
      host: video.host || "",
      duration: video.duration || "",
      date: video.date ? video.date.split("T")[0] : "",
      link: video.link,
      type: video.type || "Cohen TV",
      order: video.order,
      is_published: video.is_published,
    });
    setIsModalOpen(true);
  };

  const handlePreview = (video: CohenTvVideo) => {
    setPreviewVideo(video);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this video?")) {
      try {
        await deleteCohenTvVideo(id);
        toast.success("Deleted");
        fetchVideos();
      } catch {
        toast.error("Failed to delete");
      }
    }
  };

  const filtered = items.filter(
    (p) =>
      (p.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (p.host?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            reset();
            setIsModalOpen(true);
          }}
          className="gold-bg text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Video
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No videos found. Add your first one!
          </div>
        ) : (
          filtered.map((video) => (
            <div
              key={video.id}
              className="glass-card group overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 bg-background flex flex-col"
            >
              <div
                className="aspect-video relative overflow-hidden bg-secondary cursor-pointer"
                onClick={() => handlePreview(video)}
              >
                {video.thumbnail ? (
                  <img src={video.thumbnail} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-black/5">
                    <ReactPlayer
                      src={video.link}
                      width="100%"
                      height="100%"
                      controls
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 backdrop-blur-md border border-primary/50 flex items-center justify-center">
                    <Play className="h-4 w-4 text-primary fill-primary" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  {video.channel && (
                    <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">
                      {video.channel.platform_name}
                    </Badge>
                  )}
                  <Badge className={cn("text-[10px] border-none shadow-none", video.type === 'Podcast' ? 'bg-purple-500 text-white' : 'bg-primary text-black')}>
                    {video.type}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">
                  {video.duration || "0:00"}
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                    <span className="flex items-center gap-1 text-[10px]">
                      <Users className="h-2.5 w-2.5" /> {video.host}
                    </span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <Calendar className="h-2.5 w-2.5" />{" "}
                      {video.date ? String(video.date).split("T")[0] : "—"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 pt-2 border-t border-border/50">
                  <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => handleEdit(video)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(video.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex-1" />
                  <Button asChild size="sm" variant="outline" className="h-8 text-[10px] px-2 border-border/50">
                    <a href={video.link} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-border bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Video" : "Add Cohen TV Video"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Source Channel *</Label>
              <select
                {...register("cohen_tv_id", { required: true })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a Channel Provider...</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.platform_name} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Video Title *</Label>
                <Input {...register("title", { required: true })} placeholder="e.g. 10x ROI Strategies" />
              </div>
              <div className="space-y-2">
                <Label>Video Type *</Label>
                <select
                  {...register("type", { required: true })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Cohen TV">Cohen TV</option>
                  <option value="Podcast">Podcast</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thumbnail (Overlay Image)</Label>
                <div className="flex flex-col gap-2">
                  <Input type="file" {...register("thumbnail_file")} accept="image/*" className="cursor-pointer" />
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Recommended: 16:9 ratio</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input {...register("duration")} placeholder="e.g. 15:42" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Host / Speaker</Label>
                <Input {...register("host")} placeholder="Adam Cohen" />
              </div>
              <div className="space-y-2">
                <Label>Publish Date</Label>
                <Input {...register("date")} type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input {...register("order")} type="number" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={watch("is_published")}
                  onCheckedChange={(v) => setValue("is_published", v)}
                />
                <Label>Published</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Video Source Link (URL) *</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input {...register("link", { required: true })} placeholder="https://youtube.com/..." className="pl-9" />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gold-bg text-primary-foreground hover:bg-yellow-500">
                {editingItem ? "Update Video" : "Publish Video"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIDEO PREVIEW DIALOG */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[50%] p-0 border-border bg-black overflow-hidden shadow-2xl">
          <div className="relative aspect-video w-full bg-black">
            {previewVideo && (
              <ReactPlayer
                src={previewVideo.link}
                width="100%"
                height="100%"
                controls
                playing
              />
            )}
          </div>
          {previewVideo && (
            <div className="p-4 bg-background border-t border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{previewVideo.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {previewVideo.host}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {previewVideo.date ? String(previewVideo.date).split('T')[0] : "—"}</span>
                    {previewVideo.channel && <Badge variant="secondary" className="text-[10px]">{previewVideo.channel.platform_name}</Badge>}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setIsPreviewOpen(false)} className="hover:bg-secondary rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
