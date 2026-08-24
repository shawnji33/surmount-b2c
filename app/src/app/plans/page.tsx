import { PlansPage, type PlansStep } from '@/components/settings/PlansPage';

const STEPS: PlansStep[] = [
  'downgrade-confirm',
  'scheduled',
  'scheduled-toast',
  'cancel-details',
  'renew-confirm',
  'renewed',
  'upgrade-confirm',
  'upgraded',
];

export default async function Plans({
  searchParams,
}: {
  searchParams: Promise<{ cycle?: string; step?: string; target?: string }>;
}) {
  const { cycle, step, target } = await searchParams;
  const previewStep = STEPS.includes(step as PlansStep) ? (step as PlansStep) : undefined;
  return (
    <PlansPage
      initialCycle={cycle === 'yearly' ? 'yearly' : 'monthly'}
      previewStep={previewStep}
      previewTarget={target}
    />
  );
}
