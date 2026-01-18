"use client";

import { useAuth } from "@/contexts/AuthContext";
import { User, Wallet, Heart, Settings, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function UserDropdown() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate dropdown position - update continuously when open
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      updateDropdownPosition();
      
      // Update position continuously using requestAnimationFrame
      let rafId: number;
      const updateLoop = () => {
        updateDropdownPosition();
        if (isOpen) {
          rafId = requestAnimationFrame(updateLoop);
        }
      };
      rafId = requestAnimationFrame(updateLoop);

      // Also update on scroll and resize
      const handleScroll = () => {
        updateDropdownPosition();
      };
      const handleResize = () => {
        updateDropdownPosition();
      };

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);

      return () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
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
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/sign-out");
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const getInitials = () => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarUrl = () => {
    if (user.avatar) return user.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${user.firstName} ${user.lastName}`
    )}&background=ff5e14&color=fff&size=128`;
  };

  return (
    <>
      <div className="position-relative" style={{ zIndex: 1000 }}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="d-flex align-items-center gap-2 border-0 bg-transparent p-0"
        style={{
          outline: "none",
          borderRadius: "50%",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="position-relative d-flex align-items-center">
          <div
            className="rounded-circle overflow-hidden border border-white shadow"
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#ff5e14",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {user.avatar ? (
              <img
                src={getAvatarUrl()}
                alt={`${user.firstName} ${user.lastName}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                className="text-white fw-semibold"
                style={{ fontSize: "14px" }}
              >
                {getInitials()}
              </span>
            )}
          </div>
          <ChevronDown
            size={14}
            className="position-absolute"
            style={{
              bottom: "-2px",
              right: "-2px",
              backgroundColor: "white",
              borderRadius: "50%",
              padding: "2px",
              color: "#ff5e14",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
            }}
          />
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
                  top: `${dropdownPosition.top}px`,
                  right: `${dropdownPosition.right}px`,
                  width: "224px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e5e7eb",
                  padding: "8px 0",
                  zIndex: 9999,
                  position: "fixed",
                }}
                role="menu"
                aria-orientation="vertical"
              >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid #f3f4f6" }}
            >
              <p
                className="mb-0 fw-semibold"
                style={{ fontSize: "14px", color: "#111827" }}
              >
                {user.firstName} {user.lastName}
              </p>
              <p
                className="mb-0 text-truncate"
                style={{ fontSize: "12px", color: "#6b7280" }}
              >
                {user.email}
              </p>
            </div>

            <div className="py-1">
              <Link
                href="/account/profile"
                onClick={() => setIsOpen(false)}
                className="d-flex align-items-center gap-3 px-4 py-2 text-decoration-none"
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                role="menuitem"
              >
                <User size={16} />
                <span>Profile</span>
              </Link>

              <Link
                href="/account/campaigns"
                onClick={() => setIsOpen(false)}
                className="d-flex align-items-center gap-3 px-4 py-2 text-decoration-none"
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                role="menuitem"
              >
                <Heart size={16} />
                <span>Your fundraisers</span>
              </Link>

              <Link
                href="/account/impact"
                onClick={() => setIsOpen(false)}
                className="d-flex align-items-center gap-3 px-4 py-2 text-decoration-none"
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                role="menuitem"
              >
                <Wallet size={16} />
                <span>Your impact</span>
              </Link>

              <Link
                href="/account/profile"
                onClick={() => setIsOpen(false)}
                className="d-flex align-items-center gap-3 px-4 py-2 text-decoration-none"
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                role="menuitem"
              >
                <Settings size={16} />
                <span>Account settings</span>
              </Link>
            </div>

            <div
              style={{
                borderTop: "1px solid #f3f4f6",
                paddingTop: "4px",
              }}
            >
              <button
                onClick={handleLogout}
                className="w-100 d-flex align-items-center gap-3 px-4 py-2 border-0 bg-transparent text-start"
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                role="menuitem"
              >
                <LogOut size={16} />
                <span>Sign out</span>
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
