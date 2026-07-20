import {
  HeartHandshakeIcon,
  PackageCheckIcon,
  ShieldCheckIcon,
} from "lucide-react";

import type { CampaignSlide } from "../components/campaign-hero";
import { getCategoryPath } from "./routes";

export const promises = [
  {
    icon: PackageCheckIcon,
    title: "Carefully packed",
    copy: "Every order is checked and packed with care before it leaves us.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Genuine finds",
    copy: "Straightforward prices and a catalogue chosen for everyday use.",
  },
  {
    icon: HeartHandshakeIcon,
    title: "Human support",
    copy: "Questions before ordering? Speak to a real person from our store.",
  },
];

export const heroSlides: CampaignSlide[] = [
  {
    alt: "Women's handbags under ₹500",
    desktopImage: {
      src: "/handbags-under-500-desktop.avif",
      width: 1800,
      height: 900,
    },
    mobileImage: {
      src: "/handbags-under-500-mobile.avif",
      width: 768,
      height: 1200,
    },
    href: getCategoryPath("bags-fashion"),
  },
  {
    alt: "Jewellery picks with lasting shine",
    desktopImage: {
      src: "/jewellery-picks-desktop.avif",
      width: 1800,
      height: 900,
    },
    mobileImage: {
      src: "/jewellery-picks-mobile.avif",
      width: 768,
      height: 1200,
    },
    href: getCategoryPath("jewellery"),
  },
  {
    alt: "Dove and Philips hair care essentials",
    desktopImage: {
      src: "/hair-care-essentials-desktop.avif",
      width: 1800,
      height: 900,
    },
    mobileImage: {
      src: "/hair-care-essentials-mobile.avif",
      width: 768,
      height: 1200,
    },
    href: getCategoryPath("hair-care"),
  },
];
