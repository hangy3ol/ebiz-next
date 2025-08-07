'use client';

import GlobalErrorFallback from '@/components/GlobalErrorFallback';

export default function Error({ error, reset }) {
  return <GlobalErrorFallback error={error} reset={reset} />;
}
