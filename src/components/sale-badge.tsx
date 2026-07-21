import { SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SaleBadge({ className }: { className?: string }) {
  return (
    <Badge
      className={cn(
        "h-7 border-white/80 bg-[#e80071] px-3 font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_6px_18px_rgba(232,0,113,0.38)] ring-1 ring-black/5",
        className,
      )}
    >
      <SparklesIcon aria-hidden="true" data-icon="inline-start" />
      Sale
    </Badge>
  );
}
