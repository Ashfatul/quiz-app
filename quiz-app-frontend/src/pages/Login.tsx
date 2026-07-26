import React, { useState } from 'react';
import { LogIn, Key, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { loginUser, setAuthToken } from '../services/api';

interface LoginProps {
  setCurrentUser: (user: any) => void;
  navigate: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ setCurrentUser, navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      /**
       * FETCH REQUEST: loginUser(data)
       * ENDPOINT: POST /login
       * SUBMIT_BODY:
       * {
       *   "email": email,      // e.g. "coder@example.com"
       *   "password": password // e.g. "password123"
       * }
       */
      const data = await loginUser({ email, password });
      
      const token = data.accessToken || data.token || data.access_token;
      const user = data.user || {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        avatar: data.avatar
      };

      if (!token) {
        throw new Error('Invalid response: Token not found in server response.');
      }
      
      // Save details
      setAuthToken(token);
      localStorage.setItem('quiz_user', JSON.stringify(user));
      setCurrentUser(user);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <LogIn size={32} color="#fff" />
          </div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Log in to test your skills and view stats</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <CheckCircle size={20} />
            <span>Login successful! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.inputWithIcon}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={styles.inputWrapper}>
              <Key size={18} style={styles.inputIcon} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.inputWithIcon}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Don't have an account? </span>
          <a onClick={() => navigate('/register')} style={styles.link}>
            Register here
          </a>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: '2rem',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center' as const,
  },
  header: {
    marginBottom: '2rem',
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
  },
  title: {
    fontSize: '1.75rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#9ca3af',
  },
  form: {
    textAlign: 'left' as const,
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute' as const,
    left: '12px',
    color: '#9ca3af',
    pointerEvents: 'none' as const,
  },
  inputWithIcon: {
    paddingLeft: '2.5rem',
  },
  submitBtn: {
    width: '100%',
    marginTop: '1rem',
    padding: '0.85rem',
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    textAlign: 'left' as const,
  },
  successAlert: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    textAlign: 'left' as const,
  },
  footer: {
    marginTop: '1.5rem',
    fontSize: '0.875rem',
    color: '#9ca3af',
  },
  link: {
    color: '#6366f1',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
  },
};
