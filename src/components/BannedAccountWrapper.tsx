"use client";

import { useAuth } from "@/contexts/AuthContextProxy";
import Image from "next/image";
import { LogOut, Mail, ShieldAlert } from "lucide-react";

export default function BannedAccountWrapper({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();

  // If not banned, just show the app
  if (!user || user.isActive !== false) {
    return <>{children}</>;
  }

  // If banned, show the restricted view
  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-start md:justify-center p-6 py-20 text-center relative">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative w-[280px] h-[100px]">
              <Image
                src="/assets/img/logo/black-logo.png"
                fill
                alt="TrustFundMe Logo"
                priority
                className="object-contain"
              />
            </div>
          </div>

        {/* Warning Icon & Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border-4 border-white shadow-xl">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Tài khoản bị vô hiệu hóa
          </h1>
          <div className="h-1.5 w-24 bg-red-600 mx-auto rounded-full" />
        </div>

        {/* Message & Reason */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <p className="text-gray-600 font-medium leading-relaxed">
            Chào <span className="text-gray-900 font-bold">{user.fullName}</span>, tài khoản của bạn hiện đã bị tạm khóa bởi quản trị viên hệ thống.
          </p>
          
          <div className="text-left py-4 px-5 bg-white rounded-xl border-l-4 border-red-500 shadow-sm">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1 block">Lý do vô hiệu hóa:</span>
            <p className="text-gray-800 text-sm font-medium italic">
              "{user.banReason || user.reason || "Tài khoản vi phạm nghiêm trọng chính sách cộng đồng hoặc nhận được báo cáo vi phạm"}"
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Mọi thắc mắc xin vui lòng liên hệ:</span>
            </div>
            <a 
              href="mailto:trustfundme@co.vn" 
              className="text-[#db5945] font-bold hover:underline transition-all text-lg"
            >
              trustfundme@co.vn
            </a>
          </div>

          {/* Action Button */}
          <button
            onClick={() => logout()}
            className="group relative flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-gray-200"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Đăng xuất
          </button>
        </div>

        {/* Decorative footer text */}
        <div className="pt-8 text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">
          TrustFundMe &copy; 2026 • Security System
        </div>
      </div>
      
      {/* Decorative top stripe */}
      <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
      </div>
    </div>
  );
}
