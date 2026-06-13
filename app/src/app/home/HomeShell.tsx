'use client';

import { Sidebar } from '@/components/Sidebar';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

export function HomeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAgentsSurface = pathname.startsWith('/home/agents');

  return (
    <div className={[
      styles.dashboardLayout,
      isAgentsSurface ? styles.dashboardLayoutNoSidebar : '',
    ].filter(Boolean).join(' ')}>
      {!isAgentsSurface && <Sidebar />}
      <div className={[
        styles.mainWrapper,
        isAgentsSurface ? styles.mainWrapperNoSidebar : '',
      ].filter(Boolean).join(' ')}>
        {children}
      </div>
    </div>
  );
}
