import { NotFoundState } from "@/components/not-found-state";

export default function ProductNotFound() {
  return (
    <NotFoundState
      eyebrow="Product unavailable"
      title="We couldn't find that product"
      description="It may have been renamed, removed or moved to another category."
    />
  );
}
