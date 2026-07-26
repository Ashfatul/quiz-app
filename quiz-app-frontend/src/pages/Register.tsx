import React, { useState } from 'react';
import { UserPlus, User, Mail, Key, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { registerUser } from '../services/api';

interface RegisterProps {
  navigate: (path: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ navigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [avatar, setAvatar] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      /**
       * FETCH REQUEST: registerUser(data)
       * ENDPOINT: POST /auth/register
       * CONTENT-TYPE: multipart/form-data
       * SUBMIT_BODY:
       * {
       *   "username": username, // e.g. "johndoe"
       *   "email": email,       // e.g. "john@example.com"
       *   "password": password, // e.g. "password123"
       *   "role": role,         // "student" | "teacher"
       *   "avatar": File        // Binary stream (optional)
       * }
       */
      await registerUser({
        username,
        email,
        password,
        role,
        avatar: avatar || undefined
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <UserPlus size={32} color="#fff" />
          </div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join NestJS Quiz Learner community</p>
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
            <span>Registration successful! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.inputWithIcon}
              />
            </div>
          </div>

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
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={styles.inputWithIcon}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">I am a</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="student">Student (takes quizzes)</option>
              <option value="teacher">Teacher (creates quizzes)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="avatar">Profile Picture (Optional)</label>
            <div style={styles.fileInputContainer}>
              <label htmlFor="avatar" style={styles.fileLabel}>
                <Image size={18} />
                <span>{avatar ? avatar.name : 'Choose profile picture'}</span>
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={styles.fileInputHidden}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already have an account? </span>
          <a onClick={() => navigate('/login')} style={styles.link}>
            Login here
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
    maxWidth: '480px',
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
  fileInputContainer: {
    position: 'relative' as const,
    width: '100%',
  },
  fileInputHidden: {
    display: 'none',
  },
  fileLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#131a2e',
    border: '1px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    color: '#f3f4f6',
    cursor: 'pointer',
    justifyContent: 'center',
    fontSize: '0.95rem',
    margin: 0,
    width: '100%',
    transition: 'all 0.2s ease',
  },
  submitBtn: {
    width: '100%',
    marginTop: '1.5rem',
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
