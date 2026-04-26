import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { weeklyZoom } from "@/data/mock";
import { Calendar, Clock, Copy, ExternalLink, KeyRound, User, Video } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function WeeklyZoom() {
  const [data, setData] = useState(weeklyZoom);
  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`${label} copied`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Zoom"
        description="Recurring live session shown on the public website."
        actions={
          <Button asChild className="gold-bg text-primary-foreground">
            <a href={data.zoomLink} target="_blank" rel="noreferrer"><Video className="h-4 w-4 mr-2" /> Join Zoom</a>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6 space-y-5">
          <div>
            <h3 className="font-display font-semibold text-lg">Session details</h3>
            <p className="text-sm text-muted-foreground">Edit the meeting that appears on the site.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Title</Label><Input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Host</Label><Input value={data.host} onChange={e => setData({ ...data, host: e.target.value })} /></div>
            <div className="space-y-2"><Label>Day</Label><Input value={data.day} onChange={e => setData({ ...data, day: e.target.value })} /></div>
            <div className="space-y-2"><Label>Time</Label><Input value={data.time} onChange={e => setData({ ...data, time: e.target.value })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Zoom link</Label>
              <div className="flex gap-2">
                <Input value={data.zoomLink} onChange={e => setData({ ...data, zoomLink: e.target.value })} />
                <Button variant="outline" size="icon" onClick={() => copy(data.zoomLink, "Link")}><Copy className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="space-y-2"><Label>Meeting ID</Label><Input value={data.meetingId} onChange={e => setData({ ...data, meetingId: e.target.value })} /></div>
            <div className="space-y-2"><Label>Passcode</Label><Input value={data.passcode} onChange={e => setData({ ...data, passcode: e.target.value })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea rows={3} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline">Reset</Button>
            <Button className="gold-bg text-primary-foreground" onClick={() => toast.success("Saved")}>Save changes</Button>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="aspect-video rounded-xl gold-bg grid place-items-center">
            <Video className="h-14 w-14 text-primary-foreground" />
          </div>
          <div>
            <h4 className="font-display font-semibold">{data.title}</h4>
            <p className="text-sm text-muted-foreground">Hosted by {data.host}</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {data.day}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {data.time}</div>
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> ID: {data.meetingId}</div>
            <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> Passcode: {data.passcode}</div>
          </div>
          <Button asChild className="w-full gold-bg text-primary-foreground">
            <a href={data.zoomLink} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-2" /> Open Zoom</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
