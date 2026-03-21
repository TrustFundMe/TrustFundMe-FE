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
                  Bạn đã đăng xuất khỏi TrustFundMe an toàn.
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
                        Đừng bỏ lỡ bất kỳ khoản ủng hộ nào với ứng dụng TrustFundMe
                      </h3>
                      <ul className="list-unstyled mb-4" style={{ fontSize: "16px" }}>
                        <li className="mb-2 d-flex align-items-start gap-2">
                          <CheckCircle size={20} style={{ color: "#ff5e14", marginTop: "2px", flexShrink: 0 }} />
                          <span>Nhận mẹo và hướng dẫn gây quỹ hiệu quả</span>
                        </li>
                        <li className="mb-2 d-flex align-items-start gap-2">
                          <CheckCircle size={20} style={{ color: "#ff5e14", marginTop: "2px", flexShrink: 0 }} />
                          <span>Mở rộng nhiều cách chia sẻ chiến dịch hơn</span>
                        </li>
                        <li className="mb-2 d-flex align-items-start gap-2">
                          <CheckCircle size={20} style={{ color: "#ff5e14", marginTop: "2px", flexShrink: 0 }} />
                          <span>Đăng video cập nhật đến người ủng hộ</span>
                        </li>
                        <li className="mb-2 d-flex align-items-start gap-2">
                          <CheckCircle size={20} style={{ color: "#ff5e14", marginTop: "2px", flexShrink: 0 }} />
                          <span>Quản lý chiến dịch gây quỹ ở mọi nơi</span>
                        </li>
                      </ul>
                      <p className="text-muted mb-0">
                        Hoặc tìm "TrustFundMe" trên cửa hàng ứng dụng của bạn
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
                        "Ứng dụng giúp tôi theo dõi chiến dịch gây quỹ dễ dàng hơn rất nhiều. Tôi luôn mang điện thoại bên mình nên chỉ cần một lần chạm là xem được ngay. Mỗi khi có thông báo ủng hộ mới, tôi rất hào hứng và cũng dễ dàng gửi lời cảm ơn đến mọi người."
                      </p>
                      <div>
                        <strong style={{ color: "#202426" }}>Evan</strong>
                        <span className="text-muted"> - Người dùng ứng dụng TrustFundMe</span>
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
                  Làm gì để gây quỹ thành công hơn?
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
                          Chia sẻ với bạn bè và người thân
                        </h5>
                        <ul className="list-unstyled text-start" style={{ fontSize: "14px" }}>
                          <li className="mb-2">• Chia sẻ chiến dịch của bạn bằng thông điệp cá nhân hóa.</li>
                          <li>• Truyền cảm hứng để mọi người cùng bạn lan tỏa câu chuyện.</li>
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
                          Thiết lập rút tiền sớm
                        </h5>
                        <ul className="list-unstyled text-start" style={{ fontSize: "14px" }}>
                          <li className="mb-2">• Mời người thụ hưởng hoặc thiết lập tài khoản rút tiền sớm.</li>
                          <li>• Tiền có thể tự động chuyển vào tài khoản ngân hàng đã chỉ định.</li>
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
                          Mời thành viên đồng hành
                        </h5>
                        <ul className="list-unstyled text-start" style={{ fontSize: "14px" }}>
                          <li className="mb-2">• Thêm bạn bè và người thân làm thành viên để cùng gây quỹ.</li>
                          <li>• Thành viên có thể hỗ trợ chia sẻ chiến dịch, cảm ơn và cập nhật cho người ủng hộ.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quay về trang chủ */}
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
                  Về trang chủ
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
}
