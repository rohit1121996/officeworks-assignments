# AI-Native Engineer challenge: implementation plan

Status: implemented. The blank-search behavior was updated after user review to show all products.

## 1. Reading of the brief

Build a small, interactive product catalogue with a web or mobile client and an allowed backend. A customer can browse, search, view a product, and send an enquiry. The reviewer must be able to run it locally in under 10 minutes without paid accounts. The solution should be a useful foundation, with clear boundaries around the product source, visual design, and email transport. The exercise explicitly values judgement, critical-path delivery, tests, documented assumptions, and honest AI/time records over feature count.

The brief's deadline, repository/PR submission process, and instruction not to email the assessors are requirements of the take-home exercise. They do not authorize sending email or publishing a repository from this workspace. We will prepare those deliverables during implementation; final submission depends on the user's repository and submission context.

## 2. Chosen stack and architecture

- **Client:** React + TypeScript + Vite, responsive web. This is an allowed, preferred client choice and is easy to review locally.
- **Backend:** Node.js + TypeScript + Fastify. This is an allowed, preferred backend choice. Fastify provides route schemas, request limits, and in-process route testing with little custom code.
- **Email:** SMTP through Nodemailer; local Mailpit container captures the message in a browser inbox. SMTP host/port/sender/recipient are server configuration, so a real provider can later replace Mailpit without changing the enquiry flow.
- **Catalogue:** a normalized `Product` shape behind one server-side catalogue module. A checked-in sample catalogue with bundled product artwork is the source for a deterministic local review. A Fake Store API adapter can be added at this boundary later; the browser only uses our `/api` routes.
- **Run path:** one `docker compose up --build` command starts web, API, and Mailpit. README lists URLs, prerequisites, reset, tests, and an optional non-Docker development path. No account or paid service is required.
- **Infrastructure:** Docker Compose only, with images and configuration portable to AWS container services if deployment is added later. No AWS resource is required for the exercise.

```text
Browser (React)
   | same-origin /api requests
   v
Node/Fastify API ----> catalogue module ----> checked-in sample data
   +----> mail transport (SMTP) ----> Mailpit local inbox
```

Keep a single root npm package with `client/`, `server/`, and `shared/` directories. Share API DTO types only; keep source-specific fields inside the server adapter. Do not add a database, authentication, cart, checkout, cloud deployment, or a generic plugin framework for this PoC.

## 3. Requirement-to-evidence map

| Brief requirement | Planned behavior | Proof before submission |
| --- | --- | --- |
| Home: exactly five chosen top-rated products | Five explicit product IDs in catalogue editorial data; show five cards on `/` | API test asserts five distinct valid products; browser check counts five cards |
| Category: top-rated plus additional products | Category page splits its products into selected top-rated items and the remaining items, with no duplicates | API test for each category; browser check for one category |
| Search: submit a term and see only matching products | Search button and Enter submit; backend matches normalized term against title, description, and category, case-insensitively | API tests for matching/nonmatching and blank term; browser check |
| Product tile opens detail | Stable `/products/:id` URL with image, title, price, description, category, and enquiry action | Direct URL and click-through browser checks; 404 test |
| Enquiry sends sales email and shows thanks | Product-bound form; API validates input, resolves product itself, sends via SMTP, and returns success only after SMTP accepts it; then show thank-you state | API success/failure tests; end-to-end check in Mailpit UI |
| One allowed client/backend | React/TypeScript and Node/TypeScript | README and source tree |
| No direct client call to Fake Store API | Source URL exists only in backend adapter | Search built client bundle/source; network check |
| Local run under 10 minutes; no accounts | Compose starts all services; default catalogue has no external dependency; Mailpit captures email locally | Clean-start rehearsal from README with elapsed time |
| Secrets and configuration | `.env.example` and `.gitignore`; no credentials committed | Secret scan and README check |
| Source, tests, README, decisions, AI notes, time | Commit all requested files and keep an open PR into `main` on a feature branch when repository context exists | Final repository audit and PR review |

## 4. Behaviour and data contracts

### Pages

1. `/`: simple introduction, category navigation, and five top-rated products.
2. `/categories/:slug`: category heading, a top-rated section, and an additional-products section.
3. `/search?q=...`: results for the submitted term only, plus clear empty, loading, and error states.
4. `/products/:id`: product details and an Enquire action opening an inline form. After a successful response, replace the form with a thank-you message.

Use semantic HTML, keyboard-operable controls, visible focus, labelled fields, sensible image alternatives, responsive card grids, and form errors tied to their fields. Visual choices will be kept in CSS tokens/components so changing the look and feel does not alter business logic. Product cards, section headings, error/empty states, and form fields should be small reusable components; avoid abstractions with only one meaningful use.

### Backend API

| Endpoint | Contract |
| --- | --- |
| `GET /api/home` | Categories and the five curated top-rated products |
| `GET /api/categories/:slug` | Category metadata, `topRated[]`, `additional[]` |
| `GET /api/products?q=...` | Matching products; reject overlong query and define blank-query response |
| `GET /api/products/:id` | One normalized product or 404 |
| `POST /api/enquiries` | `{ productId, name, email, phone?, message? }`; returns 201 after accepted mail, 400 for invalid input, 404 for unknown product, 502/503 for transport failure |
| `GET /api/health` | Basic readiness for local orchestration |

Normalized product fields: `id`, `title`, `description`, `categorySlug`, `categoryName`, `price`, `currency`, `imageUrl`, and optional `rating`. Keep IDs stable across listing and detail. Category slugs are server-defined, not blindly made from upstream text. The source adapter validates upstream data and maps it to this shape; API routes do not expose upstream schema directly.

**Top-rated assumption:** the entrepreneur's five choices are editorial selections, not an automatic sort of sample ratings. Choose five valid IDs covering every sample category (at least one per category). Each sample category also needs at least one additional product. On category pages, the category's chosen items are shown first and all its other products are shown below. Document the five IDs and how they can be changed.

**Search behavior:** trim whitespace and perform case-insensitive substring matching over title, description, and category. An absent or empty term shows the full catalogue. No fuzzy search, stemming, or pagination is needed for the small sample set.

**Enquiry assumption:** name and email are required contact details; phone and message are optional. The server looks up the product from `productId`, so the client cannot forge the product title or price in the email. In local mode, “sales inbox receives an email” means Mailpit receives and displays it at `localhost:8025`; production delivery needs real SMTP configuration. No customer email or form body is stored in the application.

## 5. Security and reliability decisions

- Validate and bound every route parameter, query, and enquiry field on the server; enforce request-body size limits. Use browser validation for usability, never as the only validation.
- Escape user content in email markup, or send plain text; never put unsanitized user input in email headers. Keep sender and sales recipient server-controlled.
- Use a same-origin `/api` proxy for local web development; allow only expected origins if cross-origin access is ever enabled. Do not put SMTP settings or upstream configuration in client code.
- Add a modest per-IP rate limit to enquiry submission to reduce spam. Disable repeat submission while pending, but handle duplicate attempts server-side within the rate limit.
- Set timeouts for SMTP. Show a retryable error if delivery fails. Never display a thank-you state after an unsuccessful mail send.
- Bundle artwork for sample products so broken third-party image hosts do not spoil the demo. If a live adapter is added later, use a fixed, server-controlled upstream URL and a timeout.
- Keep logs useful but avoid logging full contact details. Configuration errors should fail fast at startup.
- This PoC has no durable enquiry queue. If SMTP accepts a message, the user gets success; if it fails, the user sees failure and can retry. A durable outbox/queue is the next step if delivery guarantees become a requirement.

## 6. Test and review plan

1. **Fast API tests:** exact five featured IDs, category partition/no duplication, search normalization, product 404, enquiry validation, successful mail call, and mail failure returning an error. Inject fake catalogue/mail implementations at module boundaries.
2. **One browser critical-path test or scripted smoke run:** home → category → search → product → enquiry → thank-you; verify the captured email in Mailpit and that the browser makes no external product API call.
3. **Manual review:** narrow and wide layout, keyboard/focus behavior, image failures, empty results, service errors, direct route refresh, and no console errors.
4. **Build/quality gates:** TypeScript check, production client build, API tests, local Compose smoke test, and README clean-start rehearsal. Avoid tests that merely restate component markup.

## 7. Implementation sequence and time box

Target approximately 2–3 hours of active challenge work; record actual time, including deviations, in the final docs.

| Phase | Target | Exit condition |
| --- | --- | --- |
| Foundation | 20–25 min | Root package, TypeScript, Vite/Fastify skeleton, Compose/Mailpit, example env, one-command startup |
| Catalogue API | 30–35 min | Normalized sample source, curated IDs, category/search/detail routes, focused API tests |
| Client | 40–50 min | All four routes, reusable cards/navigation/states, responsive styling, accessible forms |
| Enquiry | 20–25 min | SMTP transport, validation/rate limit, clear success/failure behavior, Mailpit proof |
| Review and submission docs | 30–40 min | Critical-path test/smoke check, README, `DECISIONS.md`, `AI_USAGE.md`, actual time record, PR description |

Build vertical slices in this order: local run → home → category → search → detail → enquiry. Check each slice before moving on. A live Fake Store adapter is outside this PoC and should be added only when live data is needed; this decision is recorded in `DECISIONS.md`.

## 8. Expected files and delivery checklist

```text
client/             React pages, API client, reusable UI components, CSS
server/             HTTP routes, catalogue source/normalization, mail transport
shared/             Small API DTO types only
tests/              Critical-path API and browser checks
compose.yaml        Web + API + Mailpit for local review
.env.example        Documented, non-secret defaults/configuration
README.md           Stack choice, quick start, URLs, tests, configuration
DECISIONS.md        Assumptions, scope cuts, trade-offs, growth, next-day work
AI_USAGE.md         Tools/models, instruction files, plan, 3–5 moments, AI mistakes and review
```

Before final handoff: verify the repository is on a feature branch, inspect every committed file, ensure source/tests/docs are present, run the gates above, scan for secrets, and write a PR description that explains choices and verification. Creating the remote repository, opening the PR, granting reviewers access, and emailing the link require the user's Git host/submission context.

## 9. External facts checked for this plan

- FakeStoreAPI's own repository documents `/products`, product detail, categories, category products, and product ratings: https://github.com/keikaavousi/fake-store-api
- A September 2026 issue reports its products endpoint returning HTTP 523. This does not prove it is currently down, but local review should not depend on its availability: https://github.com/keikaavousi/fake-store-api/issues/174
- Mailpit's official Docker documentation confirms the local web UI/SMTP ports and Compose use: https://mailpit.axllent.org/docs/install/docker/
