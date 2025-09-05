import AdjustmentList from '@/features/hr/evaluation/adjustment/components/AdjustmentList';
import { fetchAdjustmentList } from '@/features/hr/evaluation/adjustment/services/adjustmentService';

export default async function AdjustmentsPage() {
  const { success, result } = await fetchAdjustmentList();

  if (!success) {
    throw new Error();
  }

  return <AdjustmentList initialData={result} />;
}
