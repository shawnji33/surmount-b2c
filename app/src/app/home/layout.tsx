import type { Metadata } from 'next';
import { HomeShell } from './HomeShell';

export const metadata: Metadata = {
  title: 'Surmount — Home',
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <HomeShell>{children}</HomeShell>;
}
