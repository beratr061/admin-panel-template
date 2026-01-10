/**
 * Property Test: Zod Validation Returns Errors for Invalid Input
 * Feature: admin-panel-template, Property 17: Zod Validation Returns Errors for Invalid Input
 * Validates: Requirements 5.1
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { z } from 'zod';
import { loginSchema } from './login-form';
import { registerSchema } from './register-form';
import { forgotPasswordSchema } from './forgot-password-form';

describe('Zod Validation - Property Tests', () => {
  /**
   * Property 17: Zod Validation Returns Errors for Invalid Input
   * For any form input that violates Zod schema rules, a validation error should be returned
   * with appropriate message.
   */

  describe('Login Schema Validation', () => {
    it('Property 17: For any empty email string, loginSchema should return validation error', () => {
      fc.assert(
        fc.property(
          // Generate valid passwords
          fc.stringMatching(/^[a-zA-Z0-9]{6,20}$/),
          (password) => {
            const result = loginSchema.safeParse({ email: '', password });
            expect(result.success).toBe(false);
            if (!result.success) {
              const emailErrors = result.error.issues.filter(
                (issue) => issue.path.includes('email')
              );
              expect(emailErrors.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 17: For any string without @ symbol, loginSchema should reject as invalid email', () => {
      fc.assert(
        fc.property(
          // Generate strings without @ symbol
          fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/),
          fc.stringMatching(/^[a-zA-Z0-9]{6,20}$/),
          (invalidEmail, password) => {
            const result = loginSchema.safeParse({ email: invalidEmail, password });
            expect(result.success).toBe(false);
            if (!result.success) {
              const emailErrors = result.error.issues.filter(
                (issue) => issue.path.includes('email')
              );
              expect(emailErrors.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 17: For any password shorter than 6 characters, loginSchema should return validation error', () => {
      fc.assert(
        fc.property(
          // Generate valid emails
          fc
            .tuple(
              fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,9}$/),
              fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,5}$/),
              fc.constantFrom('com', 'org', 'net')
            )
            .map(([local, domain, tld]) => `${local}@${domain}.${tld}`),
          // Generate short passwords (1-5 chars)
          fc.stringMatching(/^[a-zA-Z0-9]{1,5}$/),
          (email, shortPassword) => {
            const result = loginSchema.safeParse({ email, password: shortPassword });
            expect(result.success).toBe(false);
            if (!result.success) {
              const passwordErrors = result.error.issues.filter(
                (issue) => issue.path.includes('password')
              );
              expect(passwordErrors.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 17: For any valid email and password (6+ chars), loginSchema should pass validation', () => {
      fc.assert(
        fc.property(
          // Generate valid emails
          fc
            .tuple(
              fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,9}$/),
              fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,5}$/),
              fc.constantFrom('com', 'org', 'net')
            )
            .map(([local, domain, tld]) => `${local}@${domain}.${tld}`),
          // Generate valid passwords (6+ chars)
          fc.stringMatching(/^[a-zA-Z0-9]{6,20}$/),
          (email, password) => {
            const result = loginSchema.safeParse({ email, password });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Register Schema Validation', () => {
    it('Property 17: For any mismatched passwords, registerSchema should return validation error', () => {
      fc.assert(
        fc.property(
          // Generate valid name
          fc.stringMatching(/^[a-zA-Z]{2,10}$/),
          // Generate valid emails
          fc
            .tuple(
              fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,9}$/),
              fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,5}$/),
              fc.constantFrom('com', 'org', 'net')
            )
            .map(([local, domain, tld]) => `${local}@${domain}.${tld}`),
          // Generate two different valid passwords (with uppercase, lowercase, and digit)
          fc.stringMatching(/^[A-Z][a-z]{3}[0-9]{2}$/),
          fc.stringMatching(/^[A-Z][a-z]{3}[0-9]{3}$/),
          (name, email, password, confirmPassword) => {
            // Ensure passwords are different
            if (password === confirmPassword) return;

            const result = registerSchema.safeParse({
              name,
              email,
              password,
              confirmPassword,
            });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 17: For any matching valid passwords, registerSchema should pass validation', () => {
      fc.assert(
        fc.property(
          // Generate valid name
          fc.stringMatching(/^[a-zA-Z]{2,10}$/),
          // Generate valid emails
          fc
            .tuple(
              fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,9}$/),
              fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,5}$/),
              fc.constantFrom('com', 'org', 'net')
            )
            .map(([local, domain, tld]) => `${local}@${domain}.${tld}`),
          // Generate valid passwords (with uppercase, lowercase, and digit)
          fc.stringMatching(/^[A-Z][a-z]{3}[0-9]{2}$/),
          (name, email, password) => {
            const result = registerSchema.safeParse({
              name,
              email,
              password,
              confirmPassword: password,
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Forgot Password Schema Validation', () => {
    it('Property 17: For any empty email, forgotPasswordSchema should return validation error', () => {
      fc.assert(
        fc.property(fc.constant(''), (emptyEmail) => {
          const result = forgotPasswordSchema.safeParse({ email: emptyEmail });
          expect(result.success).toBe(false);
          if (!result.success) {
            const emailErrors = result.error.issues.filter(
              (issue) => issue.path.includes('email')
            );
            expect(emailErrors.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('Property 17: For any invalid email format, forgotPasswordSchema should return validation error', () => {
      fc.assert(
        fc.property(
          // Generate strings without @ symbol
          fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/),
          (invalidEmail) => {
            const result = forgotPasswordSchema.safeParse({ email: invalidEmail });
            expect(result.success).toBe(false);
            if (!result.success) {
              const emailErrors = result.error.issues.filter(
                (issue) => issue.path.includes('email')
              );
              expect(emailErrors.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 17: For any valid email, forgotPasswordSchema should pass validation', () => {
      fc.assert(
        fc.property(
          // Generate valid emails
          fc
            .tuple(
              fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,9}$/),
              fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,5}$/),
              fc.constantFrom('com', 'org', 'net')
            )
            .map(([local, domain, tld]) => `${local}@${domain}.${tld}`),
          (email) => {
            const result = forgotPasswordSchema.safeParse({ email });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Generic Zod Schema Properties', () => {
    it('Property 17: For any Zod schema, safeParse should return success=false with issues array for invalid input', () => {
      // Test with a generic schema
      const testSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        age: z.number().min(0, 'Age must be positive'),
      });

      fc.assert(
        fc.property(
          // Generate invalid inputs (empty name or negative age)
          fc.oneof(
            fc.record({ name: fc.constant(''), age: fc.integer({ min: 0, max: 100 }) }),
            fc.record({ name: fc.string({ minLength: 1 }), age: fc.integer({ min: -100, max: -1 }) })
          ),
          (invalidInput) => {
            const result = testSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error.issues.length).toBeGreaterThan(0);
              // Each issue should have a message
              result.error.issues.forEach((issue) => {
                expect(issue.message).toBeDefined();
                expect(typeof issue.message).toBe('string');
                expect(issue.message.length).toBeGreaterThan(0);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 17: For any Zod schema, error messages should be non-empty strings', () => {
      const testSchema = z.object({
        email: z.string().email('Invalid email'),
        count: z.number().positive('Must be positive'),
      });

      fc.assert(
        fc.property(
          fc.record({
            email: fc.stringMatching(/^[a-zA-Z0-9]{1,10}$/), // Invalid email (no @)
            count: fc.integer({ min: -100, max: 0 }), // Invalid count (not positive)
          }),
          (invalidInput) => {
            const result = testSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
            if (!result.success) {
              result.error.issues.forEach((issue) => {
                expect(typeof issue.message).toBe('string');
                expect(issue.message.length).toBeGreaterThan(0);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
