import NoticeView from '@/features/notices/components/NoticeView';
import { fetchNoticeById } from '@/features/notices/services/noticeService';

export default async function NoticeViewPage({ params }) {
  const resolvedParams = await params;
  const noticeId = resolvedParams?.noticeId;

  const { success, result } = await fetchNoticeById({ noticeId });

  if (!success) {
    throw new Error();
  }

  return <NoticeView initialData={result} />;
}
