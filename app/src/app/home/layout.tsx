import { Sidebar } from '@/components/Sidebar';
import type { Metadata } from 'next';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Surmount — Home',
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <div className={styles.mainWrapper}>
        {children}
      </div>
    </div>
  );
}
