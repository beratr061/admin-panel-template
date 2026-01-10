import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as fc from 'fast-check';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';

describe('Auth DTOs Validation', () => {
  /**
   * Feature: admin-panel-template, Property 27: DTO Validation Rejects Invalid Payloads
   * *For any* API request with invalid payload (missing required fields, wrong types),
   * validation should fail with descriptive error.
   * **Validates: Requirements 14.2**
   */
  describe('LoginDto', () => {
    it('Property 27: should reject invalid email formats', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate strings that are NOT valid emails
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !s.includes('@') || !s.includes('.')),
          fc.string({ minLength: 6, maxLength: 50 }),
          async (invalidEmail, password) => {
            const dto = plainToInstance(LoginDto, { email: invalidEmail, password });
            const errors = await validate(dto);

            // Should have validation errors for invalid email
            const emailErrors = errors.filter((e) => e.property === 'email');
            expect(emailErrors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Property 27: should reject passwords shorter than 6 characters', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          // Generate passwords shorter than 6 characters
          fc.string({ minLength: 1, maxLength: 5 }),
          async (email, shortPassword) => {
            const dto = plainToInstance(LoginDto, { email, password: shortPassword });
            const errors = await validate(dto);

            // Should have validation errors for short password
            const passwordErrors = errors.filter((e) => e.property === 'password');
            expect(passwordErrors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Property 27: should accept valid login payloads', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 6, maxLength: 50 }),
          async (email, password) => {
            const dto = plainToInstance(LoginDto, { email, password });
            const errors = await validate(dto);

            // Should have no validation errors
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Property 27: should reject missing required fields', async () => {
      // Test missing email
      const dtoMissingEmail = plainToInstance(LoginDto, { password: 'password123' });
      const errorsMissingEmail = await validate(dtoMissingEmail);
      expect(errorsMissingEmail.some((e) => e.property === 'email')).toBe(true);

      // Test missing password
      const dtoMissingPassword = plainToInstance(LoginDto, { email: 'test@example.com' });
      const errorsMissingPassword = await validate(dtoMissingPassword);
      expect(errorsMissingPassword.some((e) => e.property === 'password')).toBe(true);

      // Test empty object
      const dtoEmpty = plainToInstance(LoginDto, {});
      const errorsEmpty = await validate(dtoEmpty);
      expect(errorsEmpty.length).toBeGreaterThan(0);
    });
  });

  describe('RegisterDto', () => {
    it('Property 27: should reject invalid email formats', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate strings that are NOT valid emails
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !s.includes('@') || !s.includes('.')),
          fc.string({ minLength: 2, maxLength: 50 }),
          async (invalidEmail, name) => {
            const dto = plainToInstance(RegisterDto, {
              email: invalidEmail,
              name,
              password: 'Password123',
              passwordConfirm: 'Password123',
            });
            const errors = await validate(dto);

            // Should have validation errors for invalid email
            const emailErrors = errors.filter((e) => e.property === 'email');
            expect(emailErrors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Property 27: should reject passwords without required complexity', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 2, maxLength: 50 }),
          // Generate passwords without uppercase, lowercase, or digit
          fc.constantFrom('password', 'PASSWORD', '123456', 'abcdef', 'ABCDEF'),
          async (email, name, weakPassword) => {
            const dto = plainToInstance(RegisterDto, {
              email,
              name,
              password: weakPassword,
              passwordConfirm: weakPassword,
            });
            const errors = await validate(dto);

            // Should have validation errors for weak password
            const passwordErrors = errors.filter((e) => e.property === 'password');
            expect(passwordErrors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Property 27: should reject names shorter than 2 characters', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          // Generate names shorter than 2 characters
          fc.string({ minLength: 0, maxLength: 1 }),
          async (email, shortName) => {
            const dto = plainToInstance(RegisterDto, {
              email,
              name: shortName,
              password: 'Password123',
              passwordConfirm: 'Password123',
            });
            const errors = await validate(dto);

            // Should have validation errors for short name
            const nameErrors = errors.filter((e) => e.property === 'name');
            expect(nameErrors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Property 27: should accept valid register payloads', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 2, maxLength: 50 }).filter((s) => s.trim().length >= 2),
          async (email, name) => {
            const validPassword = 'Password123';
            const dto = plainToInstance(RegisterDto, {
              email,
              name,
              password: validPassword,
              passwordConfirm: validPassword,
            });
            const errors = await validate(dto);

            // Should have no validation errors
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Property 27: should reject missing required fields', async () => {
      // Test missing email
      const dtoMissingEmail = plainToInstance(RegisterDto, {
        name: 'Test User',
        password: 'Password123',
        passwordConfirm: 'Password123',
      });
      const errorsMissingEmail = await validate(dtoMissingEmail);
      expect(errorsMissingEmail.some((e) => e.property === 'email')).toBe(true);

      // Test missing name
      const dtoMissingName = plainToInstance(RegisterDto, {
        email: 'test@example.com',
        password: 'Password123',
        passwordConfirm: 'Password123',
      });
      const errorsMissingName = await validate(dtoMissingName);
      expect(errorsMissingName.some((e) => e.property === 'name')).toBe(true);

      // Test missing password
      const dtoMissingPassword = plainToInstance(RegisterDto, {
        email: 'test@example.com',
        name: 'Test User',
        passwordConfirm: 'Password123',
      });
      const errorsMissingPassword = await validate(dtoMissingPassword);
      expect(errorsMissingPassword.some((e) => e.property === 'password')).toBe(true);

      // Test empty object
      const dtoEmpty = plainToInstance(RegisterDto, {});
      const errorsEmpty = await validate(dtoEmpty);
      expect(errorsEmpty.length).toBeGreaterThan(0);
    });
  });
});
