import NoticeList from '@/app/(main)/notices/components/NoticeList';
import { authGuard } from '@/libs/auth/authGuard';
import { fetchNoticeList } from '@/services/notices/noticeService';

export default async function NoticePage() {
  const currentUser = await authGuard();
  const { success, data } = await fetchNoticeList();

  if (!success) {
    throw new Error();
  }

  return <NoticeList initialData={data} currentUser={currentUser} />;
}
