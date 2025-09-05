import AdjustmentView from '@/features/hr/evaluation/adjustment/components/AdjustmentView';
import { fetchAdjustmentById } from '@/features/hr/evaluation/adjustment/services/adjustmentService';

export default async function AdjustmentViewPage({ params }) {
  const resolvedParams = await params;
  const adjustmentMasterId = resolvedParams?.adjustmentMasterId;

  const { success, result } = await fetchAdjustmentById(adjustmentMasterId);

  if (!success) {
    throw new Error();
  }

  return <AdjustmentView initialData={result} />;
}
