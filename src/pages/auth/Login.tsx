import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { ErrorMsg } from "@/components/ui/ErrorMsg";
import { handleApiError } from "@/lib/forms";

export default function Login() {
  const { login, user, settings } = useAuth();
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    if (user) {
      nav("/");
    }
  }, [user, nav]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back");
      nav("/");
    } catch (error: any) {
      if (!handleApiError(error, setError)) {
        toast.error("Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="lg:hidden mb-8 flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg overflow-hidden bg-secondary/30 border border-border/50 flex items-center justify-center">
          {settings?.site.logo ? (
            <img src={settings.site.logo} alt="Logo" className="h-full w-full object-contain" />
          ) : (
            <div className="h-full w-full gold-bg" />
          )}
        </div>
        <div className="font-display font-bold">
          {settings?.site.name ? (
            <>
              {settings.site.name.split(' ')[0]}
              <span className="gold-text"> {settings.site.name.split(' ').slice(1).join(' ')}</span>
            </>
          ) : (
            <>Adam<span className="gold-text"> Cohen Today</span></>
          )}
        </div>
      </div>

      <h2 className="font-display text-3xl font-bold mb-2">Welcome back</h2>
      <p className="text-muted-foreground text-sm mb-8">Sign in to your admin account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} required />
          <ErrorMsg message={errors.email?.message as string} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              {...register("password")}
              required
            />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <ErrorMsg message={errors.password?.message as string} />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="remember" defaultChecked />
          <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">Remember me for 30 days</Label>
        </div>

        <Button type="submit" className="w-full gold-bg text-primary-foreground hover:opacity-90 font-semibold" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>

      {/* <div className="mt-10 p-3 rounded-lg bg-secondary/40 border border-border/60 text-xs text-muted-foreground text-center">
        Use <strong className="text-foreground">admin@admin.com</strong> / <strong className="text-foreground">password</strong> to enter.
      </div> */}
    </div>
  );
}
