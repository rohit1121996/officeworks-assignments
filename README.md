# Aster & Co. product catalogue

A small React and Node.js catalogue proof of concept. Customers can browse five curated products, explore categories, search, open product details, and send an enquiry. The client calls only this application's backend. A local Mailpit inbox captures enquiries without an account or paid service.

## Quick start

Prerequisite: Docker with Compose. From the repository root:

```sh
docker compose up --build
```

Open the [catalogue](http://localhost:5174), then the [sales inbox](http://localhost:8025). Select a product, send an enquiry with test contact details, and open Mailpit to see the message. `sales@example.test` is a local demonstration recipient; no real email is delivered from Mailpit.

To stop and remove the containers, run `docker compose down`. No `.env` file is required for the local demo. Copy `.env.example` to `.env` only to override SMTP and proxy settings. Never commit `.env` or real credentials.

The one-command Compose setup was rehearsed on 22 November 2026. The web, API, and Mailpit containers started, and a browser enquiry appeared in Mailpit. See the verification section below.

## Stack and structure

- Client: React, TypeScript, Vite, responsive CSS.
- Backend: Node.js, TypeScript, Fastify.
- Mail: Nodemailer over SMTP, with Mailpit for local capture.
- Product source: checked-in sample data and bundled SVG artwork. It lives in `server/catalogue.ts` and is normalized before reaching the browser. Replace this module or add a source adapter when real product data is available.

```text
client/      pages, reusable UI, styles, local artwork
server/      API routes, catalogue, SMTP transport
shared/      API data types
tests/       critical-path API tests
```

The sample data makes the review deterministic. Fake Store API is allowed by the brief, but not required; a live dependency was omitted because it can be unavailable and product metadata is explicitly unimportant for this PoC. The browser never contacts Fake Store API.

## Available routes

| Browser route | Purpose |
| --- | --- |
| `/` | Five curated top-rated products and categories |
| `/categories/:slug` | Top-rated and additional products in one category |
| `/search?q=term` | Case-insensitive matching results |
| `/products/:id` | Product detail and enquiry form |

| API route | Purpose |
| --- | --- |
| `GET /api/home` | Categories and five top-rated products |
| `GET /api/categories/:slug` | One category, partitioned into top-rated and additional |
| `GET /api/products?q=term` | Matching products; absent or blank term returns all products |
| `GET /api/products/:id` | One product or 404 |
| `POST /api/enquiries` | Validate contact details and product, send mail, then return 201 |
| `GET /api/health` | Basic health response |

The five editorial top-rated IDs are `t1`, `t2`, `h1`, `o1`, and `s1`. Each category has at least one top-rated and one additional item. Search checks title, description, and category text after trimming and lowercasing. A blank search shows all twelve products. The server resolves the product by ID for the email; the client cannot supply its title or price.

## Configuration

Compose reads `.env` if present. Local defaults are shown in `.env.example`. `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and `SALES_INBOX` are server-side only. `API_PROXY_TARGET` tells Vite where to forward `/api` requests. For a real SMTP provider, set its host/port and a verified sender/recipient; SMTP authentication and TLS would need to be added to `server/mail.ts` for that provider.

If running without Compose, use Node.js 24 and a local SMTP sink listening on port 1025:

```sh
npm ci
npm run dev:server
```

In a second terminal:

```sh
API_PROXY_TARGET=http://localhost:3001 npm run dev:client -- --port 5174
```

The non-Docker path needs an SMTP sink for successful enquiries. The browsing flows work without one, and the enquiry form reports delivery failures rather than claiming success.

## Verification

```sh
npm test
npm run build
docker compose config
npm audit
```

The API tests cover the five editorial picks, every category's partition, empty/matching/unmatched search, query bounds, unknown products, enquiry validation, SMTP success, and SMTP failure. The build includes TypeScript checking and the production client bundle. Browser checks covered home, category, empty/matching/unmatched search, product detail, enquiry error and success states, and direct route refresh. The Compose-hosted enquiry showed a thank-you message, and the correct product and test contact details appeared in Mailpit. Home and product pages fit a 390 px viewport without horizontal overflow. Tab order, Enter-to-search, keyboard product opening, and enquiry-form focus were checked. A full screen-reader audit remains useful. On 22 November 2026, `npm audit` reported zero vulnerabilities after updating Nodemailer.

## Known limits

This is a PoC: no database, admin UI, authentication, durable enquiry queue, or live product adapter. SMTP acceptance is the success boundary; a durable outbox is needed if guaranteed eventual delivery becomes a requirement. Rate limiting is per process and suitable for a local demonstration, not a scaled deployment. See `DECISIONS.md` for assumptions and next steps.
