"use client";

import { motion } from "framer-motion";
import { Wallet as WalletIcon, CreditCard, TrendingUp } from "lucide-react";

interface WalletProps {
  balance?: number;
  className?: string;
}

export default function Wallet({ balance = 0, className = "" }: WalletProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`card border-0 shadow-sm ${className}`}
      style={{
        borderRadius: "16px",
        background: "linear-gradient(135deg, #ff5e14 0%, #e64a0a 100%)",
        color: "white",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-30px",
          left: "-30px",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
        }}
      />

      <div className="card-body p-4" style={{ position: "relative", zIndex: 1 }}>
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <p className="text-white-50 small mb-1">Wallet Balance</p>
            <h2 className="fw-bold mb-0" style={{ fontSize: "2rem" }}>
              {formatCurrency(balance)}
            </h2>
          </div>
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <WalletIcon size={30} />
          </div>
        </div>

        <div className="d-flex gap-3 mt-4">
          <div className="flex-grow-1">
            <div
              className="card border-0 p-3"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <CreditCard size={18} />
                <span className="small">Total Spent</span>
              </div>
              <h5 className="mb-0 fw-bold">{formatCurrency(0)}</h5>
            </div>
          </div>
          <div className="flex-grow-1">
            <div
              className="card border-0 p-3"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <TrendingUp size={18} />
                <span className="small">This Month</span>
              </div>
              <h5 className="mb-0 fw-bold">{formatCurrency(0)}</h5>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
