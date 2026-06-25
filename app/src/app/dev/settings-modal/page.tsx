'use client';

import { SettingsModal, type BillingStep } from '@/components/SettingsModal';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';

// Standalone preview of the Settings modal (design review / Figma capture / flow handoff).
// `?step=` renders the Billing tab in a specific state (default | cancel-confirm | scheduled | renew-confirm | toast).
function SettingsModalPreviewInner() {
  const params = useSearchParams();
  const step = (params.get('step') as BillingStep | null) ?? undefined;

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
      <SettingsModal onClose={() => {}} captureMode previewStep={step} />
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
