import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 전달받은 날짜를 특정 포맷 문자열로 포매팅하여 반환
export const formatDate = (date, formatString = 'yyyy-MM-dd HH:mm:ss') => {
  if (!date) {
    return '-';
  }
  return format(new Date(date), formatString, { locale: ko });
};
