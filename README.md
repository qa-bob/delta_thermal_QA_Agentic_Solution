# Delta Thermal — QA Automation Framework

> Playwright + TypeScript regression test suite for [Delta Thermal](http://www.deltathermalinc.com) — remote infrared monitoring for electrical substations.

---

## What This Repo Tests

This repository contains an automated QA framework that validates the Delta Thermal website across:

- **Availability** — site loads, responds within acceptable time, no critical JS errors
- **Navigation** — all nav links resolve, mobile menu toggles correctly, logo links home
- **Forms** — contact form structure, fields, and validation (no actual submission)
- **Functional** — page content, CTAs, feature sections, and business-logic flows
- **Visual regression** — screenshot comparisons against committed baselines
- **Responsive layout** — no horizontal scroll, readable text, proper meta viewport

Tests run across **desktop** (1280×720), **tablet** (768×1024), and **mobile** (390×844) viewports.

---

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | 18.0.0 |
| npm | 9.0.0 |
| Git | Any recent version |

---

## Development Environment Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd delta_thermal_QA_Agentic_Solution

# 2. Install npm dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium

# 4. (Optional) Install all browsers for full cross-browser coverage
npx playwright install

# 5. Verify setup — run smoke tests
npm run test:smoke
```

**Environment variables** (all optional):

| Variable | Purpose | Default |
|----------|---------|---------|
| `SITE_URL` | Override the URL from `site.config.json` | Value in `site.config.json` |
| `CI` | Set to `1` in CI; enables retries and stricter settings | unset |

---

## Running Tests

```bash
npm test                    # Run the full test suite
npm run test:smoke          # @smoke — availability and load checks
npm run test:navigation     # @navigation — nav links, mobile menu, routing
npm run test:forms          # @forms — contact form structure and validation
npm run test:visual         # @visual — screenshot regression comparisons
npm run test:responsive     # @responsive — layout at all viewports
npm run test:headed         # Run with browser visible (useful for debugging)

npm run baseline            # Capture new visual baselines (commit result)
npm run report              # Open the HTML test report
npm run typecheck           # TypeScript type check (no emit)
npm run lint                # ESLint across src/ and tests/
```

---

## Project Architecture

This framework applies the **Page Object Model (POM)** design pattern and **Object-Oriented Programming (OOP)** principles to keep test logic separate from UI interaction details.

```
site.config.json              ← Site URL, flags, expected nav items (run /analyze-site to populate)
playwright.config.ts          ← Playwright projects: chromium-desktop / mobile-chrome / tablet
global-setup.ts               ← Pre-suite reachability check (warns, does not block)

src/
  pages/
    base.page.ts              ← BasePage: shared navigation, layout, screenshot helpers
    home.page.ts              ← HomePage: hero text, CTA buttons, main heading
    navigation.page.ts        ← NavigationPage: nav links, mobile menu, link reachability
    contact.page.ts           ← ContactFormPage: form discovery, field inspection, fill
    functional.page.ts        ← FunctionalPage: content sections, feature grids, social proof
  fixtures/
    site.fixture.ts           ← Extended Playwright test fixture — import {test, expect} from here
  utils/
    link-checker.ts           ← HTTP HEAD request link checker utility
    visual-helper.ts          ← Cookie banner dismissal, animation settling helper
  types/
    site-config.types.ts      ← SiteConfig TypeScript interface + loadSiteConfig()

tests/
  smoke/
    site-availability.spec.ts ← @smoke: HTTP status, HTTPS, title, meta description, console errors
  navigation/
    nav-links.spec.ts         ← @navigation: nav visibility, link 404s, mobile toggle, logo link
  forms/
    contact-form.spec.ts      ← @forms: form presence, required fields, submit button, validation
  functional/
    homepage.spec.ts          ← @functional: hero section, CTAs, headings, anchor links
    content.spec.ts           ← @functional: feature sections, about/products/services content
  visual/
    visual-regression.spec.ts ← @visual: full-page screenshots vs baselines (desktop/tablet/mobile)
  responsive/
    layout.spec.ts            ← @responsive: horizontal scroll, font sizes, alt text, viewport meta

.claude/
  agents/
    site-analyzer.md          ← Subagent: crawls the site and populates site.config.json
    test-generator.md         ← Subagent: generates site-specific tests for unique features
  commands/
    analyze-site.md           ← /analyze-site skill instructions
    generate-full-suite.md    ← /generate-full-suite skill instructions
    run-smoke.md              ← /run-smoke skill instructions
    update-baseline.md        ← /update-baseline skill instructions
    generate-report.md        ← /generate-report skill instructions
  rules/
    testing.md                ← Path-scoped rules for tests/**/*.spec.ts files
    typescript.md             ← Path-scoped rules for src/**/*.ts files
  hooks/
    pre-test.sh               ← Pre-test hook: site reachability check

.github/
  workflows/
    ci.yml                    ← GitHub Actions: typecheck → lint → Playwright tests
  ISSUE_TEMPLATE/
    bug_report.md             ← Bug/test-failure report template
    test_request.md           ← New test coverage request template
  CONTRIBUTING.md             ← Contributor guide: setup, branching, PR rules
  PULL_REQUEST_TEMPLATE.md    ← PR description template
```

### OOP Page Object Hierarchy

```
BasePage (base class — src/pages/base.page.ts)
├── HomePage          extends BasePage  (hero, CTAs, headings)
├── NavigationPage    extends BasePage  (nav links, mobile menu, link checker)
├── ContactFormPage   extends BasePage  (form discovery, fields, validation)
└── FunctionalPage    extends BasePage  (content sections, feature elements)
```

**Rules for page objects:**
- Locators are `readonly Locator` class properties — never raw strings in tests
- Methods represent **user actions**, not assertions (e.g., `openMobileMenu()`, `fillForm()`)
- `expect()` calls belong **only in test files** — never inside page object methods
- Extend `BasePage` for every new page class

---

## Test Tags Reference

Every test must include at least one tag in its name. Tags are used by npm scripts to filter test runs.

| Tag | Use When |
|-----|---------|
| `@smoke` | Site loads, HTTP 2xx, no critical JS errors, page has content |
| `@navigation` | Nav links, menu toggles, routing, logo, breadcrumbs |
| `@forms` | Form presence, field types, labels, HTML5 validation |
| `@functional` | Business features: product sections, CTAs, videos, accordions |
| `@visual` | Full-page screenshot regression with `toHaveScreenshot()` |
| `@responsive` | Viewport-specific layout: scroll, fonts, images, meta tags |

---

## Available Agents (Claude Code)

Agents are specialized Claude Code subagents defined in `.claude/agents/`. Claude automatically delegates tasks to the right agent based on the task description. You do not invoke agents directly — describe the task and Claude routes it.

| Agent | File | Delegates when you ask Claude to... |
|-------|------|-------------------------------------|
| `site-analyzer` | `.claude/agents/site-analyzer.md` | Analyze the live site structure, populate `site.config.json`, identify nav items and forms |
| `test-generator` | `.claude/agents/test-generator.md` | Generate tests for specific pages or features not covered by the shared suite |

**Example prompts that trigger agents:**
```
"Analyze the Delta Thermal site and update site.config.json with the real nav items"
"Generate a test file for the Products page including all interactive elements"
```

---

## Available Skills (Slash Commands)

Skills are repeatable task workflows defined in `.claude/commands/`. Run them in a Claude Code session with the `/command` syntax.

| Skill | Command | What it does |
|-------|---------|-------------|
| Analyze Site | `/analyze-site` | Crawls the live site, extracts nav/forms/metadata, outputs updated `site.config.json` |
| Generate Full Suite | `/generate-full-suite` | Full site analysis + generates complete POM classes and all test files |
| Run Smoke Tests | `/run-smoke` | Runs `npm run test:smoke` and reports pass/fail with a summary |
| Update Baselines | `/update-baseline` | Runs `npm run baseline` to capture new visual regression screenshots |
| Generate Report | `/generate-report` | Reads `test-results/results.json` and outputs a formatted test summary |

---

## Contributor Guidelines

### Before You Start

1. Run `npm install` after checking out any branch
2. Run `npm run typecheck` — fix any errors before adding new code
3. Run `npm run test:smoke` to confirm the target site is reachable

### Code Rules (enforced by CI)

- **TypeScript strict mode** — no implicit `any`, all types must be explicit
- **No `page.waitForTimeout()`** — use Playwright's built-in auto-waiting or `waitForSelector`
- **No hardcoded URLs** — always use `baseURL` (from Playwright config) or `siteConfig.url`
- **No form submission** — tests inspect structure and validation only; never click submit to send data
- **No account creation** — never enter real credentials or sign up for services
- **No assertions in page objects** — `expect()` lives only in spec files

### Writing New Tests

1. Read `site.config.json` for the site URL and feature flags
2. Fetch the live page to inspect real selectors before writing locators
3. Add new page sections as methods on the relevant page object in `src/pages/`
4. Write the spec file that uses the page object (no raw `page.locator()` in spec bodies)
5. Tag every `test()` with at least one tag (`@smoke`, `@functional`, etc.)
6. Run `npm run typecheck && npm run lint` before pushing

### Branching

```
main                    ← Stable, always passing tests
feat/<description>      ← New test coverage (e.g., feat/products-page-tests)
fix/<description>       ← Broken test fixes (e.g., fix/mobile-menu-selector)
chore/<description>     ← Maintenance (e.g., chore/update-playwright)
```

### Pull Requests

- Reference the test category being added or changed
- If visual baselines changed: run `npm run baseline`, commit the new snapshots, add a screenshot to the PR description
- CI must pass (typecheck + lint + all tests) before merge

---

## CI/CD

GitHub Actions runs on every push and pull request (`.github/workflows/ci.yml`):

| Step | Command |
|------|---------|
| Install dependencies | `npm ci` |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Install Playwright browsers | `npx playwright install --with-deps chromium` |
| Run tests | `npm test` |
| Upload report | Playwright HTML report uploaded as artifact |

Visual regression tests require committed baselines in `__snapshots__/`. Run `npm run baseline` locally and commit the output before the first CI run.

---

## Site Configuration (`site.config.json`)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Company name (used in test output and reports) |
| `url` | string | Root URL of the site under test |
| `hasContactForm` | boolean | Whether to run `@forms` tests |
| `expectedNavItems` | string[] | Expected nav link labels (validated in navigation tests) |
| `skipVisual` | boolean | Skip `@visual` tests (for sites with heavy animation) |
| `skipForms` | boolean | Skip `@forms` tests |
| `auth.required` | boolean | Whether the site requires login (currently: false) |

Run `/analyze-site` in a Claude Code session to auto-populate this file from the live site.

---

*Built with [Playwright](https://playwright.dev/) · TypeScript · Page Object Model (POM)*
*Managed as a Claude Code agentic project — see [AGENTS.md](./AGENTS.md) and [Skills.md](./Skills.md)*
