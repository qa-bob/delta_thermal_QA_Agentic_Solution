---
paths:
  - "src/**/*.ts"
  - "*.ts"
---

# TypeScript Rules for Source Files

These rules apply when writing or editing TypeScript source files under `src/` or at the project root.

## Type Safety

- Strict mode is enabled — no implicit `any`; all types must be declared
- All public methods must have explicit return type annotations
- All `readonly Locator` properties must be typed explicitly
- Use `unknown` over `any` when the type is genuinely unknown; add a comment explaining why

## Page Object Conventions

```typescript
// Class declaration
export class MyPage extends BasePage {
  // Locators: readonly, typed, initialized in declaration
  readonly heroSection: Locator = this.page.locator('[data-testid="hero"]');
  readonly ctaButton: Locator = this.page.getByRole('link', { name: /get started/i });

  // Action methods: async, explicit return type, no assertions
  async clickCTA(): Promise<void> {
    await this.ctaButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Query methods: return data, not void; no assertions
  async getHeadingText(): Promise<string> {
    return (await this.page.locator('h1').first().textContent())?.trim() ?? '';
  }
}
```

## Prohibited Patterns

- `expect()` inside any file under `src/pages/` — assertions belong in spec files only
- `page.waitForTimeout()` — use Playwright auto-waiting or explicit state waits
- Catching errors silently without logging: `catch {}` → `catch (err) { console.warn(...) }`
- `as any` casts without a comment explaining the reason

## Import Paths

Use the configured TypeScript path aliases — never use relative `../../../` traversals:

```typescript
import { BasePage } from '@pages/base.page';
import { SiteConfig } from '@types/site-config.types';
import { dismissCookieBanner } from '@utils/visual-helper';
```
