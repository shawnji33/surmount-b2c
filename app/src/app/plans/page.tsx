import { PlansPage, type PlansStep } from '@/components/settings/PlansPage';

const STEPS: PlansStep[] = [
  'downgrade-confirm',
  'scheduled',
  'scheduled-toast',
  'renew-confirm',
  'renewed',
  'upgrade-confirm',
];

export default async function Plans({ searchParams }: { searchParams: Promise<{ cycle?: string; step?: string }> }) {
  const { cycle, step } = await searchParams;
  const previewStep = STEPS.includes(step as PlansStep) ? (step as PlansStep) : undefined;
  return <PlansPage initialCycle={cycle === 'yearly' ? 'yearly' : 'monthly'} previewStep={previewStep} />;
}
