/**
 * src/pages/functional.page.ts
 *
 * FunctionalPage provides methods for inspecting content sections, feature
 * showcases, and business-logic elements common to B2B corporate/industrial sites.
 * Designed to work without site-specific class names.
 */

import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface SectionInfo {
  heading: string;
  hasContent: boolean;
}

export interface LinkInfo {
  text: string;
  href: string;
  isExternal: boolean;
}

export class FunctionalPage extends BasePage {
  // ── Headings and content structure ────────────────────────────────────────────

  /**
   * Return all h1 and h2 headings on the current page with their text.
   */
  async getAllHeadings(): Promise<Array<{ level: number; text: string }>> {
    const results: Array<{ level: number; text: string }> = [];

    for (const level of [1, 2, 3]) {
      const headings = this.page.locator(`h${level}`);
      const count = await headings.count();
      for (let i = 0; i < count; i++) {
        const text = ((await headings.nth(i).textContent()) ?? '').trim();
        if (text) results.push({ level, text });
      }
    }

    return results;
  }

  /**
   * Return the text of all visible paragraphs on the page.
   * Filters out empty or whitespace-only paragraphs.
   */
  async getContentParagraphs(): Promise<string[]> {
    const paragraphs = this.page.locator('main p, article p, section p, [class*="content"] p');
    const count = await paragraphs.count();
    const results: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = ((await paragraphs.nth(i).textContent()) ?? '').trim();
      if (text.length > 10) results.push(text);
    }

    return results;
  }

  // ── CTA (Call-To-Action) elements ─────────────────────────────────────────────

  /**
   * Return all CTA buttons and links visible on the page.
   * Uses both class-based and text-based heuristics.
   */
  async getCTAElements(): Promise<Locator[]> {
    // Class-based detection
    const byClass = this.page.locator(
      'a[class*="btn"], a[class*="button"], a[class*="cta"], ' +
      'button[class*="primary"], button[class*="cta"], ' +
      'a[class*="action"], [role="button"]'
    );

    const byClassItems = await byClass.all();
    if (byClassItems.length > 0) return byClassItems;

    // Text-based fallback for sites without CSS class naming conventions
    return this.page.locator('a, button').filter({
      hasText: /get started|contact us|learn more|get a quote|request demo|schedule|free trial|download|view products/i,
    }).all();
  }

  /**
   * Return true if at least one CTA element is visible above the fold.
   */
  async hasCTAAboveFold(): Promise<boolean> {
    const ctas = await this.getCTAElements();
    for (const cta of ctas) {
      const box = await cta.boundingBox();
      if (box && box.y < 900 && await cta.isVisible()) {
        return true;
      }
    }
    return false;
  }

  // ── Feature / product sections ────────────────────────────────────────────────

  /**
   * Return all identifiable content sections on the page.
   * A "section" is any <section>, <article>, or landmark region.
   */
  async getContentSections(): Promise<SectionInfo[]> {
    const sectionLocators = this.page.locator('section, article, [role="region"]');
    const count = await sectionLocators.count();
    const results: SectionInfo[] = [];

    for (let i = 0; i < count; i++) {
      const section = sectionLocators.nth(i);
      const heading = section.locator('h1, h2, h3').first();
      const headingText = await heading.count() > 0
        ? ((await heading.textContent()) ?? '').trim()
        : '';

      const bodyText = await section.evaluate<string>((el) => (el as HTMLElement).innerText ?? '');
      results.push({
        heading: headingText,
        hasContent: bodyText.trim().length > 30,
      });
    }

    return results;
  }

  /**
   * Return true if the page has a feature grid or list
   * (common patterns: grid of cards, icon + text pairs, bullet lists in sections).
   */
  async hasFeatureGrid(): Promise<boolean> {
    const patterns = [
      '[class*="feature"]',
      '[class*="card-grid"]',
      '[class*="services"]',
      '[class*="benefits"]',
      '[class*="capabilities"]',
      'ul[class*="list"] > li, ol[class*="list"] > li',
    ];

    for (const selector of patterns) {
      const count = await this.page.locator(selector).count();
      if (count >= 2) return true;
    }

    return false;
  }

  // ── Images and media ──────────────────────────────────────────────────────────

  /**
   * Return all images on the page with their src and alt attributes.
   */
  async getImages(): Promise<Array<{ src: string; alt: string; hasAlt: boolean }>> {
    return this.page.evaluate<Array<{ src: string; alt: string; hasAlt: boolean }>>(() => {
      return Array.from(document.querySelectorAll('img')).map((img) => ({
        src: img.src || img.getAttribute('data-src') || '',
        alt: img.alt ?? '',
        hasAlt: img.hasAttribute('alt'),
      }));
    });
  }

  /**
   * Return true if the page has any embedded video (YouTube, Vimeo, or <video> tag).
   */
  async hasEmbeddedVideo(): Promise<boolean> {
    const videoPatterns = [
      'iframe[src*="youtube"]',
      'iframe[src*="vimeo"]',
      'iframe[src*="wistia"]',
      'video',
      '[class*="video-embed"]',
    ];

    for (const selector of videoPatterns) {
      if (await this.page.locator(selector).count() > 0) return true;
    }

    return false;
  }

  // ── Footer ────────────────────────────────────────────────────────────────────

  /**
   * Return all links in the footer with their text and href.
   */
  async getFooterLinks(): Promise<LinkInfo[]> {
    const footer = this.page.locator('footer, [role="contentinfo"]').first();
    if (await footer.count() === 0) return [];

    const links = footer.locator('a[href]');
    const count = await links.count();
    const results: LinkInfo[] = [];
    const siteOrigin = new URL(this.config.url).origin;

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = ((await link.textContent()) ?? '').trim();
      const href = (await link.getAttribute('href')) ?? '';

      if (!href || href === '#') continue;

      let absoluteHref: string;
      try {
        absoluteHref = new URL(href, this.config.url).toString();
      } catch {
        absoluteHref = href;
      }

      results.push({
        text,
        href: absoluteHref,
        isExternal: !absoluteHref.startsWith(siteOrigin),
      });
    }

    return results;
  }

  /**
   * Return the copyright text from the footer, if present.
   */
  async getFooterCopyright(): Promise<string> {
    const footer = this.page.locator('footer, [role="contentinfo"]').first();
    if (await footer.count() === 0) return '';

    const copyrightEl = footer.locator(
      '[class*="copyright"], [class*="legal"], small'
    ).first();

    if (await copyrightEl.count() > 0) {
      return ((await copyrightEl.textContent()) ?? '').trim();
    }

    // Fallback: look for © symbol in footer text
    const footerText = await footer.evaluate<string>((el) => (el as HTMLElement).innerText ?? '');
    const copyrightMatch = footerText.match(/©.+/);
    return copyrightMatch ? copyrightMatch[0].trim() : '';
  }

  // ── Social and contact ────────────────────────────────────────────────────────

  /**
   * Return all social media links on the page.
   */
  async getSocialLinks(): Promise<LinkInfo[]> {
    const socialDomains = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'x.com'];
    const links = this.page.locator('a[href]');
    const count = await links.count();
    const results: LinkInfo[] = [];

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const href = (await link.getAttribute('href')) ?? '';
      const isSocial = socialDomains.some((domain) => href.includes(domain));

      if (isSocial) {
        const textContent = ((await link.textContent()) ?? '').trim();
        const ariaLabel = (await link.getAttribute('aria-label')) ?? '';
        const text = textContent || ariaLabel || href;
        results.push({ text, href, isExternal: true });
      }
    }

    return results;
  }

  /**
   * Return true if a phone number is visible anywhere on the page.
   */
  async hasPhoneNumber(): Promise<boolean> {
    const phonePattern = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}|\+1[\s.-]\d{3}[\s.-]\d{3}[\s.-]\d{4}/;
    const bodyText = await this.page.evaluate<string>(() => document.body.innerText);
    return phonePattern.test(bodyText);
  }

  /**
   * Return true if an email address is visible anywhere on the page.
   */
  async hasEmailAddress(): Promise<boolean> {
    const emailLinks = this.page.locator('a[href^="mailto:"]');
    if (await emailLinks.count() > 0) return true;

    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const bodyText = await this.page.evaluate<string>(() => document.body.innerText);
    return emailPattern.test(bodyText);
  }
}
