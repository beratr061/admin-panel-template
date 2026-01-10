/**
 * Property Test: Inline Validation Errors Appear Next to Fields
 * Feature: admin-panel-template, Property 19: Inline Validation Errors Appear Next to Fields
 * Validates: Requirements 5.9
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { ForgotPasswordForm } from './forgot-password-form';

describe('Inline Validation Errors - Property Tests', () => {
  beforeEach(() => {
    cleanup();
  });

  /**
   * Property 19: Inline Validation Errors Appear Next to Fields
   * For any field with validation error, the error message should be displayed
   * adjacent to that field.
   */

  describe('LoginForm Inline Validation', () => {
    it('Property 19: For any invalid email, error message appears adjacent to email field', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate invalid emails (strings without @)
          fc.stringMatching(/^[a-zA-Z0-9]{1,15}$/),
          async (invalidEmail) => {
            cleanup();
            const mockOnSubmit = vi.fn();

            render(<LoginForm onSubmit={mockOnSubmit} />);

            const emailInput = document.getElementById('email') as HTMLInputElement;
            const submitButton = screen.getByRole('button', { name: /giriş yap/i });

            // Enter invalid email
            fireEvent.change(emailInput, { target: { value: invalidEmail } });
            fireEvent.click(submitButton);

            // Wait for validation error to appear
            await waitFor(() => {
              const errorElement = document.getElementById('email-error');
              expect(errorElement).toBeInTheDocument();

              // Verify error is adjacent to the email field (within the same parent container)
              const emailFieldContainer = emailInput.closest('.space-y-2');
              expect(emailFieldContainer).toContainElement(errorElement);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 19: For any short password, error message appears adjacent to password field', async () => {
      await fc.assert(
        fc.asyncProperty(
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
          async (email, shortPassword) => {
            cleanup();
            const mockOnSubmit = vi.fn();

            render(<LoginForm onSubmit={mockOnSubmit} />);

            const emailInput = document.getElementById('email') as HTMLInputElement;
            const passwordInput = document.getElementById('password') as HTMLInputElement;
            const submitButton = screen.getByRole('button', { name: /giriş yap/i });

            // Enter valid email and short password
            fireEvent.change(emailInput, { target: { value: email } });
            fireEvent.change(passwordInput, { target: { value: shortPassword } });
            fireEvent.click(submitButton);

            // Wait for validation error to appear
            await waitFor(() => {
              const errorElement = document.getElementById('password-error');
              expect(errorElement).toBeInTheDocument();

              // Verify error is adjacent to the password field
              const passwordFieldContainer = passwordInput.closest('.space-y-2');
              expect(passwordFieldContainer).toContainElement(errorElement);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 19: Error messages have role="alert" for accessibility', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(''), // Empty email
          async () => {
            cleanup();
            const mockOnSubmit = vi.fn();

            render(<LoginForm onSubmit={mockOnSubmit} />);

            const submitButton = screen.getByRole('button', { name: /giriş yap/i });
            fireEvent.click(submitButton);

            // Wait for validation errors
            await waitFor(() => {
              const alertElements = screen.getAllByRole('alert');
              expect(alertElements.length).toBeGreaterThan(0);

              // Each alert should contain error text
              alertElements.forEach((alert) => {
                expect(alert.textContent).toBeTruthy();
              });
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('ForgotPasswordForm Inline Validation', () => {
    it('Property 19: For any invalid email in forgot password form, error appears next to field', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate invalid emails
          fc.stringMatching(/^[a-zA-Z0-9]{1,15}$/),
          async (invalidEmail) => {
            cleanup();
            const mockOnSubmit = vi.fn();

            render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

            const emailInput = document.getElementById('email') as HTMLInputElement;
            const submitButton = screen.getByRole('button', { name: /şifre sıfırlama bağlantısı gönder/i });

            // Enter invalid email
            fireEvent.change(emailInput, { target: { value: invalidEmail } });
            fireEvent.click(submitButton);

            // Wait for validation error
            await waitFor(() => {
              const errorElement = document.getElementById('email-error');
              expect(errorElement).toBeInTheDocument();

              // Verify error is adjacent to the email field
              const emailFieldContainer = emailInput.closest('.space-y-2');
              expect(emailFieldContainer).toContainElement(errorElement);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('RegisterForm Inline Validation', () => {
    it('Property 19: For any empty name, error appears next to name field', async () => {
      await fc.assert(
        fc.asyncProperty(
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
          async (email, password) => {
            cleanup();
            const mockOnSubmit = vi.fn();

            render(<RegisterForm onSubmit={mockOnSubmit} />);

            const emailInput = document.getElementById('email') as HTMLInputElement;
            const passwordInput = document.getElementById('password') as HTMLInputElement;
            const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
            const submitButton = screen.getByRole('button', { name: /kayıt ol/i });

            // Leave name empty, fill other fields
            fireEvent.change(emailInput, { target: { value: email } });
            fireEvent.change(passwordInput, { target: { value: password } });
            fireEvent.change(confirmPasswordInput, { target: { value: password } });
            fireEvent.click(submitButton);

            // Wait for validation error
            await waitFor(() => {
              const errorElement = document.getElementById('name-error');
              expect(errorElement).toBeInTheDocument();

              // Verify error is adjacent to the name field
              const nameInput = document.getElementById('name');
              const nameFieldContainer = nameInput?.closest('.space-y-2');
              expect(nameFieldContainer).toContainElement(errorElement);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 19: For mismatched passwords, error appears next to confirm password field', async () => {
      await fc.assert(
        fc.asyncProperty(
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
          // Generate valid password
          fc.stringMatching(/^[A-Z][a-z]{3}[0-9]{2}$/),
          // Generate different confirm password
          fc.stringMatching(/^[A-Z][a-z]{3}[0-9]{3}$/),
          async (name, email, password, confirmPassword) => {
            // Ensure passwords are different
            if (password === confirmPassword) return;

            cleanup();
            const mockOnSubmit = vi.fn();

            render(<RegisterForm onSubmit={mockOnSubmit} />);

            const nameInput = document.getElementById('name') as HTMLInputElement;
            const emailInput = document.getElementById('email') as HTMLInputElement;
            const passwordInput = document.getElementById('password') as HTMLInputElement;
            const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
            const submitButton = screen.getByRole('button', { name: /kayıt ol/i });

            // Fill all fields with mismatched passwords
            fireEvent.change(nameInput, { target: { value: name } });
            fireEvent.change(emailInput, { target: { value: email } });
            fireEvent.change(passwordInput, { target: { value: password } });
            fireEvent.change(confirmPasswordInput, { target: { value: confirmPassword } });
            fireEvent.click(submitButton);

            // Wait for validation error
            await waitFor(() => {
              const errorElement = document.getElementById('confirmPassword-error');
              expect(errorElement).toBeInTheDocument();

              // Verify error is adjacent to the confirm password field
              const confirmPasswordFieldContainer = confirmPasswordInput.closest('.space-y-2');
              expect(confirmPasswordFieldContainer).toContainElement(errorElement);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('General Inline Validation Properties', () => {
    it('Property 19: Error messages are visually styled with destructive color', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(true), async () => {
          cleanup();
          const mockOnSubmit = vi.fn();

          render(<LoginForm onSubmit={mockOnSubmit} />);

          const submitButton = screen.getByRole('button', { name: /giriş yap/i });
          fireEvent.click(submitButton);

          // Wait for validation errors
          await waitFor(() => {
            const errorElements = screen.getAllByRole('alert');
            expect(errorElements.length).toBeGreaterThan(0);

            // Each error should have the destructive text color class
            errorElements.forEach((error) => {
              expect(error.className).toContain('text-destructive');
            });
          });
        }),
        { numRuns: 100 }
      );
    });

    it('Property 19: Input fields with errors have aria-invalid attribute', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(true), async () => {
          cleanup();
          const mockOnSubmit = vi.fn();

          render(<LoginForm onSubmit={mockOnSubmit} />);

          const submitButton = screen.getByRole('button', { name: /giriş yap/i });
          fireEvent.click(submitButton);

          // Wait for validation
          await waitFor(() => {
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            // Inputs with errors should have aria-invalid="true"
            expect(emailInput?.getAttribute('aria-invalid')).toBe('true');
            expect(passwordInput?.getAttribute('aria-invalid')).toBe('true');
          });
        }),
        { numRuns: 100 }
      );
    });
  });
});
