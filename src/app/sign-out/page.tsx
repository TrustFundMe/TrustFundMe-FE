"use client";

import DanboxLayout from "@/layout/DanboxLayout";
import { useAuth } from "@/contexts/AuthContextProxy";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, Users, CreditCard, Smartphone, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SignOutPage() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  return (
    <DanboxLayout header={2} footer={2}>
      <section className="section-padding" style={{ minHeight: "80vh" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-5"
              >
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#fff5f0",
                    margin: "0 auto",
                  }}
                >
                  <CheckCircle size={40} style={{ color: "#ff5e14" }} />
                </div>
                <h1 className="fw-bold mb-3" style={{ color: "#202426", fontSize: "2.5rem" }}>
                  You have securely signed out of TrustFundMe.
                </h1>
              </motion.div>

              {/* App Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card border-0 shadow-sm mb-5"
                style={{ borderRadius: "16px", backgroundColor: "#fff5f0" }}
              >
                <div className="card-body p-5">
                  <div className="row align-items-center">
                    <div className="col-lg-8">
                      <h3 className="fw-bold mb-3" style={{ color: "#202426" }}>
                        Never miss a donation with the TrustFundMe App
                      </h3>
                      <ul className="list-unstyled mb-4" style={{ fontSize: "16px" }}>
                        <li className="mb-2 d-flex align-items-start gap-2">
                          <CheckCircle size={20} style={{ color: "#ff5e14", marginTop: "2px", flexShrink: 0 }} />
                          <span>Get fundraising coaching tips</span>
                        </li>
                        <li className="mb-2 d-flex align-items-start gap-2">
                          <CheckCircle size={20} style={{ color: "#ff5e14", marginTop: "2px", flexShrink: 0 }} />
                          <span>Access more ways to share</span>
                        </li>
                        <li className="mb-2 d-flex align-items-start gap-2">
                          <CheckCircle size={20} style={{ color: "#ff5e14", marginTop: "2px", flexShrink: 0 }} />
                          <span>Post videos to update donors</span>
                        </li>
                        <li className="mb-2 d-flex align-items-start gap-2">
                          <CheckCircle size={20} style={{ color: "#ff5e14", marginTop: "2px", flexShrink: 0 }} />
                          <span>Manage your fundraiser anywhere</span>
                        </li>
                      </ul>
                      <p className="text-muted mb-0">
                        Or, search your app store for 'TrustFundMe'
                      </p>
                    </div>
                    <div className="col-lg-4 text-center">
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{
                          width: "120px",
                          height: "120px",
                          backgroundColor: "#ff5e14",
                          color: "white",
                        }}
                      >
                        <Smartphone size={60} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="card border-0 shadow-sm mb-5"
                style={{ borderRadius: "16px" }}
              >
                <div className="card-body p-5">
                  <div className="d-flex align-items-start gap-4">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: "#fff5f0",
                      }}
                    >
                      <span className="fw-bold" style={{ color: "#ff5e14", fontSize: "20px" }}>
                        E
                      </span>
                    </div>
                    <div>
                      <p className="mb-2" style={{ fontSize: "16px", fontStyle: "italic", color: "#202426" }}>
                        "The app made it so much easier to check on the fundraiser. I always have my phone with me, so it was just a click away. Getting notifications regarding each donation was exciting and I was able to easily thank people for their contributions."
                      </p>
                      <div>
                        <strong style={{ color: "#202426" }}>Evan</strong>
                        <span className="text-muted"> - TrustFundMe app user</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Fundraising Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="fw-bold text-center mb-5" style={{ color: "#202426" }}>
                  What can you do to fundraise successfully?
                </h3>
                <div className="row g-4">
                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
                      <div className="card-body p-4 text-center">
                        <div
                          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#fff5f0",
                            margin: "0 auto",
                          }}
                        >
                          <Share2 size={30} style={{ color: "#ff5e14" }} />
                        </div>
                        <h5 className="fw-bold mb-3" style={{ color: "#202426" }}>
                          Share with friends and family
                        </h5>
                        <ul className="list-unstyled text-start" style={{ fontSize: "14px" }}>
                          <li className="mb-2">• Share your fundraiser with a personalized message.</li>
                          <li>• Inspire others to help you spread the word.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
                      <div className="card-body p-4 text-center">
                        <div
                          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#fff5f0",
                            margin: "0 auto",
                          }}
                        >
                          <CreditCard size={30} style={{ color: "#ff5e14" }} />
                        </div>
                        <h5 className="fw-bold mb-3" style={{ color: "#202426" }}>
                          Set up withdrawals early
                        </h5>
                        <ul className="list-unstyled text-start" style={{ fontSize: "14px" }}>
                          <li className="mb-2">• Invite your beneficiary or set up your withdrawal account early.</li>
                          <li>• Funds can automatically be deposited into the designated bank account.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
                      <div className="card-body p-4 text-center">
                        <div
                          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#fff5f0",
                            margin: "0 auto",
                          }}
                        >
                          <Users size={30} style={{ color: "#ff5e14" }} />
                        </div>
                        <h5 className="fw-bold mb-3" style={{ color: "#202426" }}>
                          Invite team members
                        </h5>
                        <ul className="list-unstyled text-start" style={{ fontSize: "14px" }}>
                          <li className="mb-2">• Add friends and family as team members to help you fundraise.</li>
                          <li>• Team members can help you share your campaign as well as thank and update donors.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Back to Home */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center mt-5"
              >
                <Link
                  href="/"
                  className="theme-btn d-inline-flex align-items-center gap-2"
                >
                  <Heart size={18} />
                  Back to Home
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
}
