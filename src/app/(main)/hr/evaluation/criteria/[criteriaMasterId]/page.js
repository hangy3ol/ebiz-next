import CriteriaView from '@/features/hr/evaluation/criteria/components/CriteriaView';
import { fetchCriteriaById } from '@/features/hr/evaluation/criteria/services/criteriaService';

export default async function CriteriaViewPage({ params }) {
  const resolvedParams = await params;
  const criteriaMasterId = resolvedParams?.criteriaMasterId;

  const { success, result } = await fetchCriteriaById(criteriaMasterId);

  if (!success) {
    throw new Error();
  }

  return <CriteriaView initialData={result} />;
}
