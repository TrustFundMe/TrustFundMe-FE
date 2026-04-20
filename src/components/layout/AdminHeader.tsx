'use client';

import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

const URL_TO_LABEL: Record<string, string> = {
  admin: 'Quản lý',
  users: 'Người dùng',
  campaigns: 'Chiến dịch',
  payouts: 'Giải ngân',
  tasks: 'Nhiệm vụ',
  modules: 'Module',
  'module-groups': 'Nhóm module',
  roles: 'Vai trò',
  flags: 'Báo cáo',
  'feed-posts': 'Bài đăng',
  'payout-history': 'Lịch sử giải ngân',
  'bank-accounts': 'Tài khoản ngân hàng',
  kyc: 'Xác minh KYC',
  notifications: 'Thông báo',
  donations: 'Quyên góp',
  payments: 'Thanh toán',
  categories: 'Danh mục',
  'fundraising-goals': 'Mục tiêu gây quỹ',
  expenditures: 'Chi tiêu',
  chat: 'Chat',
  forum: 'Diễn đàn',
  feed: 'Bài đăng',
};

export function AdminHeader() {
  const pathname = usePathname() || '';
  const paths = pathname.split('/').filter(Boolean);

  const breadcrumbItems = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    const label = URL_TO_LABEL[path] || (path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '));
    return {
      label,
      href,
      active: index === paths.length - 1
    };
  });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 flex-1 pl-2">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.href}>
                <BreadcrumbItem className="hidden md:block">
                  {item.active ? (
                    <BreadcrumbPage className="font-black text-slate-900">{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href} className="font-bold text-slate-400 hover:text-slate-600">
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && (
                  <BreadcrumbSeparator className="hidden md:block text-slate-300 text-xs font-bold select-none">/</BreadcrumbSeparator>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3">
      </div>
    </header>
  );
}
