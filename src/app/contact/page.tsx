import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowUpRightIcon,
  ExternalLinkIcon,
  MapIcon,
  MapPinIcon,
  MessageCircleIcon,
  NavigationIcon,
  PhoneIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  absoluteUrl,
  SITE_URL,
  WHATSAPP_NUMBER,
} from "@/lib/site-config";
import { cn } from "@/lib/utils";

const MAPS_URL = "https://maps.app.goo.gl/jFChZU3KcVvAoHPp7?g_st=aw";
const MAP_EMBED_URL =
  "https://www.google.com/maps?q=Sharif%20Gift%20Center%2C%20Old%20Sarafa%2C%20Lohiya%20Maidan%2C%20near%20Dunda%20Maharaj%20Math%2C%20Deglur%2C%20Maharashtra%20431717&output=embed";
const PHONE_URL = `tel:+${WHATSAPP_NUMBER}`;
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
  url: SITE_URL,
  image: absoluteUrl("/sharif-store-logo-transparent.png"),
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
  priceRange: "₹₹",
};

const contactOptions = [
  {
    eyebrow: "Quick questions",
    title: "Chat on WhatsApp",
    description: "Ask about products, availability or gifting ideas.",
    href: WHATSAPP_URL,
    icon: MessageCircleIcon,
    external: true,
  },
  {
    eyebrow: "Speak with us",
    title: "Call the store",
    description: "Talk directly with our team before planning your visit.",
    href: PHONE_URL,
    icon: PhoneIcon,
    external: false,
  },
  {
    eyebrow: "Plan your route",
    title: "Get directions",
    description: "Open our exact Deglur location in Google Maps.",
    href: MAPS_URL,
    icon: NavigationIcon,
    external: true,
  },
] as const;

export default function ContactPage() {
  return (
    <main className="flex-1 overflow-hidden bg-[#fffdfb]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c"),
        }}
      />

      <section className="pb-5 sm:pb-8">
        <div className="relative w-full overflow-hidden bg-[#2b1020] text-white">
          <Image
            src="/contact-hero-background.avif"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[78%_center] sm:object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(43,16,32,.9)_0%,rgba(43,16,32,.72)_52%,rgba(43,16,32,.46)_100%)]"
          />

          <div className="relative mx-auto flex min-h-[560px] w-full max-w-[1440px] items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
            <div>
              <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#ff9fc9] sm:text-xs">
                <span className="h-px w-9 bg-[#ff4d9b]" />
                Your neighbourhood gift stop
              </p>
              <h1 className="mt-6 max-w-3xl font-heading text-5xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-[5.4rem]">
                Let&apos;s make finding us easy.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
                Questions about a product or planning a store visit? Message,
                call, or head straight to Sharif Gift Center in the heart of
                Deglur.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 rounded-full bg-[#25D366] px-6 text-white hover:bg-[#20bd5a]",
                  )}
                >
                  <MessageCircleIcon aria-hidden="true" />
                  WhatsApp us
                </a>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "h-12 rounded-full border-white/20 bg-white/8 px-6 text-white hover:bg-white hover:text-[#2b1020]",
                  )}
                >
                  <NavigationIcon aria-hidden="true" />
                  Get directions
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <div className="grid gap-3 md:grid-cols-3">
          {contactOptions.map((option) => {
            const Icon = option.icon;

            return (
              <a
                key={option.title}
                href={option.href}
                target={option.external ? "_blank" : undefined}
                rel={option.external ? "noreferrer" : undefined}
                className="group flex min-h-52 flex-col rounded-lg border border-[#2b1020]/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#e80071]/25 hover:shadow-[0_20px_55px_rgba(70,18,44,.1)] sm:p-7"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#fde7f1] text-[#e80071] transition-colors group-hover:bg-[#e80071] group-hover:text-white">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <ArrowUpRightIcon
                    aria-hidden="true"
                    className="size-5 text-[#2b1020]/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#e80071]"
                  />
                </div>
                <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e80071]">
                  {option.eyebrow}
                </p>
                <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
                  {option.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {option.description}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-28">
        <div className="overflow-hidden rounded-lg border border-[#2b1020]/10 bg-white shadow-[0_25px_80px_rgba(70,18,44,.08)] lg:grid lg:grid-cols-[minmax(310px,.68fr)_minmax(0,1.32fr)]">
          <div className="flex flex-col p-7 sm:p-10 lg:p-12">
            <span className="grid size-12 place-items-center rounded-full bg-[#2b1020] text-white">
              <MapPinIcon aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e80071]">
              Find the storefront
            </p>
            <h2 className="mt-3 max-w-sm font-heading text-4xl font-semibold leading-tight tracking-[-0.035em]">
              Right by Lohiya Maidan.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-muted-foreground">
              Look for Sharif Gift Center in Old Sarafa, near Dunda Maharaj
              Math. The map opens the most accurate route to our location.
            </p>

            <div className="mt-8 space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-lg bg-[#fff7ec] p-4">
                <MapIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#e80071]" />
                <p className="leading-6">
                  <span className="font-bold">Landmark:</span> Dunda Maharaj
                  Math, Lohiya Maidan
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-[#fff7ec] p-4">
                <MessageCircleIcon
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-[#e80071]"
                />
                <p className="leading-6">
                  Message us before travelling to check product availability.
                </p>
              </div>
            </div>

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 h-12 w-full rounded-full sm:w-fit",
              )}
            >
              <NavigationIcon aria-hidden="true" />
              Start navigation
              <ExternalLinkIcon aria-hidden="true" />
            </a>
          </div>

          <div className="relative min-h-[390px] border-t border-border bg-muted sm:min-h-[520px] lg:min-h-[650px] lg:border-l lg:border-t-0">
            <iframe
              src={MAP_EMBED_URL}
              title="Sharif Gift Center location on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 grayscale-[8%] contrast-[1.03]"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </main>
  );
}
