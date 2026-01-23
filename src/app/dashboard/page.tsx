'use client';

import DanboxLayout from "@/layout/DanboxLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContextProxy";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const displayName = user?.fullName || 
                     user?.email?.split('@')[0] ||
                     'User';

  return (
    <ProtectedRoute>
      <DanboxLayout header={2} footer={2}>
        <section className="about-section section-padding">
          <div className="container">
            <div className="row g-4">
              <div className="col-12">
                <div className="section-title">
                  <h2>Welcome back, {displayName}!</h2>
                  <p>
                    Manage your contributions, track your impact, and participate in voting.
                  </p>
                </div>
              </div>

            <div className="col-lg-4">
              <div className="service-card-items" style={{ borderRadius: 0 }}>
                <div className="content">
                  <h4>My Contributions</h4>
                  <p>Total amount you have donated across all funds.</p>
                  <h3 style={{ marginTop: 12 }}>$XX,XXX,XXX VND</h3>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="service-card-items" style={{ borderRadius: 0 }}>
                <div className="content">
                  <h4>Impact Tracking</h4>
                  <p>"Your donations have helped [X] children and provided [Y] meals."</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="service-card-items" style={{ borderRadius: 0 }}>
                <div className="content">
                  <h4>Voting Participation</h4>
                  <p>Pending expense requests that need your approval.</p>
                  <ul style={{ marginTop: 12, marginBottom: 0, paddingLeft: 18 }}>
                    <li>Request #01 – Medical supplies – $XX,XXX,XXX VND</li>
                    <li>Request #02 – Food distribution – $XX,XXX,XXX VND</li>
                    <li>Request #03 – Transportation – $XX,XXX,XXX VND</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </DanboxLayout>
    </ProtectedRoute>
  );
}
