'use client';

import { Suspense } from 'react';
import { BuilderWorkspace, type BuilderTab } from '../_shared/BuilderWorkspace';

const TABS: readonly BuilderTab[] = ['Strategy builder', 'Backtest'];

export default function EtfBuilderPage() {
  return (
    <Suspense fallback={null}>
      <BuilderWorkspace title="ETF Builder" tabs={TABS} />
    </Suspense>
  );
}
