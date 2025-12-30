'use client';

import { ErrorBoundary } from '@/utils/errorBoundary';

export default function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

