/**
 * Property Test: Toast Notifications Appear on Trigger
 * Feature: admin-panel-template, Property 21: Toast Notifications Appear on Trigger
 * Validates: Requirements 7.1
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { toast as sonnerToast } from "sonner";
import { toast } from "./toast";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn().mockReturnValue("toast-id-success"),
    error: vi.fn().mockReturnValue("toast-id-error"),
    warning: vi.fn().mockReturnValue("toast-id-warning"),
    info: vi.fn().mockReturnValue("toast-id-info"),
    loading: vi.fn().mockReturnValue("toast-id-loading"),
    promise: vi.fn().mockReturnValue("toast-id-promise"),
    dismiss: vi.fn(),
  }),
}));

describe("Toast Notifications - Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 21: Toast Notifications Appear on Trigger
   * For any toast trigger (success, error, warning, info), a notification should be triggered
   * with the correct variant and message.
   */
  it("Property 21: For any toast variant and message, the corresponding sonner toast function should be called", () => {
    const toastVariants = ["success", "error", "warning", "info"] as const;

    fc.assert(
      fc.property(
        fc.constantFrom(...toastVariants),
        fc.string({ minLength: 1, maxLength: 200 }),
        (variant, message) => {
          // Clear mocks before each property check
          vi.clearAllMocks();

          // Trigger the toast
          toast[variant](message);

          // Verify the correct sonner function was called
          expect(sonnerToast[variant]).toHaveBeenCalledTimes(1);
          expect(sonnerToast[variant]).toHaveBeenCalledWith(
            message,
            expect.objectContaining({
              duration: 4000, // Default duration
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Toast with custom duration uses the specified duration
   */
  it("Property: For any toast variant and custom duration, the duration should be passed correctly", () => {
    const toastVariants = ["success", "error", "warning", "info"] as const;

    fc.assert(
      fc.property(
        fc.constantFrom(...toastVariants),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1000, max: 10000 }),
        (variant, message, duration) => {
          vi.clearAllMocks();

          toast[variant](message, { duration });

          expect(sonnerToast[variant]).toHaveBeenCalledWith(
            message,
            expect.objectContaining({
              duration,
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Loading toast uses infinite duration
   */
  it("Property: Loading toast should use infinite duration", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (message) => {
          vi.clearAllMocks();

          toast.loading(message);

          expect(sonnerToast.loading).toHaveBeenCalledWith(
            message,
            expect.objectContaining({
              duration: Infinity,
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Toast returns an ID for each call
   */
  it("Property: Each toast call should return a toast ID", () => {
    const toastVariants = ["success", "error", "warning", "info"] as const;

    fc.assert(
      fc.property(
        fc.constantFrom(...toastVariants),
        fc.string({ minLength: 1, maxLength: 100 }),
        (variant, message) => {
          vi.clearAllMocks();

          const result = toast[variant](message);

          // Should return the mock toast ID
          expect(result).toBe(`toast-id-${variant}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Dismiss function calls sonner dismiss
   */
  it("Property: Dismiss should call sonner dismiss with the correct ID", () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.string({ minLength: 1, maxLength: 50 }), fc.integer({ min: 1, max: 1000 })),
        (toastId) => {
          vi.clearAllMocks();

          toast.dismiss(toastId);

          expect(sonnerToast.dismiss).toHaveBeenCalledWith(toastId);
        }
      ),
      { numRuns: 100 }
    );
  });
});
