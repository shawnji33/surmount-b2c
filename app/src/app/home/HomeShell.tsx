'use client';

import { Sidebar } from '@/components/Sidebar';
import { usePathname, useSearchParams } from 'next/navigation';
import { ToastProvider } from './_components/ToastProvider';
import styles from './layout.module.css';

export function HomeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAgentsSurface = pathname.startsWith('/home/agents');
  // The "Investing Agent" home-screen layout explorations are alternate hierarchies for the
  // same focused, immersive landing surface the real /home/agents welcome screen already is —
  // so they get the same sidebar-free treatment.
  const isAgentHomeExploration = pathname.startsWith('/home/playground/agent-home');
  // The "choose a plan" demo page is a full-screen takeover (closed via an X, not part of the
  // dashboard chrome) with its own edge-to-edge shell, so it needs zero ancestor padding —
  // unlike the agents surface, which still wants the 32px margin.
  const isPlansSurface = pathname === '/home/get-started/plans';
  // "Choose a builder" is the same kind of full-screen decision takeover as choose-a-plan — a
  // two-panel layout that needs the full viewport width, not the dashboard's 32px gutters.
  const isChooseBuilderSurface = pathname === '/home/builder/choose';
  // Promptfolio's landing hero is the same kind of immersive, centered surface as /home/agents —
  // a dashboard sidebar would compete with the centered composer for attention. Once a
  // conversation starts, its building and summary stages become real workspace screens (backtest,
  // holdings, review) and get the normal sidebar + builder chrome back, same as ETF Builder.
  const promptfolioStage = searchParams.get('stage');
  const isPromptfolioWorkspace = pathname === '/home/builder/promptfolio'
    && (promptfolioStage === 'building' || promptfolioStage === 'summary');
  const isPromptfolioSurface = pathname === '/home/builder/promptfolio' && !isPromptfolioWorkspace;
  const isFullBleedSurface = isAgentsSurface || isAgentHomeExploration || isPlansSurface
    || isPromptfolioSurface || isChooseBuilderSurface;

  return (
    <ToastProvider>
      <div className={[
        styles.dashboardLayout,
        isFullBleedSurface ? styles.dashboardLayoutNoSidebar : '',
      ].filter(Boolean).join(' ')}>
        {!isFullBleedSurface && <Sidebar />}
        <div className={[
          styles.mainWrapper,
          (isAgentsSurface || isAgentHomeExploration || isPromptfolioSurface) ? styles.mainWrapperNoSidebar : '',
          (isPlansSurface || isChooseBuilderSurface) ? styles.mainWrapperFullBleed : '',
        ].filter(Boolean).join(' ')}>
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
