import { SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SaleBadge({ className }: { className?: string }) {
  return (
    <Badge
      className={cn(
        "border-white/80 bg-primary font-bold uppercase tracking-[0.08em] text-primary-foreground shadow-[0_3px_10px_rgba(232,0,113,0.28)] ring-1 ring-black/5",
        className,
      )}
    >
      <SparklesIcon aria-hidden="true" data-icon="inline-start" />
      Sale
    </Badge>
  );
}
