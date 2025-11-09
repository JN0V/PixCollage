/**
 * Centralized logger for PixCollage app
 * All logs are prefixed with [PixCollage] for easy filtering with adb logcat
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private prefix = '[PixCollage]';
  private enabled = true;

  private log(level: LogLevel, category: string, message: string, ...args: any[]) {
    if (!this.enabled) return;

    const fullMessage = `${this.prefix} [${category}] ${message}`;
    
    switch (level) {
      case 'debug':
        console.log(fullMessage, ...args);
        break;
      case 'info':
        console.info(fullMessage, ...args);
        break;
      case 'warn':
        console.warn(fullMessage, ...args);
        break;
      case 'error':
        console.error(fullMessage, ...args);
        break;
    }
  }

  // Gesture logs
  gesture(message: string, ...args: any[]) {
    this.log('debug', 'GESTURE', message, ...args);
  }

  // Drag logs
  drag(message: string, ...args: any[]) {
    this.log('debug', 'DRAG', message, ...args);
  }

  // Image element logs
  image(message: string, ...args: any[]) {
    this.log('debug', 'IMAGE', message, ...args);
  }

  // Canvas logs
  canvas(message: string, ...args: any[]) {
    this.log('debug', 'CANVAS', message, ...args);
  }

  // Filter logs
  filter(message: string, ...args: any[]) {
    this.log('debug', 'FILTER', message, ...args);
  }

  // Export logs
  export(message: string, ...args: any[]) {
    this.log('info', 'EXPORT', message, ...args);
  }

  // Error logs
  error(message: string, ...args: any[]) {
    this.log('error', 'ERROR', message, ...args);
  }

  // Info logs
  info(message: string, ...args: any[]) {
    this.log('info', 'INFO', message, ...args);
  }

  // Enable/disable logging
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const logger = new Logger();
