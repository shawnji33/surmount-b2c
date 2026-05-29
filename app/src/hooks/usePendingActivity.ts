'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMockActivityItems } from '@/lib/mock-activity';
import type { ActivityItem } from '@/types/activity';
import { isPendingActivityStatus } from '@/types/activity';

type UsePendingActivityResult = {
  items: ActivityItem[];
  pendingCount: number;
  isLoading: boolean;
  refetch: () => void;
};

export function usePendingActivity(): UsePendingActivityResult {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(() => {
    setItems(getMockActivityItems());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refetch();

    const pollingId = window.setInterval(() => {
      refetch();
    }, 30_000);

    return () => window.clearInterval(pollingId);
  }, [refetch]);

  const pendingCount = useMemo(
    () => items.filter((item) => isPendingActivityStatus(item.status)).length,
    [items],
  );

  return {
    items,
    pendingCount,
    isLoading,
    refetch,
  };
}
