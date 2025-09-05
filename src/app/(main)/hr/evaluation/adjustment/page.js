import AdjustmentList from '@/features/hr/evaluation/adjustment/components/AdjustmentList';
import { fetchCriteriaList } from '@/features/hr/evaluation/criteria/services/criteriaService';

export default async function AdjustmentsPage() {
  const { success, result } = await fetchCriteriaList();

  if (!success) {
    throw new Error();
  }

  return <AdjustmentList initialData={result} />;
}
