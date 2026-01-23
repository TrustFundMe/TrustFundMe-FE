'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import DanboxLayout from '@/layout/DanboxLayout';
import { Wallet, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function WalletPage() {
  return (
    <ProtectedRoute requireVerified={true}>
      <DanboxLayout header={2} footer={2}>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/account/profile"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
                <p className="mt-2 text-gray-600">Manage your wallet balance and transactions</p>
              </div>
            </div>

            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-8 mb-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-orange-100 text-sm font-medium mb-2">Wallet Balance</p>
                    <p className="text-4xl font-bold text-white">$0.00</p>
                  </div>
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                    <Wallet className="w-12 h-12 text-white opacity-50" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-orange-400/30">
                  <div>
                    <div className="flex items-center gap-2 text-orange-100 text-sm mb-1">
                      <Wallet className="w-4 h-4" />
                      <span>Total Spent</span>
                    </div>
                    <p className="text-xl font-semibold text-white">$0.00</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-orange-100 text-sm mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>This Month</span>
                    </div>
                    <p className="text-xl font-semibold text-white">$0.00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction History</h2>
              <div className="text-center py-12">
                <p className="text-gray-500">No transactions yet</p>
              </div>
            </div>
          </div>
        </div>
      </DanboxLayout>
    </ProtectedRoute>
  );
}
