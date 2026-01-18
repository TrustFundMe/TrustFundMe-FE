"use client";

import DanboxLayout from "@/layout/DanboxLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Info } from "lucide-react";

export default function ProfilePage() {
  const { isAuthenticated, user, updateUser } = useAuth();
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setEditedName(`${user.firstName} ${user.lastName}`);
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarUrl = () => {
    if (user.avatar) return user.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${user.firstName} ${user.lastName}`
    )}&background=1a685b&color=fff&size=200`;
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return "*******0703";
    const lastThree = phone.slice(-3);
    return `*******${lastThree}`;
  };

  const maskPassword = () => {
    return "••••••••••••";
  };

  const handleSaveName = () => {
    const names = editedName.trim().split(" ");
    const firstName = names[0] || "";
    const lastName = names.slice(1).join(" ") || "";
    updateUser({ firstName, lastName });
    setIsEditingName(false);
  };

  return (
    <DanboxLayout header={2} footer={2}>
      <section className="section-padding" style={{ minHeight: "80vh" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="fw-bold mb-5">Profile</h1>

                {/* Avatar Section */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-4">
                      <div
                        className="rounded-circle overflow-hidden"
                        style={{
                          width: "80px",
                          height: "80px",
                          border: "3px solid #1a685b",
                        }}
                      >
                        {user.avatar ? (
                          <img
                            src={getAvatarUrl()}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="w-100 h-100 d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: "#1a685b", color: "white" }}
                          >
                            <span className="fw-bold fs-4">{getInitials()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <h4 className="mb-1 fw-bold">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-muted mb-0">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name Section */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div>
                        <label className="text-muted small d-block mb-2 fw-semibold">
                          Name
                        </label>
                        {isEditingName ? (
                          <div className="d-flex gap-2 align-items-center">
                            <input
                              type="text"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="form-control"
                              style={{ maxWidth: "300px" }}
                              autoFocus
                            />
                            <button
                              onClick={handleSaveName}
                              className="btn btn-primary btn-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingName(false);
                                setEditedName(`${user.firstName} ${user.lastName}`);
                              }}
                              className="btn btn-outline-secondary btn-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="mb-0 fw-semibold">
                            {user.firstName} {user.lastName}
                          </p>
                        )}
                      </div>
                      {!isEditingName && (
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                      )}
                    </div>
                    <hr className="my-3" />
                    <p className="text-muted small mb-0">
                      Your phone number is linked to your account for security. To
                      change your number please visit our help center.
                    </p>
                  </div>
                </div>

                {/* Phone Number Section */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <label className="text-muted small fw-semibold mb-0">
                            Verification phone number
                          </label>
                          <Info size={16} className="text-muted" />
                        </div>
                        <p className="mb-0 fw-semibold">{maskPhone(user.phone)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Section */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div>
                        <label className="text-muted small d-block mb-2 fw-semibold">
                          Email address
                        </label>
                        <p className="mb-0 fw-semibold">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Birthday Section */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div>
                        <label className="text-muted small d-block mb-2 fw-semibold">
                          Birthday
                        </label>
                        <p className="mb-0 fw-semibold">
                          {user.birthday
                            ? new Date(user.birthday).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div>
                        <label className="text-muted small d-block mb-2 fw-semibold">
                          Password
                        </label>
                        <p className="mb-0 fw-semibold">{maskPassword()}</p>
                      </div>
                    </div>
                    <hr className="my-3" />
                    <p className="text-muted small mb-0">
                      To edit your password, please visit our{" "}
                      <a href="/forgot-password" className="text-primary">
                        forgot password page
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
}
