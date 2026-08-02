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
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
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
        <BagProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </BagProvider>
      </body>
    </html>
  );
}
