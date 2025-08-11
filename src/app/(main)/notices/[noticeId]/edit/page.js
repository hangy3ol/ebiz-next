import NoticeForm from '@/features/notices/components/NoticeForm';
import { fetchNoticeById } from '@/features/notices/services/noticeService';

export default async function NoticeEditPage({ params }) {
  const resolvedParams = await params;
  const noticeId = resolvedParams?.noticeId;

  const { success, result } = await fetchNoticeById({ noticeId });

  if (!success) {
    throw new Error();
  }

  return <NoticeForm mode="edit" initialData={result} />;
}
