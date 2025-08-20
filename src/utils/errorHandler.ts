// Error handler utility for suppressing common media player warnings
export class ErrorHandler {
  private originalConsoleError: typeof console.error;

  constructor() {
    this.originalConsoleError = console.error.bind(console);
    this.setupErrorSuppression();
  }

  private setupErrorSuppression() {
    // Override console.error to filter out screen orientation lock errors
    console.error = (...args: any[]) => {
      const message = args.join(' ').toLowerCase();
      
      // List of error patterns to suppress
      const suppressedErrors = [
        'failed to lock screen orientation',
        'screen orientation lock',
        'orientation lock failed',
        'vidstack.*orientation',
      ];

      // Check if this error should be suppressed
      const shouldSuppress = suppressedErrors.some(pattern => {
        return message.includes(pattern) || new RegExp(pattern, 'i').test(message);
      });

      // Only log if not suppressed
      if (!shouldSuppress) {
        this.originalConsoleError(...args);
      }
    };
  }

  // Method to restore original console.error if needed
  restore() {
    console.error = this.originalConsoleError;
  }

  // Handle media player errors specifically
  static handleMediaPlayerError(error: any) {
    if (typeof error === 'string' && error.toLowerCase().includes('orientation')) {
      // Silently ignore orientation-related errors
      return true;
    }
    return false;
  }
}

// Initialize error handler
const errorHandler = new ErrorHandler();

export default errorHandler;
