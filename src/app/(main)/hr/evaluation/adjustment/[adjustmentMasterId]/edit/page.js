import AdjustmentForm from '@/features/hr/evaluation/adjustment/components/AdjustmentForm';
import { fetchAdjustmentById } from '@/features/hr/evaluation/adjustment/services/adjustmentService';

export default async function AdjustmentEditPage({ params }) {
  const resolvedParams = await params;
  const adjustmentMasterId = resolvedParams?.adjustmentMasterId;

  const { success, result } = await fetchAdjustmentById(adjustmentMasterId);

  if (!success) {
    throw new Error();
  }

  return <AdjustmentForm mode="edit" initialData={result} />;
}
