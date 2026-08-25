'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import Image from 'next/image';
import { BuilderHeader } from '../../_shared/BuilderHeader';
import { useToast } from '../../../_components/ToastProvider';
import { usePromptfolioSession } from '../_lib/usePromptfolioSession';
import type { PromptfolioDraft } from '../_data';
import { ChatPanel } from './ChatPanel';
import { BacktestDashboard } from './BacktestDashboard';
import s from './BuildingView.module.css';

const DEFAULT_CHAT_WIDTH = 360;
const MIN_CHAT_WIDTH = 320;
const MAX_CHAT_WIDTH = 480;

function getChatMaxWidth(container: HTMLDivElement | null) {
  if (!container) return MAX_CHAT_WIDTH;
  return Math.max(MIN_CHAT_WIDTH, Math.min(MAX_CHAT_WIDTH, Math.floor(container.clientWidth * 0.4)));
}

export function BuildingView({
  initialInput,
  startSession,
  onBack,
  onReview,
}: {
  initialInput: string | null;
  startSession: boolean;
  onBack: () => void;
  onReview: (draft: PromptfolioDraft) => void;
}) {
  const session = usePromptfolioSession(initialInput, startSession);
  const { showToast } = useToast();
  const annotationIdRef = useRef(0);
  const columnsRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null);
  const [promptAnnotations, setPromptAnnotations] = useState<Array<{ id: number; text: string }>>([]);
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const [maxChatWidth, setMaxChatWidth] = useState(MAX_CHAT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const columns = columnsRef.current;
    if (!columns) return undefined;

    const updateBounds = () => {
      if (!window.matchMedia('(min-width: 1200px) and (hover: hover) and (pointer: fine)').matches) return;
      const nextMax = getChatMaxWidth(columns);
      setMaxChatWidth(nextMax);
      setChatWidth((current) => Math.min(current, nextMax));
    };

    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(columns);
    return () => observer.disconnect();
  }, []);

  function startResize(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    if (!window.matchMedia('(min-width: 1200px) and (hover: hover) and (pointer: fine)').matches) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: chatWidth };
    setIsResizing(true);
  }

  function moveResize(event: PointerEvent<HTMLDivElement>) {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    const nextMax = getChatMaxWidth(columnsRef.current);
    const nextWidth = Math.min(nextMax, Math.max(MIN_CHAT_WIDTH, resize.startWidth + event.clientX - resize.startX));
    setMaxChatWidth(nextMax);
    setChatWidth(Math.round(nextWidth));
  }

  function stopResize(event: PointerEvent<HTMLDivElement>) {
    if (resizeRef.current?.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    setIsResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function resetChatWidth() {
    setChatWidth(Math.min(DEFAULT_CHAT_WIDTH, getChatMaxWidth(columnsRef.current)));
  }

  function handleResizeKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 24 : 8;
    let nextWidth: number | null = null;
    if (event.key === 'ArrowLeft') nextWidth = chatWidth - step;
    if (event.key === 'ArrowRight') nextWidth = chatWidth + step;
    if (event.key === 'Home') nextWidth = MIN_CHAT_WIDTH;
    if (event.key === 'End') nextWidth = maxChatWidth;
    if (event.key === 'Enter') nextWidth = Math.min(DEFAULT_CHAT_WIDTH, maxChatWidth);
    if (nextWidth === null) return;
    event.preventDefault();
    setChatWidth(Math.min(maxChatWidth, Math.max(MIN_CHAT_WIDTH, nextWidth)));
  }

  function handleAddPromptAnnotation(text: string) {
    annotationIdRef.current += 1;
    setPromptAnnotations((current) => [...current, { id: annotationIdRef.current, text }]);
  }

  function handleRemovePromptAnnotation(id: number) {
    setPromptAnnotations((current) => current.filter((annotation) => annotation.id !== id));
  }

  function handleSubmit(text: string) {
    const request = [text.trim(), ...promptAnnotations.map((annotation) => annotation.text)]
      .filter(Boolean)
      .join('\n');
    if (!request) return;
    session.submit(request);
    setPromptAnnotations([]);
  }

  function handleReset() {
    setPromptAnnotations([]);
    session.reset();
  }

  function handleReview() {
    if (!session.draft) return;
    onReview(session.draft);
  }

  function handleRemoveHolding(ticker: string) {
    const index = session.draft?.rows.findIndex((row) => row.ticker === ticker) ?? -1;
    const removed = index >= 0 ? session.draft?.rows[index] : undefined;
    if (!removed) return;

    session.removeHolding(ticker);
    showToast({
      message: `${ticker} removed from holdings`,
      durationMs: 5000,
      action: {
        label: 'Undo',
        onClick: () => session.restoreHolding(removed.ticker, removed.weight, index),
      },
    });
  }

  return (
    <div className={s.root}>
      <BuilderHeader
        title="Promptfolio"
        titleBadge={
          <Image
            className={s.badge}
            src="/assets/badges/ai-badge.svg"
            alt="Surmount AI"
            width={111}
            height={26}
          />
        }
        onSave={handleReview}
        saveDisabled={session.isThinking || !session.draft || session.revealStage < 4}
        onDeploy={handleReview}
        deployDisabled={session.isThinking || !session.draft || session.revealStage < 4}
        onClose={onBack}
      />

      <div
        ref={columnsRef}
        className={s.columns}
        data-resizing={isResizing}
        style={{ '--conversation-width': `${chatWidth}px` } as CSSProperties}
      >
        <div className={s.chatColumn} id="promptfolio-conversation-panel">
          <ChatPanel
            turns={session.turns}
            isThinking={session.isThinking}
            draft={session.draft}
            revealStage={session.revealStage}
            onSubmit={handleSubmit}
            onReset={handleReset}
            promptAnnotations={promptAnnotations}
            onRemovePromptAnnotation={handleRemovePromptAnnotation}
          />
          <div
            className={s.resizeHandle}
            role="separator"
            aria-label="Resize conversation panel. Drag left or right, or use the arrow keys. Double-click to reset."
            aria-controls="promptfolio-conversation-panel"
            aria-orientation="vertical"
            aria-valuemin={MIN_CHAT_WIDTH}
            aria-valuemax={maxChatWidth}
            aria-valuenow={chatWidth}
            aria-valuetext={`${chatWidth} pixels`}
            tabIndex={0}
            title="Drag left or right to resize. Double-click to reset to 360 pixels."
            onPointerDown={startResize}
            onPointerMove={moveResize}
            onPointerUp={stopResize}
            onPointerCancel={stopResize}
            onDoubleClick={resetChatWidth}
            onKeyDown={handleResizeKeyDown}
          />
        </div>

        <div className={s.dashboardColumn}>
          <BacktestDashboard
            draft={session.draft}
            revealStage={session.revealStage}
            isThinking={session.isThinking}
            onAddHolding={session.addHolding}
            onUpdateHoldingWeight={session.updateHoldingWeight}
            onRemoveHolding={handleRemoveHolding}
            onUpdateRules={session.updateRules}
            onAddPromptAnnotation={handleAddPromptAnnotation}
          />
        </div>
      </div>
    </div>
  );
}
