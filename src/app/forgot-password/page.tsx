"use client";

import DanboxLayout from "@/layout/DanboxLayout";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <DanboxLayout header={2} footer={2}>
      <section className="section-padding" style={{ minHeight: "80vh" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                  <div className="card-body p-5">
                    <Link
                      href="/sign-in"
                      className="d-inline-flex align-items-center gap-2 text-muted text-decoration-none mb-4"
                    >
                      <ArrowLeft size={18} />
                      Back to sign in
                    </Link>

                    {!success ? (
                      <>
                        <div className="text-center mb-4">
                          <div
                            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                            style={{
                              width: "80px",
                              height: "80px",
                              backgroundColor: "#f0f9f7",
                            }}
                          >
                            <Mail size={40} className="text-primary" />
                          </div>
                          <h2 className="fw-bold mb-2">Forgot password?</h2>
                          <p className="text-muted">
                            Enter your email address and we'll send you a link to reset
                            your password.
                          </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                          <div className="mb-4">
                            <label htmlFor="email" className="form-label fw-semibold">
                              Email address
                            </label>
                            <input
                              type="email"
                              id="email"
                              className="form-control"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              style={{ borderRadius: "8px" }}
                            />
                          </div>

                          {error && (
                            <div className="alert alert-danger" role="alert">
                              {error}
                            </div>
                          )}

                          <button
                            type="submit"
                            className="btn btn-primary w-100 py-2"
                            disabled={loading}
                            style={{ borderRadius: "8px" }}
                          >
                            {loading ? "Sending..." : "Send reset link"}
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="text-center">
                        <div
                          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                          style={{
                            width: "80px",
                            height: "80px",
                            backgroundColor: "#d4edda",
                          }}
                        >
                          <Mail size={40} className="text-success" />
                        </div>
                        <h3 className="fw-bold mb-3">Check your email</h3>
                        <p className="text-muted mb-4">
                          We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <p className="text-muted small mb-4">
                          Didn't receive the email? Check your spam folder or try again.
                        </p>
                        <Link
                          href="/sign-in"
                          className="btn btn-primary px-4 py-2"
                          style={{ borderRadius: "8px" }}
                        >
                          Back to sign in
                        </Link>
                      </div>
                    )}
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
