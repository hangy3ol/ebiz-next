import CriteriaDetail from '@/features/hr/evaluations/criteria/components/CriteriaDetail';
import { fetchCriteriaById } from '@/features/hr/evaluations/criteria/services/criteriaService';

export default async function CriteriaDetailPage({ params }) {
  const resolvedParams = await params;
  const criteriaMasterId = resolvedParams?.criteriaMasterId;

  const { success, result } = await fetchCriteriaById(criteriaMasterId);

  if (!success) {
    throw new Error();
  }

  return <CriteriaDetail initialData={result} />;
}
