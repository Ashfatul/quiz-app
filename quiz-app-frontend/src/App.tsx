import { useState, useEffect } from 'react';
import './App.css';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CreateQuiz } from './pages/CreateQuiz';
import { PlayQuiz } from './pages/PlayQuiz';
import { ManageCategories } from './pages/ManageCategories';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Sync route path updates
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Retrieve user auth info from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('quiz_user');
    const storedToken = localStorage.getItem('quiz_token');
    if (storedUser && storedToken) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('quiz_user');
        localStorage.removeItem('quiz_token');
      }
    }
  }, []);

  // Simple Regex Router helper
  const renderPage = () => {
    if (currentPath === '/login') {
      return <Login setCurrentUser={setCurrentUser} navigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <Register navigate={navigate} />;
    }
    if (currentPath === '/quizzes/create') {
      return <CreateQuiz navigate={navigate} />;
    }
    if (currentPath === '/categories') {
      return <ManageCategories navigate={navigate} currentUser={currentUser} />;
    }
    
    // Play Quiz matching (/quizzes/:id)
    const quizPlayMatch = currentPath.match(/^\/quizzes\/([^/]+)$/);
    if (quizPlayMatch) {
      const quizId = quizPlayMatch[1];
      return <PlayQuiz quizId={quizId} navigate={navigate} />;
    }

    // Default route: Dashboard
    return <Dashboard currentUser={currentUser} navigate={navigate} />;
  };

  return (
    <div style={styles.app}>
      <Navbar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        navigate={navigate}
        currentPath={currentPath}
      />
      <main style={styles.main}>
        {renderPage()}
      </main>
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          &copy; 2026 NestJS Quiz Learner. Built with ⚡ Vite + React + Vanilla CSS.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
  },
  footer: {
    padding: '1.5rem',
    textAlign: 'center' as const,
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    background: 'rgba(11, 15, 25, 0.4)',
  },
  footerText: {
    fontSize: '0.85rem',
    color: '#6b7280',
  },
};

export default App;
