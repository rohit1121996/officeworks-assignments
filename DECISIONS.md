# Decisions and assumptions

## Ambiguities resolved

- **“Top rated” means curated, not calculated.** The five home-page products are the entrepreneur's chosen IDs (`t1`, `t2`, `h1`, `o1`, `s1`). Each category shows its chosen products first and its remaining products separately. The sample ratings are display metadata only.
- **Sample products are sufficient.** The brief says product metadata is not important and Fake Store API is acceptable, not mandatory. Twelve sample products and bundled artwork keep the local demonstration available even if an external API or image host fails.
- **Search is literal text matching.** A submitted term is trimmed and matched case-insensitively against title, description, and category. An absent or blank term shows the full catalogue. Fuzzy search, ranking, and pagination are deferred for the small catalogue.
- **Contact details are name and email.** Phone and message are optional. The enquiry email includes the server-resolved product, not a client-supplied description.
- **Local “sales inbox” is Mailpit.** A successful submission is accepted by its SMTP server and visible in its web UI. It does not send to an external address.
- **Web is the chosen client.** React/TypeScript and Node.js/TypeScript are both allowed options and make local review straightforward.

## Trade-offs and cuts

- A single `Catalogue` module is the product-source boundary. A Fake Store adapter was considered and left out because live data is not required for the acceptance flows and adds a failure mode to the review. Replacing the source can occur without changing UI pages or email handling.
- The enquiry is sent synchronously. The API returns success only after SMTP accepts it; on failure it returns an error so the user can retry. A database-backed outbox would add durability, but is beyond the critical path.
- Rate limiting is in memory, per process. It reduces accidental or casual abuse locally. A distributed store would be necessary for multiple API instances.
- The visual design uses a small set of CSS rules and four reusable category illustrations. It is intentionally easy to replace when creative direction arrives.
- There is no cart, checkout, login, admin panel, hosting stack, or analytics because none is needed to demonstrate the requested journey.

## How this can grow

Add a source adapter that maps a real API into the existing `Product` shape; keep all fetches server-side, validate upstream data, and add timeout/cache behavior. Move the five editorial IDs into a managed content store. Replace Mailpit with a configured SMTP provider and add a persistent outbox when reliable delivery matters. A deployed version can put the web/API containers behind an AWS-compatible load balancer and use a managed datastore if the catalogue grows.

## With another day

1. Rehearse Docker startup and the full enquiry flow in a clean environment, including Mailpit inspection.
2. Add a browser-level critical-path test and accessibility audit for keyboard and screen-reader behavior.
3. Add a real product adapter with validated mapping and a controlled failure test, if live data is desired.
4. Add an enquiry outbox and operational monitoring if messages must survive mail outages.
