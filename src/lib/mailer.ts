import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/**
 * Sends email through the store's own mailbox (Hostinger business email by
 * default). SMTP_USER / SMTP_PASSWORD are the mailbox login.
 */
function readSmtpConfig() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 465);
  return {
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port,
    secure: port === 465,
    auth: { user, pass },
    from: process.env.MAIL_FROM || `The Sharif Store <${user}>`,
  };
}

export function isMailerConfigured() {
  return readSmtpConfig() !== null;
}

let transporter: Transporter | null = null;

export async function sendMail(message: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const config = readSmtpConfig();
  if (!config) throw new Error("SMTP is not configured.");

  transporter ??= nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({ from: config.from, ...message });
}
