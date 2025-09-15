import { fetchAdjustmentList } from '@/features/hr/evaluation/adjustment/services/adjustmentService';
import SettingList from '@/features/hr/evaluation/setting/components/SettingList';

export default async function AdjustmentsPage() {
  const { success, result } = await fetchAdjustmentList();

  if (!success) {
    throw new Error();
  }

  return <SettingList initialData={result} />;
}
