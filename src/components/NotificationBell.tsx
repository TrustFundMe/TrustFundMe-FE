"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, Flag, Heart, MessageCircle, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContextProxy";

interface Notification {
  id: string;
  type: "flag_reviewed" | "campaign_update" | "new_comment" | "like" | "general";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function NotifIcon({ type }: { type: Notification["type"] }) {
  const base = { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as const;
  switch (type) {
    case "flag_reviewed":
      return <div style={{ ...base, background: "rgba(248,77,67,0.1)" }}><Flag className="w-4 h-4" style={{ color: "#F84D43" }} /></div>;
    case "campaign_update":
      return <div style={{ ...base, background: "rgba(26,104,91,0.1)" }}><Megaphone className="w-4 h-4" style={{ color: "#1A685B" }} /></div>;
    case "new_comment":
      return <div style={{ ...base, background: "rgba(59,130,246,0.1)" }}><MessageCircle className="w-4 h-4" style={{ color: "#3B82F6" }} /></div>;
    case "like":
      return <div style={{ ...base, background: "rgba(248,77,67,0.1)" }}><Heart className="w-4 h-4" style={{ color: "#F84D43" }} /></div>;
    default:
      return <div style={{ ...base, background: "rgba(0,0,0,0.06)" }}><Bell className="w-4 h-4" style={{ color: "#666" }} /></div>;
  }
}

const STORAGE_KEY = "tfm_notifications";

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifications(items: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const loadFromStorage = useCallback(() => {
    setNotifications(loadNotifications());
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadFromStorage();
  }, [isAuthenticated, loadFromStorage]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!isAuthenticated) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const markRead = (id: string) => {
    const updated = notifications.map((n) => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    saveNotifications(updated);
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "relative", background: "rgba(0,0,0,0.05)", border: "none",
          borderRadius: "50%", width: 38, height: 38, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}
        title="Thông báo"
      >
        <Bell className="w-5 h-5" style={{ color: "#333" }} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute", top: 4, right: 4, background: "#F84D43",
              color: "#fff", borderRadius: "50%", width: 16, height: 16,
              fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center",
              justifyContent: "center", border: "2px solid #fff",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 9999,
              background: "#fff", border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
              width: 360, maxHeight: 480, display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Panel header */}
            <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", fontFamily: "var(--font-dm-sans)" }}>
                Thông báo {unreadCount > 0 && <span style={{ color: "#F84D43" }}>({unreadCount})</span>}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {unreadCount > 0 && (
                  <button type="button" onClick={markAllRead}
                    style={{ fontSize: 12, color: "#1A685B", border: "none", background: "none", cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-dm-sans)" }}>
                    Đọc tất cả
                  </button>
                )}
                {notifications.length > 0 && (
                  <button type="button" onClick={clearAll}
                    style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", border: "none", background: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans)" }}>
                    Xóa hết
                  </button>
                )}
                <button type="button" onClick={() => setOpen(false)}
                  style={{ border: "none", background: "rgba(0,0,0,0.06)", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center", color: "rgba(0,0,0,0.4)", fontFamily: "var(--font-dm-sans)", fontSize: 14 }}>
                  <Bell className="w-8 h-8 mx-auto mb-3" style={{ opacity: 0.3 }} />
                  <p style={{ margin: 0 }}>Chưa có thông báo nào</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => { markRead(notif.id); if (notif.link) setOpen(false); }}
                    style={{
                      padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start",
                      background: notif.isRead ? "#fff" : "rgba(26,104,91,0.04)",
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                      cursor: notif.link ? "pointer" : "default",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.02)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = notif.isRead ? "#fff" : "rgba(26,104,91,0.04)"; }}
                  >
                    <NotifIcon type={notif.type} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "#1a1a1a", fontFamily: "var(--font-dm-sans)" }}>
                        {notif.title}
                      </p>
                      <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(0,0,0,0.6)", fontFamily: "var(--font-dm-sans)", lineHeight: 1.4 }}>
                        {notif.message}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                        {notif.link && (
                          <Link href={notif.link} style={{ fontSize: 11, color: "#1A685B", fontWeight: 600, fontFamily: "var(--font-dm-sans)", textDecoration: "none" }}>
                            Xem →
                          </Link>
                        )}
                        {!notif.isRead && (
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1A685B", display: "inline-block", marginLeft: "auto" }} />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
