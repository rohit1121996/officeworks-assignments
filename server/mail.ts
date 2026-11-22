import nodemailer from "nodemailer";
import type { Enquiry, Product } from "../shared/types.js";

export type MailSender = {
  send(enquiry: Enquiry, product: Product): Promise<void>;
};

export function createMailSender(config: {
  host: string;
  port: number;
  from: string;
  to: string;
}): MailSender {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: false,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });

  return {
    async send(enquiry, product) {
      const text = [
        `Product enquiry: ${product.title} (${product.id})`,
        `Name: ${enquiry.name}`,
        `Email: ${enquiry.email}`,
        `Phone: ${enquiry.phone || "Not supplied"}`,
        "",
        enquiry.message || "No message supplied.",
      ].join("\n");
      await transport.sendMail({
        from: config.from,
        to: config.to,
        subject: `Product enquiry: ${product.id}`,
        text,
      });
    },
  };
}
