'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CaretDown, Check, CopySimple, File, FileCode, Sparkle, TerminalWindow, type Icon } from '@phosphor-icons/react';
import { ASSET_UNIVERSE } from '../../_data';
import type { PromptfolioDraft } from '../_data';
import type { ProcedureKind } from '../_lib/usePromptfolioSession';
import s from './ThinkingProcedure.module.css';

type ThinkingProcedureProps = {
  step: number;
  complete: boolean;
  draft: PromptfolioDraft;
  kind: ProcedureKind;
  addedTickers: string[];
};
type ToolRow = { id: string; icon: Icon; label: string; chip: string; detail: ReactNode };

const DIFFS = [
  { id: 'strategy', label: 'strategy.model', add: 24, del: 0, lines: [
    { tone: 'context', text: 'export const portfolio = {' },
    { tone: 'add', text: '+  allocation: normalizedWeights,' },
    { tone: 'add', text: '+  rebalance: cadence,' },
    { tone: 'context', text: '};' },
  ] },
  { id: 'rules', label: 'rules.config', add: 8, del: 2, lines: [
    { tone: 'context', text: 'riskControls: {' },
    { tone: 'delete', text: '-  stopLoss: null,' },
    { tone: 'add', text: '+  stopLoss: validatedStopLoss,' },
    { tone: 'context', text: '}' },
  ] },
  { id: 'backtest', label: 'backtest.report', add: 12, del: 0, lines: [
    { tone: 'context', text: 'window: "3y",' },
    { tone: 'add', text: '+  benchmark: "S&P 500",' },
    { tone: 'add', text: '+  includeDrawdown: true,' },
  ] },
] as const;

const ACTIVE_ROW_IDS = ['thinking', 'write', 'verify', 'read'] as const;
const PIXEL_DELAYS = [90, 0, 90, 180, 90, 180, 270, 180, 270];
const CODE_STREAM_WINDOW_MS = 4200;

const BACKTEST_LOG = [
  { tone: 'muted', text: '> fetching backtest logs…' },
  { tone: 'info', text: '> [INFO] Starting backtest' },
  { tone: 'detail', text: '> - Start date: 2023-08-24 00:00:00' },
  { tone: 'detail', text: '> - End date: 2026-08-24 00:00:00' },
  { tone: 'detail', text: '> - Initial capital: 10000.0' },
  { tone: 'detail', text: '> - Slippage: 0.0' },
  { tone: 'detail', text: '> - Fees: 0.0' },
  { tone: 'info', text: '> [INFO] Pulling source code' },
  { tone: 'info', text: '> [INFO] Source code cloned, running on historical data' },
  { tone: 'success', text: '> [INFO] Backtest completed successfully!' },
  { tone: 'info', text: '> [INFO] Storing backtest results' },
  { tone: 'success', text: '> Backtesting is completed' },
] as const;

function useElapsed(running: boolean) {
  const [deciseconds, setDeciseconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setDeciseconds((value) => value + 1), 100);
    return () => window.clearInterval(timer);
  }, [running]);

  const seconds = deciseconds / 10;
  return seconds < 60
    ? `${seconds.toFixed(1)}s`
    : `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(1)}s`;
}

function PixelLoader() {
  return (
    <span className={s.pixelLoader} aria-hidden="true">
      {PIXEL_DELAYS.map((delay, index) => (
        <span
          className={s.pixel}
          key={`${delay}-${index}`}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function StreamingLine({ text, active }: { text: string; active: boolean }) {
  const words = text.split(' ');
  const [count, setCount] = useState(active ? 0 : words.length);

  useEffect(() => {
    if (!active) {
      setCount(words.length);
      return;
    }

    setCount(0);
    const timer = window.setInterval(() => {
      setCount((current) => {
        if (current >= words.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 55);
    return () => window.clearInterval(timer);
  }, [active, text, words.length]);

  const streaming = active && count < words.length;
  return (
    <span>
      {words.slice(0, count).join(' ')}
      {count > 0 && ' '}
      {streaming && <span className={s.streamingCursor} aria-hidden="true" />}
    </span>
  );
}

function CodeFrame({
  title,
  language,
  copyText,
  children,
}: {
  title: string;
  language: string;
  copyText: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    void navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className={s.codeFrame}>
      <div className={s.codeHeader}>
        <span className={s.codeMeta}>
          <span className={s.codeTitle}>{title}</span>
          <span className={s.codeLanguage}>{language}</span>
        </span>
        <button type="button" className={s.copyButton} data-copied={copied} aria-label={`Copy ${title}`} onClick={copyCode}>
          {copied ? <Check weight="bold" aria-hidden="true" /> : <CopySimple aria-hidden="true" />}
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className={s.codeViewport}>{children}</div>
    </div>
  );
}

function highlightStrategyLine(line: string) {
  const tokenPattern = /("(?:\\.|[^"\\])*")|(\b(?:export|const|as)\b)|(\b\d+(?:\.\d+)?\b)/g;
  const parts: ReactNode[] = [];
  let cursor = 0;
  let match = tokenPattern.exec(line);

  while (match) {
    if (match.index > cursor) parts.push(line.slice(cursor, match.index));
    const token = match[0];
    const remainder = line.slice(match.index + token.length).trimStart();
    const className = match[2]
      ? s.tokenKeyword
      : match[3]
        ? s.tokenNumber
        : remainder.startsWith(':')
          ? s.tokenKey
          : s.tokenString;
    parts.push(<span className={className} key={`${match.index}-${token}`}>{token}</span>);
    cursor = match.index + token.length;
    match = tokenPattern.exec(line);
  }

  if (cursor < line.length) parts.push(line.slice(cursor));
  return parts;
}

function StreamingCodeLines({ source, active }: { source: string; active: boolean }) {
  const lines = source.split('\n');
  const [count, setCount] = useState(active ? 1 : lines.length);
  const linesRef = useRef<HTMLDivElement>(null);
  const lineDelay = Math.max(70, Math.floor(CODE_STREAM_WINDOW_MS / lines.length));

  useEffect(() => {
    setCount(active ? 1 : lines.length);
  }, [active, lines.length, source]);

  useEffect(() => {
    if (!active || count >= lines.length) return;
    const timer = window.setTimeout(() => {
      setCount((current) => Math.min(current + 1, lines.length));
    }, lineDelay);
    return () => window.clearTimeout(timer);
  }, [active, count, lineDelay, lines.length]);

  useEffect(() => {
    const viewport = linesRef.current?.parentElement;
    if (active && viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [active, count]);

  const streaming = active && count < lines.length;

  return (
    <div ref={linesRef} className={s.codeLines} aria-label="Generated strategy source" aria-busy={streaming}>
      {lines.slice(0, count).map((line, index) => (
        <div className={s.codeLine} data-active={active} key={`${index}-${line}`}>
          <span className={s.lineNumber} aria-hidden="true">{index + 1}</span>
          <code>
            {highlightStrategyLine(line)}
            {streaming && index === count - 1 && <span className={s.codeStreamCursor} aria-hidden="true" />}
          </code>
        </div>
      ))}
    </div>
  );
}

export function ThinkingProcedure({ step, complete, draft, kind, addedTickers }: ThinkingProcedureProps) {
  const [openRows, setOpenRows] = useState<Set<string>>(() => new Set(['thinking']));
  const [selectedDiff, setSelectedDiff] = useState<string | null>(null);
  const elapsed = useElapsed(!complete);
  const activeRowId = complete || step < 0
    ? null
    : ACTIVE_ROW_IDS[Math.min(step, ACTIVE_ROW_IDS.length - 1)];
  const strategyPayload = {
    recommendations: draft.rows.map((row) => {
      const asset = ASSET_UNIVERSE.find((candidate) => candidate.ticker === row.ticker);
      return {
        ticker: row.ticker,
        company_name: asset?.name ?? row.ticker,
        allocation: row.weight,
        relevance_score: row.weight >= 25 ? 5 : row.weight >= 15 ? 4 : 3,
        reasoning: `${asset?.name ?? row.ticker} adds ${asset?.industry.toLowerCase() ?? 'diversified'} exposure and receives a ${row.weight}% target weight based on its fit, quality profile, and contribution to portfolio diversification.`,
      };
    }),
    strategy_summary: draft.description,
    risk_assessment: draft.rules.stopLoss.enabled ? 'Medium' : 'Medium–High',
    rebalancing_frequency: draft.rules.rebalance.every,
    rebalancing_period: draft.rules.rebalance.unit.toLowerCase(),
  };
  const strategySource = `export const strategy = ${JSON.stringify(strategyPayload, null, 2)} as const;`;
  const strategyLineCount = strategySource.split('\n').length;
  const isAssetUpdate = kind === 'asset-update';
  const addedAssets = addedTickers.map((ticker) => (
    ASSET_UNIVERSE.find((asset) => asset.ticker === ticker)?.name ?? ticker
  ));
  const addedAssetLabel = addedAssets.join(', ') || 'the requested asset';
  const addedTickerLabel = addedTickers.join(', ') || 'new asset';
  const holdingsPatch = addedTickers
    .map((ticker) => `+ { ticker: "${ticker}", targetWeight: 15 }`)
    .join('\n');
  const assetUpdateDiffs = [
    { id: 'holdings', label: 'holdings.patch', add: Math.max(addedTickers.length, 1), del: 0, lines: [
      { tone: 'context', text: 'positions: [' },
      ...addedTickers.map((ticker) => ({ tone: 'add', text: `+  { ticker: "${ticker}", weight: 15 },` })),
      { tone: 'context', text: ']' },
    ] },
    { id: 'weights', label: 'weights.config', add: 5, del: 4, lines: [
      { tone: 'context', text: 'targetAllocation: {' },
      { tone: 'delete', text: '-  existing: 100,' },
      { tone: 'add', text: '+  existing: 85,' },
      ...addedTickers.map((ticker) => ({ tone: 'add', text: `+  ${ticker}: 15,` })),
      { tone: 'context', text: '}' },
    ] },
    { id: 'backtest', label: 'backtest.report', add: 6, del: 0, lines: [
      { tone: 'add', text: `+  holdingsChanged: ${Math.max(addedTickers.length, 1)},` },
      { tone: 'add', text: '+  weightsNormalized: true,' },
      { tone: 'add', text: '+  refreshMetrics: true,' },
    ] },
  ];

  useEffect(() => {
    if (step < 0) {
      setOpenRows(new Set());
      return;
    }
    setOpenRows(new Set([complete ? 'write' : ACTIVE_ROW_IDS[Math.min(step, ACTIVE_ROW_IDS.length - 1)]]));
  }, [complete, step]);

  const buildRows: ToolRow[] = [
    {
      id: 'thinking', icon: Sparkle, label: 'Thinking', chip: 'Planning the portfolio structure…',
      detail: <div className={s.mutedLines}><StreamingLine active={activeRowId === 'thinking'} text="Translate the prompt into theme, risk, and diversification constraints." /><StreamingLine active={activeRowId === 'thinking'} text="Plan a transparent allocation that can be refined in the builder." /></div>,
    },
    {
      id: 'write', icon: FileCode, label: `Write ${strategyLineCount} lines`, chip: 'strategy.model.ts',
      detail: <CodeFrame title="strategy.model.ts" language="TypeScript" copyText={strategySource}>
        <StreamingCodeLines source={strategySource} active={activeRowId === 'write'} />
      </CodeFrame>,
    },
    {
      id: 'verify', icon: TerminalWindow, label: 'Rebuild and verify', chip: 'backtest --window 3y',
      detail: <CodeFrame title="backtest.log" language="Execution log" copyText={BACKTEST_LOG.map((line) => line.text).join('\n')}>
        <div className={s.logLines} aria-label="Backtest execution log">{BACKTEST_LOG.map((line, index) => (
          <code className={s.logLine} data-active={activeRowId === 'verify'} data-tone={line.tone} key={line.text} style={{ animationDelay: `${index * 55}ms` }}>{line.text}</code>
        ))}</div>
      </CodeFrame>,
    },
    {
      id: 'read', icon: File, label: 'Read market data', chip: 'market-universe.json',
      detail: <div className={s.mutedLines}><StreamingLine active={activeRowId === 'read'} text={`${draft.rows.length} positions selected: ${draft.rows.map((row) => row.ticker).join(', ')}`} /><StreamingLine active={activeRowId === 'read'} text="Market metadata and historical series loaded." /></div>,
    },
  ];

  const assetUpdateRows: ToolRow[] = [
    {
      id: 'thinking', icon: Sparkle, label: 'Review request', chip: `Add ${addedAssetLabel}`,
      detail: <div className={s.mutedLines}><StreamingLine active={activeRowId === 'thinking'} text={`Match ${addedAssetLabel} to ${addedTickerLabel} in the supported asset universe.`} /><StreamingLine active={activeRowId === 'thinking'} text="Keep the existing strategy identity and risk rules unchanged." /></div>,
    },
    {
      id: 'write', icon: FileCode, label: `Add ${addedTickers.length || 1} holding`, chip: 'holdings.patch',
      detail: <CodeFrame title="holdings.patch" language="Portfolio diff" copyText={holdingsPatch}>
        <StreamingCodeLines source={holdingsPatch} active={activeRowId === 'write'} />
      </CodeFrame>,
    },
    {
      id: 'verify', icon: TerminalWindow, label: 'Rebalance weights', chip: 'normalize to 100%',
      detail: <div className={s.mutedLines}><StreamingLine active={activeRowId === 'verify'} text="Reserve a 15% target weight for the new position." /><StreamingLine active={activeRowId === 'verify'} text="Scale the existing holdings proportionally and normalize the portfolio to 100%." /></div>,
    },
    {
      id: 'read', icon: File, label: 'Refresh results', chip: 'backtest --changed-assets',
      detail: <div className={s.mutedLines}><StreamingLine active={activeRowId === 'read'} text="Recalculate return, drawdown, and diversification metrics." /><StreamingLine active={activeRowId === 'read'} text="Stage the updated allocation for the dashboard transition." /></div>,
    },
  ];
  const rows = isAssetUpdate ? assetUpdateRows : buildRows;
  const diffs = isAssetUpdate ? assetUpdateDiffs : DIFFS;

  function toggleRow(id: string) {
    setOpenRows((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const selected = diffs.find((diff) => diff.id === selectedDiff) ?? null;

  return (
    <section className={s.root} aria-label={isAssetUpdate ? 'Portfolio update procedure' : 'Portfolio build procedure'}>
      {!complete ? (
        <div className={s.runHeader}>
          <span className={s.liveStatus} role="status">
            <PixelLoader />
            <span className={s.shimmerLabel}>{isAssetUpdate ? 'Updating portfolio' : 'Building portfolio'}</span>
            <span className={s.elapsed}>{elapsed}</span>
          </span>
        </div>
      ) : (
        <span className={s.srOnly} role="status">{isAssetUpdate ? 'Portfolio update complete' : 'Portfolio build complete'}</span>
      )}

      <div className={s.procedureBody}>
        <div className={s.toolRows} data-loading={!complete}>
          {rows.slice(0, step < 0 ? 0 : Math.min(step + 1, rows.length)).map((row) => {
            const rowOpen = openRows.has(row.id);
            const IconComponent = row.icon;
            return (
              <div className={s.toolRow} data-has-icon="true" key={row.id}>
                <button type="button" className={s.toolButton} data-loading={!complete} data-has-caret={!complete} aria-expanded={rowOpen} onClick={() => toggleRow(row.id)}>
                  {complete ? <span className={s.iconSlot}>
                    <IconComponent className={s.toolIcon} weight="regular" aria-hidden="true" />
                    <CaretDown className={s.rowCaret} data-open={rowOpen} weight="bold" aria-hidden="true" />
                  </span> : <span className={s.iconSlot}>
                    <CaretDown className={s.rowCaret} data-loading-caret="true" data-open={rowOpen} weight="bold" aria-hidden="true" />
                  </span>}
                  <span className={s.toolLabel}>{row.label}</span>
                  <span className={s.inlineChip}>{row.chip}</span>
                </button>
                <div className={s.rowDisclosure} data-open={rowOpen}><div className={s.disclosureInner}><div className={s.rowDetail}>{row.detail}</div></div></div>
              </div>
            );
          })}
        </div>

        {step >= 4 && <div className={s.diffArea}>
          <div className={s.diffChips}>
            {diffs.map((diff) => <button key={diff.id} type="button" className={s.diffChip} data-selected={selectedDiff === diff.id} aria-expanded={selectedDiff === diff.id} onClick={() => setSelectedDiff((current) => current === diff.id ? null : diff.id)}>
              <span>{diff.label}</span><span className={s.addCount}>+{diff.add}</span>{diff.del > 0 && <span className={s.deleteCount}>−{diff.del}</span>}
            </button>)}
            <span className={s.moreFiles}>+2 more</span>
          </div>
          <div className={s.diffDisclosure} data-open={Boolean(selected)}><div className={s.disclosureInner}>
            {selected && <div className={s.diffPreview}><div className={s.diffPreviewHeader}>{selected.label}</div><div className={s.diffCode}>{selected.lines.map((line, index) => <div key={`${line.text}-${index}`} data-tone={line.tone}>{line.text}</div>)}</div></div>}
          </div></div>
        </div>}
      </div>
    </section>
  );
}
