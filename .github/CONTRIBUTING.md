# Contributing to Delta Thermal QA Framework

Thank you for contributing to this QA automation project. This guide covers everything you need to get started and keep contributions consistent.

---

## Development Setup

```bash
# Clone and install
git clone <repo-url>
cd delta_thermal_QA_Agentic_Solution
npm install

# Install Playwright browsers
npx playwright install chromium

# Verify everything works
npm run typecheck
npm run lint
npm run test:smoke
```

---

## Architecture Overview

This project follows the **Page Object Model (POM)** design pattern:

- **Page objects** (`src/pages/`) encapsulate all UI interaction
- **Test specs** (`tests/`) contain only assertions and test orchestration
- **Fixtures** (`src/fixtures/`) wire page objects into Playwright's test context
- **Utilities** (`src/utils/`) contain shared helpers used by both

**The golden rule:** page object methods perform actions; test files make assertions. Never mix the two.

---

## Page Object Model Rules

When adding or modifying page objects:

```typescript
// CORRECT: locator as a property, action as a method
export class ProductsPage extends BasePage {
  readonly heroHeading: Locator = this.page.locator('h1').first();

  async clickGetQuote(): Promise<void> {
    await this.page.getByRole('link', { name: /get a quote/i }).click();
  }
}

// WRONG: assertions in page objects
async isHeroVisible(): Promise<void> {
  await expect(this.heroHeading).toBeVisible(); // ❌ — no expect() here
}
```

---

## Writing Tests

### Import from the custom fixture

```typescript
// ✅ Always import from the fixture, not from @playwright/test
import { test, expect } from '@fixtures/site.fixture';

// ❌ Never import directly from Playwright
import { test, expect } from '@playwright/test';
```

### Tag every test

```typescript
test('homepage hero is visible @smoke @functional', async ({ homePage }) => {
  // ...
});
```

Available tags: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`, `@custom`

### Never hardcode URLs

```typescript
// ✅ Correct
await page.goto(siteConfig.url + '/contact');

// ❌ Wrong
await page.goto('http://www.deltathermalinc.com/contact');
```

### Never submit forms

```typescript
// ✅ Correct — inspect the form
const hasEmail = await contactPage.hasEmailField();
expect(hasEmail).toBeTruthy();

// ❌ Wrong — submitting the form
await page.getByRole('button', { name: /submit/i }).click();
await page.waitForNavigation(); // This would send a real message
```

### Use Playwright auto-waiting

```typescript
// ✅ Correct
await page.waitForSelector('[data-testid="hero"]');
await page.getByRole('heading', { level: 1 }).waitFor();

// ❌ Wrong
await page.waitForTimeout(2000);
```

---

## TypeScript Requirements

- Strict mode is enabled (`tsconfig.json`) — no implicit `any`
- All method parameters and return types must be explicit
- All page object properties must be typed
- Run `npm run typecheck` before every commit

```typescript
// ✅ Correct
async getNavLinks(): Promise<NavLinkInfo[]> { ... }

// ❌ Wrong
async getNavLinks() { ... }
```

---

## Branching Strategy

```
main                       ← Stable, CI must be green
feat/<description>         ← New test coverage
fix/<description>          ← Fix broken or flaky tests
chore/<description>        ← Dependencies, config, tooling
refactor/<description>     ← Page object refactoring (no new tests)
```

Protect `main` — all changes must go through a pull request.

---

## Pull Request Checklist

Before opening a PR, verify:

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] New tests are tagged with at least one tag
- [ ] No hardcoded URLs
- [ ] No form submissions
- [ ] No `page.waitForTimeout()` calls
- [ ] New page object methods do not contain `expect()` calls
- [ ] Visual baseline screenshots updated if visual tests changed (`npm run baseline`, commit `__snapshots__/`)

---

## Updating Visual Baselines

When a design change causes visual tests to fail intentionally:

1. Verify the design change is correct by viewing the site
2. Run `npm run baseline` to capture new screenshots
3. Review each image in `__snapshots__/` visually — confirm the diff is expected
4. Commit the updated snapshots with a message like: `chore: update visual baselines after header redesign`
5. Include a before/after screenshot comparison in the PR description

---

## Claude Code Integration

This repo is configured for [Claude Code](https://code.claude.com) agentic workflows. If you are using Claude Code:

- Read [AGENTS.md](../AGENTS.md) for available subagents
- Read [Skills.md](../Skills.md) for available slash commands
- Claude will automatically route tasks to the right subagent
- Use `/analyze-site` before writing new selectors to get current HTML structure

---

## Getting Help

- Check [CLAUDE.md](../CLAUDE.md) for project conventions
- Check [README.md](../README.md) for setup and architecture
- Open an issue using the `.github/ISSUE_TEMPLATE/` templates
