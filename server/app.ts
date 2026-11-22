import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { Catalogue } from "./catalogue.js";
import type { MailSender } from "./mail.js";
import type { Enquiry } from "../shared/types.js";

export function createApp(options: {
  catalogue?: Catalogue;
  mailer: MailSender;
  logger?: boolean;
}) {
  const app = Fastify({ logger: options.logger ?? false, bodyLimit: 16_384 });
  const catalogue = options.catalogue ?? new Catalogue();

  app.register(rateLimit, { global: false, max: 5, timeWindow: "1 minute" });

  app.get("/api/health", async () => ({ ok: true }));
  app.get("/api/home", async () => catalogue.home());

  app.get<{ Params: { slug: string } }>(
    "/api/categories/:slug",
    async (request, reply) => {
      const result = catalogue.category(request.params.slug);
      if (!result) return reply.code(404).send({ error: "Category not found" });
      return result;
    },
  );

  app.get<{ Querystring: { q?: string } }>(
    "/api/products",
    {
      schema: {
        querystring: {
          type: "object",
          properties: { q: { type: "string", maxLength: 120 } },
          additionalProperties: false,
        },
      },
    },
    async (request) => ({ products: catalogue.search(request.query.q ?? "") }),
  );

  app.get<{ Params: { id: string } }>(
    "/api/products/:id",
    async (request, reply) => {
      const product = catalogue.product(request.params.id);
      if (!product) return reply.code(404).send({ error: "Product not found" });
      return product;
    },
  );

  app.post<{ Body: Enquiry }>(
    "/api/enquiries",
    {
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      schema: {
        body: {
          type: "object",
          required: ["productId", "name", "email"],
          additionalProperties: false,
          properties: {
            productId: { type: "string", minLength: 1, maxLength: 100 },
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              pattern: "\\S",
            },
            email: {
              type: "string",
              minLength: 5,
              maxLength: 254,
              pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            },
            phone: { type: "string", maxLength: 30 },
            message: { type: "string", maxLength: 2000 },
          },
        },
      },
    },
    async (request, reply) => {
      const product = catalogue.product(request.body.productId);
      if (!product) return reply.code(404).send({ error: "Product not found" });
      try {
        await options.mailer.send(request.body, product);
      } catch (error) {
        request.log.error({ err: error }, "Enquiry delivery failed");
        return reply
          .code(503)
          .send({
            error: "Unable to send enquiry right now. Please try again.",
          });
      }
      return reply.code(201).send({ ok: true });
    },
  );

  app.setErrorHandler((error, _request, reply) => {
    const issue = error as { validation?: unknown; statusCode?: number };
    if (issue.validation)
      return reply.code(400).send({ error: "Invalid request" });
    if (issue.statusCode === 429)
      return reply
        .code(429)
        .send({ error: "Too many enquiries. Please try later." });
    app.log.error(error);
    return reply
      .code(issue.statusCode ?? 500)
      .send({ error: "Request failed" });
  });

  return app;
}
