import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { callBookings } from "@/data/mock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarCheck, Clock, Mail, PhoneCall, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  confirmed: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function BookACall() {
  const [bookings, setBookings] = useState(callBookings);
  const [form, setForm] = useState({ name: "", email: "", topic: "", date: "", time: "10:00", duration: "30 min" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.date) { toast.error("Fill required fields"); return; }
    setBookings([{ id: `cb${Date.now()}`, ...form, status: "pending" }, ...bookings]);
    setForm({ name: "", email: "", topic: "", date: "", time: "10:00", duration: "30 min" });
    toast.success("Call booked");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Book a Call" description="Manage discovery calls and configure availability." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <form onSubmit={submit} className="glass-card p-6 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-lg">New booking</h3>
            <p className="text-xs text-muted-foreground">Add a call manually on behalf of a client.</p>
          </div>
          <div className="space-y-2"><Label>Full name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="space-y-2"><Label>Topic</Label><Textarea rows={2} value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Time</Label><Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Duration</Label>
            <Select value={form.duration} onValueChange={v => setForm({ ...form, duration: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15 min">15 minutes</SelectItem>
                <SelectItem value="30 min">30 minutes</SelectItem>
                <SelectItem value="45 min">45 minutes</SelectItem>
                <SelectItem value="60 min">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full gold-bg text-primary-foreground"><PhoneCall className="h-4 w-4 mr-2" /> Book call</Button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-lg">Availability</h3>
                <p className="text-xs text-muted-foreground">Public booking widget settings.</p>
              </div>
              <div className="flex items-center gap-2 text-sm"><Switch defaultChecked /> Accepting bookings</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <label key={d} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-secondary/30">
                  <Switch defaultChecked={!["Sat", "Sun"].includes(d)} /> {d}
                </label>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-display font-semibold text-lg px-2 pt-2 pb-3">Recent bookings</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="font-medium flex items-center gap-2"><User className="h-3.5 w-3.5 text-primary" /> {b.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" /> {b.email}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{b.topic}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm"><CalendarCheck className="h-3.5 w-3.5 text-primary" /> {b.date}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> {b.time}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{b.duration}</TableCell>
                      <TableCell>
                        <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border", statusStyles[b.status])}>{b.status}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
