/*
 * ==================================================================================
 * BACKEND INTEGRATION GUIDE - TrustFundMe Authentication
 * ==================================================================================
 * 
 * 📌 API ENDPOINTS NEEDED:
 * ------------------------
 * 
 * 1. POST /api/auth/check-email
 *    Request: { email: string }
 *    Response: { exists: boolean, firstName?: string, lastName?: string }
 *    Purpose: Check if email exists in database
 * 
 * 2. POST /api/auth/register
 *    Request: { email: string, password: string, firstName: string, lastName: string }
 *    Response: { success: boolean, accessToken: string, refreshToken: string, user: {...} }
 *    Purpose: Create new user account
 * 
 * 3. POST /api/auth/login
 *    Request: { email: string, password: string }
 *    Response: { success: boolean, accessToken: string, refreshToken: string, user: {...} }
 *    Purpose: Login with email + password
 * 
 * 4. POST /api/auth/google
 *    Request: { idToken: string } (from Google OAuth)
 *    Response: { success: boolean, accessToken: string, refreshToken: string, user: {...} }
 *    Purpose: Google OAuth login/registration
 * 
 * 5. POST /api/auth/forgot-password
 *    Request: { email: string }
 *    Response: { success: boolean, message: string }
 *    Purpose: Send password reset email
 * 
 * 6. POST /api/auth/reset-password
 *    Request: { token: string, newPassword: string }
 *    Response: { success: boolean }
 *    Purpose: Reset password with token from email
 * 
 * 7. POST /api/auth/refresh
 *    Request: { refreshToken: string } (from httpOnly cookie)
 *    Response: { accessToken: string }
 *    Purpose: Get new access token using refresh token
 * 
 * 8. POST /api/auth/logout
 *    Request: { refreshToken: string }
 *    Response: { success: boolean }
 *    Purpose: Revoke refresh token and logout
 * 
 * ==================================================================================
 * 🔐 SECURITY REQUIREMENTS (CRITICAL!)
 * ==================================================================================
 * 
 * PASSWORD STORAGE:
 * -----------------
 * ❌ NEVER store plain text passwords in database
 * ✅ Use bcrypt with cost factor 12+ OR Argon2id
 * 
 * Example (bcrypt):
 *   const bcrypt = require('bcrypt');
 *   const saltRounds = 12;
 *   const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
 * 
 * Example (Argon2):
 *   const argon2 = require('argon2');
 *   const hashedPassword = await argon2.hash(plainPassword);
 * 
 * PASSWORD VALIDATION:
 * --------------------
 * Backend MUST validate:
 * - Minimum 12 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 symbol (!@#$%^&*()_+-=[]{}|;:,.<>?)
 * 
 * JWT TOKEN STRATEGY:
 * -------------------
 * Access Token:
 *   - Short-lived: 15-30 minutes
 *   - Contains: { sub: userId, email, role, iat, exp }
 *   - Stored in: httpOnly cookie
 *   - Used for: API authorization
 * 
 * Refresh Token:
 *   - Long-lived: 7-30 days
 *   - Contains: { sub: userId, tokenId, iat, exp }
 *   - Stored in: Database + httpOnly cookie
 *   - Used for: Getting new access tokens
 *   - MUST be revocable (store in DB with active/revoked status)
 * 
 * Example JWT payload (Access Token):
 *   {
 *     "sub": "user_id_12345",
 *     "email": "user@example.com",
 *     "role": "user",
 *     "iat": 1609459200,
 *     "exp": 1609460100
 *   }
 * 
 * COOKIE SECURITY:
 * ----------------
 * Access Token Cookie:
 *   res.cookie("access_token", accessToken, {
 *     httpOnly: true,        // Prevents XSS attacks
 *     secure: true,          // HTTPS only (use in production)
 *     sameSite: "strict",    // Prevents CSRF attacks
 *     maxAge: 15 * 60 * 1000 // 15 minutes
 *   });
 * 
 * Refresh Token Cookie:
 *   res.cookie("refresh_token", refreshToken, {
 *     httpOnly: true,
 *     secure: true,
 *     sameSite: "strict",
 *     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
 *   });
 * 
 * DATABASE SCHEMA FOR REFRESH TOKENS:
 * ------------------------------------
 * Table: refresh_tokens
 *   - id: UUID (primary key)
 *   - user_id: UUID (foreign key to users table)
 *   - token: string (hashed refresh token)
 *   - expires_at: timestamp
 *   - created_at: timestamp
 *   - revoked: boolean (default: false)
 *   - revoked_at: timestamp (nullable)
 * 
 * ADDITIONAL SECURITY MEASURES:
 * ------------------------------
 * 1. Rate Limiting:
 *    - Login attempts: 5 per 15 minutes per IP
 *    - Registration: 3 per hour per IP
 *    - Password reset: 3 per hour per email
 * 
 * 2. Email Verification:
 *    - Send verification email after registration
 *    - User cannot login until email is verified
 *    - Verification token expires in 24 hours
 * 
 * 3. Password Reset:
 *    - Generate secure random token (32+ bytes)
 *    - Token expires in 15-30 minutes
 *    - One-time use only (delete after successful reset)
 *    - Send reset link via email
 * 
 * 4. CSRF Protection:
 *    - Use CSRF tokens for all state-changing operations
 *    - Validate CSRF token on backend
 * 
 * 5. Input Validation:
 *    - Sanitize all user inputs
 *    - Validate email format
 *    - Validate password strength
 *    - Prevent SQL injection (use parameterized queries)
 * 
 * 6. Logging & Monitoring:
 *    - Log all authentication attempts (success/failure)
 *    - Monitor for suspicious patterns
 *    - Alert on multiple failed login attempts
 * 
 * ==================================================================================
 * 📊 AUTHENTICATION FLOW DIAGRAM
 * ==================================================================================
 * 
 * NEW USER FLOW:
 * --------------
 * 1. User enters email → Click "Continue"
 * 2. Frontend calls: POST /api/auth/check-email { email }
 * 3. Backend responds: { exists: false }
 * 4. Frontend shows: Registration form (firstName, lastName, email, password)
 * 5. User fills form → Click "Sign Up"
 * 6. Frontend calls: POST /api/auth/register { email, password, firstName, lastName }
 * 7. Backend:
 *    - Validates password strength
 *    - Hashes password with bcrypt/argon2
 *    - Creates user in database
 *    - Generates access + refresh tokens
 *    - Stores refresh token in database
 *    - Sets httpOnly cookies
 *    - Sends verification email (optional)
 * 8. Backend responds: { success: true, accessToken, refreshToken, user }
 * 9. Frontend redirects to: /dashboard
 * 
 * EXISTING USER FLOW:
 * -------------------
 * 1. User enters email → Click "Continue"
 * 2. Frontend calls: POST /api/auth/check-email { email }
 * 3. Backend responds: { exists: true, firstName: "John", lastName: "Doe" }
 * 4. Frontend shows: Password input field
 * 5. User enters password → Click "Sign In"
 * 6. Frontend calls: POST /api/auth/login { email, password }
 * 7. Backend:
 *    - Finds user by email
 *    - Compares password: bcrypt.compare(plainPassword, hashedPassword)
 *    - If valid: Generates tokens, sets cookies
 *    - If invalid: Returns error
 * 8. Backend responds: { success: true, accessToken, refreshToken, user }
 * 9. Frontend redirects to: /dashboard
 * 
 * FORGOT PASSWORD FLOW:
 * ---------------------
 * 1. User clicks "Forgot password?" (only visible after email check shows exists: true)
 * 2. Frontend calls: POST /api/auth/forgot-password { email }
 * 3. Backend:
 *    - Generates secure reset token
 *    - Stores token in database with expiration (15-30 min)
 *    - Sends email with reset link: https://trustfundme.com/reset-password?token=xyz
 * 4. User clicks link in email
 * 5. Frontend shows: New password form
 * 6. User enters new password → Click "Reset Password"
 * 7. Frontend calls: POST /api/auth/reset-password { token, newPassword }
 * 8. Backend:
 *    - Validates token (not expired, not used)
 *    - Validates new password strength
 *    - Hashes new password
 *    - Updates user password in database
 *    - Marks token as used
 *    - Revokes all existing refresh tokens for user (force re-login)
 * 9. Frontend redirects to: /sign-in with success message
 * 
 * TOKEN REFRESH FLOW:
 * -------------------
 * 1. Frontend makes API call, receives 401 Unauthorized (access token expired)
 * 2. Frontend calls: POST /api/auth/refresh (refresh token sent via httpOnly cookie)
 * 3. Backend:
 *    - Validates refresh token (not expired, not revoked, exists in DB)
 *    - Generates new access token
 *    - Sets new access token cookie
 * 4. Backend responds: { accessToken }
 * 5. Frontend retries original API call with new access token
 * 
 * LOGOUT FLOW:
 * ------------
 * 1. User clicks "Logout"
 * 2. Frontend calls: POST /api/auth/logout
 * 3. Backend:
 *    - Marks refresh token as revoked in database
 *    - Clears access + refresh token cookies
 * 4. Frontend redirects to: /sign-in
 * 
 * ==================================================================================
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// ==================================================================================
// TYPES
// ==================================================================================

type Step = "email-entry" | "password-entry" | "sign-up" | "forgot-password";

type FakeUserDb = {
  [email: string]: {
    firstName: string;
    lastName: string;
    password: string; // NOTE: In real backend, this would be hashed!
  };
};

type PasswordValidation = {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
};

// ==================================================================================
// UTILITY FUNCTIONS
// ==================================================================================

const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Validates password strength according to security requirements
 * 
 * BACKEND TODO: Implement identical validation on server side
 * - Minimum 12 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 symbol (!@#$%^&*()_+-=[]{}|;:,.<>?)
 */
const validatePassword = (password: string): PasswordValidation => {
  return {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
  };
};

const isPasswordValid = (validation: PasswordValidation): boolean => {
  return (
    validation.minLength &&
    validation.hasUppercase &&
    validation.hasLowercase &&
    validation.hasNumber &&
    validation.hasSymbol
  );
};

// ==================================================================================
// MAIN COMPONENT
// ==================================================================================

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();

  // ==================================================================================
  // STATE MANAGEMENT
  // ==================================================================================

  const [step, setStep] = useState<Step>("email-entry");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Sign up states
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [signUpPassword, setSignUpPassword] = useState<string>("");
  const [showSignUpPassword, setShowSignUpPassword] = useState<boolean>(false);
  
  // Field touched states (for validation)
  const [firstNameTouched, setFirstNameTouched] = useState<boolean>(false);
  const [lastNameTouched, setLastNameTouched] = useState<boolean>(false);
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);

  // UI states
  const [error, setError] = useState<string>("");
  const [info, setInfo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // User info (when email exists)
  const [existingUserName, setExistingUserName] = useState<string>("");

  // ==================================================================================
  // FAKE DATABASE (Frontend-only simulation)
  // ==================================================================================
  // BACKEND TODO: Replace with real API calls to check email existence
  // Example: const response = await fetch('/api/auth/check-email', { method: 'POST', body: JSON.stringify({ email }) })

  const fakeUsers: FakeUserDb = useMemo(() => {
    return {
      "demo@trustfundme.com": {
        firstName: "Demo",
        lastName: "User",
        password: "Demo@1234567", // NOTE: In real backend, this would be bcrypt hash!
      },
      "john@example.com": {
        firstName: "John",
        lastName: "Doe",
        password: "SecurePass123!",
      },
    };
  }, []);

  // ==================================================================================
  // PASSWORD VALIDATION (Real-time)
  // ==================================================================================

  const passwordValidation = useMemo(() => {
    return validatePassword(signUpPassword);
  }, [signUpPassword]);

  const isSignUpPasswordValid = useMemo(() => {
    return isPasswordValid(passwordValidation);
  }, [passwordValidation]);

  // Field validation errors
  const firstNameError = useMemo(() => {
    if (!firstNameTouched) return "";
    if (!firstName.trim()) return "Please fill out this field.";
    return "";
  }, [firstNameTouched, firstName]);

  const lastNameError = useMemo(() => {
    if (!lastNameTouched) return "";
    if (!lastName.trim()) return "Please fill out this field.";
    return "";
  }, [lastNameTouched, lastName]);

  const emailError = useMemo(() => {
    if (!emailTouched) return "";
    if (!email.trim()) return "Please fill out this field.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    return "";
  }, [emailTouched, email]);

  const passwordErrorMessage = useMemo(() => {
    if (!passwordTouched) return "";
    if (!signUpPassword) return "Please fill out this field.";
    if (!isSignUpPasswordValid) {
      return "Value does not comply with requirements";
    }
    return "";
  }, [passwordTouched, signUpPassword, isSignUpPasswordValid]);

  // ==================================================================================
  // HANDLERS
  // ==================================================================================

  /**
   * Handle email continue button click
   * Checks if email exists in database
   * 
   * BACKEND TODO: Replace with API call
   * POST /api/auth/check-email
   * Request: { email: string }
   * Response: { exists: boolean, firstName?: string, lastName?: string }
   */
  const handleEmailContinue = async (): Promise<void> => {
    setError("");
    setInfo("");

    // Validate email format
    if (!email.trim()) {
      setError("Please fill out this field.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    // BACKEND TODO: Replace this with actual API call
    // Example:
    // try {
    //   const response = await fetch('/api/auth/check-email', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email: normalizeEmail(email) })
    //   });
    //   const data = await response.json();
    //   if (data.exists) {
    //     setExistingUserName(`${data.firstName} ${data.lastName}`);
    //     setStep("password-entry");
    //   } else {
    //     setStep("sign-up");
    //   }
    // } catch (error) {
    //   setError("Something went wrong. Please try again.");
    // }

    // Frontend simulation
    setTimeout(() => {
      const normalized = normalizeEmail(email);
      const user = fakeUsers[normalized];

      if (user) {
        // Email exists - show password entry
        setExistingUserName(`${user.firstName} ${user.lastName}`);
        setStep("password-entry");
      } else {
        // Email doesn't exist - show sign up form
        setStep("sign-up");
      }

      setLoading(false);
    }, 500);
  };

  /**
   * Handle sign in with password
   * 
   * BACKEND TODO: Replace with API call
   * POST /api/auth/login
   * Request: { email: string, password: string }
   * Response: { success: boolean, accessToken: string, refreshToken: string, user: {...} }
   * 
   * Backend should:
   * 1. Find user by email
   * 2. Compare password: await bcrypt.compare(password, user.hashedPassword)
   * 3. If valid: Generate JWT tokens, set httpOnly cookies
   * 4. Return user info and tokens
   */
  const handleSignIn = async (): Promise<void> => {
    setError("");
    setInfo("");

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    // BACKEND TODO: Replace with actual API call
    // Example:
    // try {
    //   const response = await fetch('/api/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     credentials: 'include', // Important for cookies
    //     body: JSON.stringify({ email: normalizeEmail(email), password })
    //   });
    //   
    //   if (response.ok) {
    //     const data = await response.json();
    //     // Tokens are automatically stored in httpOnly cookies by backend
    //     router.push('/dashboard');
    //   } else {
    //     const error = await response.json();
    //     setError(error.message || 'Invalid email or password');
    //   }
    // } catch (error) {
    //   setError("Something went wrong. Please try again.");
    // }

    // Frontend simulation
    setTimeout(() => {
      const normalized = normalizeEmail(email);
      const user = fakeUsers[normalized];

      if (user && user.password === password) {
        // Success - login user and redirect to homepage
        login({
          id: `user_${Date.now()}`,
          firstName: user.firstName,
          lastName: user.lastName,
          email: normalized,
          phone: "+84123456703",
          birthday: "1990-01-01",
        });
        router.push("/");
      } else {
        setError("Invalid password. Please try again.");
        setLoading(false);
      }
    }, 500);
  };

  /**
   * Handle user registration
   * 
   * BACKEND TODO: Replace with API call
   * POST /api/auth/register
   * Request: { email: string, password: string, firstName: string, lastName: string }
   * Response: { success: boolean, accessToken: string, refreshToken: string, user: {...} }
   * 
   * Backend should:
   * 1. Validate all inputs (email format, password strength, required fields)
   * 2. Check if email already exists
   * 3. Hash password: await bcrypt.hash(password, 12)
   * 4. Create user in database
   * 5. Generate JWT tokens (access + refresh)
   * 6. Store refresh token in database
   * 7. Set httpOnly cookies
   * 8. Send verification email (optional but recommended)
   * 9. Return user info and tokens
   */
  const handleSignUp = async (): Promise<void> => {
    setError("");
    setInfo("");

    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !signUpPassword.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    // Validate password strength
    if (!isSignUpPasswordValid) {
      setError("Password does not meet security requirements.");
      return;
    }

    setLoading(true);

    // BACKEND TODO: Replace with actual API call
    // Example:
    // try {
    //   const response = await fetch('/api/auth/register', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     credentials: 'include', // Important for cookies
    //     body: JSON.stringify({
    //       email: normalizeEmail(email),
    //       password: signUpPassword,
    //       firstName: firstName.trim(),
    //       lastName: lastName.trim()
    //     })
    //   });
    //   
    //   if (response.ok) {
    //     const data = await response.json();
    //     // Show success message if email verification is required
    //     // setInfo("Account created! Please check your email to verify your account.");
    //     // Or redirect directly if no verification needed
    //     router.push('/dashboard');
    //   } else {
    //     const error = await response.json();
    //     setError(error.message || 'Registration failed');
    //   }
    // } catch (error) {
    //   setError("Something went wrong. Please try again.");
    // }

    // Frontend simulation
    setTimeout(() => {
      // Success - create user, login and redirect to homepage
      const normalized = normalizeEmail(email);
      login({
        id: `user_${Date.now()}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalized,
        phone: "+84123456703",
        birthday: "1990-01-01",
      });
      router.push("/");
    }, 500);
  };

  /**
   * Handle forgot password
   * 
   * BACKEND TODO: Replace with API call
   * POST /api/auth/forgot-password
   * Request: { email: string }
   * Response: { success: boolean, message: string }
   * 
   * Backend should:
   * 1. Check if email exists
   * 2. Generate secure reset token (crypto.randomBytes(32).toString('hex'))
   * 3. Store token in database with expiration (15-30 minutes)
   * 4. Send email with reset link: https://trustfundme.com/reset-password?token=xyz
   * 5. Return generic success message (don't reveal if email exists for security)
   */
  const handleForgotPassword = async (): Promise<void> => {
    setError("");
    setInfo("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    // BACKEND TODO: Replace with actual API call
    // Example:
    // try {
    //   const response = await fetch('/api/auth/forgot-password', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email: normalizeEmail(email) })
    //   });
    //   
    //   const data = await response.json();
    //   setInfo(data.message);
    // } catch (error) {
    //   setError("Something went wrong. Please try again.");
    // }

    // Frontend simulation
    setTimeout(() => {
      setInfo("If this email exists in our system, you will receive a password reset link shortly.");
      setLoading(false);
    }, 500);
  };

  /**
   * Handle Google OAuth login
   * 
   * BACKEND TODO: Implement Google OAuth flow
   * 1. Frontend: Redirect to Google OAuth consent screen
   * 2. Google: User authorizes, redirects back with authorization code
   * 3. Frontend: Send code to backend
   * 4. Backend: Exchange code for Google ID token
   * 5. Backend: Verify ID token with Google
   * 6. Backend: Get user info from token (email, name, etc.)
   * 7. Backend: Check if user exists by email
   *    - If exists: Login user, generate tokens
   *    - If not exists: Create new user, generate tokens
   * 8. Backend: Set httpOnly cookies and return user info
   * 9. Frontend: Redirect to dashboard
   * 
   * Libraries to use:
   * - Frontend: @react-oauth/google or next-auth
   * - Backend: google-auth-library
   */
  const handleGoogleSignIn = (): void => {
    // BACKEND TODO: Implement Google OAuth
    // Example using @react-oauth/google:
    // import { useGoogleLogin } from '@react-oauth/google';
    // 
    // const login = useGoogleLogin({
    //   onSuccess: async (response) => {
    //     const result = await fetch('/api/auth/google', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       credentials: 'include',
    //       body: JSON.stringify({ idToken: response.credential })
    //     });
    //     if (result.ok) {
    //       router.push('/dashboard');
    //     }
    //   }
    // });

    // Frontend simulation - giả lập Google login
    setError("");
    setInfo("");
    
    // Giả lập user data từ Google
    const googleUser = {
      id: `google_user_${Date.now()}`,
      firstName: "Google",
      lastName: "User",
      email: "google.user@example.com",
      phone: "+84123456703",
      birthday: "1990-01-01",
    };
    
    // Login và redirect to homepage
    login(googleUser);
    router.push("/");
  };

  /**
   * Handle back to email entry
   */
  const handleBackToEmail = (): void => {
    setStep("email-entry");
    setPassword("");
    setSignUpPassword("");
    setFirstName("");
    setLastName("");
    setError("");
    setInfo("");
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setEmailTouched(false);
    setPasswordTouched(false);
  };

  /**
   * Handle field blur (when user leaves field)
   */
  const handleFirstNameBlur = (): void => {
    setFirstNameTouched(true);
  };

  const handleLastNameBlur = (): void => {
    setLastNameTouched(true);
  };

  const handleEmailBlur = (): void => {
    setEmailTouched(true);
  };

  const handlePasswordBlur = (): void => {
    setPasswordTouched(true);
  };

  // ==================================================================================
  // RENDER
  // ==================================================================================

  return (
    <>
      {/* Main container with centered card */}
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Link href="/" className="inline-block">
                <img 
                  src="/assets/img/logo/black-logo.png" 
                  alt="TrustFundMe Logo" 
                  className="h-12 w-auto hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>

            {/* Subheading */}
            {step !== "sign-up" && (
              <div className="text-center mb-8">
                <p className="text-gray-600">
                  Sign in to TrustFundMe or sign up to continue
                </p>
              </div>
            )}

            {/* Error/Info Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {info && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{info}</p>
              </div>
            )}

            {/* Google Sign In Button (only show on email-entry step) */}
            {step === "email-entry" && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or</span>
                  </div>
                </div>
              </>
            )}

            {/* EMAIL ENTRY STEP */}
            {step === "email-entry" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEmailContinue();
                }}
              >
                <div className="mb-6">
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      placeholder=" "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 peer"
                      required
                    />
                    <label 
                      htmlFor="email" 
                      className="absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                    >
                      Email
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Please wait..." : "Continue"}
                </button>

                <p className="text-center text-xs text-gray-500 mt-6">
                  This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
                </p>
              </form>
            )}

            {/* PASSWORD ENTRY STEP (Existing User) */}
            {step === "password-entry" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignIn();
                }}
              >
                <div className="mb-4">
                  <div className="relative">
                    <input
                      id="emailDisplay"
                      type="email"
                      placeholder=" "
                      value={email}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 outline-none text-gray-900 peer"
                    />
                    <label 
                      htmlFor="emailDisplay" 
                      className="absolute left-4 -top-2 text-xs bg-white px-1 text-gray-500"
                    >
                      Email
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder=" "
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 peer"
                      required
                    />
                    <label 
                      htmlFor="password" 
                      className="absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <button
                    type="button"
                    onClick={() => setStep("forgot-password")}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    Change email
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            )}

            {/* SIGN UP STEP (New User) */}
            {step === "sign-up" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignUp();
                }}
              >
                <div className="mb-4">
                  <div className="relative">
                    <input
                      id="firstName"
                      type="text"
                      placeholder=" "
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={handleFirstNameBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all text-gray-900 peer ${
                        firstNameTouched && firstNameError
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                      }`}
                      required
                    />
                    <label 
                      htmlFor="firstName" 
                      className="absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                    >
                      First Name
                    </label>
                  </div>
                  {firstNameError && (
                    <p className="text-xs text-red-500 mt-1 animate-fade-in">{firstNameError}</p>
                  )}
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      id="lastName"
                      type="text"
                      placeholder=" "
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={handleLastNameBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all text-gray-900 peer ${
                        lastNameTouched && lastNameError
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                      }`}
                      required
                    />
                    <label 
                      htmlFor="lastName" 
                      className="absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                    >
                      Last Name
                    </label>
                  </div>
                  {lastNameError && (
                    <p className="text-xs text-red-500 mt-1 animate-fade-in">{lastNameError}</p>
                  )}
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      id="signupEmail"
                      type="email"
                      placeholder=" "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={handleEmailBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all text-gray-900 peer ${
                        emailTouched && emailError
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                      }`}
                      required
                    />
                    <label 
                      htmlFor="signupEmail" 
                      className="absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                    >
                      Email Address
                    </label>
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-500 mt-1 animate-fade-in">{emailError}</p>
                  )}
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      id="signupPassword"
                      type={showSignUpPassword ? "text" : "password"}
                      placeholder=" "
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      onBlur={handlePasswordBlur}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 outline-none transition-all text-gray-900 peer ${
                        passwordTouched && !isSignUpPasswordValid
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                      }`}
                      required
                    />
                    <label 
                      htmlFor="signupPassword" 
                      className="absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showSignUpPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrorMessage && (
                    <p className="text-xs text-red-500 mt-1 animate-fade-in">{passwordErrorMessage}</p>
                  )}
                </div>

                {/* Password Requirements (Real-time validation) */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Your password must have at least:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      {passwordValidation.minLength ? (
                        <svg className="w-4 h-4 text-green-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : passwordTouched ? (
                        <svg className="w-4 h-4 text-red-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="3" />
                        </svg>
                      )}
                      <span className={passwordValidation.minLength ? "text-green-700" : passwordTouched ? "text-red-600" : "text-gray-600"}>
                        Minimum 12 characters
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      {passwordValidation.hasUppercase ? (
                        <svg className="w-4 h-4 text-green-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : passwordTouched ? (
                        <svg className="w-4 h-4 text-red-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="3" />
                        </svg>
                      )}
                      <span className={passwordValidation.hasUppercase ? "text-green-700" : passwordTouched ? "text-red-600" : "text-gray-600"}>
                        1 uppercase letter
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      {passwordValidation.hasLowercase ? (
                        <svg className="w-4 h-4 text-green-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : passwordTouched ? (
                        <svg className="w-4 h-4 text-red-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="3" />
                        </svg>
                      )}
                      <span className={passwordValidation.hasLowercase ? "text-green-700" : passwordTouched ? "text-red-600" : "text-gray-600"}>
                        1 lowercase letter
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      {passwordValidation.hasNumber ? (
                        <svg className="w-4 h-4 text-green-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : passwordTouched ? (
                        <svg className="w-4 h-4 text-red-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="3" />
                        </svg>
                      )}
                      <span className={passwordValidation.hasNumber ? "text-green-700" : passwordTouched ? "text-red-600" : "text-gray-600"}>
                        1 number
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      {passwordValidation.hasSymbol ? (
                        <svg className="w-4 h-4 text-green-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : passwordTouched ? (
                        <svg className="w-4 h-4 text-red-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="3" />
                        </svg>
                      )}
                      <span className={passwordValidation.hasSymbol ? "text-green-700" : passwordTouched ? "text-red-600" : "text-gray-600"}>
                        1 symbol
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isSignUpPasswordValid}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {loading ? "Creating account..." : "Sign up"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    Back to email
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD STEP */}
            {step === "forgot-password" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleForgotPassword();
                }}
              >
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <div className="mb-6">
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("password-entry")}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            )}

            {/* Footer Links */}
            {step === "email-entry" && (
              <div className="mt-6 text-center">
                <Link href="/" className="text-sm text-gray-600 hover:underline">
                  Back to Home
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}





