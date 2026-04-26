import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReactNode, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Loader2, Upload, X, Globe, Mail, Phone, MapPin, Clock, Settings as SettingsIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { ErrorMsg } from "@/components/ui/ErrorMsg";
import { handleApiError } from "@/lib/forms";
import { useAuth } from "@/contexts/AuthContext";

export function SettingsCard({ 
  title, 
  description, 
  children, 
  onSave, 
  isLoading, 
  isSaving,
  icon: Icon
}: { 
  title: string; 
  description?: string; 
  children: ReactNode; 
  onSave?: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isLoading?: boolean; 
  isSaving?: boolean;
  icon?: any;
}) {
  return (
    <div className="glass-card p-6 space-y-5 relative overflow-hidden group">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <form onSubmit={onSave} className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {Icon && <Icon className="h-5 w-5 text-primary" />}
              <h3 className="font-display font-semibold text-lg">{title}</h3>
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button type="button" variant="outline" disabled={isSaving}>Reset</Button>
          <Button type="submit" className="gold-bg text-primary-foreground" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export function WebsiteSettings() {
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm();
  const { refreshSettings } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSiteData();
  }, []);

  const fetchSiteData = () => {
    api.get("/settings/site")
      .then(res => {
        const d = res.data.data;
        const sanitizedData = {
          ...d,
          name: d.name || "Adam Cohen Today",
          title: d.title || "Adam Cohen Today"
        };
        reset(sanitizedData);
        if (sanitizedData.logo) setLogoPreview(sanitizedData.logo);
        if (sanitizedData.favicon) setFaviconPreview(sanitizedData.favicon);
      })
      .catch(() => toast.error("Failed to load website settings"))
      .finally(() => setLoading(false));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'logo') setLogoPreview(url);
      if (type === 'favicon') setFaviconPreview(url);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    const formData = new FormData();
    
    // Append text fields
    Object.keys(data).forEach(key => {
      if (key !== 'logo' && key !== 'favicon') {
        formData.append(key, data[key] || "");
      }
    });

    // Append files if selected
    if (logoRef.current?.files?.[0]) {
      formData.append('logo', logoRef.current.files[0]);
    }
    if (faviconRef.current?.files?.[0]) {
      formData.append('favicon', faviconRef.current.files[0]);
    }

    try {
      await api.post("/settings/site", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Website settings updated");
      await refreshSettings();
      fetchSiteData();
    } catch (error: any) {
      if (!handleApiError(error, setError)) {
        toast.error("Failed to update site settings");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard 
      title="Identity & SEO" 
      description="Manage your site name, branding assets, and search optimization."
      isLoading={loading}
      isSaving={saving}
      onSave={handleSubmit(onSubmit)}
      icon={Globe}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input {...register("name")} placeholder="Adam Cohen Today" />
              <ErrorMsg message={errors.name?.message as string} />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input {...register("tagline")} placeholder="Empowering Your Vision" />
              <ErrorMsg message={errors.tagline?.message as string} />
            </div>
            
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-40 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-secondary/30 relative group overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain p-2" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground/50" />
                  )}
                  <input 
                    type="file" 
                    ref={logoRef}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground mb-2">Recommended: 400x120px PNG, SVG or WEBP</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => logoRef.current?.click()}>
                    Choose Logo
                  </Button>
                </div>
              </div>
              <ErrorMsg message={errors.logo?.message as string} />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Favicon</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-secondary/30 relative overflow-hidden">
                  {faviconPreview ? (
                    <img src={faviconPreview} alt="Favicon Preview" className="h-10 w-10 object-contain" />
                  ) : (
                    <Globe className="h-6 w-6 text-muted-foreground/50" />
                  )}
                  <input 
                    type="file" 
                    ref={faviconRef}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*,.ico"
                    onChange={(e) => handleFileChange(e, 'favicon')}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground mb-2">Recommended: 32x32px ICO, PNG or WEBP</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => faviconRef.current?.click()}>
                    Choose Icon
                  </Button>
                </div>
              </div>
              <ErrorMsg message={errors.favicon?.message as string} />
            </div>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>SEO Title</Label>
          <Input {...register("title")} />
          <p className="text-[10px] text-muted-foreground">This appears in the browser tab and search results.</p>
          <ErrorMsg message={errors.title?.message as string} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>SEO Keywords</Label>
          <Input {...register("keywords")} placeholder="branding, studio, design" />
          <ErrorMsg message={errors.keywords?.message as string} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Meta Description</Label>
          <Textarea rows={3} {...register("description")} />
          <ErrorMsg message={errors.description?.message as string} />
        </div>
      </div>
    </SettingsCard>
  );
}

export function ContactSettings() {
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings/contact")
      .then(res => reset(res.data.data))
      .catch(() => toast.error("Failed to load contact settings"))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await api.post("/settings/contact", data);
      toast.success("Contact information updated");
    } catch (error: any) {
      if (!handleApiError(error, setError)) {
        toast.error("Failed to update contact settings");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard 
      title="Contact Information" 
      description="Public details shown on website and correspondence."
      isLoading={loading}
      isSaving={saving}
      onSave={handleSubmit(onSubmit)}
      icon={Phone}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Public Support Email</Label>
          <Input {...register("public_email")} placeholder="hello@company.com" />
          <ErrorMsg message={errors.public_email?.message as string} />
        </div>
        <div className="space-y-2"><Label>Contact Form Recipient</Label>
          <Input {...register("recipient_email")} placeholder="notifications@company.com" />
          <ErrorMsg message={errors.recipient_email?.message as string} />
        </div>
        <div className="space-y-2"><Label>Phone Number</Label>
          <Input {...register("phone")} />
          <ErrorMsg message={errors.phone?.message as string} />
        </div>
        <div className="space-y-2"><Label>WhatsApp Number</Label>
          <Input {...register("whatsapp")} />
          <ErrorMsg message={errors.whatsapp?.message as string} />
        </div>
        <div className="space-y-2"><Label>Office Hours</Label>
          <Input {...register("office_hours")} placeholder="Mon–Fri · 9:00–18:00" />
          <ErrorMsg message={errors.office_hours?.message as string} />
        </div>
        <div className="space-y-2"><Label>Google Maps URL</Label>
          <Input {...register("google_maps_url")} />
          <ErrorMsg message={errors.google_maps_url?.message as string} />
        </div>
        <div className="space-y-2 md:col-span-2"><Label>Physical Address</Label>
          <Textarea rows={2} {...register("address")} />
          <ErrorMsg message={errors.address?.message as string} />
        </div>

        {/* Social Links */}
        <div className="md:col-span-2 pt-2 border-t border-border">
          <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" /> Social Media Links
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>LinkedIn URL</Label>
              <Input {...register("linkedin_url")} placeholder="https://linkedin.com/in/..." />
              <ErrorMsg message={errors.linkedin_url?.message as string} />
            </div>
            <div className="space-y-2"><Label>Instagram URL</Label>
              <Input {...register("instagram_url")} placeholder="https://instagram.com/..." />
              <ErrorMsg message={errors.instagram_url?.message as string} />
            </div>
            <div className="space-y-2"><Label>YouTube URL</Label>
              <Input {...register("youtube_url")} placeholder="https://youtube.com/@..." />
              <ErrorMsg message={errors.youtube_url?.message as string} />
            </div>
            <div className="space-y-2"><Label>Twitter / X URL</Label>
              <Input {...register("twitter_url")} placeholder="https://x.com/..." />
              <ErrorMsg message={errors.twitter_url?.message as string} />
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

export function EmailSettings() {
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings/smtp")
      .then(res => reset(res.data.data))
      .catch(() => toast.error("Failed to load email settings"))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await api.post("/settings/smtp", data);
      toast.success("Email settings updated");
    } catch (error: any) {
      if (!handleApiError(error, setError)) {
        toast.error("Failed to update email settings");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard 
      title="Email (SMTP)" 
      description="Configure your outbound mail server."
      isLoading={loading}
      isSaving={saving}
      onSave={handleSubmit(onSubmit)}
      icon={Mail}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>From name</Label>
          <Input {...register("from_name")} />
          <ErrorMsg message={errors.from_name?.message as string} />
        </div>
        <div className="space-y-2"><Label>From email</Label>
          <Input {...register("from_address")} />
          <ErrorMsg message={errors.from_address?.message as string} />
        </div>
        <div className="space-y-2"><Label>SMTP host</Label>
          <Input {...register("host")} placeholder="smtp.mailgun.org" />
          <ErrorMsg message={errors.host?.message as string} />
        </div>
        <div className="space-y-2"><Label>Port</Label>
          <Input type="number" {...register("port")} placeholder="587" />
          <ErrorMsg message={errors.port?.message as string} />
        </div>
        <div className="space-y-2"><Label>Username</Label>
          <Input {...register("username")} />
          <ErrorMsg message={errors.username?.message as string} />
        </div>
        <div className="space-y-2"><Label>Password</Label>
          <Input type="password" {...register("password")} placeholder="••••••••" />
          <ErrorMsg message={errors.password?.message as string} />
        </div>
        <div className="space-y-2"><Label>Encryption</Label>
          <select 
            {...register("encryption")} 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="none">None</option>
          </select>
          <ErrorMsg message={errors.encryption?.message as string} />
        </div>
      </div>
    </SettingsCard>
  );
}

export function PusherSettings() {
  const { register, handleSubmit, reset, setError, control, formState: { errors } } = useForm({
    defaultValues: {
      app_id: "",
      key: "",
      secret: "",
      cluster: "mt1"
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings/pusher")
      .then(res => {
        if (res.data.data && Object.keys(res.data.data).length > 0) {
          reset(res.data.data);
        }
      })
      .catch(() => toast.error("Failed to load pusher settings"))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await api.post("/settings/pusher", data);
      toast.success("Pusher settings updated");
    } catch (error: any) {
      if (!handleApiError(error, setError)) {
        toast.error("Failed to update pusher settings");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard 
      title="Pusher (Real-time)" 
      description="Real-time channels for live notifications and chat."
      isLoading={loading}
      isSaving={saving}
      onSave={handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>App ID</Label>
          <Input {...register("app_id")} placeholder="e.g. 123456" />
          <ErrorMsg message={errors.app_id?.message as string} />
        </div>
        <div className="space-y-2">
          <Label>Cluster</Label>
          <Controller
            name="cluster"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mt1">mt1 (US East)</SelectItem>
                  <SelectItem value="eu">eu (Europe)</SelectItem>
                  <SelectItem value="ap1">ap1 (Asia)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <ErrorMsg message={errors.cluster?.message as string} />
        </div>
        <div className="space-y-2"><Label>Key</Label>
          <Input {...register("key")} placeholder="Pusher Key" />
          <ErrorMsg message={errors.key?.message as string} />
        </div>
        <div className="space-y-2"><Label>Secret</Label>
          <Input type="password" {...register("secret")} placeholder="••••••••" />
          <ErrorMsg message={errors.secret?.message as string} />
        </div>
      </div>
    </SettingsCard>
  );
}

export function NotificationSettings() {
  return (
    <SettingsCard title="Notifications" description="Choose what you want to hear about.">
      <div className="p-4 text-center text-muted-foreground italic font-medium py-10">
        Advanced notification engine is coming soon in the next major update.
      </div>
    </SettingsCard>
  );
}
