import { PageHeader } from "@/components/layout/PageHeader";
import { stats, revenueData, trafficData, recentActivity } from "@/data/mock";
import { ArrowDownRight, ArrowUpRight, Download, MoreHorizontal, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(var(--gold))", "hsl(var(--gold-light))", "hsl(var(--gold-dark))", "hsl(var(--muted-foreground))"];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back — here's what's happening at Adam Cohen Today."
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export</Button>
            <Button size="sm" className="gold-bg text-primary-foreground"><TrendingUp className="h-4 w-4 mr-2" /> View report</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className="font-display text-2xl md:text-3xl font-bold mt-2">{s.value}</div>
            <div className={cn("flex items-center gap-1 text-xs mt-2", s.trend === "up" ? "text-success" : "text-destructive")}>
              {s.trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              <span className="font-semibold">{s.change}</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-lg">Revenue & Leads</h3>
              <p className="text-xs text-muted-foreground">Last 8 months</p>
            </div>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--info))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--gold))" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="leads" stroke="hsl(var(--info))" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-1">Traffic Sources</h3>
          <p className="text-xs text-muted-foreground mb-4">This month</p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={trafficData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {trafficData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">Recent activity</h3>
          <Button variant="ghost" size="sm" className="text-xs">View all</Button>
        </div>
        <div className="space-y-3">
          {recentActivity.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/40 transition-colors">
              <div className="h-9 w-9 rounded-full gold-bg grid place-items-center text-primary-foreground text-xs font-bold shrink-0">
                {a.user.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm"><span className="font-semibold">{a.user}</span> <span className="text-muted-foreground">{a.action}</span></div>
                <div className="text-xs text-muted-foreground">{a.time}</div>
              </div>
              <span className="gold-badge hidden sm:inline-block">{a.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
