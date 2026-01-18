"use client";

import DanboxLayout from "@/layout/DanboxLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, CreditCard, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WalletPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const balance = 0;
  const totalSpent = 0;
  const thisMonth = 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <DanboxLayout header={2} footer={2}>
      <section className="section-padding" style={{ minHeight: "80vh" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/account/profile"
              className="d-inline-flex align-items-center gap-2 text-muted text-decoration-none mb-4"
            >
              <ArrowLeft size={18} />
              Back to Profile
            </Link>

            <h1 className="fw-bold mb-5">Wallet</h1>

            {/* Wallet Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card border-0 shadow-sm mb-4"
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
                      <h5 className="mb-0 fw-bold">{formatCurrency(totalSpent)}</h5>
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
                      <h5 className="mb-0 fw-bold">{formatCurrency(thisMonth)}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transaction History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="fw-bold mb-4">Transaction History</h3>
              <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                <div className="card-body p-5 text-center">
                  <p className="text-muted mb-0">No transactions yet</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </DanboxLayout>
  );
}
