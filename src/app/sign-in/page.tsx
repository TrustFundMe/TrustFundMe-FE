"use client";

import DanboxLayout from "@/layout/DanboxLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Step = "sign-in" | "forgot" | "sign-up";

type FakeUserDb = {
  // NOTE: Key is normalized email.
  [email: string]: {
    // NOTE: Minimal fields for frontend-only simulation.
    firstName: string;
    lastName: string;
  };
};

const normalizeEmail = (email: string): string => {
  // NOTE: Normalize email for consistent lookups.
  return email.trim().toLowerCase();
};

export default function SignInPage() {
  // NOTE: Router used for fake navigation after "login".
  const router = useRouter();

  // NOTE: Simple multi-step UI on the same page (Sign in / Forgot / Sign up).
  const [step, setStep] = useState<Step>("sign-in");

  // NOTE: Form states.
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // NOTE: Sign up states.
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [signUpPassword, setSignUpPassword] = useState<string>("");

  // NOTE: UI states.
  const [error, setError] = useState<string>("");
  const [info, setInfo] = useState<string>("");

  // NOTE: Frontend-only fake "database" in memory.
  const fakeUsers: FakeUserDb = useMemo(() => {
    // NOTE: Add one sample user to demonstrate the "email exists" flow.
    return {
      "demo@trustfundme.vn": { firstName: "Demo", lastName: "User" },
    };
  }, []);

  const onContinueSignIn = (): void => {
    // NOTE: Clear messages.
    setError("");
    setInfo("");

    // NOTE: Basic validation.
    if (!email.trim()) {
      setError("Please fill out this field.");
      return;
    }

    // NOTE: If email not found, redirect user to sign up step (as requested).
    const normalized = normalizeEmail(email);
    if (!fakeUsers[normalized]) {
      setInfo("We couldn't find an account with that email. Please create an account.");
      setStep("sign-up");
      return;
    }

    // NOTE: Per requirement: frontend-only, clicking login always succeeds.
    router.push("/dashboard");
  };

  const onGoogleSignIn = (): void => {
    // NOTE: Frontend-only simulation.
    setError("");
    setInfo("");
    router.push("/dashboard");
  };

  const onForgotPassword = (): void => {
    // NOTE: Frontend-only simulation: show message.
    setError("");
    if (!email.trim()) {
      setError("Please enter your email first.");
      return;
    }
    setInfo("If this email exists in our system, you will receive a password reset link shortly.");
  };

  const onCreateAccount = (): void => {
    // NOTE: Clear messages.
    setError("");
    setInfo("");

    // NOTE: Simple required fields validation.
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !signUpPassword.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    // NOTE: Frontend-only: pretend success and navigate to dashboard.
    router.push("/dashboard");
  };

  return (
    <DanboxLayout header={2} footer={2}>
      <section className="contact-section fix section-padding">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="contact-form-items" style={{ borderRadius: 0 }}>
                <div className="contact-title">
                  <h3>{step === "sign-up" ? "Create an account" : "Welcome"}</h3>
                  {step === "sign-up" ? (
                    <p>
                      Already have an account?{" "}
                      <a
                        href="#"
                        className="link"
                        onClick={(e) => {
                          e.preventDefault();
                          setError("");
                          setInfo("");
                          setStep("sign-in");
                        }}
                      >
                        Sign in
                      </a>
                    </p>
                  ) : (
                    <p>
                      Sign in to continue. If you don’t have an account, we’ll help you create one.
                    </p>
                  )}
                </div>

                {/* NOTE: Messages */}
                {error ? (
                  <div className="alert alert-danger" role="alert" style={{ borderRadius: 0 }}>
                    {error}
                  </div>
                ) : null}
                {info ? (
                  <div className="alert alert-success" role="alert" style={{ borderRadius: 0 }}>
                    {info}
                  </div>
                ) : null}

                {/* NOTE: Google Sign in button (no icon per requirement). */}
                {step !== "sign-up" ? (
                  <div className="mb-4">
                    <button
                      type="button"
                      className="theme-btn w-100"
                      style={{ borderRadius: 0, background: "#ffffff", color: "#1b1f2a", border: "1px solid #e5e5e5" }}
                      onClick={onGoogleSignIn}
                    >
                      Continue with Google
                    </button>
                  </div>
                ) : null}

                {step !== "sign-up" ? (
                  <div className="text-center mb-4">
                    <span style={{ display: "inline-block", padding: "0 10px", background: "#fff" }}>or</span>
                    <div style={{ height: 1, background: "#e5e5e5", marginTop: -12 }} />
                  </div>
                ) : null}

                {/* NOTE: Forms */}
                {step === "sign-in" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onContinueSignIn();
                    }}
                  >
                    <div className="form-clt">
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ borderRadius: 0 }}
                      />
                    </div>
                    <div className="form-clt">
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ borderRadius: 0 }}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <a
                        href="#"
                        className="link"
                        onClick={(e) => {
                          e.preventDefault();
                          setError("");
                          setInfo("");
                          setStep("forgot");
                        }}
                      >
                        Forgot password?
                      </a>
                      <Link href="/" className="link">
                        Back to Home
                      </Link>
                    </div>

                    <button type="submit" className="theme-btn w-100" style={{ borderRadius: 0 }}>
                      Sign in
                    </button>
                  </form>
                ) : null}

                {step === "forgot" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onForgotPassword();
                    }}
                  >
                    <div className="form-clt">
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ borderRadius: 0 }}
                      />
                    </div>

                    <button type="submit" className="theme-btn w-100" style={{ borderRadius: 0 }}>
                      Send reset link
                    </button>

                    <div className="text-center mt-4">
                      <a
                        href="#"
                        className="link"
                        onClick={(e) => {
                          e.preventDefault();
                          setError("");
                          setInfo("");
                          setStep("sign-in");
                        }}
                      >
                        Back to Sign in
                      </a>
                    </div>
                  </form>
                ) : null}

                {step === "sign-up" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onCreateAccount();
                    }}
                  >
                    <div className="form-clt">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={{ borderRadius: 0 }}
                      />
                    </div>
                    <div className="form-clt">
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={{ borderRadius: 0 }}
                      />
                    </div>
                    <div className="form-clt">
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ borderRadius: 0 }}
                      />
                    </div>
                    <div className="form-clt">
                      <input
                        type="password"
                        placeholder="Password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        style={{ borderRadius: 0 }}
                      />
                    </div>

                    <div className="mb-4" style={{ background: "#f2f6f7", padding: 16, borderRadius: 0 }}>
                      <p style={{ marginBottom: 10 }}>Your password must have at least:</p>
                      <ul style={{ marginBottom: 0, paddingLeft: 18 }}>
                        <li>Minimum 12 characters</li>
                        <li>1 uppercase letter</li>
                        <li>1 lowercase letter</li>
                        <li>1 number</li>
                        <li>1 symbol</li>
                      </ul>
                    </div>

                    <button type="submit" className="theme-btn w-100" style={{ borderRadius: 0 }}>
                      Sign up
                    </button>

                    <div className="text-center mt-4">
                      <a
                        href="#"
                        className="link"
                        onClick={(e) => {
                          e.preventDefault();
                          setError("");
                          setInfo("");
                          setStep("sign-in");
                        }}
                      >
                        Back to Sign in
                      </a>
                    </div>
                  </form>
                ) : null}

                {/* NOTE: Small disclaimer style similar to screenshot */}
                {step !== "sign-up" ? (
                  <p className="text-center mt-4" style={{ fontSize: 12, marginBottom: 0 }}>
                    This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
}
