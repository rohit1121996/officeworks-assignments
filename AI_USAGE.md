# AI usage notes

## Tools and model

OpenAI Codex (GPT-6 family as identified by the agent environment) was used for planning, implementation, tests, and review. The exact model variant was not exposed to the project. The PDF and Ponytail skills guided document reading and keeping the implementation small. Web research checked the FakeStoreAPI repository, its availability report, and Mailpit's official Docker instructions. No subagents were used.

No `AGENTS.md`, `CLAUDE.md`, or `.cursor/rules` existed in this initially empty workspace. `PLAN.md` was written before application code and is committed with the source.

## Five moments that shaped the solution

1. The user's request asked for architecture and a complete requirement analysis before coding. This led to the requirement-to-evidence table and implementation sequence in `PLAN.md`.
2. The brief's “five chosen top rated” wording led to five explicit editorial IDs rather than ranking products by a sample rating field.
3. The requirement that product data pass through the backend led to the `/api` boundary and a server-owned `Catalogue` module.
4. The no-paid-account and local-email requirements led to SMTP plus Mailpit, with success shown only after mail acceptance.
5. The brief's short time box and emphasis on judgement led to checked-in sample data and local artwork rather than a live product dependency.

## Critical review of AI output

- The first generated patch tried to add and update `package.json` in the same patch. The patch tool rejected it; the files were reapplied cleanly.
- The initial TypeScript error handler treated an unknown error as a typed Fastify error. `npm run check` caught it; the handler now narrows the fields it uses.
- The first test command used the `tsx` CLI, which attempted an IPC socket blocked by the sandbox. It was changed to Node's test runner with `tsx` imported; all five tests passed.
- The initial plan suggested an optional live Fake Store adapter. Review showed it was unnecessary for the requested acceptance flows, so the implementation and plan were aligned around a replaceable sample source.
- A user review identified that blank search should show all products. The initial implementation and written assumption returned none. Both the API and UI were corrected, with API and browser checks for empty, matching, and unmatched search.
- A later container build exposed a high-severity advisory in the originally chosen Nodemailer major version. The dependency was upgraded to the patched 10.x line, its separate type package was removed, and the build, API tests, Compose flow, Mailpit delivery, and dependency audit were repeated.

## Time spent

Initial implementation took approximately 1 hour of elapsed work on 22 November 2026: planning and PDF review about 10 minutes; implementation about 25 minutes; testing, debugging, and documentation about 25 minutes. The search correction and broader scenario checks took approximately another 20 minutes. Docker startup, Mailpit verification, keyboard checks, and the dependency upgrade took approximately another 30 minutes. These are estimates, not stopwatch measurements.
