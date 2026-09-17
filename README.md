# Playwright Agentic QA Framework

A TypeScript quality-engineering framework for deterministic Playwright automation, API contract checks, cross-browser validation, container smoke tests, CI quality gates, and optional AI-assisted test development.

> **Design principle:** deterministic tests make release decisions; AI agents assist with planning, generation, and diagnosis but do not replace validation or human review.

## Contents

- [What this project does](#what-this-project-does)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Running the tests](#running-the-tests)
- [Using the AI agents](#using-the-ai-agents)
- [Configuration](#configuration)
- [CI/CD and quality gates](#cicd-and-quality-gates)
- [Security and safe-use policy](#security-and-safe-use-policy)
- [Project structure](#project-structure)
- [Known limitations](#known-limitations)
- [Contributing](#contributing)

## What this project does

The implemented automated tests use public, read-only behavior from:

- **VA.gov** for the primary browser, API, and network-routing examples
- **IRS.gov** for a configurable navigation smoke test through the `irsPage` fixture

Current coverage includes:

- Homepage landmarks, headings, navigation, and page titles
- Public HTTP contracts for the homepage, `robots.txt`, and `sitemap.xml`
- Network interception and deterministic simulated backend responses
- Search-input validation and runtime configuration parsing
- Chromium, Firefox, and WebKit execution
- Docker-based Chromium smoke testing

Tests do not submit credentials, payments, taxpayer information, or other sensitive data.

## Architecture

```text
┌──────────────────────┐
│ Playwright / Vitest  │  deterministic tests and assertions
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ Fixtures and clients │  browser contexts, API contexts, page objects
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ Public test targets  │  VA.gov and configurable IRS.gov navigation
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ Evidence and gates   │  JUnit, HTML, traces, screenshots, CI decisions
└──────────────────────┘

Optional development assistance:
VS Code/CLI → LangChain agent → MCP Playwright/filesystem/Git tools
```

The agentic layer is optional. Playwright and unit tests run without an LLM.

## Getting started

### Prerequisites

- Node.js 22.x for CI; Node.js 20+ for local development
- npm
- Docker for container validation
- Playwright-supported browsers
- Python 3 and `uvx` only when using the Git MCP server
- An OpenAI API key only when using the LangChain assistant

### Install

```bash
npm ci
npx playwright install
```

For Linux CI-style browser dependencies:

```bash
npx playwright install --with-deps
```

Create local configuration without committing secrets:

```bash
cp .env.example .env
```

Never commit `.env`, `.secrets`, API keys, access tokens, credentials, or authentication state.

## Running the tests

### Standard commands

```bash
npm test
npm run test:ui
npm run test:api
npm run test:network
npm run test:unit
npm run typecheck
npm run lint
npm run format:check
npm run ci:local
```

### Run a browser project

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run the IRS navigation smoke test

```bash
npx playwright test tests/ui/irs-navigation.spec.ts
```

### Debug and review evidence

```bash
npx playwright test --debug
npx playwright show-report
```

Playwright writes HTML and JUnit reports plus failure screenshots, traces, videos, and result diagnostics under the configured output directories.

## Using the AI agents

The repository contains three specialized Playwright custom agents under `.github/agents/`. Use them as a controlled workflow rather than asking one agent to perform the entire lifecycle without checkpoints.

### 1. Test planner

Use `playwright-test-planner` when you need to explore an application and create a structured test plan.

Best for:

- Discovering pages, controls, and user journeys
- Identifying happy paths, edge cases, and validation behavior
- Defining independent scenarios and expected outcomes
- Saving a reviewable Markdown test plan

Recommended workflow:

1. Start from a fresh browser state.
2. Explore only authorized targets.
3. Capture user-observable behavior, not implementation assumptions.
4. Include preconditions, steps, expected results, and failure conditions.
5. Save the plan under `specs/`.
6. Review the plan before generating code.

### 2. Test generator

Use `playwright-test-generator` to implement one approved scenario at a time.

Best for:

- Converting a plan item into a single Playwright test
- Reusing fixtures, page objects, and existing project conventions
- Verifying each step interactively before writing code
- Producing a test with traceable step comments

Recommended workflow:

1. Provide the plan file, scenario name, test file, and seed file.
2. Run the generator setup step.
3. Execute the scenario interactively.
4. Review the generated log and locator choices.
5. Write one focused test.
6. Run that test and the relevant regression subset.
7. Review the diff before committing.

Generated tests must use stable, user-facing locators and web-first assertions. Do not accept generated code solely because it runs once.

### 3. Test healer

Use `playwright-test-healer` after a Playwright failure.

Best for:

- Reproducing failures
- Inspecting snapshots, console output, network behavior, and runtime state
- Classifying locator, assertion, timeout, network, data, or environment failures
- Applying the smallest safe test change
- Re-running the failed test and regression coverage

Recommended workflow:

1. Run the affected test or suite.
2. Debug the first failure, not the final aggregate error.
3. Inspect the page snapshot and supporting evidence.
4. Identify the root cause.
5. Change selectors, synchronization, assertions, or test data only as justified.
6. Re-run the test after every fix.
7. Use `test.fixme()` only when the behavior is genuinely blocked and document why.

### Agent safety rules

- Inspect the repository before creating files.
- Prefer existing fixtures, clients, page objects, and utilities.
- Never expose or commit secrets.
- Do not use real personal, taxpayer, payment, or authentication data.
- Do not perform destructive or unauthorized actions against public systems.
- Treat agent output as a proposal until deterministic tests and human review confirm it.
- Do not use `networkidle` or arbitrary `waitForTimeout` calls.
- Keep generated changes small, reviewable, and traceable to a plan or failure artifact.

### LangChain CLI assistant

The separate CLI assistant uses LangChain, OpenAI, and MCP servers for repository and browser assistance:

```bash
npm run chat
```

The assistant requires:

- `OPENAI_API_KEY`
- `npx` for the Playwright and filesystem MCP servers
- `uvx` and `mcp-server-git` for Git MCP access
- Network access to download or start MCP servers

The VS Code extension exposes the same chat capability through the registered assistant command when the extension is packaged and activated in VS Code.

## Configuration

Runtime settings are parsed by `config/environment.ts`.

| Variable                      | Purpose                             | Default                     |
| ----------------------------- | ----------------------------------- | --------------------------- |
| `BASE_URL`                    | Primary browser base URL            | `https://www.va.gov`        |
| `API_BASE_URL`                | API request base URL                | `BASE_URL`                  |
| `IRS_BASE_URL`                | IRS navigation fixture base URL     | `https://www.irs.gov`       |
| `ENVIRONMENT`                 | `local`, `ci`, `staging`, or `test` | `local` locally, `ci` in CI |
| `HEADLESS`                    | Browser headless mode               | `true`                      |
| `WORKERS`                     | Playwright worker count             | framework default           |
| `RETRIES`                     | Retry count                         | `0` locally, `2` in CI      |
| `TIMEOUT`                     | Test timeout in milliseconds        | `30000`                     |
| `SHARD_INDEX` / `SHARD_TOTAL` | Optional Playwright sharding        | unset                       |
| `OPENAI_API_KEY`              | LangChain assistant authentication  | unset                       |
| `OPENAI_MODEL`                | OpenAI model name                   | `gpt-5-mini`                |

Use synthetic or public values only. Validate configuration before running tests against a new target.

## CI/CD and quality gates

### Quality workflow

`.github/workflows/playwright.yml` runs on pushes to `main`/`master`, pull requests, and manual dispatch:

1. Install locked npm dependencies with `npm ci`.
2. Check formatting, lint, and TypeScript.
3. Run Vitest unit tests and `npm audit --audit-level=high`.
4. Run Chromium, Firefox, and WebKit shards.
5. Build and run the Chromium Docker smoke test.
6. Enforce the `Quality gate`.

The quality gate blocks when static checks, browser shards, or the container smoke test do not pass.

### Security workflows

- `security.yml` builds and scans the container with Trivy and enforces `Security gate`.
- `codeql.yml` runs CodeQL JavaScript/TypeScript analysis on GitHub-hosted workflows.
- `gitleaks.yml` scans repository history for secrets.
- `dependency-review.yml` blocks newly introduced high-severity dependencies on pull requests.
- Dependabot updates npm, GitHub Actions, and Docker dependencies weekly.

Local `act` runs are useful for checking shell and job behavior. GitHub-native services such as CodeQL reporting and dependency review are authoritative in GitHub Actions.

For release protection, configure branch rules to require the `Quality gate`, `Security gate`, CodeQL, Gitleaks, and dependency-review checks as appropriate for the repository.

## Security and safe-use policy

- Use public or synthetic data only.
- Never commit secrets, credentials, tokens, or authentication state.
- Keep CI permissions least-privileged.
- Do not perform destructive, high-volume, bypass, or unauthorized testing.
- Treat AI output as untrusted until reviewed and validated.
- Keep external test targets explicitly authorized.
- Rotate any credential that is accidentally exposed.

See `.github/SECURITY.md` for vulnerability reporting and scope requirements.

## Project structure

```text
agentic/       LangChain agent, model, MCP client, and extension points
api/           API clients
chatbot/       CLI and chat orchestration
config/        Environment parsing
fixtures/      Playwright browser/API fixtures
pages/         Page objects
specs/         Test plans
tests/         Playwright UI, API, and network tests
unit/          Vitest unit tests
utils/         Shared validation utilities
.github/       Custom agents, CI, security, and dependency automation
```

## Known limitations

- The implemented tests target VA.gov plus the IRS navigation smoke test; broader government-application scenarios in `TEST_PLAN.md` are not all automated.
- Dedicated accessibility suites, performance baselines, and advanced business-rule API testing are not currently implemented.
- Public-site tests depend on external network availability and site behavior.
- The local agent tool modules and memory layer are extension points, not complete standalone implementations.
- The assistant is optional and must not replace deterministic test execution or human approval.

## Contributing

1. Create a focused branch.
2. Update or add a test before changing behavior where practical.
3. Reuse existing fixtures and page objects.
4. Run formatting, lint, type-check, unit tests, and the relevant Playwright project.
5. Review traces and reports for failures rather than relying on retries.
6. Keep secrets and generated artifacts out of commits.
7. Submit a focused pull request describing behavior, evidence, and any residual risk.

## License

MIT License.
