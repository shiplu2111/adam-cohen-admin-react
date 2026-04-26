import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Plus, Search, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useForm, Controller } from "react-hook-form";
import { ErrorMsg } from "@/components/ui/ErrorMsg";
import { handleApiError } from "@/lib/forms";

interface User { 
  id: number; 
  name: string; 
  email: string; 
  status: "active" | "inactive"; 
  roles: any[]; 
}

interface Role {
  id: number;
  name: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const { hasPermission } = useAuth();

  const { register, handleSubmit, reset, control, setError, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      status: "active",
      roles: [] as string[]
    }
  });

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get("/employees");
      setEmployees(data.data);
    } catch (error) {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await api.get("/roles");
      setRoles(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = employees.filter(e => 
    [e.name, e.email].some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const openNew = () => { 
    setEditingId(null);
    reset({ name: "", email: "", password: "", status: "active", roles: [] });
    setOpen(true); 
  };

  const openEdit = (e: User) => {
    setEditingId(e.id);
    reset({
      name: e.name,
      email: e.email,
      password: "",
      status: e.status,
      roles: e.roles.map(r => r.name)
    });
    setOpen(true);
  };

  const onSubmit = async (data: any) => {
    setSaveLoading(true);
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, data);
        toast.success("Employee updated");
      } else {
        await api.post("/employees", data);
        toast.success("Employee created");
      }
      fetchEmployees();
      setOpen(false);
    } catch (error: any) {
      if (!handleApiError(error, setError)) {
        toast.error(error.response?.data?.message || "Failed to save");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/employees/${id}`);
      toast.success("Employee removed");
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your team, their access levels, and status."
        actions={
          hasPermission("create employees") && (
            <Button onClick={openNew} className="gold-bg text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" /> New Employee
            </Button>
          )
        }
      />

      <div className="glass-card p-4 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search team..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(e => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="gold-bg text-primary-foreground text-xs">
                          {e.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{e.name}</div>
                        <div className="text-xs text-muted-foreground">{e.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {e.roles.map(r => (
                        <Badge key={r.id} variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {r.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={e.status === "active" ? "bg-success/15 text-success border-success/30" : "bg-muted/30 text-muted-foreground"}>
                      {e.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {hasPermission("update employees") && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(e)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission("delete employees") && (
                        <DeleteConfirm
                          trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                          title={`Delete ${e.name}?`}
                          description="This action cannot be undone if they have no activity."
                          onConfirm={() => handleDelete(e.id)}
                        />
                      )}
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
          <DialogHeader><DialogTitle>{editingId ? "Edit Employee" : "New Employee"}</DialogTitle></DialogHeader>
          <form id="employee-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register("name")} />
              <ErrorMsg message={errors.name?.message as string} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              <ErrorMsg message={errors.email?.message as string} />
            </div>
            {!editingId && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" {...register("password")} />
                <ErrorMsg message={errors.password?.message as string} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <ErrorMsg message={errors.status?.message as string} />
              </div>
              <div className="space-y-2">
                <Label>Roles</Label>
                <Controller
                  name="roles"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      onValueChange={(v) => field.onChange([v])} 
                      value={field.value?.[0] || ""}
                    >
                      <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        {roles.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                <ErrorMsg message={errors.roles?.message as string} />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button form="employee-form" type="submit" disabled={saveLoading} className="gold-bg text-primary-foreground">
              {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Save Changes" : "Create Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
