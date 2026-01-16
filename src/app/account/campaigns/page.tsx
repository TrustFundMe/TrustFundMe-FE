"use client";

import DanboxLayout from "@/layout/DanboxLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, TrendingUp, Users, Calendar } from "lucide-react";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";

export default function MyCampaignsPage() {
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

  // Mock campaigns data
  const campaigns: any[] = [];

  return (
    <DanboxLayout header={2} footer={2}>
      <PageBanner pageName="Your Fundraisers" />
      <section className="causes-section section-padding">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-5">
              <div>
                <span className="sub-title color-2 d-inline-flex align-items-center gap-2 mb-2">
                  <i className="far fa-heart" />
                  Manage Your Campaigns
                </span>
                <h2 className="fw-bold mb-0">Your fundraisers</h2>
              </div>
              <Link
                href="/causes"
                className="theme-btn d-flex align-items-center gap-2"
              >
                <Plus size={18} />
                Create fundraiser
              </Link>
            </div>

            {campaigns.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="popular-causes-card-items"
                style={{ maxWidth: "600px", margin: "0 auto" }}
              >
                <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                  <div className="card-body p-5 text-center">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: "100px",
                        height: "100px",
                        backgroundColor: "#fff5f0",
                        margin: "0 auto",
                      }}
                    >
                      <Heart size={50} style={{ color: "#ff5e14" }} />
                    </div>
                    <h4 className="fw-bold mb-3" style={{ color: "#202426" }}>
                      No fundraisers yet
                    </h4>
                    <p className="text-muted mb-4" style={{ fontSize: "16px" }}>
                      Start making a difference by creating your first fundraiser.
                      Your campaigns will appear here once you create them.
                    </p>
                    <Link
                      href="/causes"
                      className="theme-btn d-inline-flex align-items-center gap-2"
                    >
                      <Plus size={18} />
                      Create fundraiser
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="row g-4">
                {campaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="col-md-6 col-lg-4"
                  >
                    <div className="popular-causes-card-items">
                      <div className="row g-4 align-items-center">
                        <div className="col-lg-6">
                          <div className="thumb">
                            <img
                              src={campaign.image || "/assets/img/causes/04.png"}
                              alt={campaign.title}
                              style={{
                                width: "100%",
                                height: "auto",
                                borderRadius: "8px",
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="content">
                            <h4>
                              <Link href={`/causes-details/${campaign.id}`}>
                                {campaign.title}
                              </Link>
                            </h4>
                            <p>{campaign.description}</p>
                            <div className="progress-items">
                              <span className="point">
                                {Math.round((campaign.raised / campaign.goal) * 100)}%
                              </span>
                              <div className="progress">
                                <div
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{
                                    width: `${(campaign.raised / campaign.goal) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-3">
                              <div>
                                <span className="fw-bold" style={{ color: "#ff5e14" }}>
                                  ${campaign.raised.toLocaleString()}
                                </span>
                                <span className="text-muted"> raised</span>
                              </div>
                              <div>
                                <span className="text-muted">Goal: </span>
                                <span className="fw-bold">${campaign.goal.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="d-flex gap-3 mt-3">
                              <div className="d-flex align-items-center gap-1">
                                <Users size={14} className="text-muted" />
                                <span className="text-muted small">
                                  {campaign.donors} donors
                                </span>
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <Calendar size={14} className="text-muted" />
                                <span className="text-muted small">
                                  {new Date(campaign.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </DanboxLayout>
  );
}
