/** Dev Logger — captures console output and global errors for the DevConsole. */

export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: number;
  timestamp: Date;
  level: LogLevel;
  message: string;
  /** Stringified extra arguments / stack traces */
  details?: string;
}

type Listener = (entry: LogEntry) => void;

class DevLogger {
  private entries: LogEntry[] = [];
  private listeners = new Set<Listener>();
  private nextId = 1;
  private installed = false;
  private originals: Record<LogLevel, (...args: unknown[]) => void> = {} as never;

  /** Maximum entries kept in memory */
  private readonly maxEntries = 500;

  /** Install console & global-error interception. Safe to call multiple times. */
  install(): void {
    if (this.installed) return;
    this.installed = true;

    // Patch console methods
    for (const level of ['log', 'info', 'warn', 'error'] as LogLevel[]) {
      // eslint-disable-next-line no-console
      this.originals[level] = console[level].bind(console);
      // eslint-disable-next-line no-console
      console[level] = (...args: unknown[]) => {
        this.push(level, args);
        this.originals[level](...args);
      };
    }

    // Capture unhandled errors
    window.addEventListener('error', this.handleError);
    window.addEventListener('unhandledrejection', this.handleRejection);
  }

  /** Remove all interception — used in tests. */
  uninstall(): void {
    if (!this.installed) return;
    this.installed = false;

    for (const level of ['log', 'info', 'warn', 'error'] as LogLevel[]) {
      if (this.originals[level]) {
        // eslint-disable-next-line no-console
        console[level] = this.originals[level];
      }
    }

    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.handleRejection);
  }

  /** Subscribe to new log entries. Returns an unsubscribe function. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Return a snapshot of all current entries. */
  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  /** Clear all stored entries and notify listeners with a sentinel. */
  clear(): void {
    this.entries = [];
    // Notify with a special "clear" entry so the UI resets
    this.notify({
      id: -1,
      timestamp: new Date(),
      level: 'info',
      message: '--- Console cleared ---',
    });
  }

  // ---- internals ----

  private push(level: LogLevel, args: unknown[]): void {
    const message = args
      .map((a) => (typeof a === 'string' ? a : formatValue(a)))
      .join(' ');

    const details = args
      .filter((a) => a instanceof Error)
      .map((e) => (e as Error).stack ?? String(e))
      .join('\n');

    const entry: LogEntry = {
      id: this.nextId++,
      timestamp: new Date(),
      level,
      message,
      details: details || undefined,
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
    this.notify(entry);
  }

  private notify(entry: LogEntry): void {
    for (const l of this.listeners) {
      try {
        l(entry);
      } catch {
        // Don't let a bad listener break logging
      }
    }
  }

  private handleError = (event: ErrorEvent): void => {
    const details = event.error?.stack ?? `${event.filename}:${event.lineno}:${event.colno}`;
    const entry: LogEntry = {
      id: this.nextId++,
      timestamp: new Date(),
      level: 'error',
      message: `Uncaught: ${event.message}`,
      details,
    };
    this.entries.push(entry);
    this.notify(entry);
  };

  private handleRejection = (event: PromiseRejectionEvent): void => {
    const reason = event.reason;
    const message =
      reason instanceof Error ? reason.message : String(reason);
    const details =
      reason instanceof Error ? reason.stack : undefined;

    const entry: LogEntry = {
      id: this.nextId++,
      timestamp: new Date(),
      level: 'error',
      message: `Unhandled Promise Rejection: ${message}`,
      details,
    };
    this.entries.push(entry);
    this.notify(entry);
  };
}

function formatValue(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/** Singleton logger instance */
const devLogger = new DevLogger();
export default devLogger;
