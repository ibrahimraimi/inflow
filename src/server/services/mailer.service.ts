import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

const mailerSend = new MailerSend({
  apiKey: (process.env.MAILERSEND_API_TOKEN || 
           process.env.MAILERSEND_API_KEY || 
           process.env.MAILERSEND_TEST_TOKEN) as string,
});

const getSender = () => {
  const email = (process.env.MAILERSEND_SENDER_EMAIL || "no-reply@inflowanalytics.com") as string;
  const name = (process.env.MAILERSEND_SENDER_NAME || "Inflow Analytics") as string;
  const fullEmail = email.includes("@") ? email : `info@${email}`;
  
  return new Sender(fullEmail, name);
};

export class MailerService {
  static async sendEmail({
    to,
    toName,
    subject,
    template,
  }: {
    to: string;
    toName?: string;
    subject: string;
    template: ReactElement;
  }) {
    try {
      const html = await render(template);
      const plainText = await render(template, { plainText: true });

      const emailParams = new EmailParams()
        .setFrom(getSender())
        .setTo([new Recipient(to, toName)])
        .setSubject(subject)
        .setHtml(html)
        .setText(plainText);

      await mailerSend.email.send(emailParams);
    } catch (error) {
      console.error("Error sending email via MailerSend:", error);
      throw new Error("Failed to send email.");
    }
  }
}
