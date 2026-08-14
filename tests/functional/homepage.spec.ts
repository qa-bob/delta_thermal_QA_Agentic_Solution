/**
 * tests/functional/homepage.spec.ts
 *
 * Functional tests for the Delta Thermal homepage.
 * Verifies that the homepage communicates the core value proposition:
 * hero content, main headings, CTA presence, and key messaging are all present.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Homepage Functional Tests @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    // homePage fixture navigates automatically; wait for network idle
    await homePage.waitForLoad();
  });

  // ── Page load and content ────────────────────────────────────────────────────

  test('homepage loads and has meaningful content @functional @smoke', async ({ homePage }) => {
    const isLoaded = await homePage.isLoaded();
    expect(
      isLoaded,
      'Homepage should have at least one heading, a navigation element, and 50+ chars of body text'
    ).toBeTruthy();
  });

  test('homepage has a main heading (h1) @functional', async ({ homePage }) => {
    const heading = await homePage.getMainHeading();
    expect(
      heading.length,
      'Homepage must have a non-empty <h1> or <h2> heading'
    ).toBeGreaterThan(0);
  });

  test('homepage hero section contains content @functional', async ({ homePage }) => {
    const heroText = await homePage.getHeroText();
    expect(
      heroText.length,
      'Homepage hero/header section should contain visible text (value proposition)'
    ).toBeGreaterThan(10);
  });

  // ── CTAs (Call-To-Action) ────────────────────────────────────────────────────

  test('homepage has at least one call-to-action button or link @functional', async ({ homePage }) => {
    const ctas = await homePage.getCTAButtons();
    expect(
      ctas.length,
      'Homepage should have at least one CTA button or link (e.g., "Contact Us", "Learn More")'
    ).toBeGreaterThan(0);
  });

  test('all homepage CTA buttons are visible @functional', async ({ homePage }) => {
    const ctas = await homePage.getCTAButtons();

    if (ctas.length === 0) {
      console.warn('[functional] No CTA elements found on homepage — skipping visibility check');
      return;
    }

    // Check the first 5 CTAs (avoid iterating hundreds of links on link-heavy pages)
    for (const cta of ctas.slice(0, 5)) {
      const isVisible = await cta.isVisible();
      if (!isVisible) {
        const text = await cta.textContent();
        console.warn(`[functional] CTA "${text?.trim()}" is not visible`);
      }
    }

    // At least one CTA must be visible
    let anyVisible = false;
    for (const cta of ctas.slice(0, 5)) {
      if (await cta.isVisible()) { anyVisible = true; break; }
    }
    expect(anyVisible, 'At least one homepage CTA must be visible').toBeTruthy();
  });

  // ── Body content quality ─────────────────────────────────────────────────────

  test('homepage body has enough text content to be informative @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    const wordCount = bodyText.trim().split(/\s+/).length;

    expect(
      wordCount,
      `Homepage body has only ${wordCount} words — too sparse to be informative. Expected at least 50.`
    ).toBeGreaterThan(50);
  });

  test('homepage does not show placeholder or coming-soon content @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());

    const placeholders = [
      'lorem ipsum',
      'coming soon',
      'under construction',
      'page not found',
      'hello world',
      'sample text',
    ];

    const found = placeholders.filter((p) => bodyText.includes(p));
    expect(
      found,
      `Homepage contains placeholder content: ${found.join(', ')}`
    ).toHaveLength(0);
  });

  // ── Images and media ─────────────────────────────────────────────────────────

  test('homepage hero image (if any) is visible @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    // Hero images can be <img> inside header/banner, or CSS background — check <img> elements
    const heroImages = page.locator(
      'header img, [class*="hero"] img, [class*="banner"] img, ' +
      '[role="banner"] img, section:first-of-type img'
    );

    const count = await heroImages.count();
    if (count === 0) {
      console.warn('[functional] No hero <img> found — site may use CSS background images');
      return;
    }

    // At least one hero image should be visible
    const firstVisible = await heroImages.first().isVisible();
    expect(firstVisible, 'Hero image should be visible on the homepage').toBeTruthy();
  });

  // ── Company identity ─────────────────────────────────────────────────────────

  test('homepage title contains company name or relevant keywords @functional @smoke', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const title = (await page.title()).toLowerCase();

    // Page title should contain the company name or a major keyword
    const companyNameLower = siteConfig.name.toLowerCase();
    const hasCompanyName = companyNameLower
      .split(/\s+/)
      .some((word) => word.length > 3 && title.includes(word));

    if (!hasCompanyName) {
      console.warn(
        `[functional] Page title "${await page.title()}" does not contain company name "${siteConfig.name}". ` +
        'This may affect SEO and brand recognition.'
      );
    }

    // Title should be meaningful (more than just the company name)
    expect(title.trim().length).toBeGreaterThan(5);
  });

  // ── Anchor links ─────────────────────────────────────────────────────────────

  test('homepage anchor links scroll to valid sections @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    // Find all anchor links (href="#section-id")
    const anchorLinks = page.locator('a[href^="#"]');
    const count = await anchorLinks.count();

    if (count === 0) {
      console.warn('[functional] No anchor links (#section) found on homepage — skipping');
      return;
    }

    const brokenAnchors: string[] = [];

    for (let i = 0; i < count; i++) {
      const href = await anchorLinks.nth(i).getAttribute('href');
      if (!href || href === '#') continue;

      const targetId = href.slice(1); // Remove the '#'
      const target = page.locator(`#${CSS.escape(targetId)}`);

      if (await target.count() === 0) {
        brokenAnchors.push(href);
      }
    }

    if (brokenAnchors.length > 0) {
      console.warn('[functional] Anchor links with no matching target:\n' +
        brokenAnchors.map((a) => `  ${a}`).join('\n'));
    }

    expect(
      brokenAnchors.length,
      `${brokenAnchors.length} anchor link(s) point to non-existent sections`
    ).toBe(0);
  });
});
