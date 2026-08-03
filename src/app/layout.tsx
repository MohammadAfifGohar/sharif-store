import type { Metadata } from "next";
import { Urbanist } from "next/font/google";

import { BagProvider } from "@/components/bag-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sharif Beauty & Gift Collection",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Shop premium beauty products and unique gifts at Sharif Beauty & Gift Collection. Trusted quality, elegant collections, and a refined shopping experience.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: SITE_NAME,
    title: "Sharif Beauty & Gift Collection",
    description:
      "Shop beauty, gifting and everyday essentials from Sharif Store in Deglur.",
    images: [{ url: "/sharif-store-logo-transparent.png", alt: "Sharif Store" }],
  },
  twitter: {
    card: "summary",
    title: "Sharif Beauty & Gift Collection",
    description:
      "Shop beauty, gifting and everyday essentials from Sharif Store in Deglur.",
    images: ["/sharif-store-logo-transparent.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c"),
          }}
        />
        <BagProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </BagProvider>
      </body>
    </html>
  );
}
