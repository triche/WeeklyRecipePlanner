import React, { useEffect, useRef, useState, useCallback } from 'react';
import devLogger, { LogEntry, LogLevel } from '../services/devLogger';

interface DevConsoleProps {
  /** Whether the console panel is visible */
  visible: boolean;
  /** Callback to close / hide the console */
  onClose: () => void;
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  log: 'LOG',
  info: 'INFO',
  warn: 'WARN',
  error: 'ERR',
};

const LEVEL_EMOJIS: Record<LogLevel, string> = {
  log: '📝',
  info: 'ℹ️',
  warn: '⚠️',
  error: '🔴',
};

const DevConsole: React.FC<DevConsoleProps> = ({ visible, onClose }) => {
  const [entries, setEntries] = useState<LogEntry[]>(() => devLogger.getEntries());
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = devLogger.subscribe((entry) => {
      if (entry.id === -1) {
        // clear sentinel
        setEntries([]);
        return;
      }
      setEntries((prev) => [...prev, entry]);
    });
    return unsubscribe;
  }, []);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries]);

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    devLogger.clear();
    setExpandedIds(new Set());
  }, []);

  if (!visible) return null;

  const filtered =
    filter === 'all' ? entries : entries.filter((e) => e.level === filter);

  const errorCount = entries.filter((e) => e.level === 'error').length;
  const warnCount = entries.filter((e) => e.level === 'warn').length;

  return (
    <div className="dev-console" data-testid="dev-console">
      {/* Toolbar */}
      <div className="dev-console-toolbar">
        <span className="dev-console-title">🛠 Dev Console</span>

        <div className="dev-console-filters">
          {(['all', 'log', 'info', 'warn', 'error'] as const).map((level) => (
            <button
              key={level}
              className={`dev-console-filter-btn ${filter === level ? 'active' : ''} ${level}`}
              onClick={() => setFilter(level)}
              aria-label={`Filter ${level}`}
            >
              {level === 'all' ? 'All' : LEVEL_LABELS[level]}
              {level === 'error' && errorCount > 0 && (
                <span className="dev-console-badge error">{errorCount}</span>
              )}
              {level === 'warn' && warnCount > 0 && (
                <span className="dev-console-badge warn">{warnCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="dev-console-actions">
          <button className="dev-console-action-btn" onClick={handleClear} title="Clear console">
            🗑️ Clear
          </button>
          <button className="dev-console-action-btn" onClick={onClose} title="Close console">
            ✕
          </button>
        </div>
      </div>

      {/* Log entries */}
      <div className="dev-console-entries">
        {filtered.length === 0 && (
          <div className="dev-console-empty">No log entries{filter !== 'all' ? ` for "${filter}"` : ''}.</div>
        )}
        {filtered.map((entry) => (
          <div
            key={entry.id}
            className={`dev-console-entry ${entry.level}`}
            onClick={entry.details ? () => toggleExpand(entry.id) : undefined}
            role={entry.details ? 'button' : undefined}
            tabIndex={entry.details ? 0 : undefined}
            onKeyDown={
              entry.details
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') toggleExpand(entry.id);
                  }
                : undefined
            }
          >
            <span className="dev-console-entry-icon">{LEVEL_EMOJIS[entry.level]}</span>
            <span className="dev-console-entry-time">
              {entry.timestamp.toLocaleTimeString()}
            </span>
            <span className="dev-console-entry-msg">{entry.message}</span>
            {entry.details && (
              <span className="dev-console-entry-expand">
                {expandedIds.has(entry.id) ? '▼' : '▶'}
              </span>
            )}
            {entry.details && expandedIds.has(entry.id) && (
              <pre className="dev-console-entry-details">{entry.details}</pre>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default DevConsole;
