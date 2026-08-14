# Claude Code — GitHub Context Instructions

These instructions apply when Claude Code is operating in a GitHub Actions context (PR review, issue triage, automated analysis).

## Repository Purpose

This repo tests the Delta Thermal website (`http://www.deltathermalinc.com`) using Playwright + TypeScript with the Page Object Model (POM) design pattern.

## When Reviewing Pull Requests

Check PRs against these requirements:

1. **TypeScript** — no use of `any` without a comment explaining why; all functions have explicit return types
2. **Test tags** — every `test()` call must include at least one of: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`
3. **No hardcoded URLs** — must use `siteConfig.url`, `baseURL`, or relative paths
4. **No form submission** — tests that click submit and wait for navigation are invalid
5. **POM compliance** — `expect()` must not appear inside `src/pages/*.ts` files
6. **No waitForTimeout** — `page.waitForTimeout()` is banned; use proper Playwright waits

## When Triaging Issues

- **[BUG] issues**: check whether the selector changed on the live site (run `/analyze-site` to verify)
- **[TEST] issues**: check `site.config.json` to understand the current coverage; refer to `CLAUDE.md` for architecture rules

## File Locations

- All test spec files: `tests/**/*.spec.ts`
- All page objects: `src/pages/*.ts` (must extend `BasePage`)
- All fixtures: `src/fixtures/site.fixture.ts`
- Site configuration: `site.config.json`
- CI configuration: `.github/workflows/ci.yml`

## Do Not

- Suggest submitting forms in tests
- Suggest hardcoding the site URL
- Suggest using `page.waitForTimeout()` as a fix for flaky tests
- Add assertions inside page object methods
