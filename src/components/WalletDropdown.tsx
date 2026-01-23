"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet as WalletIcon, CreditCard, TrendingUp, X } from "lucide-react";
import { createPortal } from "react-dom";

interface WalletDropdownProps {
  balance?: number;
}

export default function WalletDropdown({ balance = 0 }: WalletDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Close on scroll
      window.addEventListener("scroll", () => setIsOpen(false), true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", () => setIsOpen(false), true);
    };
  }, [isOpen]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      <div className="position-relative" style={{ zIndex: 1000 }}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="d-flex align-items-center justify-content-center border-0 bg-transparent p-0"
          style={{
            outline: "none",
            borderRadius: "50%",
            transition: "all 0.2s",
            width: "40px",
            height: "40px",
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
          aria-expanded={isOpen}
        >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#ff5e14",
            color: "white",
            boxShadow: "0 2px 8px rgba(255, 94, 20, 0.3)",
          }}
        >
          <WalletIcon size={20} />
        </div>
      </button>
      </div>

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="position-fixed"
                style={{
                  top: `${dropdownPosition.top - 320}px`, // Show above button
                  right: `${dropdownPosition.right}px`,
                  width: "320px",
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  zIndex: 9999,
                }}
              >
            {/* Wallet Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #ff5e14 0%, #e64a0a 100%)",
                color: "white",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative circles */}
              <div
                style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-30px",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  left: "-20px",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              />

              <div
                className="d-flex justify-content-between align-items-start mb-3"
                style={{ position: "relative", zIndex: 1 }}
              >
                <div>
                  <p
                    className="mb-1 small"
                    style={{ opacity: 0.9, fontSize: "12px" }}
                  >
                    Wallet Balance
                  </p>
                  <h3 className="mb-0 fw-bold" style={{ fontSize: "28px" }}>
                    {formatCurrency(balance)}
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="border-0 bg-transparent p-0"
                  style={{ color: "white", opacity: 0.8 }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div
                className="d-flex gap-2"
                style={{ position: "relative", zIndex: 1 }}
              >
                <div
                  className="flex-grow-1 p-3 rounded"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <CreditCard size={16} />
                    <span className="small" style={{ fontSize: "11px" }}>
                      Total Spent
                    </span>
                  </div>
                  <h6 className="mb-0 fw-bold" style={{ fontSize: "16px" }}>
                    {formatCurrency(0)}
                  </h6>
                </div>
                <div
                  className="flex-grow-1 p-3 rounded"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <TrendingUp size={16} />
                    <span className="small" style={{ fontSize: "11px" }}>
                      This Month
                    </span>
                  </div>
                  <h6 className="mb-0 fw-bold" style={{ fontSize: "16px" }}>
                    {formatCurrency(0)}
                  </h6>
                </div>
              </div>
            </div>

            {/* Wallet Actions */}
            <div className="p-3">
              <button
                className="w-100 btn border-0 py-2 rounded"
                style={{
                  backgroundColor: "#ff5e14",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e64a0a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ff5e14";
                }}
              >
                Add Funds
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
}
