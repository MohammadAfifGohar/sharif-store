import type { Metadata } from "next";
import {
  ExternalLinkIcon,
  MapPinIcon,
  MessageCircleIcon,
  NavigationIcon,
  StoreIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { WHATSAPP_NUMBER } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const MAPS_URL =
  "https://maps.app.goo.gl/jFChZU3KcVvAoHPp7?g_st=aw";
const MAP_EMBED_URL =
  "https://www.google.com/maps?q=Sharif%20Gift%20Center%2C%20Old%20Sarafa%2C%20Lohiya%20Maidan%2C%20near%20Dunda%20Maharaj%20Math%2C%20Deglur%2C%20Maharashtra%20431717&output=embed";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hello Sharif Store, I would like to know more about your products.",
)}`;

export const metadata: Metadata = {
  title: "Contact & Visit Us",
  description:
    "Visit Sharif Gift Center at Old Sarafa, Lohiya Maidan, Deglur, Nanded, or contact us on WhatsApp.",
  alternates: { canonical: "/contact" },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Sharif Gift Center",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Old Sarafa, Lohiya Maidan, near Dunda Maharaj Math",
    addressLocality: "Deglur",
    addressRegion: "Maharashtra",
    postalCode: "431717",
    addressCountry: "IN",
  },
  telephone: `+${WHATSAPP_NUMBER}`,
  hasMap: MAPS_URL,
};

export default function ContactPage() {
  return (
    <main className="flex-1 overflow-hidden bg-[#fffafc]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <section className="relative isolate border-b border-primary/10 px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_18%,rgba(232,0,113,0.14),transparent_26%),radial-gradient(circle_at_84%_70%,rgba(247,167,201,0.3),transparent_32%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-20 top-12 -z-10 size-64 rounded-full border-[52px] border-primary/5 sm:size-80"
        />

        <div className="mx-auto grid max-w-[1440px] items-end gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-16">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <span className="h-px w-8 bg-primary" />
              Find us in Deglur
            </p>
            <h1 className="mt-5 max-w-4xl font-heading text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
              Come by. Find something worth gifting.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Visit Sharif Gift Center for beauty, gifts, accessories and
              everyday discoveries, thoughtfully brought together in the
              heart of Deglur.
            </p>
          </div>

          <div className="relative rounded-3xl border border-primary/15 bg-background/85 p-6 shadow-[0_24px_80px_rgba(91,21,55,0.12)] backdrop-blur sm:p-8">
            <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
              <MapPinIcon aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Store address
            </p>
            <address className="mt-3 not-italic text-lg font-semibold leading-8 text-foreground">
              Sharif Gift Center
              <br />
              Old Sarafa, Lohiya Maidan
              <br />
              Near Dunda Maharaj Math
              <br />
              Deglur 431717, Dist. Nanded
            </address>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
        <div className="grid overflow-hidden rounded-3xl border border-border bg-background shadow-[0_30px_90px_rgba(31,31,31,0.09)] lg:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
          <div className="flex flex-col p-6 sm:p-9 lg:p-12">
            <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
              <StoreIcon aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Plan your visit
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Easy to find, right by Lohiya Maidan.
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              Look for us in Old Sarafa, close to Dunda Maharaj Math. Tap the
              directions button to open the exact location in Google Maps.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "group")}
              >
                <NavigationIcon aria-hidden="true" />
                Get directions
                <ExternalLinkIcon
                  aria-hidden="true"
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                <MessageCircleIcon aria-hidden="true" />
                WhatsApp us
              </a>
            </div>

            <div className="mt-auto pt-10">
              <p className="border-t border-border pt-6 text-sm leading-6 text-muted-foreground">
                Coming from outside Deglur? Use Google Maps for the most
                accurate route to the store entrance.
              </p>
            </div>
          </div>

          <div className="relative min-h-[360px] border-t border-border bg-muted sm:min-h-[480px] lg:min-h-[620px] lg:border-l lg:border-t-0">
            <iframe
              src={MAP_EMBED_URL}
              title="Sharif Gift Center location on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 grayscale-[15%] contrast-[1.02]"
              allowFullScreen
            />
          </div>
        </div>
      </section>

    </main>
  );
}
