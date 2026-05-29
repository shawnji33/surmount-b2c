import { cx } from '@/utils/cx';

interface DotProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'size-1.5', md: 'size-2', lg: 'size-2.5' };

export const Dot = ({ size = 'sm', className }: DotProps) => (
  <span className={cx('inline-block rounded-full bg-current', sizes[size], className)} />
);
