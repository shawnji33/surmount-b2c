'use client';

import { useMemo } from 'react';
import type { Agent } from '../nodes/types';
import {
  projectUpcoming,
  nowEvent,
  pastEvents,
  type TimelineEvent,
  type TimeGroup,
} from './timeline';

const GROUP_ORDER: TimeGroup[] = ['Upcoming', 'Now', 'Today', 'Earlier'];

export interface TimelineGroup {
  group: TimeGroup;
  events: TimelineEvent[];
}

/* merges projected-future + real-past events into one sorted, grouped feed.
   Draft → projected only; Active → now + past accrue below the upcoming check. */
export function useTimeline(agent: Agent, activated: boolean, asOf?: Date): TimelineGroup[] {
  return useMemo(() => {
    const events: TimelineEvent[] = [];
    if (activated) {
      // keep the single next projected check visible at the top
      events.push(projectUpcoming(agent, asOf)[0]);
      events.push(nowEvent(agent, asOf));
      events.push(...pastEvents(agent));
    } else {
      events.push(...projectUpcoming(agent, asOf));
    }

    return GROUP_ORDER.map((group) => ({
      group,
      events: events.filter((e) => e.group === group),
    })).filter((g) => g.events.length > 0);
  }, [agent, activated, asOf]);
}
