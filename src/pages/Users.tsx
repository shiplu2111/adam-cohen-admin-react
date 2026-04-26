import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { initialRoles } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface User { id: string; name: string; email: string; role: string; status: "active" | "invited"; }
const seed: User[] = [
  { id: "u1", name: "Alex Morgan", email: "alex@apexascend.com", role: "Super Admin", status: "active" },
  { id: "u2", name: "Sarah Chen", email: "sarah@apexascend.com", role: "Editor", status: "active" },
  { id: "u3", name: "Marcus Reid", email: "marcus@apexascend.com", role: "Editor", status: "active" },
  { id: "u4", name: "Lena Park", email: "lena@apexascend.com", role: "Support", status: "invited" },
  { id: "u5", name: "Owen Hart", email: "owen@apexascend.com", role: "Viewer", status: "active" },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>(seed);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const filtered = users.filter(u => [u.name, u.email, u.role].some(s => s.toLowerCase().includes(search.toLowerCase())));

  const openNew = () => { setEditing({ id: "", name: "", email: "", role: "Viewer", status: "invited" }); setOpen(true); };
  const save = () => {
    if (!editing?.name || !editing.email) { toast.error("Name and email required"); return; }
    if (editing.id) setUsers(users.map(u => u.id === editing.id ? editing : u));
    else setUsers([{ ...editing, id: `u${Date.now()}` }, ...users]);
    setOpen(false); toast.success("Saved");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage admin accounts and assigned roles."
        actions={<Button onClick={openNew} className="gold-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Invite user</Button>}
      />

      <div className="glass-card p-4 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="gold-bg text-primary-foreground text-xs">{u.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                      <div>
                        <div className="font-medium text-sm">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">{u.role}</Badge></TableCell>
                  <TableCell>
                    {u.status === "active"
                      ? <Badge variant="outline" className="bg-success/15 text-success border-success/30">Active</Badge>
                      : <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30">Invited</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(u); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <DeleteConfirm
                        trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                        title={`Remove ${u.name}?`}
                        description="They will lose access to the admin immediately."
                        onConfirm={() => { setUsers(users.filter(x => x.id !== u.id)); toast.success("User removed"); }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit user" : "Invite user"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Role</Label>
                <Select value={editing.role} onValueChange={v => setEditing({ ...editing, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{initialRoles.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="gold-bg text-primary-foreground">{editing?.id ? "Save" : "Send invite"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
