/**
 * Auth Service - Calls Next.js API routes (which call BE API directly)
 * BE handles authentication and stores user data in MySQL
 */

interface LoginResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user: any;
  error?: string;
}

interface SignUpResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user: any;
  error?: string;
}

export const authService = {
  /**
   * Login with email and password - calls BE API
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        user: null,
        error: data.error || 'Login failed',
      };
    }

    // Store user info in localStorage (tokens are in httpOnly cookies)
    if (data.user) {
      localStorage.setItem('be_user', JSON.stringify(data.user));
    }

    return {
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };
  },

  /**
   * Sign up new user - calls BE API
   */
  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<SignUpResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || data.message || 'Signup failed';
      console.error('Signup API error:', { status: response.status, data });
      
      return {
        success: false,
        user: null,
        error: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
      };
    }

    // Store user info in localStorage (tokens are in httpOnly cookies)
    if (data.user) {
      localStorage.setItem('be_user', JSON.stringify(data.user));
    }

    return {
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };
  },

  /**
   * Get current session - verify token with BE
   */
  async getSession(): Promise<{ session: any; user: any }> {
    // Check localStorage for user info
    const storedUser = localStorage.getItem('be_user');
    
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    
    // If session is valid, return it; otherwise return stored user or null
    if (data.session && data.user) {
      // Update stored user
      localStorage.setItem('be_user', JSON.stringify(data.user));
      return data;
    }
    
    // Fallback to stored user
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return {
          session: { access_token: null, token_type: 'Bearer' },
          user,
        };
      } catch (e) {
        console.warn('Failed to parse stored user:', e);
      }
    }
    
    return { session: null, user: null };
  },

  /**
   * Logout - calls BE API to revoke token
   */
  async logout(): Promise<void> {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    localStorage.removeItem('be_user');
  },

  /**
   * Resend verification email
   * TODO: Implement in BE if needed
   */
  async resendVerificationEmail(email: string): Promise<{ error?: string }> {
    // TODO: Create BE endpoint for email verification
    return { error: 'Email verification not yet implemented in BE' };
  },

  /**
   * Forgot password - request password reset email
   * TODO: Implement in BE if needed
   */
  async forgotPassword(email: string): Promise<{ error?: string; message?: string }> {
    // TODO: Create BE endpoint for password reset
    return { error: 'Password reset not yet implemented in BE' };
  },

  /**
   * Check if email exists in system - calls BE API
   */
  async checkEmail(email: string): Promise<{
    exists: boolean;
    email: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      // Debug log
      console.log('Check email API response:', { status: response.status, data });
      
      if (!response.ok) {
        return {
          exists: false,
          email: email.trim().toLowerCase(),
          error: data.error || 'Failed to check email',
        };
      }
      
      // BE returns { exists: boolean, email: string, fullName?: string }
      // Ensure exists is boolean (not null/undefined)
      return {
        exists: data.exists === true, // Explicit boolean check
        email: data.email || email.trim().toLowerCase(),
        fullName: data.fullName,
        error: data.error,
      };
    } catch (error: any) {
      console.error('Check email service error:', error);
      return {
        exists: false,
        email: email.trim().toLowerCase(),
        error: error?.message || 'Failed to check email',
      };
    }
  },

  /**
   * Sign in with Google OAuth
   * TODO: BE needs to implement POST /api/auth/google endpoint
   */
  async signInWithGoogle(idToken: string): Promise<LoginResponse> {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        user: null,
        error: data.error || 'Google OAuth failed',
      };
    }

    // Store user info in localStorage (tokens are in httpOnly cookies)
    if (data.user) {
      localStorage.setItem('be_user', JSON.stringify(data.user));
    }

    return {
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };
  },
};
