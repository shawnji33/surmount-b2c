'use client';

import { SettingsModal, type BillingStep } from '@/components/SettingsModal';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';

type Tab = 'general' | 'privacy' | 'billing' | 'support';

// Standalone preview of the Settings modal (design review / Figma capture / flow handoff).
// `?tab=` selects the tab (billing | general | privacy); `?step=` renders the
// Billing tab in a specific state (default | cancel-confirm | scheduled | renew-confirm | toast).
function SettingsModalPreviewInner() {
  const params = useSearchParams();
  const step = (params.get('step') as BillingStep | null) ?? undefined;
  const tab = (params.get('tab') as Tab | null) ?? undefined;

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
      <SettingsModal onClose={() => {}} captureMode initialTab={tab} previewStep={step} />
    </div>
  );
}

export default function SettingsModalPreview() {
  return (
    <Suspense fallback={null}>
      <SettingsModalPreviewInner />
    </Suspense>
  );
}
