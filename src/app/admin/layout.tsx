'use client';

import { ReactNode } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import RequireRole from '@/components/auth/RequireRole';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole allowedRoles={['ADMIN']}>
      <SidebarProvider defaultOpen={true}>
        <AdminSidebar />
        <SidebarInset className="h-screen flex flex-col overflow-hidden max-h-[calc(100vh-18px)]">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto min-h-0 flex flex-col px-6 pb-6 pt-6 custom-scrollbar">
            {children}
          </main>
        </SidebarInset>
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }
        `}</style>
      </SidebarProvider>
    </RequireRole>
  );
}
