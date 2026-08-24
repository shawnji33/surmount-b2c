'use client';

import { useRouter } from 'next/navigation';
import { BuilderHeader } from '../../_shared/BuilderHeader';
import { useToast } from '../../../_components/ToastProvider';
import { savePendingDraft } from '../../_shared/_lib/promptfolioHandoff';
import { usePromptfolioSession } from '../_lib/usePromptfolioSession';
import { ChatPanel } from './ChatPanel';
import { BacktestDashboard } from './BacktestDashboard';
import s from './BuildingView.module.css';

export function BuildingView({ initialInput, onBack }: { initialInput: string | null; onBack: () => void }) {
  const router = useRouter();
  const { showToast } = useToast();
  const session = usePromptfolioSession(initialInput);

  function handleContinue() {
    if (!session.draft) return;
    savePendingDraft({
      name: session.draft.name,
      description: session.draft.description,
      rows: session.draft.rows,
      rules: session.draft.rules,
    });
    router.push('/home/builder/etf?step=build');
  }

  function handleSave() {
    showToast(`"${session.draft?.name ?? 'Draft'}" has been saved`);
  }

  return (
    <div className={s.root}>
      <BuilderHeader
        title="Promptfolio"
        titleBadge={
          <span className={[s.badge, 'ai-gradient-border'].join(' ')}>
            <span className="ai-gradient-text">Surmount AI</span>
          </span>
        }
        onSave={handleSave}
        saveDisabled={!session.draft}
        onDeploy={handleContinue}
        onClose={onBack}
      />

      <div className={s.columns}>
        <div className={s.chatColumn}>
          <ChatPanel
            turns={session.turns}
            isThinking={session.isThinking}
            draft={session.draft}
            revealStage={session.revealStage}
            onSubmit={session.submit}
            onReset={session.reset}
          />
        </div>

        <div className={s.dashboardColumn}>
          <BacktestDashboard
            draft={session.draft}
            revealStage={session.revealStage}
            templateName={session.matchedTemplateName}
            onRemoveHolding={session.removeHolding}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </div>
  );
}
