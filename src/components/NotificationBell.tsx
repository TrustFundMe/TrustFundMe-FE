"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, Flag, Heart, MessageCircle, Megaphone, Info, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContextProxy";
import { notificationService } from "@/services/notificationService";
import type { Notification as BENotification } from "@/types/notification";

interface Notification {
  id: number | string;
  type: string;
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
  if (isNaN(diff)) return "---";
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function NotifIcon({ type }: { type: string }) {
  const base = { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as const;
  const t = type.toLowerCase();

  if (t.includes("donation")) return <div style={{ ...base, background: "rgba(16,185,129,0.1)" }}><Heart className="w-4 h-4" style={{ color: "#10B981" }} /></div>;
  if (t.includes("message")) return <div style={{ ...base, background: "rgba(59,130,246,0.1)" }}><MessageCircle className="w-4 h-4" style={{ color: "#3B82F6" }} /></div>;
  if (t.includes("campaign") || t.includes("update")) return <div style={{ ...base, background: "rgba(26,104,91,0.1)" }}><Megaphone className="w-4 h-4" style={{ color: "#1A685B" }} /></div>;
  if (t.includes("flag")) return <div style={{ ...base, background: "rgba(248,77,67,0.1)" }}><Flag className="w-4 h-4" style={{ color: "#F84D43" }} /></div>;
  if (t.includes("kyc")) return <div style={{ ...base, background: "rgba(59,130,246,0.1)" }}><Info className="w-4 h-4" style={{ color: "#3B82F6" }} /></div>;
  if (t.includes("appointment")) return <div style={{ ...base, background: "rgba(255,94,20,0.1)" }}><Calendar className="w-4 h-4" style={{ color: "#FF5E14" }} /></div>;

  return <div style={{ ...base, background: "rgba(0,0,0,0.06)" }}><Bell className="w-4 h-4" style={{ color: "#666" }} /></div>;
}

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const mapNotification = useCallback((n: BENotification): Notification => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.content,
    isRead: n.isRead,
    createdAt: n.createdAt,
    link: (n.type === "CAMPAIGN_APPROVED" || n.type === "CAMPAIGN_REJECTED" || n.type === "EXPENDITURE_APPROVED" || n.type === "EXPENDITURE_REJECTED")
      ? `/account/campaigns?id=${n.targetId}`
      : n.targetType === "APPOINTMENT" ? `/account/profile?appointmentId=${n.targetId}` :
        n.targetType === "CAMPAIGN" ? `/campaign/${n.targetId}` :
          n.targetType === "FEED" ? `/forum/post/${n.targetId}` :
            n.targetType === "Conversation" ? `/chat/${n.targetId}` : undefined
  }), []);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await notificationService.getLatest(user.id);
      setNotifications(data.map(mapNotification));
    } catch (error) {
      console.error("[NotificationBell] Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, mapNotification]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error("[NotificationBell] Failed to fetch unread count:", error);
    }
  }, [user?.id]);

  // Fetch unread count on mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, user?.id, fetchUnreadCount]);

  // useEffect removed to avoid auto-fetching on mount

  // Fetch when opening the bell to ensure data is fresh
  useEffect(() => {
    if (open && isAuthenticated && user?.id) {
      fetchNotifications();
    }
  }, [open, isAuthenticated, user?.id, fetchNotifications]);

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

  // unreadCount is now managed by state

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => notificationService.markAsRead(n.id)));
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string | number) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif || notif.isRead) return;

    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "relative", background: "rgba(0,0,0,0.05)", border: "none",
          borderRadius: "50%", width: 36, height: 36, cursor: "pointer",
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
              position: "absolute", top: 2, right: 2, background: "#F84D43",
              color: "#fff", borderRadius: "50%", width: 14, height: 14,
              fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center",
              justifyContent: "center", border: "1.5px solid #fff",
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

            {/* Notification list container */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {loading && notifications.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center", color: "rgba(0,0,0,0.4)", fontFamily: "var(--font-dm-sans)", fontSize: 14 }}>
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  </div>
                  <p style={{ margin: 0 }}>Đang tải thông báo...</p>
                </div>
              ) : notifications.length === 0 ? (
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
