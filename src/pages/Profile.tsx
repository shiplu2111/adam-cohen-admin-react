import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const initials = user?.name.split(" ").map(p => p[0]).slice(0, 2).join("") ?? "AM";

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Profile" description="Update your personal information." />

      <div className="glass-card p-6">
        <div className="flex items-center gap-5 pb-6 border-b border-border">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-2 ring-primary/40">
              <AvatarFallback className="gold-bg text-primary-foreground text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full gold-bg grid place-items-center">
              <Camera className="h-3.5 w-3.5 text-primary-foreground" />
            </button>
          </div>
          <div>
            <div className="font-display font-semibold text-xl">{user?.name}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
            <span className="gold-badge mt-2 inline-block">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); toast.success("Profile updated"); }} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          <div className="space-y-2"><Label>Full name</Label><Input defaultValue={user?.name} /></div>
          <div className="space-y-2"><Label>Email</Label><Input defaultValue={user?.email} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input placeholder="+1 (555) 000-0000" /></div>
          <div className="space-y-2"><Label>Location</Label><Input placeholder="City, Country" /></div>
          <div className="space-y-2 md:col-span-2"><Label>Bio</Label><Textarea rows={4} placeholder="Tell us about yourself..." /></div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit" className="gold-bg text-primary-foreground">Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
