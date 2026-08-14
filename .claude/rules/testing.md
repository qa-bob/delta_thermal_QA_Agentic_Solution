---
paths:
  - "tests/**/*.spec.ts"
  - "tests/**/*.test.ts"
---

# Test File Rules

These rules apply when writing or editing spec files under `tests/`.

## Required

- Import `{ test, expect }` from `@fixtures/site.fixture` — never from `@playwright/test` directly
- Tag every `test()` with at least one of: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`
- Use page object methods for all UI interaction — no raw `page.locator()` calls in spec bodies
- Navigate via `siteConfig.url` or Playwright's `baseURL` — never hardcode the site URL

## Forbidden

- `page.waitForTimeout()` — use `waitForSelector`, `waitForLoadState`, or Playwright auto-waiting
- `expect()` in `beforeEach` or helper functions that are shared with page objects
- Any form submission that would send real data to the server
- Creating user accounts or entering real credentials

## Test Structure Pattern

```typescript
import { test, expect } from '@fixtures/site.fixture';

test.describe('Feature Name @tag', () => {
  test.beforeEach(async ({ pageObject }) => {
    await pageObject.navigate();
  });

  test('describes what is verified @tag', async ({ pageObject }) => {
    const result = await pageObject.someAction();
    expect(result).toBeTruthy();
  });
});
```

## Handling Conditional Features

Use `test.skip()` when a feature is not present on this site:

```typescript
test.beforeEach(async ({ siteConfig }) => {
  if (!siteConfig.hasContactForm) {
    test.skip(true, 'Contact form not present on this site');
  }
});
```
