import type { Metadata } from "next";

import {
  GRIEVANCE_OFFICER,
  SELLER,
  SITE_NAME,
  SUPPORT_EMAIL,
  WHATSAPP_NUMBER,
} from "@/lib/site-config";

const LAST_UPDATED = "16 November 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses and protects your personal information.`,
  alternates: { canonical: "/privacy-policy" },
};

const sections = [
  {
    id: "who-we-are",
    title: "Who we are",
    points: [
      `${SITE_NAME} (thesharifstore.in) is the online store of ${SELLER.shopName}, ${SELLER.address}, and is operated by ${SELLER.operatorName}. In this policy, "we", "us" and "our" mean ${SITE_NAME}.`,
      "This policy explains what personal information we collect when you use this website, place an order or contact us, why we collect it, who we share it with and the choices you have. It is published under the Information Technology Act, 2000 and its rules, and the Digital Personal Data Protection Act, 2023.",
    ],
  },
  {
    id: "what-we-collect",
    title: "Information we collect",
    points: [
      "Order details: your name, phone number, email address, delivery address and PIN code, the products you buy and the payment method you choose.",
      "Account details, if you choose to log in: your email address and name, or the details shared by Google when you sign in with Google. A password you set is stored by our login provider in protected form; we never see it.",
      "Payment details: online payments are handled by Razorpay. We receive only the payment status and a payment reference. We do not see or store your card, UPI PIN or bank login details.",
      "Messages and reviews: what you send us on WhatsApp, phone or email, and any product review you submit (your name, email, rating and review text).",
      "Technical information: basic information your browser sends, such as IP address and device type, which our hosting providers record in server logs for security.",
    ],
  },
  {
    id: "why",
    title: "Why we use it",
    points: [
      "To process, deliver and support your order, including sending order confirmation emails and contacting you about delivery.",
      "To create and secure your account, verify your email and help you reset your password.",
      "To handle returns, refunds, complaints and questions.",
      "To prevent fraud and misuse of the website, for example by limiting repeated failed requests.",
      "To keep the records we are required to keep under tax and accounting laws.",
      "We do not sell your personal information, and we do not use it for advertising.",
    ],
  },
  {
    id: "sharing",
    title: "Who we share it with",
    points: [
      "We share only what each service needs to do its job:",
      "Razorpay, to process online payments and refunds.",
      "Courier and delivery partners, who receive your name, phone number and delivery address to deliver your order.",
      "Google (Firebase Authentication), to run account login.",
      "Our web hosting and email providers, which store our website, order records and emails on our behalf.",
      "Government authorities, if the law requires us to.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    points: [
      "If you log in, we set one cookie to keep you logged in. It is needed for your account to work.",
      "Your shopping bag is saved in your own browser's local storage, so it stays when you reload the page. It is not sent to us until you check out.",
      "We do not use advertising or tracking cookies.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    points: [
      "We keep order and invoice records for as long as tax and accounting laws require.",
      "We keep account details while your account is active. If you ask us to delete your account, we delete your account details, but may keep order records that the law requires us to keep.",
      "Reviews stay on the website until you ask us to remove them.",
    ],
  },
  {
    id: "security",
    title: "How we protect it",
    points: [
      "The website uses HTTPS encryption. Payments go through Razorpay's secure checkout. Access to order records is limited to the people who need it to serve you.",
      "No online system is completely secure. If a data breach affects your information, we will inform you and the authorities as the law requires.",
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    points: [
      "You can ask us for a summary of the personal information we hold about you, ask us to correct or update it, or ask us to delete it.",
      "You can withdraw your consent at any time, for example by deleting your account. This does not affect orders already placed.",
      "You can nominate another person to exercise these rights for you if you are unable to.",
      `To use any of these rights, email ${SUPPORT_EMAIL} or message us on WhatsApp at +${WHATSAPP_NUMBER}. We will reply within 30 days.`,
      "If you are not satisfied with our response, you can complain to the Data Protection Board of India.",
    ],
  },
  {
    id: "children",
    title: "Children",
    points: [
      "This website is meant for adults. If you are under 18, please place orders through a parent or guardian.",
    ],
  },
  {
    id: "grievance",
    title: "Grievance Officer",
    points: [
      `${GRIEVANCE_OFFICER.name}, ${GRIEVANCE_OFFICER.designation}, ${SITE_NAME}`,
      `Email: ${GRIEVANCE_OFFICER.email}`,
      `Phone / WhatsApp: ${GRIEVANCE_OFFICER.phone}`,
      `Address: ${SELLER.shopName}, ${SELLER.address}`,
      "We will acknowledge your complaint within 48 hours and resolve it within one month.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    points: [
      "We may update this policy from time to time. The latest version is always on this page, with the date it was last updated.",
    ],
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 bg-[#fffdfb]">
      <section className="bg-[#2b1020] text-white">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
          <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#ff9fc9] sm:text-xs">
            <span className="h-px w-9 bg-[#ff4d9b]" />
            Your information
          </p>
          <h1 className="mt-6 max-w-3xl font-heading text-5xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-7xl">
            Privacy Policy
          </h1>
          <p className="mt-6 text-sm text-white/60">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 lg:px-10 lg:pb-24">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-28">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#e80071]">
              On this page
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="hover:text-foreground">
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="max-w-3xl">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 border-b border-[#2b1020]/10 py-8 first:pt-0 last:border-b-0"
            >
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {section.title}
              </h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-muted-foreground marker:text-[#e80071]">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
