import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Plus, Shield, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useForm, Controller } from "react-hook-form";
import { ErrorMsg } from "@/components/ui/ErrorMsg";
import { handleApiError } from "@/lib/forms";

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { hasPermission } = useAuth();

  const { register, handleSubmit, reset, control, setError, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      permissions: [] as string[]
    }
  });

  const editingPermissions = watch("permissions");
  const editingName = watch("name");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get("/roles"),
        api.get("/roles/permissions")
      ]);
      setRoles(rolesRes.data.data);
      setAllPermissions(permsRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    reset({ name: "", permissions: [] });
    setOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingId(role.id);
    reset({
      name: role.name,
      permissions: role.permissions.map(p => p.name)
    });
    setOpen(true);
  };

  const togglePermission = (permName: string) => {
    let current = [...editingPermissions];
    const [action, ...resourceParts] = permName.split(" ");
    const resource = resourceParts.join(" ");
    const readPerm = `read ${resource}`;

    if (current.includes(permName)) {
      current = current.filter(p => p !== permName);
      if (action === "read") {
        current = current.filter(p => !p.endsWith(` ${resource}`));
      }
    } else {
      current.push(permName);
      if (action !== "read" && !current.includes(readPerm)) {
        current.push(readPerm);
      }
    }
    setValue("permissions", current);
  };

  const toggleGroup = (resource: string) => {
    const groupPerms = groupedPermissions[resource].map((p: any) => p.name);
    const allSelected = groupPerms.every((p: string) => editingPermissions.includes(p));
    
    let nextPermissions = [...editingPermissions];
    if (allSelected) {
      nextPermissions = nextPermissions.filter(p => !groupPerms.includes(p));
    } else {
      const toAdd = groupPerms.filter((p: string) => !nextPermissions.includes(p));
      nextPermissions = [...nextPermissions, ...toAdd];
    }
    setValue("permissions", nextPermissions);
  };

  const onSubmit = async (data: any) => {
    setSaveLoading(true);
    try {
      if (editingId) {
        await api.put(`/roles/${editingId}`, data);
        toast.success("Role updated");
      } else {
        await api.post("/roles", data);
        toast.success("Role created");
      }
      fetchData();
      setOpen(false);
    } catch (error: any) {
      if (!handleApiError(error, setError)) {
        toast.error(error.response?.data?.message || "Failed to save");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (role: Role) => {
    try {
      await api.delete(`/roles/${role.id}`);
      toast.success("Role deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const groupedPermissions = allPermissions.reduce((acc: any, curr) => {
    const [action, ...resourceParts] = curr.name.split(" ");
    const resource = resourceParts.join(" ");
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(curr);
    return acc;
  }, {});

  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Define access levels and assign granular permissions to roles."
        actions={
          hasPermission("create roles") && (
            <Button onClick={openNew} className="gold-bg text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" /> New Role
            </Button>
          )
        }
      />

      <div className="glass-card p-4 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search roles..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Permissions Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map(role => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <Shield className="h-4 w-4 text-primary" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.permissions.length} permissions</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {hasPermission("update roles") && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(role)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission("delete roles") && role.name !== "Super Admin" && (
                        <DeleteConfirm
                          trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                          title={`Delete ${role.name} role?`}
                          description="Users assigned to this role will lose their permissions."
                          onConfirm={() => handleDelete(role)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle>{editingId ? "Edit Role" : "New Role"}</DialogTitle></DialogHeader>
          
          <form id="role-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto pr-2 space-y-6 pt-2">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input 
                {...register("name")} 
                disabled={editingName === "Super Admin"}
              />
              <ErrorMsg message={errors.name?.message as string} />
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Permissions Matrix</Label>
              <div className="grid gap-4">
                {Object.keys(groupedPermissions).map(resource => (
                  <div key={resource} className="p-4 rounded-xl border border-border/50 bg-secondary/5 space-y-3">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
                      <h5 className="text-xs font-bold uppercase tracking-widest text-primary">{resource}</h5>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`all-${resource}`}
                          checked={groupedPermissions[resource].every((p: any) => editingPermissions.includes(p.name))}
                          onCheckedChange={() => toggleGroup(resource)}
                          disabled={editingName === "Super Admin"}
                        />
                        <label htmlFor={`all-${resource}`} className="text-[10px] font-bold uppercase cursor-pointer opacity-70">Select All</label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {groupedPermissions[resource].map((perm: Permission) => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`perm-${perm.id}`} 
                            checked={editingPermissions.includes(perm.name)}
                            onCheckedChange={() => togglePermission(perm.name)}
                            disabled={editingName === "Super Admin"}
                          />
                          <label 
                            htmlFor={`perm-${perm.id}`}
                            className="text-[11px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                          >
                            {perm.name.split(" ")[0]}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          <DialogFooter className="pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              form="role-form"
              type="submit"
              disabled={saveLoading || editingName === "Super Admin"} 
              className="gold-bg text-primary-foreground"
            >
              {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Save Permissions" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
