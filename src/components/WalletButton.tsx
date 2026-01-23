"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Wallet as WalletIcon } from "lucide-react";
import Link from "next/link";

interface WalletButtonProps {
  balance?: number;
}

export default function WalletButton({ balance = 100000000 }: WalletButtonProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount}`;
  };

  return (
    <Link
      href="/account/wallet"
      className="d-flex align-items-center gap-2 text-decoration-none position-relative"
      style={{
        transition: "all 0.2s",
        padding: "4px 8px",
        borderRadius: "20px",
        backgroundColor: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.8";
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "scale(1)";
      }}
      aria-label="Wallet"
    >
      <div
        className="rounded-circle d-flex align-items-center justify-content-center"
        style={{
          width: "32px",
          height: "32px",
          backgroundColor: "#ff5e14",
          color: "white",
          boxShadow: "0 2px 8px rgba(255, 94, 20, 0.3)",
          flexShrink: 0,
        }}
      >
        <WalletIcon size={16} />
      </div>
      <span
        className="fw-bold text-nowrap"
        style={{
          fontSize: "14px",
          color: "#ff5e14",
          lineHeight: "1",
        }}
      >
        {formatShortCurrency(balance)}
      </span>
    </Link>
  );
}
