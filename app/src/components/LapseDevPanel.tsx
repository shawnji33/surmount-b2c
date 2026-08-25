'use client';

import { useEffect, useState, type ReactNode } from 'react';

// The panel UI for the Lapse animation inspector. The global clock patch it
// drives is installed far earlier, in src/instrumentation-client.ts.
//
// The NODE_ENV guard has to live *inside* this client module, not at the call
// site in app/layout.tsx. Referencing a client component from a Server
// Component registers it as a client entry point, so the bundler ships it even
// when the server-side render is dead code — an earlier version guarded only in
// layout.tsx and still put 327 KB of panel into the production bundle. Here the
// comparison is statically replaced at build time and the dynamic import below
// becomes unreachable, so @aiforui/lapse drops out of the production graph.
export function LapseDevPanel() {
  const [panel, setPanel] = useState<ReactNode>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    let cancelled = false;
    void import('@aiforui/lapse')
      .then(({ Lapse }) => {
        if (!cancelled) setPanel(<Lapse />);
      })
      .catch(() => {
        // Never let the inspector break the app.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return panel;
}
