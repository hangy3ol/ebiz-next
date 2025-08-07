import NoticeList from '@/features/notices/components/NoticeList';
import { fetchNoticeList } from '@/features/notices/services/noticeService';

export default async function NoticePage() {
  const { success, result } = await fetchNoticeList();

  if (!success) {
    throw new Error();
  }

  return <NoticeList initialData={result} />;
}
