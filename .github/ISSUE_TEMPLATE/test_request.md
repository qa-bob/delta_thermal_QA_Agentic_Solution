---
name: New Test Coverage Request
about: Request test coverage for a page, feature, or user flow not currently tested
title: '[TEST] '
labels: enhancement, qa
assignees: ''
---

## What needs to be tested

<!-- Describe the page, feature, or user flow that needs test coverage -->

## Site URL / Page

**URL:** 

## Test category

- [ ] `@smoke` — Availability
- [ ] `@navigation` — Links and routing
- [ ] `@forms` — Form interaction
- [ ] `@functional` — Feature or content behavior
- [ ] `@visual` — Screenshot regression
- [ ] `@responsive` — Layout at different viewports
- [ ] `@custom` — Site-specific scenario

## What should be verified

<!-- List the specific assertions this test should make. Be concrete. -->
- 
- 
- 

## Constraints / Notes

<!-- Any edge cases, things to avoid, or context that will help whoever writes the test -->

## Acceptance criteria

<!-- How will we know the test is complete and correct? -->
- [ ] Test file created in the correct `tests/<category>/` folder
- [ ] Page object updated/created in `src/pages/` with the relevant selectors
- [ ] All tests tagged with at least one `@tag`
- [ ] `npm run typecheck` passes
- [ ] Test passes locally against the live site
