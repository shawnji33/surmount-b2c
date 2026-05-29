import { Sidebar } from '@/components/Sidebar';
import type { Metadata } from 'next';
import styles from '../home/layout.module.css';

export const metadata: Metadata = {
  title: 'Surmount — Activity',
};

export default function ActivityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <div className={styles.mainWrapper}>
        {children}
      </div>
    </div>
  );
}
