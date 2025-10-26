'use client'

import { ThemeProvider as Provider } from '@/components/ThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>
}
