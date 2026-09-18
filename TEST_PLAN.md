# Quality Engineering Test Plan

## 1. Document control

| Attribute          | Value                                                       |
| ------------------ | ----------------------------------------------------------- |
| Project            | Playwright Agentic QA Framework                             |
| Primary target     | VA.gov public, read-only behavior                           |
| Secondary target   | IRS.gov navigation smoke test                               |
| Framework          | Playwright Test and Vitest                                  |
| Language           | TypeScript                                                  |
| Browser matrix     | Chromium, Firefox, WebKit                                   |
| Execution          | Local, Docker, GitHub Actions, and optional `act` emulation |
| Test data          | Public or synthetic only                                    |
| Authentication     | Non-destructive navigation only                             |
| Decision authority | Deterministic test and security gates                       |
| AI role            | Planning, generation, diagnosis, and recommendations only   |

This document describes the current executable coverage and separates planned coverage from implemented coverage.

## 2. Objectives

The framework is intended to provide repeatable, observable, and reviewable quality signals for public government websites:

- Validate critical read-only browser behavior.
- Validate safe public HTTP contracts.
- Exercise deterministic network failure and response scenarios.
- Detect configuration, lint, type, unit, dependency, and container issues early.
- Provide cross-browser evidence for supported workflows.
- Preserve artifacts required for diagnosis.
- Use AI only as an assistive layer with human approval and deterministic verification.

## 3. Scope

### 3.1 Implemented scope

#### VA.gov browser coverage

- Navigate to the configured `BASE_URL`.
- Verify page title.
- Verify a primary navigation landmark.
- Verify a visible heading.
- Verify the main content landmark.
- Verify a navigable primary-navigation link.

Automation: `tests/ui/homepage.spec.ts` and `pages/home.page.ts`.

#### IRS.gov navigation coverage

- Navigate to the configured `IRS_BASE_URL`.
- Verify successful navigation.
- Verify the URL origin.
- Verify an IRS/Internal Revenue Service page title.

Automation: `tests/ui/irs-navigation.spec.ts` and the `irsPage` fixture in `fixtures/test.ts`.

#### Public HTTP contract coverage

- Read the configured homepage.
- Read `robots.txt`.
- Read `sitemap.xml`.
- Verify expected status and content types.
- Verify an unknown path returns a client error.

Automation: `tests/api/public-site.spec.ts` and `api/clients/public-site.client.ts`.

#### Network behavior coverage

- Fulfill a deterministic API response.
- Abort a selected request.
- Continue a navigation request with a diagnostic header.
- Fulfill a deterministic 503 response.
- Inspect response status and content type.

Automation: `tests/network/routing.spec.ts`.

#### Unit coverage

- Runtime URL, boolean, integer, environment, retry, and sharding parsing.
- Search input validation, empty values, whitespace, and maximum length.

Automation: `unit/environment.spec.ts` and `unit/search-input.spec.ts`.

### 3.2 Planned scope

The following capabilities are documented as future extensions and are not currently release coverage:

- Dedicated accessibility assertions.
- Performance baselines and percentile thresholds.
- Expanded business-rule API validation.
- IRS form, payment, refund, account, localization, and contact workflows.
- Automated requirement-to-test traceability.
- AI failure classification and self-healing patches.
- Historical flake-rate and coverage analytics.

Planned scenarios must not be reported as passing until executable tests exist and are included in CI.

### 3.3 Out of scope

- Real credentials, taxpayer data, SSNs, ITINs, passwords, payment data, or tax records.
- Authentication bypass, brute force, privilege escalation, or unauthorized access.
- Destructive transactions or record modification.
- Denial-of-service or high-volume load testing against public production sites.
- Automated merging of AI-generated code without human review.

## 4. Quality model

```text
Requirement
    ↓
Test design
    ↓
Deterministic Playwright/Vitest test
    ↓
Execution evidence
    ↓
Quality and security gates
    ↓
Human release decision
```

The framework follows these engineering principles:

- Tests validate user-observable behavior rather than implementation details.
- Fixtures establish state consistently and clean up owned resources.
- Tests are independent and safe to retry.
- User-facing locators and web-first assertions are preferred.
- External-site tests remain read-only and rate-conscious.
- A retry is evidence for investigation, not proof of health.
- AI recommendations are untrusted until validated.

## 5. Risk model

Risk is assessed using:

```text
Risk = business impact × user impact × failure probability
```

| Priority | Definition                             | Current examples                                                    |
| -------- | -------------------------------------- | ------------------------------------------------------------------- |
| P0       | Release-blocking or critical user path | Configured homepage, core HTTP availability, quality/security gates |
| P1       | Important user or platform behavior    | Cross-browser coverage, IRS navigation, public metadata contracts   |
| P2       | Useful supporting behavior             | Mocked dependency behavior, secondary validation paths              |
| P3       | Informational or exploratory coverage  | Future optimization and analytics scenarios                         |

## 6. Test data and environment controls

### Approved data

- Public URLs.
- Public page content.
- Synthetic search values.
- Synthetic API responses.
- Public or synthetic ZIP codes where future scenarios require them.

### Prohibited data

- Real personally identifiable information.
- Real authentication state.
- Real taxpayer, payment, or tax-account data.
- Secrets in source files, test artifacts, screenshots, traces, or logs.

### Runtime environments

| Environment | Purpose                                | Required controls                                     |
| ----------- | -------------------------------------- | ----------------------------------------------------- |
| Local       | Development and focused tests          | `.env`, safe public targets, no secrets in commits    |
| CI          | Pull-request and branch validation     | `CI=true`, headless execution, locked dependencies    |
| Docker      | Reproducible Chromium smoke validation | `.dockerignore`, non-root runtime user                |
| `act`       | Local workflow approximation           | Treat GitHub-native integrations as non-authoritative |

Primary configuration is parsed by `config/environment.ts`. Defaults are VA.gov and IRS.gov; override with `BASE_URL`, `API_BASE_URL`, and `IRS_BASE_URL` when authorized.

## 7. Test cases and mapping

| ID         | Scenario                                | Type                      | Priority | Automation                        |
| ---------- | --------------------------------------- | ------------------------- | -------- | --------------------------------- |
| VA-UI-001  | Configured VA.gov homepage loads        | UI/smoke                  | P0       | `tests/ui/homepage.spec.ts`       |
| VA-UI-002  | VA.gov primary navigation is visible    | UI/accessibility baseline | P0       | `tests/ui/homepage.spec.ts`       |
| VA-UI-003  | VA.gov heading and main landmarks exist | UI/accessibility baseline | P0       | `tests/ui/homepage.spec.ts`       |
| IRS-UI-001 | Configured IRS.gov homepage navigation  | UI/smoke                  | P1       | `tests/ui/irs-navigation.spec.ts` |
| API-001    | Homepage HTTP contract                  | API                       | P0       | `tests/api/public-site.spec.ts`   |
| API-002    | Robots policy is exposed                | API                       | P1       | `tests/api/public-site.spec.ts`   |
| API-003    | Sitemap document is exposed             | API                       | P1       | `tests/api/public-site.spec.ts`   |
| API-004    | Unknown path returns client error       | API/negative              | P1       | `tests/api/public-site.spec.ts`   |
| NET-001    | Mocked successful dependency            | Network                   | P1       | `tests/network/routing.spec.ts`   |
| NET-002    | Aborted dependency is surfaced          | Network/negative          | P1       | `tests/network/routing.spec.ts`   |
| NET-003    | Navigation diagnostic header is added   | Network                   | P2       | `tests/network/routing.spec.ts`   |
| NET-004    | Mocked backend error is handled         | Network/negative          | P1       | `tests/network/routing.spec.ts`   |
| UNIT-001   | Runtime configuration is validated      | Unit                      | P0       | `unit/environment.spec.ts`        |
| UNIT-002   | Search input rules are validated        | Unit                      | P1       | `unit/search-input.spec.ts`       |

## 8. Execution strategy

### Pull request

Run:

- Formatting check
- ESLint
- TypeScript type-check
- Vitest unit tests
- High-severity npm audit
- Required browser matrix jobs
- Docker Chromium smoke test
- Required repository security checks configured in branch protection

### Main branch

Run the full quality and security workflows, retain diagnostic artifacts, and require the aggregate `Quality gate` and `Security gate` checks.

### Local focused execution

```bash
npx playwright test tests/ui/irs-navigation.spec.ts
npx playwright test tests/ui/homepage.spec.ts
npx playwright test tests/api/public-site.spec.ts
npx playwright test tests/network/routing.spec.ts
npm run test:unit
```

## 9. CI/CD quality gates

### Quality gate

`.github/workflows/playwright.yml` requires all of the following:

- Static quality and unit tests pass.
- Chromium, Firefox, and WebKit browser shards pass.
- Docker Chromium smoke test passes.

### Security gate

`.github/workflows/security.yml` requires the container scan to pass for configured HIGH and CRITICAL findings.

Additional security workflows provide independent controls:

- CodeQL analysis.
- Gitleaks secret scanning.
- Pull-request dependency review.
- Dependabot update automation.

The aggregate gates are intentionally strict. A gate failure is a summary; investigate the first upstream job failure rather than weakening the gate.

## 10. Evidence and observability

A failed test should provide as much of the following as applicable:

- Test and case ID.
- Browser and environment.
- Error and stack trace.
- Screenshot.
- Playwright trace.
- Video on configured retries.
- Console and network evidence.
- JUnit result.
- Commit and workflow run.

Reports are generated by Playwright and Vitest. CI uploads browser and unit diagnostics when supported by the runner.

## 11. AI-assisted workflow

AI agents may support three controlled stages:

### Planning

`playwright-test-planner` explores an authorized target and writes a reviewable scenario plan under `specs/`.

### Generation

`playwright-test-generator` implements one approved scenario, verifies interactions, uses project fixtures, and writes one focused test.

### Healing

`playwright-test-healer` reproduces the first failure, inspects evidence, proposes the smallest fix, and reruns regression coverage.

AI-generated changes require:

1. Source and existing-pattern inspection.
2. Human review of the proposed diff.
3. Deterministic test execution.
4. Security and quality gate validation.
5. Explicit approval before merge.

## 12. Failure classification

Classify failures as one of:

```text
LOCATOR_FAILURE
ASSERTION_FAILURE
TIMEOUT
NETWORK_FAILURE
APPLICATION_ERROR
ENVIRONMENT_FAILURE
DATA_FAILURE
AUTHENTICATION_FAILURE
SECURITY_FAILURE
PERFORMANCE_REGRESSION
FLAKY_TEST
UNKNOWN
```

The first failing action is the primary diagnostic signal. Aggregate gate failures are not root causes.

## 13. Defect and flake management

Every defect should include:

- Summary and severity.
- Environment, browser, commit, and workflow.
- Test case ID.
- Reproduction steps.
- Expected and actual results.
- Screenshot, trace, video, and logs where available.
- Root-cause classification.
- Remediation and regression evidence.

Tests that pass only after retries should be tracked as flaky until the cause is understood.

Recommended metrics:

```text
Failure rate
Retry rate
Flake rate
Mean time to resolution
Time to diagnose
```

## 14. Entry and exit criteria

### Entry criteria

- Target is reachable and explicitly authorized.
- Dependencies and required browsers are installed.
- Configuration has been validated.
- Test data is public or synthetic.
- CI runner and Docker prerequisites are available.

### Exit criteria

- All required P0 tests pass.
- Quality and security gates pass.
- No unresolved critical security findings exist.
- Required P1 coverage meets acceptance criteria.
- Evidence is retained and failures are documented.
- Known limitations and residual risks are recorded.

## 15. Maintenance

- Prefer `getByRole`, `getByLabel`, and other user-facing locators.
- Avoid brittle CSS/XPath selectors unless necessary.
- Avoid arbitrary sleeps and discouraged synchronization APIs.
- Keep tests independent and read-only.
- Reuse fixtures, page objects, API clients, and validation utilities.
- Keep test plans, README documentation, and executable coverage aligned.
- Review dependency, action, and container updates through automated checks.

## 16. Acceptance criteria

The framework is considered healthy when:

- Deterministic tests run locally and in CI.
- Browser and container evidence is retained for failures.
- Quality and security gates make explicit pass/fail decisions.
- Public targets are exercised safely and non-destructively.
- AI assistance remains optional, auditable, and subordinate to deterministic validation.
