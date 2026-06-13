'use client';

import {
  ArrowRight,
  Bell,
  Buildings,
  CalendarCheck,
  ChartLineUp,
  CheckCircle,
  HouseLine,
  MagnifyingGlass,
  Notebook,
  Plus,
  ShieldCheck,
  Sparkle,
  UsersThree,
} from '@phosphor-icons/react';
import styles from './page.module.css';

const bookStats = [
  { label: 'Total AUM', value: '$121.4M', detail: '+$480K', sub: 'vs last week', tone: 'positive' },
  { label: 'Weekly Return', value: '+0.40%', detail: '+0.12%', sub: 'vs S&P 500', tone: 'positive' },
  { label: 'Clients', value: '85', detail: '3 new this quarter', sub: '', tone: 'neutral' },
  { label: 'Open Tasks', value: '5', detail: '2 overdue', sub: '', tone: 'neutral' },
  { label: 'Alerts', value: '4', detail: '2 drift - 1 cash - 1 risk', sub: '', tone: 'neutral' },
];

const meetings = [
  { time: '10:00 AM', client: 'Jennifer Walsh', type: 'Annual Review', meta: '60 min - Video call', tone: 'brand' },
  { time: '02:00 PM', client: 'Michael Torres', type: 'Portfolio Review', meta: '45 min - Video call', tone: 'warning' },
  { time: '03:00 PM', client: 'Sarah Kim', type: 'Client onboarding', meta: '60 min - Video call', tone: 'gray' },
];

const tasks = [
  { label: 'Follow up on Kim estate planning docs', meta: 'Overdue 2 days - From Feb 15 meeting', status: 'Overdue', tone: 'danger', done: false },
  { label: 'Send Q4 report to Jennifer Walsh', meta: 'Completed - From Jan 22 meeting', status: 'Done', tone: 'done', done: true },
  { label: 'Review Michael bond reallocation proposal', meta: 'Due today - From Feb 18 meeting', status: 'Due today', tone: 'warning', done: false },
  { label: 'Rebalance Williams equity allocation', meta: 'Due Mar 8 - Drift alert triggered', status: '', tone: 'neutral', done: false },
  { label: 'Prepare Q1 market update email', meta: 'Due Mar 10 - 12 clients', status: '', tone: 'neutral', done: false },
];

const insights = [
  {
    client: 'Michael Doe',
    detail: 'Equity allocation drifted ',
    emphasis: '+12%',
    suffix: ' above target. Rebalancing recommended before today meeting.',
    action: 'Review portfolio',
  },
  {
    client: 'Sarah Kim',
    detail: '',
    emphasis: '$180K',
    suffix: ' cash sitting uninvested for 47 days. She mentioned rate sensitivity in onboarding.',
    action: 'Add to task',
  },
  {
    client: 'Robert Williams',
    detail: 'Bond position down ',
    emphasis: '6.2%',
    suffix: ' this month. He mentioned rate concerns in your last meeting.',
    action: 'Add to task',
  },
  {
    client: 'Jennifer Walsh',
    detail: '10-year anniversary as a client on March 12. Consider a personalized note.',
    emphasis: '',
    suffix: '',
    action: 'Draft an email',
  },
];

const activities = [
  ['AI Meeting Summary generated for Jennifer Walsh - Jan 22 meeting', '2h ago'],
  ["Trade executed - NVDA $12,400 for Michael's account", 'Yesterday'],
  ['Drift alert triggered for Michael Torres', 'Yesterday'],
  ['Document uploaded by Sarah Kim - estate plan draft', 'Mar 2'],
  ['Follow-up email sent to Robert Williams re: Q4 performance', 'Mar 1'],
];

const milestones = [
  { month: 'Mar', day: '17', client: 'Jennifer Walsh', detail: '10-year client anniversary' },
  { month: 'Apr', day: '22', client: 'Robert Williams', detail: 'Birthday - turning 58' },
  { month: 'May', day: '10', client: 'Margaret Chen', detail: 'Retirement date - 8 months out' },
  { month: 'Jun', day: '30', client: 'David & Priya Park', detail: 'Wedding anniversary - 15 years' },
];

const navItems = [
  { label: 'Home', icon: HouseLine, active: true },
  { label: 'Clients', icon: UsersThree },
  { label: 'Meetings', icon: CalendarCheck },
  { label: 'Market', icon: Buildings },
];

function SurmountMark() {
  return (
    <div className={styles.logoMark} aria-hidden="true">
      <img src="/assets/illustrations/surmount-logo-mark-blue.png" alt="" />
    </div>
  );
}

function SectionAction({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className={styles.sectionAction}>
      {children}
      <ArrowRight weight="regular" aria-hidden="true" />
    </button>
  );
}

export default function B2BAdvisorDashboard() {
  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Advisor navigation">
        <div className={styles.sidebarTop}>
          <a href="/b2b" className={styles.logoButton} aria-label="Surmount B2B home">
            <SurmountMark />
          </a>

          <nav>
            <ul className={styles.navList}>
              {navItems.map(({ label, icon: Icon, active }) => (
                <li className={styles.navItem} key={label}>
                  <a
                    className={[styles.navButton, active ? styles.navButtonActive : ''].filter(Boolean).join(' ')}
                    href="/b2b"
                    aria-label={label}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon weight="regular" aria-hidden="true" />
                  </a>
                  <span className={styles.tooltip}>Go to {label}</span>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <button type="button" className={styles.avatarButton} aria-label="Account menu">
          <span>L</span>
        </button>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.header}>
          <h1>Good morning, Logan</h1>
          <div className={styles.headerActions}>
            <button type="button" className={styles.iconButton} aria-label="Search">
              <MagnifyingGlass weight="regular" aria-hidden="true" />
            </button>
            <button type="button" className={styles.iconButton} aria-label="Notifications">
              <Bell weight="regular" aria-hidden="true" />
            </button>
            <button type="button" className={styles.secondaryButton}>Invest</button>
            <button type="button" className={styles.primaryButton}>
              <Plus weight="bold" aria-hidden="true" />
              New meeting
            </button>
          </div>
        </header>

        <section className={styles.content} aria-label="Advisor book dashboard">
          <div className={styles.statStrip}>
            {bookStats.map((stat) => (
              <div className={styles.statCell} key={stat.label}>
                <span className={styles.statLabel}>{stat.label}</span>
                <strong className={stat.tone === 'positive' ? styles.positiveValue : undefined}>{stat.value}</strong>
                <span className={styles.statMeta}>
                  {stat.tone === 'positive' ? <span className={styles.successPill}>{stat.detail}</span> : stat.detail}
                  {stat.sub ? <span>{stat.sub}</span> : null}
                </span>
              </div>
            ))}
          </div>

          <section className={styles.briefing}>
            <div className={styles.aiSeal}>
              <Sparkle weight="fill" aria-hidden="true" />
            </div>
            <div>
              <span className={styles.aiChip}>Surmount AI</span>
              <p>
                Before your <strong>Torres 1pm</strong>, his equity is +12% above target - worth addressing. Kim has{' '}
                <strong>$180K uninvested</strong> for 47 days; onboarding call is an opportunity. Jennifer's{' '}
                <strong>10-year anniversary</strong> is March 12.
              </p>
            </div>
            <div className={styles.briefingActions}>
              <button type="button" className={styles.ghostButton}>Dismiss</button>
              <button type="button" className={styles.primaryButton}>View details</button>
            </div>
          </section>

          <div className={styles.dashboardGrid}>
            <div className={styles.leftRail}>
              <section className={styles.block}>
                <div className={styles.blockHeader}>
                  <div className={styles.titleRow}>
                    <h2>Today's Meetings</h2>
                    <span className={styles.countBadge}>3</span>
                  </div>
                  <SectionAction>View calendar</SectionAction>
                </div>

                <div className={styles.meetingPanel}>
                  {meetings.map((meeting) => (
                    <article className={styles.meetingRow} key={`${meeting.time}-${meeting.client}`}>
                      <time>{meeting.time}</time>
                      <span className={styles.meetingDot} aria-hidden="true" />
                      <div className={styles.meetingMain}>
                        <div className={styles.inlineTitle}>
                          <strong>{meeting.client}</strong>
                          <span className={[styles.tag, styles[`tag-${meeting.tone}` as keyof typeof styles]].join(' ')}>
                            {meeting.type}
                          </span>
                        </div>
                        <span>{meeting.meta}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.block}>
                <div className={styles.blockHeader}>
                  <div className={styles.titleRow}>
                    <h2>Tasks</h2>
                    <span className={styles.overdueBadge}>1 overdue</span>
                  </div>
                  <SectionAction>View all</SectionAction>
                </div>

                <div className={styles.taskPanel}>
                  {tasks.map((task) => (
                    <article className={styles.taskRow} key={task.label}>
                      <span className={[styles.checkbox, task.done ? styles.checkboxDone : ''].filter(Boolean).join(' ')}>
                        {task.done ? <CheckCircle weight="fill" aria-hidden="true" /> : null}
                      </span>
                      <div className={styles.taskText}>
                        <strong className={task.done ? styles.completedTask : undefined}>{task.label}</strong>
                        <span>{task.meta}</span>
                      </div>
                      {task.status ? <span className={[styles.statusPill, styles[`status-${task.tone}` as keyof typeof styles]].join(' ')}>{task.status}</span> : null}
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.block}>
                <div className={styles.blockHeader}>
                  <h2>Recent activities</h2>
                  <SectionAction>View all</SectionAction>
                </div>
                <div className={styles.activityPanel}>
                  {activities.map(([label, time]) => (
                    <article className={styles.activityRow} key={label}>
                      <span>{label}</span>
                      <time>{time}</time>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className={styles.rightRail}>
              <section className={styles.block}>
                <div className={styles.blockHeader}>
                  <div className={styles.titleRow}>
                    <h2>AI Insights</h2>
                    <span className={styles.aiChip}>Surmount AI</span>
                  </div>
                  <SectionAction>View all</SectionAction>
                </div>

                <div className={styles.insightPanel}>
                  {insights.map((insight) => (
                    <article className={styles.insightRow} key={insight.client}>
                      <div>
                        <strong>{insight.client}</strong>
                        <p>
                          {insight.detail}
                          {insight.emphasis ? <span>{insight.emphasis}</span> : null}
                          {insight.suffix}
                        </p>
                      </div>
                      <button type="button" className={styles.smallButton}>{insight.action}</button>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.block}>
                <div className={styles.blockHeader}>
                  <h2>Client CRM</h2>
                  <SectionAction>Open clients</SectionAction>
                </div>
                <div className={styles.crmPanel}>
                  <div>
                    <UsersThree weight="regular" aria-hidden="true" />
                    <span>85 active households</span>
                  </div>
                  <div>
                    <ChartLineUp weight="regular" aria-hidden="true" />
                    <span>12 drift reviews queued</span>
                  </div>
                  <div>
                    <ShieldCheck weight="regular" aria-hidden="true" />
                    <span>7 suitability notes updated</span>
                  </div>
                  <div>
                    <Notebook weight="regular" aria-hidden="true" />
                    <span>4 shared portfolios awaiting response</span>
                  </div>
                </div>
              </section>

              <section className={styles.block}>
                <div className={styles.blockHeader}>
                  <h2>Upcoming Milestones</h2>
                  <SectionAction>View calendar</SectionAction>
                </div>
                <div className={styles.milestonePanel}>
                  {milestones.map((milestone) => (
                    <article className={styles.milestoneRow} key={`${milestone.month}-${milestone.day}`}>
                      <time>
                        <span>{milestone.month}</span>
                        <strong>{milestone.day}</strong>
                      </time>
                      <div>
                        <strong>{milestone.client}</strong>
                        <span>{milestone.detail}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
