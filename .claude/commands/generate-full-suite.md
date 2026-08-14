# /generate-full-suite

Analyze the live website and generate a complete Playwright test suite — page objects and spec files — based on what is discovered on the site.

## Usage

```
/generate-full-suite [url]
```

If `url` is omitted, use the URL from `site.config.json`.

## What this command does

### Phase 1 — Site Analysis

1. Read `site.config.json` to get the current URL and company name.
2. Navigate to the site homepage using `WebFetch`. Wait for `networkidle`.
3. Dismiss any cookie/consent banners before inspecting structure.
4. Extract and record:
   - Page `<title>` and `<meta name="description">`
   - All `nav a[href]` links (text + href)
   - All `<h1>`, `<h2>` headings
   - All primary CTA buttons
   - All `<form>` elements (especially those with email fields)
   - All `<img>` elements (check `alt` attributes)
   - Key landmark sections: hero, about, products/services, features, testimonials, footer
5. Follow nav links to check: `/contact`, `/about`, `/products`, `/services`, `/technology`.
6. Update `site.config.json` with `expectedNavItems`, `hasContactForm`, `description`, `industry`.

### Phase 2 — Page Object Generation

For each discovered page or section, create or update the corresponding page object in `src/pages/`:

- If the class already exists, add new locator properties and methods
- If it does not exist, create a new file extending `BasePage`
- Follow naming convention: `<page-name>.page.ts`
- All locators are `readonly Locator` properties
- Methods represent actions (not assertions)
- No `expect()` calls inside page objects

Minimum page objects to create/update:
- `src/pages/home.page.ts` — hero, main heading, primary CTAs
- `src/pages/navigation.page.ts` — nav links, mobile toggle
- `src/pages/contact.page.ts` — form discovery, fields, submit button
- `src/pages/functional.page.ts` — feature sections, about content, product grids

### Phase 3 — Test File Generation

Generate spec files for every test category. Each spec file must:

1. Import `{ test, expect }` from `@fixtures/site.fixture`
2. Tag every `test()` with at least one tag
3. Use page objects via fixtures — no raw `page.locator()` calls in test bodies
4. Not hardcode URLs — use `siteConfig.url` or Playwright's `baseURL`
5. Never submit forms
6. Use descriptive test names that explain what is being verified and why it matters

Files to generate (if not already complete):

| File | Tags | Coverage |
|------|------|---------|
| `tests/smoke/site-availability.spec.ts` | `@smoke` | HTTP status, load time, JS errors, HTTPS, title |
| `tests/navigation/nav-links.spec.ts` | `@navigation` | Nav visibility, link reachability, mobile menu, logo |
| `tests/forms/contact-form.spec.ts` | `@forms` | Form presence, fields, submit button, HTML5 validation |
| `tests/functional/homepage.spec.ts` | `@functional` | Hero, CTAs, headings, anchor links |
| `tests/functional/content.spec.ts` | `@functional` | Feature sections, product/service content, about section |
| `tests/visual/visual-regression.spec.ts` | `@visual` | Full-page screenshots at desktop/tablet/mobile |
| `tests/responsive/layout.spec.ts` | `@responsive` | Horizontal scroll, font sizes, alt text, viewport meta |

### Phase 4 — Validation

1. Run `npx tsc --noEmit` to verify TypeScript compiles cleanly.
2. Report any compilation errors with file and line numbers.
3. Fix all type errors before finishing.

## Output format

Report your work in this order:

1. **Site Analysis Summary** — what pages, forms, and nav items were found
2. **Config Changes** — what was updated in `site.config.json`
3. **Files Created/Updated** — list of page objects and spec files
4. **TypeScript Status** — pass or list of errors with fixes applied
5. **Next Steps** — any manual steps needed (e.g., run `npm run baseline` for visual tests)

## Constraints

- Do not submit any forms
- Do not create accounts or enter real credentials
- Do not hardcode URLs — always derive from `siteConfig.url`
- Do not use `page.waitForTimeout()` — use Playwright auto-waiting
- Do not add `expect()` calls inside page object methods
