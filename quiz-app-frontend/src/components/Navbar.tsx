import React from 'react';
import { BookOpen, LogIn, LogOut, PlusCircle, Trophy, UserPlus, Zap, Settings } from 'lucide-react';
import { clearAuth } from '../services/api';

interface NavbarProps {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  navigate: (path: string) => void;
  currentPath: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  setCurrentUser,
  navigate,
  currentPath,
}) => {
  const handleLogout = () => {
    clearAuth();
    setCurrentUser(null);
    navigate('/login');
  };

  const isActive = (path: string) => currentPath === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.brand} onClick={() => navigate('/')}>
        <BookOpen size={28} color="#6366f1" />
        <span style={styles.logoText}>NestJS Quiz <span style={styles.badge}>LEARNER</span></span>
      </div>

      <div style={styles.menu}>
        <button
          className="btn"
          style={isActive('/') ? styles.activeLink : styles.link}
          onClick={() => navigate('/')}
        >
          <Trophy size={18} />
          Explore
        </button>

        {currentUser && (
          <>
            {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
              <>
                <button
                  className="btn"
                  style={isActive('/quizzes/create') ? styles.activeLink : styles.link}
                  onClick={() => navigate('/quizzes/create')}
                >
                  <PlusCircle size={18} />
                  Create Quiz
                </button>
                <button
                  className="btn"
                  style={isActive('/categories') ? styles.activeLink : styles.link}
                  onClick={() => navigate('/categories')}
                >
                  <Settings size={18} />
                  Manage Categories
                </button>
              </>
            )}
            <button
              className="btn"
              style={isActive('/lobby') ? styles.activeLink : styles.link}
              onClick={() => navigate('/lobby')}
            >
              <Zap size={18} />
              Live Multiplayer
            </button>
          </>
        )}
      </div>

      <div style={styles.authSection}>
        {currentUser ? (
          <div style={styles.profileContainer}>
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl.startsWith('http') ? currentUser.avatarUrl : `http://localhost:3000${currentUser.avatarUrl}`}
                alt={currentUser.username}
                style={styles.avatar}
                onError={(e) => {
                  // Fallback if avatar fails to load
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`;
                }}
              />
            ) : (
              <div style={styles.avatarFallback}>
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div style={styles.profileDetails}>
              <span style={styles.username}>{currentUser.username}</span>
              <span style={styles.userRole}>
                {currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Student'}
              </span>
            </div>
            <button className="btn btn-secondary" onClick={handleLogout} style={styles.logoutBtn}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <div style={styles.authButtons}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/login')}
              style={styles.btnSmall}
            >
              <LogIn size={16} />
              Login
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/register')}
              style={styles.btnSmall}
            >
              <UserPlus size={16} />
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'rgba(11, 15, 25, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  badge: {
    fontSize: '0.7rem',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#6366f1',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    fontWeight: 600,
  },
  menu: {
    display: 'flex',
    gap: '0.5rem',
  },
  link: {
    background: 'transparent',
    color: '#9ca3af',
    border: 'none',
    boxShadow: 'none',
    padding: '0.5rem 1rem',
  },
  activeLink: {
    background: 'rgba(99, 102, 241, 0.12)',
    color: '#6366f1',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    boxShadow: 'none',
    padding: '0.5rem 1rem',
  },
  authSection: {
    display: 'flex',
    alignItems: 'center',
  },
  authButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  btnSmall: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
  },
  profileContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '2px solid #6366f1',
  },
  avatarFallback: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#312e81',
    color: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    border: '2px solid #6366f1',
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    lineHeight: '1.2',
  },
  username: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#f3f4f6',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  logoutBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
    marginLeft: '0.5rem',
  },
};
