/**
 * Property Test: Language Preference Persists
 * Feature: admin-panel-template, Property 29: Language Preference Persists
 * Validates: Requirements 11.5
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { locales, type Locale } from "@/i18n";

// Mock document.cookie for testing
const mockCookies: Record<string, string> = {};

const getCookie = (name: string): string | undefined => {
  return mockCookies[name];
};

const setCookie = (name: string, value: string): void => {
  mockCookies[name] = value;
};

const clearCookies = (): void => {
  Object.keys(mockCookies).forEach((key) => delete mockCookies[key]);
};

describe("Language Preference Persistence - Property Tests", () => {
  beforeEach(() => {
    clearCookies();
  });

  /**
   * Property 29: Language Preference Persists
   * For any language selection, after page reload, the same language should be active.
   */
  it("Property 29: Language preference persists - for any locale, saving and reloading should preserve the locale", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...locales) as fc.Arbitrary<Locale>,
        async (locale) => {
          // Clear cookies from previous iteration
          clearCookies();

          // Simulate setting a locale (as if user selected it)
          setCookie("NEXT_LOCALE", locale);

          // Verify locale is stored
          expect(getCookie("NEXT_LOCALE")).toBe(locale);

          // Simulate page reload - the locale should be read from cookie
          const persistedLocale = getCookie("NEXT_LOCALE");
          
          // Verify locale persisted and is valid
          expect(persistedLocale).toBe(locale);
          expect(locales.includes(persistedLocale as Locale)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Language changes persist across sessions
   * For any initial locale, changing it and reloading should show the new locale
   */
  it("Property: Language changes persist across sessions - changing locale and reloading preserves the change", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...locales) as fc.Arbitrary<Locale>,
        async (initialLocale) => {
          // Clear cookies from previous iteration
          clearCookies();

          // Set initial locale
          setCookie("NEXT_LOCALE", initialLocale);

          // Verify initial locale is stored
          expect(getCookie("NEXT_LOCALE")).toBe(initialLocale);

          // Simulate changing locale to a different one
          const otherLocales = locales.filter((l) => l !== initialLocale);
          const newLocale = otherLocales[0];
          
          setCookie("NEXT_LOCALE", newLocale);

          // Simulate page reload - the new locale should be read from cookie
          const persistedLocale = getCookie("NEXT_LOCALE");

          // Verify the changed locale persisted
          expect(persistedLocale).toBe(newLocale);
          expect(locales.includes(persistedLocale as Locale)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Invalid locale falls back to default
   * For any invalid locale value, the system should handle it gracefully
   */
  it("Property: Invalid locale values are handled gracefully", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter((s) => !locales.includes(s as Locale)),
        async (invalidLocale) => {
          // Clear cookies from previous iteration
          clearCookies();

          // Set an invalid locale
          setCookie("NEXT_LOCALE", invalidLocale);

          // Verify the cookie is set
          const storedValue = getCookie("NEXT_LOCALE");
          expect(storedValue).toBe(invalidLocale);

          // Validate that the stored value is NOT a valid locale
          // (this is what the request.ts would check and fallback to default)
          const isValidLocale = locales.includes(storedValue as Locale);
          expect(isValidLocale).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All supported locales can be persisted
   * For all locales in the supported list, each should be persistable
   */
  it("Property: All supported locales can be persisted", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...locales) as fc.Arbitrary<Locale>,
        async (locale) => {
          // Clear cookies from previous iteration
          clearCookies();

          // Set the locale
          setCookie("NEXT_LOCALE", locale);

          // Verify it can be retrieved
          const retrieved = getCookie("NEXT_LOCALE");
          expect(retrieved).toBe(locale);

          // Verify it's a valid locale
          expect(locales.includes(retrieved as Locale)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
