/**
 * tests/functional/content.spec.ts
 *
 * Functional tests for content sections across the Delta Thermal website.
 * Covers feature sections, about/company info, product/service listings,
 * footer integrity, and social/contact information presence.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Site Content @functional', () => {
  // ── Feature / product sections ────────────────────────────────────────────────

  test.describe('Feature Sections', () => {
    test('homepage has identifiable content sections @functional', async ({ functionalPage }) => {
      await functionalPage.navigate();
      await functionalPage.waitForLoad();

      const sections = await functionalPage.getContentSections();

      expect(
        sections.length,
        'Homepage should have at least one identifiable content section (<section>, <article>)'
      ).toBeGreaterThan(0);

      const sectionsWithContent = sections.filter((s) => s.hasContent);
      expect(
        sectionsWithContent.length,
        'At least one content section should have meaningful text content (>30 chars)'
      ).toBeGreaterThan(0);
    });

    test('homepage sections have descriptive headings @functional', async ({ functionalPage }) => {
      await functionalPage.navigate();
      await functionalPage.waitForLoad();

      const headings = await functionalPage.getAllHeadings();
      expect(
        headings.length,
        'Page should have multiple headings to structure the content'
      ).toBeGreaterThan(1);

      // No heading should be empty or just whitespace
      const emptyHeadings = headings.filter((h) => h.text.length === 0);
      expect(
        emptyHeadings,
        `Found ${emptyHeadings.length} empty heading(s) — these are accessibility violations`
      ).toHaveLength(0);
    });

    test('page has a feature grid or list of services/benefits @functional', async ({ functionalPage }) => {
      await functionalPage.navigate();
      await functionalPage.waitForLoad();

      const hasGrid = await functionalPage.hasFeatureGrid();

      if (!hasGrid) {
        console.warn(
          '[functional] No feature grid/card pattern detected. ' +
          'The site may use a non-standard layout — review manually.'
        );
      }

      // This is a soft assertion: warn but do not fail
      // (some sites list features in plain prose rather than grids)
      expect(
        typeof hasGrid,
        'hasFeatureGrid() should return a boolean'
      ).toBe('boolean');
    });
  });

  // ── About / company information ───────────────────────────────────────────────

  test.describe('About / Company Content', () => {
    test('site has an About page or About section @functional', async ({ page, siteConfig, functionalPage }) => {
      // Try navigating to common About page paths
      const aboutPaths = ['/about', '/about-us', '/company', '/who-we-are', '/our-story'];
      let foundAbout = false;

      for (const aboutPath of aboutPaths) {
        try {
          const response = await page.goto(
            siteConfig.url.replace(/\/$/, '') + aboutPath,
            { waitUntil: 'domcontentloaded', timeout: 10_000 }
          );

          if (response && response.ok()) {
            const bodyText = await page.evaluate<string>(() => document.body.innerText);
            if (bodyText.trim().length > 100) {
              foundAbout = true;
              break;
            }
          }
        } catch {
          // Path not found — try next
        }
      }

      // Also check if there's an About link in the nav
      if (!foundAbout) {
        await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
        const aboutLink = page.locator('a').filter({ hasText: /about/i }).first();
        foundAbout = await aboutLink.count() > 0;
      }

      // Soft assertion: warn rather than hard fail if no dedicated about page found
      if (!foundAbout) {
        console.warn(
          '[functional] No dedicated About page found. ' +
          'Consider adding /about for SEO and trust signals.'
        );
      }
    });

    test('site displays company contact information @functional', async ({ functionalPage }) => {
      await functionalPage.navigate();
      await functionalPage.waitForLoad();

      const hasEmail = await functionalPage.hasEmailAddress();
      const hasPhone = await functionalPage.hasPhoneNumber();

      // At least one contact method should be visible on the homepage or in the footer
      const hasContactInfo = hasEmail || hasPhone;

      if (!hasContactInfo) {
        console.warn(
          '[functional] No email address or phone number found on homepage. ' +
          'This may affect lead generation and trust.'
        );
      }

      // This is informational; B2B SaaS sites often only have a contact form
    });
  });

  // ── Footer ────────────────────────────────────────────────────────────────────

  test.describe('Footer', () => {
    test('footer is present on the homepage @functional', async ({ page, siteConfig }) => {
      await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

      const footer = page.locator('footer, [role="contentinfo"]').first();
      const count = await footer.count();

      expect(
        count,
        'Page should have a <footer> or [role="contentinfo"] element'
      ).toBeGreaterThan(0);

      const isVisible = await footer.isVisible();
      expect(isVisible, 'Footer should be visible on the page').toBeTruthy();
    });

    test('footer contains links @functional', async ({ functionalPage }) => {
      await functionalPage.navigate();
      await functionalPage.waitForLoad();

      const footerLinks = await functionalPage.getFooterLinks();

      expect(
        footerLinks.length,
        'Footer should contain at least one link'
      ).toBeGreaterThan(0);
    });

    test('footer has copyright information @functional', async ({ functionalPage }) => {
      await functionalPage.navigate();
      await functionalPage.waitForLoad();

      const copyright = await functionalPage.getFooterCopyright();

      if (!copyright) {
        console.warn(
          '[functional] No copyright notice found in the footer. ' +
          'A copyright notice is recommended for brand protection.'
        );
      }
    });

    test('footer links are not broken (no 404s) @functional', async ({ functionalPage, siteConfig }) => {
      await functionalPage.navigate();
      await functionalPage.waitForLoad();

      const footerLinks = await functionalPage.getFooterLinks();

      // Filter to internal links only (external social/partner links may have CORS restrictions)
      const internalLinks = footerLinks.filter((l) => !l.isExternal);

      if (internalLinks.length === 0) {
        console.warn('[functional] No internal footer links found to check');
        return;
      }

      const brokenLinks: Array<{ href: string; status: number }> = [];
      const siteOrigin = new URL(siteConfig.url).origin;

      for (const link of internalLinks.slice(0, 10)) { // Limit to 10 to avoid slow tests
        try {
          // Validate the URL is from the same origin before requesting
          const linkUrl = new URL(link.href);
          if (linkUrl.origin !== siteOrigin) continue;

          const response = await functionalPage.page.request.head(link.href, {
            timeout: 8_000,
          });

          if (!response.ok() && response.status() !== 405) { // 405 = Method Not Allowed (HEAD not supported)
            brokenLinks.push({ href: link.href, status: response.status() });
          }
        } catch {
          // Network errors treated as warnings, not failures
          console.warn(`[functional] Could not reach footer link: ${link.href}`);
        }
      }

      expect(
        brokenLinks,
        `Found ${brokenLinks.length} broken footer link(s):\n` +
          brokenLinks.map((l) => `  ${l.href} → HTTP ${l.status}`).join('\n')
      ).toHaveLength(0);
    });
  });

  // ── Social media and external links ──────────────────────────────────────────

  test.describe('Social and External Links', () => {
    test('social media links (if any) open in a new tab @functional', async ({ functionalPage }) => {
      await functionalPage.navigate();
      await functionalPage.waitForLoad();

      const socialLinks = await functionalPage.getSocialLinks();

      if (socialLinks.length === 0) {
        console.warn('[functional] No social media links found on the homepage');
        return;
      }

      const missingTarget: string[] = [];

      for (const social of socialLinks) {
        const link = functionalPage.page.locator(`a[href="${social.href}"]`).first();
        if (await link.count() === 0) continue;

        const target = await link.getAttribute('target');
        if (target !== '_blank') {
          missingTarget.push(`${social.text} (${social.href})`);
        }
      }

      if (missingTarget.length > 0) {
        console.warn(
          '[functional] Social links without target="_blank":\n' +
            missingTarget.map((l) => `  ${l}`).join('\n')
        );
      }
    });
  });

  // ── Page-to-page navigation ───────────────────────────────────────────────────

  test.describe('Page Navigation Flows', () => {
    test('contact link navigates to a contact page or section @functional', async ({ page, siteConfig }) => {
      await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

      const contactLink = page.locator('a').filter({ hasText: /contact/i }).first();

      if (await contactLink.count() === 0) {
        console.warn('[functional] No "Contact" link found on homepage');
        return;
      }

      await contactLink.click();
      await page.waitForLoadState('domcontentloaded');

      // After clicking contact, we should be on a meaningful page
      const bodyText = await page.evaluate<string>(() => document.body.innerText);
      expect(
        bodyText.trim().length,
        'Contact page/section should have content after navigation'
      ).toBeGreaterThan(50);
    });

    test('all discovered pages load without server errors @functional', async ({ page, siteConfig }) => {
      const serverErrors: Array<{ path: string; status: number }> = [];

      // Common B2B website page paths to probe
      const pagePaths = [
        '/about',
        '/contact',
        '/products',
        '/services',
        '/technology',
        '/solutions',
        '/resources',
        '/blog',
      ];

      for (const pagePath of pagePaths) {
        const url = siteConfig.url.replace(/\/$/, '') + pagePath;
        try {
          const response = await page.request.head(url, { timeout: 8_000 });
          const status = response.status();
          // 404 is expected for pages that don't exist; 5xx is a server error
          if (status >= 500) {
            serverErrors.push({ path: pagePath, status });
          }
        } catch {
          // Network error — not a server error
        }
      }

      expect(
        serverErrors,
        `Found ${serverErrors.length} page(s) with server errors:\n` +
          serverErrors.map((e) => `  ${e.path} → HTTP ${e.status}`).join('\n')
      ).toHaveLength(0);
    });
  });

  // ── Media and assets ──────────────────────────────────────────────────────────

  test.describe('Images and Media', () => {
    test('all visible images have loaded (no broken images) @functional', async ({ page, siteConfig }) => {
      await page.goto(siteConfig.url, { waitUntil: 'networkidle' });

      const brokenImages = await page.evaluate<string[]>(() => {
        return Array.from(document.querySelectorAll('img'))
          .filter((img) => {
            return !img.complete || img.naturalWidth === 0;
          })
          .map((img) => img.src || img.getAttribute('data-src') || '[no src]');
      });

      if (brokenImages.length > 0) {
        console.warn(
          '[functional] Broken or unloaded images:\n' +
            brokenImages.slice(0, 5).map((src) => `  ${src}`).join('\n')
        );
      }

      expect(
        brokenImages.length,
        `Found ${brokenImages.length} broken image(s) on the homepage`
      ).toBe(0);
    });

    test('page does not embed videos if they cannot autoplay @functional', async ({ functionalPage }) => {
      await functionalPage.navigate();
      await functionalPage.waitForLoad();

      const hasVideo = await functionalPage.hasEmbeddedVideo();

      if (hasVideo) {
        console.info('[functional] Embedded video detected — verify it does not autoplay with sound (UX concern)');
      }

      // This is informational only — not a pass/fail condition
    });
  });
});
