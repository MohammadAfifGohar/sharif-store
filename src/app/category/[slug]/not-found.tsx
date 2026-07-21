import { NotFoundState } from "@/components/not-found-state";

export default function CategoryNotFound() {
  return (
    <NotFoundState
      eyebrow="Collection unavailable"
      title="We couldn't find that category"
      description="It may have been renamed or removed. Return home to browse the collections currently available."
    />
  );
}
