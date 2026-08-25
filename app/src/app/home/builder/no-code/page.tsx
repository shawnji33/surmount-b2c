'use client';

import { Suspense } from 'react';
import { BuilderWorkspace, type BuilderTab } from '../_shared/BuilderWorkspace';
import { LogicCanvas } from './_logic/LogicCanvas';

const TABS: readonly BuilderTab[] = ['Strategy builder', 'Logic builder', 'Backtest'];

export default function NoCodeBuilderPage() {
  return (
    <Suspense fallback={null}>
      <BuilderWorkspace title="No-Code Builder" tabs={TABS} logicContent={({ selectedAssets }) => <LogicCanvas selectedAssets={selectedAssets} />} />
    </Suspense>
  );
}
