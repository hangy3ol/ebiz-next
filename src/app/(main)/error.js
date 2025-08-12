'use client';

import GlobalErrorFallback from '@/common/components/GlobalErrorFallback';

export default function Error({ error, reset }) {
  return <GlobalErrorFallback error={error} reset={reset} />;
}
