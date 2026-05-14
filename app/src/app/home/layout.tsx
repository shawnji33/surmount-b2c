import { Sidebar } from '@/components/Sidebar';
import styles from './layout.module.css';

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
