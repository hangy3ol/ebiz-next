import NoticeList from '@/features/notice/components/NoticeList';
import { fetchNoticeList } from '@/features/notice/services/noticeService';

export default async function NoticeListPage() {
  const { success, result } = await fetchNoticeList();

  if (!success) {
    throw new Error();
  }

  return <NoticeList initialData={result} />;
}
