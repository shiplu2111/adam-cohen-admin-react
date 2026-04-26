import { PageHeader } from "@/components/layout/PageHeader";
import { Construction } from "lucide-react";

export default function Placeholder({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="glass-card p-12 text-center">
        <div className="h-14 w-14 rounded-full gold-bg grid place-items-center mx-auto mb-4">
          <Construction className="h-7 w-7 text-primary-foreground" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-1">Coming soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">This area is scaffolded and ready to be wired up to your data.</p>
      </div>
    </div>
  );
}
