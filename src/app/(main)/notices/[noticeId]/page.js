import NoticeForm from '@/app/(main)/notices/components/NoticeForm';
import { fetchNoticeById } from '@/services/notices/noticeService';

export default async function NoticeDetailPage({ params }) {
  const resolvedParams = await params;
  const noticeId = resolvedParams?.noticeId;

  const isNew = noticeId === 'new';
  let data = null;
  let success = false;

  if (!isNew) {
    try {
      const result = await fetchNoticeById({ noticeId });
      data = result.data || null;
      success = result.success;
    } catch (error) {
      console.error('[NoticeDetailPage] 공지사항 상세 조회 실패:', error);
    }
  }

  return (
    <NoticeForm initialData={data} initialStatus={success} isNew={isNew} />
  );
}
