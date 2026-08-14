## Summary

<!-- What does this PR add or fix? One or two sentences. -->

## Test Category

<!-- Check all that apply -->
- [ ] `@smoke` — Site availability / load
- [ ] `@navigation` — Nav links, mobile menu, routing
- [ ] `@forms` — Contact form structure and validation
- [ ] `@functional` — Business features and page content
- [ ] `@visual` — Screenshot regression
- [ ] `@responsive` — Viewport layouts
- [ ] `@custom` — Site-specific tests
- [ ] Infrastructure / config (no test changes)

## What was changed

<!-- List the files changed and the purpose of each change -->
- 
- 

## How to verify locally

```bash
# Run the relevant test category:
npm run test:smoke
npm run test:navigation
npm run test:forms
npx playwright test --grep @functional
npm run test:visual
npm run test:responsive
```

## Visual changes

<!-- If visual baselines were updated, include screenshots showing the before/after diff.
     If no visual changes, delete this section. -->

## Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] All new tests are tagged with at least one `@tag`
- [ ] No hardcoded URLs (used `siteConfig.url` or `baseURL`)
- [ ] No form submissions
- [ ] No `page.waitForTimeout()` calls
- [ ] No `expect()` inside page object methods
- [ ] Visual baselines updated and committed if needed (`__snapshots__/`)
