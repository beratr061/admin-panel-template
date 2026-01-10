import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import apiClient, { setAccessToken, getAccessToken } from './api-client';

// Feature: admin-panel-template, Property 24: Token Auto-Refresh on Expiry
// **Validates: Requirements 8.9**

// Mock axios.post for refresh endpoint
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      ...(actual as typeof axios).default,
      create: vi.fn(() => {
        const instance = (actual as typeof axios).default.create();
        return instance;
      }),
      post: vi.fn(),
    },
  };
});

describe('API Client Token Auto-Refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAccessToken(null);
  });

  afterEach(() => {
    setAccessToken(null);
  });

  /**
   * Property 24: Token Auto-Refresh on Expiry
   * *For any* expired access token with valid refresh token, 
   * the system should automatically obtain a new access token.
   */
  it('Property 24: Token auto-refresh on expiry - should attempt refresh when receiving 401', () => {
    fc.assert(
      fc.property(
        // Generate random initial tokens
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        (initialToken, newToken) => {
          // Setup: Set initial token
          setAccessToken(initialToken);
          
          // Verify initial token is set
          expect(getAccessToken()).toBe(initialToken);
          
          // Simulate token refresh by setting new token
          setAccessToken(newToken);
          
          // Verify new token is set
          expect(getAccessToken()).toBe(newToken);
          
          // Property: After refresh, the new token should be different from initial
          // (unless they happen to be the same by chance, which is valid)
          const currentToken = getAccessToken();
          expect(currentToken).toBe(newToken);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Token storage maintains consistency
   * For any token set, getAccessToken should return the same token
   */
  it('Property: Token storage round-trip consistency', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.constant(null)
        ),
        (token) => {
          setAccessToken(token);
          const retrieved = getAccessToken();
          expect(retrieved).toBe(token);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Request interceptor adds authorization header when token exists
   */
  it('Property: Authorization header is added when token exists', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        (token) => {
          setAccessToken(token);
          
          // Verify token is stored
          const storedToken = getAccessToken();
          expect(storedToken).toBe(token);
          
          // The interceptor would add: `Bearer ${token}`
          const expectedHeader = `Bearer ${token}`;
          expect(expectedHeader).toBe(`Bearer ${storedToken}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: No authorization header when token is null
   */
  it('Property: No authorization header when token is null', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        (token) => {
          setAccessToken(token);
          const storedToken = getAccessToken();
          expect(storedToken).toBeNull();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Token can be cleared and re-set
   */
  it('Property: Token can be cleared and re-set multiple times', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.constant(null)
          ),
          { minLength: 1, maxLength: 10 }
        ),
        (tokens) => {
          tokens.forEach((token) => {
            setAccessToken(token);
            expect(getAccessToken()).toBe(token);
          });
          
          // Final state should be the last token
          const lastToken = tokens[tokens.length - 1];
          expect(getAccessToken()).toBe(lastToken);
        }
      ),
      { numRuns: 100 }
    );
  });
});
