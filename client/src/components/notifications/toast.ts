import { toast as sonnerToast, ExternalToast } from "sonner";

/**
 * Toast notification options
 */
export interface ToastOptions extends Omit<ExternalToast, "id"> {
  /** Duration in milliseconds before auto-dismiss. Default: 4000ms */
  duration?: number;
  /** Position of the toast. Default: top-right (configured in Toaster) */
  position?: ExternalToast["position"];
}

/**
 * Default toast duration in milliseconds
 */
const DEFAULT_DURATION = 4000;

/**
 * Toast notification utility functions
 * Provides success, error, warning, and info variants with auto-dismiss
 */
export const toast = {
  /**
   * Show a success toast notification
   * @param message - The message to display
   * @param options - Optional toast configuration
   */
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      duration: options?.duration ?? DEFAULT_DURATION,
      ...options,
    });
  },

  /**
   * Show an error toast notification
   * @param message - The message to display
   * @param options - Optional toast configuration
   */
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: options?.duration ?? DEFAULT_DURATION,
      ...options,
    });
  },

  /**
   * Show a warning toast notification
   * @param message - The message to display
   * @param options - Optional toast configuration
   */
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      duration: options?.duration ?? DEFAULT_DURATION,
      ...options,
    });
  },

  /**
   * Show an info toast notification
   * @param message - The message to display
   * @param options - Optional toast configuration
   */
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      duration: options?.duration ?? DEFAULT_DURATION,
      ...options,
    });
  },

  /**
   * Show a loading toast notification
   * @param message - The message to display
   * @param options - Optional toast configuration
   * @returns Toast ID that can be used to dismiss or update the toast
   */
  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      duration: Infinity, // Loading toasts don't auto-dismiss
      ...options,
    });
  },

  /**
   * Show a promise-based toast notification
   * Shows loading state while promise is pending, then success/error based on result
   * @param promise - The promise to track
   * @param messages - Messages for loading, success, and error states
   * @param options - Optional toast configuration
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      ...messages,
      duration: options?.duration ?? DEFAULT_DURATION,
      ...options,
    });
  },

  /**
   * Dismiss a specific toast or all toasts
   * @param toastId - Optional toast ID to dismiss. If not provided, dismisses all toasts
   */
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },

  /**
   * Show a custom toast notification
   * @param message - The message to display
   * @param options - Optional toast configuration
   */
  custom: (message: string, options?: ToastOptions) => {
    return sonnerToast(message, {
      duration: options?.duration ?? DEFAULT_DURATION,
      ...options,
    });
  },
};

export default toast;
