import { vi, beforeEach, afterEach } from 'vitest';
import devLogger from './devLogger';

describe('devLogger', () => {
  // Keep original console methods so we can verify they still get called
  const origLog = console.log;
  const origError = console.error;
  const origWarn = console.warn;
  const origInfo = console.info;

  beforeEach(() => {
    devLogger.install();
  });

  afterEach(() => {
    devLogger.clear();
    devLogger.uninstall();
    // Restore originals just in case
    console.log = origLog;
    console.error = origError;
    console.warn = origWarn;
    console.info = origInfo;
  });

  it('captures console.log entries', () => {
    console.log('hello from test');
    const entries = devLogger.getEntries();
    expect(entries.length).toBeGreaterThanOrEqual(1);
    const match = entries.find((e) => e.message.includes('hello from test'));
    expect(match).toBeDefined();
    expect(match!.level).toBe('log');
  });

  it('captures console.error entries', () => {
    console.error('test error');
    const entries = devLogger.getEntries();
    const match = entries.find((e) => e.message.includes('test error'));
    expect(match).toBeDefined();
    expect(match!.level).toBe('error');
  });

  it('captures console.warn entries', () => {
    console.warn('test warning');
    const entries = devLogger.getEntries();
    const match = entries.find((e) => e.message.includes('test warning'));
    expect(match).toBeDefined();
    expect(match!.level).toBe('warn');
  });

  it('captures console.info entries', () => {
    console.info('test info');
    const entries = devLogger.getEntries();
    const match = entries.find((e) => e.message.includes('test info'));
    expect(match).toBeDefined();
    expect(match!.level).toBe('info');
  });

  it('extracts error stack into details', () => {
    const err = new Error('boom');
    console.error('failed:', err);
    const entries = devLogger.getEntries();
    const match = entries.find((e) => e.message.includes('failed:'));
    expect(match).toBeDefined();
    expect(match!.details).toContain('boom');
  });

  it('notifies subscribers of new entries', () => {
    const listener = vi.fn();
    devLogger.subscribe(listener);

    console.log('notify test');

    expect(listener).toHaveBeenCalled();
    const call = listener.mock.calls.find(
      (c: unknown[]) => (c[0] as { message: string }).message.includes('notify test')
    );
    expect(call).toBeDefined();
  });

  it('allows unsubscribing', () => {
    const listener = vi.fn();
    const unsub = devLogger.subscribe(listener);
    unsub();

    const countBefore = listener.mock.calls.length;
    console.log('after unsub');

    // Should not have been called again
    expect(listener.mock.calls.length).toBe(countBefore);
  });

  it('clears all entries', () => {
    console.log('one');
    console.log('two');
    expect(devLogger.getEntries().length).toBeGreaterThanOrEqual(2);

    devLogger.clear();
    expect(devLogger.getEntries()).toHaveLength(0);
  });

  it('formats objects as JSON', () => {
    console.log('data', { foo: 'bar', num: 42 });
    const entries = devLogger.getEntries();
    const match = entries.find((e) => e.message.includes('foo'));
    expect(match).toBeDefined();
    expect(match!.message).toContain('"bar"');
  });

  it('does not capture after uninstall', () => {
    devLogger.uninstall();
    console.log('invisible');
    expect(devLogger.getEntries()).toHaveLength(0);
    // Re-install for afterEach
    devLogger.install();
  });
});
