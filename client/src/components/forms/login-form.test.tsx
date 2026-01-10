/**
 * Property Test: Login Form Validation Works
 * Feature: admin-panel-template, Property 22: Login Form Validation Works
 * Validates: Requirements 8.2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { LoginForm, loginSchema } from './login-form';

// Mock onSubmit function
const mockOnSubmit = vi.fn();

// Helper to render LoginForm
const renderLoginForm = (isLoading = false) => {
  return render(<LoginForm onSubmit={mockOnSubmit} isLoading={isLoading} />);
};

// Helper to get form elements
const getFormElements = () => {
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const submitButton = screen.getByRole('button', { name: /giriş yap/i });
  return { emailInput, passwordInput, submitButton };
};

describe('Login Form - Property Tests', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
    cleanup();
  });

  /**
   * Property 22: Login Form Validation Works
   * For any invalid login input (empty email, invalid email format, short password),
   * appropriate validation error should be shown.
   */
  it('Property 22: For any empty email, validation should fail with appropriate error', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid passwords (6+ chars, alphanumeric only)
        fc.stringMatching(/^[a-zA-Z0-9]{6,20}$/),
        async (password) => {
          cleanup();
          mockOnSubmit.mockClear();

          renderLoginForm();
          const { passwordInput, submitButton } = getFormElements();

          // Leave email empty, fill password
          fireEvent.change(passwordInput, { target: { value: password } });
          fireEvent.click(submitButton);

          // Wait for validation error
          await waitFor(() => {
            const errorMessage = screen.getByText(/email adresi gereklidir/i);
            expect(errorMessage).toBeInTheDocument();
          });

          expect(mockOnSubmit).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 22: For any invalid email format, validation should fail with appropriate error', async () => {
    // Generate strings that are NOT valid emails (simple alphanumeric strings without @)
    const invalidEmailArbitrary = fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/);

    await fc.assert(
      fc.asyncProperty(
        invalidEmailArbitrary,
        fc.stringMatching(/^[a-zA-Z0-9]{6,20}$/),
        async (invalidEmail, password) => {
          cleanup();
          mockOnSubmit.mockClear();

          renderLoginForm();
          const { emailInput, passwordInput, submitButton } = getFormElements();

          fireEvent.change(emailInput, { target: { value: invalidEmail } });
          fireEvent.change(passwordInput, { target: { value: password } });
          fireEvent.click(submitButton);

          // Wait for validation error
          await waitFor(() => {
            const errorMessage = screen.getByText(/geçerli bir email adresi giriniz/i);
            expect(errorMessage).toBeInTheDocument();
          });

          expect(mockOnSubmit).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 22: For any password shorter than 6 characters, validation should fail', async () => {
    // Generate valid emails
    const validEmailArbitrary = fc
      .tuple(
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,9}$/),
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,5}$/),
        fc.constantFrom('com', 'org', 'net')
      )
      .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

    // Generate short passwords (1-5 chars)
    const shortPasswordArbitrary = fc.stringMatching(/^[a-zA-Z0-9]{1,5}$/);

    await fc.assert(
      fc.asyncProperty(validEmailArbitrary, shortPasswordArbitrary, async (email, shortPassword) => {
        cleanup();
        mockOnSubmit.mockClear();

        renderLoginForm();
        const { emailInput, passwordInput, submitButton } = getFormElements();

        fireEvent.change(emailInput, { target: { value: email } });
        fireEvent.change(passwordInput, { target: { value: shortPassword } });
        fireEvent.click(submitButton);

        // Wait for validation error
        await waitFor(() => {
          const errorMessage = screen.getByText(/şifre en az 6 karakter olmalıdır/i);
          expect(errorMessage).toBeInTheDocument();
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });

  it('Property 22: For any valid email and password (6+ chars), form should submit successfully', async () => {
    // Generate valid emails
    const validEmailArbitrary = fc
      .tuple(
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,9}$/),
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,5}$/),
        fc.constantFrom('com', 'org', 'net')
      )
      .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

    // Generate valid passwords (6+ chars)
    const validPasswordArbitrary = fc.stringMatching(/^[a-zA-Z0-9]{6,20}$/);

    await fc.assert(
      fc.asyncProperty(validEmailArbitrary, validPasswordArbitrary, async (email, password) => {
        cleanup();
        mockOnSubmit.mockClear();
        mockOnSubmit.mockResolvedValue(undefined);

        renderLoginForm();
        const { emailInput, passwordInput, submitButton } = getFormElements();

        fireEvent.change(emailInput, { target: { value: email } });
        fireEvent.change(passwordInput, { target: { value: password } });
        fireEvent.click(submitButton);

        // Wait for onSubmit to be called
        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalledWith({
            email,
            password,
            rememberMe: false,
          });
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Unit test: Zod schema validation
   */
  it('Zod schema rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'validpass' });
    expect(result.success).toBe(false);
  });

  it('Zod schema rejects invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'notanemail', password: 'validpass' });
    expect(result.success).toBe(false);
  });

  it('Zod schema rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '12345' });
    expect(result.success).toBe(false);
  });

  it('Zod schema accepts valid input', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'validpass' });
    expect(result.success).toBe(true);
  });
});
