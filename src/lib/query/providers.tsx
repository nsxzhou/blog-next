'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DataPrefetcher } from './DataPrefetcher'
import queryClient from './client'

interface QueryProvidersProps {
  children: React.ReactNode
}

/**
 * TanStack Query Provider组件
 * 提供全局的QueryClient和开发工具
 */
export function QueryProviders({ children }: QueryProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <DataPrefetcher />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}