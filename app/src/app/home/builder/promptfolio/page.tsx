'use client';

import { Suspense } from 'react';
import { PromptfolioBuilder } from './PromptfolioBuilder';

export default function PromptfolioPage() {
  return (
    <Suspense fallback={null}>
      <PromptfolioBuilder />
    </Suspense>
  );
}
