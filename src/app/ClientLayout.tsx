'use client';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../lib/emotion-cache';
import { AuthProvider } from '@/context/AuthContext';

const clientSideEmotionCache = createEmotionCache();

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </CacheProvider>
  );
}
