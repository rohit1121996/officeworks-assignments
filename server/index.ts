import { createApp } from "./app.js";
import { createMailSender } from "./mail.js";

const port = Number(process.env.PORT || 3001);
const smtpPort = Number(process.env.SMTP_PORT || 1025);
if (!Number.isInteger(port) || !Number.isInteger(smtpPort)) {
  throw new Error("PORT and SMTP_PORT must be integers");
}

const app = createApp({
  logger: true,
  mailer: createMailSender({
    host: process.env.SMTP_HOST || "localhost",
    port: smtpPort,
    from: process.env.SMTP_FROM || "catalogue@example.test",
    to: process.env.SALES_INBOX || "sales@example.test",
  }),
});

await app.listen({ host: process.env.HOST || "127.0.0.1", port });
