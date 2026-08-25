'use client';

import { useState } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { DeployOverlay } from '../../_shared/DeployOverlay';
import { DeployStep } from '../../_shared/DeployStep';
import { useDeploySuccess } from '../../_shared/useDeploySuccess';
import { clearPromptfolioReview } from '../_lib/promptfolioReviewStorage';
import type { PromptfolioDraft } from '../_data';
import s from './SummaryView.module.css';

export function SummaryView({
  draft,
  onBack,
}: {
  draft: PromptfolioDraft;
  onBack: () => void;
}) {
  const { handleDeployOverlayClose } = useDeploySuccess();
  const [deployOpen, setDeployOpen] = useState(false);
  const totalWeight = draft.rows.reduce((sum, row) => sum + row.weight, 0);

  return (
    <div className={s.root}>
      <main className={s.review}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          fullWidth={false}
          iconLeading={<ArrowLeft weight="regular" aria-hidden="true" />}
          onClick={onBack}
        >
          Back
        </Button>

        <div>
          <DeployStep
            name={draft.name}
            description={draft.description}
            rows={draft.rows}
            totalWeight={totalWeight}
            rules={draft.rules}
            onDeploy={() => setDeployOpen(true)}
          />
        </div>
      </main>

      {deployOpen && (
        <DeployOverlay
          strategyName={draft.name}
          onClose={() => {
            setDeployOpen(false);
            clearPromptfolioReview();
            handleDeployOverlayClose(draft.name);
          }}
        />
      )}
    </div>
  );
}
