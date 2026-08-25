'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '../../_components/ToastProvider';

export function useDeploySuccess() {
  const router = useRouter();
  const { showToast } = useToast();

  function handleDeployOverlayClose(strategyName: string) {
    router.push('/home/builder');
    showToast(`"${strategyName || 'Strategy'}" has been deployed`);
  }

  return { handleDeployOverlayClose };
}
