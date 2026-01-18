"use client";

import DanboxLayout from "@/layout/DanboxLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, Calendar, Heart, Users } from "lucide-react";
import PageBanner from "@/components/PageBanner";

export default function ImpactPage() {
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

  // Mock donations data
  const donations: any[] = [];
  
  // Calculate total impact
  const totalImpact = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const fundraisersSupported = new Set(donations.map(d => d.campaignId)).size;
  const peopleInspired = 0; // Mock data

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DanboxLayout header={2} footer={2}>
      <PageBanner pageName="Your Impact" />
      <section className="causes-section section-padding">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Total Impact Section */}
            <div className="row mb-5">
              <div className="col-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-5"
                >
                  <h1 className="display-4 fw-bold mb-3" style={{ color: "#ff5e14" }}>
                    {formatCurrency(totalImpact)}
                  </h1>
                  <p className="text-muted fs-5">
                    Your total impact from donating, organizing and sharing
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="card border-0 shadow-sm h-100"
                  style={{ borderRadius: "12px" }}
                >
                  <div className="card-body p-4 d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: "#fff5f0",
                      }}
                    >
                      <Heart size={30} style={{ color: "#ff5e14" }} />
                    </div>
                    <div>
                      <h3 className="mb-0 fw-bold" style={{ color: "#ff5e14" }}>
                        {fundraisersSupported}
                      </h3>
                      <p className="text-muted mb-0">Fundraisers supported</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="col-md-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="card border-0 shadow-sm h-100"
                  style={{ borderRadius: "12px" }}
                >
                  <div className="card-body p-4 d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: "#fff5f0",
                      }}
                    >
                      <Users size={30} style={{ color: "#ff5e14" }} />
                    </div>
                    <div>
                      <h3 className="mb-0 fw-bold" style={{ color: "#ff5e14" }}>
                        {peopleInspired}
                      </h3>
                      <p className="text-muted mb-0">People you inspired to help</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Call to Action */}
            {totalImpact === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="card border-0 mb-5"
                style={{
                  backgroundColor: "#ff5e14",
                  borderRadius: "12px",
                  color: "white",
                }}
              >
                <div className="card-body p-5 text-center">
                  <h4 className="fw-bold mb-3">Start seeing your impact</h4>
                  <p className="mb-4">
                    When you donate to and share fundraisers, you can view the total
                    impact above.
                  </p>
                  <a
                    href="/causes"
                    className="btn btn-light px-4 py-2"
                    style={{ borderRadius: "8px" }}
                  >
                    Find a fundraiser &gt;
                  </a>
                </div>
              </motion.div>
            )}

            {/* Donations List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="fw-bold mb-4">Your Donations</h3>
              
              {donations.length === 0 ? (
                <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                  <div className="card-body p-5 text-center">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: "80px",
                        height: "80px",
                        backgroundColor: "#fff5f0",
                        margin: "0 auto",
                      }}
                    >
                      <Wallet size={40} style={{ color: "#ff5e14" }} />
                    </div>
                    <h4 className="fw-bold mb-3" style={{ color: "#202426" }}>
                      No donations yet
                    </h4>
                    <p className="text-muted mb-0">
                      Your donation history will appear here once you start contributing.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="row g-4">
                  {donations.map((donation, index) => (
                    <motion.div
                      key={donation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="col-12"
                    >
                      <div
                        className="card border-0 shadow-sm"
                        style={{ borderRadius: "12px" }}
                      >
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-3 mb-2">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    backgroundColor: "#fff5f0",
                                  }}
                                >
                                  <Heart size={24} style={{ color: "#ff5e14" }} />
                                </div>
                                <div>
                                  <h5 className="fw-bold mb-1">{donation.campaignName}</h5>
                                  <p className="text-muted small mb-0">
                                    <Calendar size={14} className="d-inline me-1" />
                                    {formatDate(donation.date)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-end">
                              <h4 className="fw-bold mb-0" style={{ color: "#ff5e14" }}>
                                {formatCurrency(donation.amount)}
                              </h4>
                              <p className="text-muted small mb-0">
                                {donation.anonymous ? "Anonymous" : "Public"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </DanboxLayout>
  );
}
