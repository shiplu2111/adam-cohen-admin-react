import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upcomingEvents, eventRegistrations } from "@/data/mock";
import { CalendarDays, MapPin, Plus, Search, Users as UsersIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const eventStatusStyles: Record<string, string> = {
  open: "bg-success/15 text-success border-success/30",
  full: "bg-destructive/15 text-destructive border-destructive/30",
  "early-bird": "bg-info/15 text-info border-info/30",
};

const regStatusStyles: Record<string, string> = {
  confirmed: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  waitlist: "bg-info/15 text-info border-info/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const Pill = ({ status, map }: { status: string; map: Record<string, string> }) => (
  <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border", map[status])}>{status}</span>
);

export default function Events() {
  const [q, setQ] = useState("");
  const filtered = eventRegistrations.filter(r =>
    [r.name, r.email, r.event].some(v => v.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upcoming Events"
        description="Public events and the people registered for them."
        actions={<Button className="gold-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> New event</Button>}
      />

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="registrations">Registrations ({eventRegistrations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcomingEvents.map(e => {
              const pct = Math.round((e.registered / e.capacity) * 100);
              return (
                <div key={e.id} className="glass-card p-5 space-y-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-12 w-12 rounded-xl gold-bg grid place-items-center shrink-0">
                      <CalendarDays className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <Pill status={e.status} map={eventStatusStyles} />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-lg leading-tight">{e.title}</h4>
                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                      <div className="flex items-center gap-1.5"><CalendarDays className="h-3 w-3" /> {e.date} · {e.time}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {e.location}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground flex items-center gap-1"><UsersIcon className="h-3 w-3" /> {e.registered}/{e.capacity}</span>
                      <span className="font-semibold text-primary">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full gold-bg" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">View</Button>
                    <Button size="sm" className="flex-1 gold-bg text-primary-foreground">Edit</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="registrations" className="mt-4">
          <div className="glass-card p-4 space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search registrations..." className="pl-9" />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.email}</TableCell>
                      <TableCell>{r.event}</TableCell>
                      <TableCell className="text-muted-foreground">{r.date}</TableCell>
                      <TableCell><Pill status={r.status} map={regStatusStyles} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
