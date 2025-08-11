import NoticeDetail from '@/features/notices/components/NoticeDetail';
import { fetchNoticeById } from '@/features/notices/services/noticeService';

export default async function NoticeDetailPage({ params }) {
  const resolvedParams = await params;
  const noticeId = resolvedParams?.noticeId;

  const { success, result } = await fetchNoticeById({ noticeId });

  if (!success) {
    throw new Error();
  }

  return <NoticeDetail initialData={result} />;
}
