---
name: Test Failure / Bug Report
about: Report a failing test or incorrect test behavior
title: '[BUG] '
labels: bug, qa
assignees: ''
---

## Test that is failing

**Test file:** `tests/<category>/<filename>.spec.ts`
**Test name:** 
**Tag:** `@smoke` / `@navigation` / `@forms` / `@functional` / `@visual` / `@responsive`

## Error message

```
Paste the full error output from Playwright here
```

## Steps to reproduce

```bash
# Command used to run the test
npm run test:smoke
# or
npx playwright test --grep "test name here"
```

## Expected behavior

<!-- What should the test do? -->

## Actual behavior

<!-- What does it do instead? -->

## Environment

- OS: 
- Node.js version: (`node --version`)
- Playwright version: (`npx playwright --version`)
- Browser: Chromium / Firefox / WebKit
- Site URL tested: 

## Possible cause

<!-- Optional: your hypothesis on what is broken (selector changed, site updated, etc.) -->

## Screenshots / Traces

<!-- Attach any screenshots or Playwright trace files from `test-results/` -->
