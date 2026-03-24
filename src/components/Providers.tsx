"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContextProxy";
import { ToastProvider } from "@/components/ui/Toast";
import BannedAccountWrapper from "@/components/BannedAccountWrapper";

export function ClientProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BannedAccountWrapper>
          <ToastProvider>
            {children}
          </ToastProvider>
        </BannedAccountWrapper>
      </AuthProvider>
    </QueryClientProvider>
  );
}
