import { CheckIcon, FlaskConicalIcon, SparklesIcon } from "lucide-react";

import type {
  DescriptionBlock,
  ProductDescription as ParsedDescription,
} from "@/lib/product-description";

const SECTION_LABEL =
  "flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground";

function Block({ block }: { block: DescriptionBlock }) {
  switch (block.kind) {
    case "text":
      return <p className="leading-7 text-muted-foreground">{block.text}</p>;

    case "heading":
      return <h3 className={SECTION_LABEL}>{block.text}</h3>;

    case "list":
      return (
        <ul className="grid gap-2 sm:grid-cols-2">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm leading-6">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckIcon className="size-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      );

    case "ingredients":
      return (
        <div>
          <h3 className={SECTION_LABEL}>
            <FlaskConicalIcon className="size-3.5" />
            {block.label}
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {block.items.map((item) => (
              <li
                key={item}
                className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "steps":
      return (
        <div>
          <h3 className={SECTION_LABEL}>
            <SparklesIcon className="size-3.5" />
            {block.label}
          </h3>
          {block.items.length > 1 ? (
            <ol className="mt-3 space-y-3">
              {block.items.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm leading-6">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="pt-px">{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm leading-6">{block.items[0]}</p>
          )}
        </div>
      );

    case "fact":
      // Rendered together in the facts strip, see below.
      return null;
  }
}

/**
 * The product's description as readable sections: the overview, short facts
 * (skin type, suitable for …) side by side, ingredients as chips and the
 * how-to-use routine as numbered steps.
 */
export function ProductDescription({
  description,
}: {
  description: ParsedDescription;
}) {
  const { intro, blocks } = description;
  if (intro.length === 0 && blocks.length === 0) return null;

  const facts = blocks.filter(
    (block): block is Extract<DescriptionBlock, { kind: "fact" }> =>
      block.kind === "fact",
  );
  const others = blocks.filter((block) => block.kind !== "fact");

  return (
    <section aria-labelledby="product-about-heading" className="mt-8">
      <h2 id="product-about-heading" className={SECTION_LABEL}>
        About this product
      </h2>

      <div className="mt-3 space-y-6 rounded-2xl border border-border bg-background p-5 sm:p-6">
        {intro.length > 0 ? (
          <div className="space-y-3">
            {intro.map((paragraph) => (
              <p key={paragraph} className="leading-7 text-foreground/80">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {facts.length > 0 ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-xl bg-muted/60 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm font-medium leading-6">{fact.text}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {others.map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </div>
    </section>
  );
}
