import { LoaderCircleIcon } from "lucide-react";

export default function CategoryLoading() {
  return (
    <main
      role="status"
      aria-label="Loading products"
      className="mx-auto flex min-h-[45vh] max-w-7xl items-center justify-center px-4"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
        Updating products…
      </div>
    </main>
  );
}
