import React, { useEffect, useState } from 'react';
import { Search, Filter, BookOpen, Clock, Award, Star, RefreshCw, BarChart2, Zap, Trash2 } from 'lucide-react';
import { getQuizzes, getUserStats, deleteQuiz } from '../services/api';

interface DashboardProps {
  currentUser: any;
  navigate: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, navigate }) => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [errorQuizzes, setErrorQuizzes] = useState<string | null>(null);

  const fetchQuizzesData = async () => {
    setLoadingQuizzes(true);
    setErrorQuizzes(null);
    try {
      /**
       * FETCH REQUEST: getQuizzes(search, category)
       * ENDPOINT: GET /quizzes?search=...&category=...
       * RESPONSE: Array of Quiz entities
       */
      const data = await getQuizzes(search, category);
      setQuizzes(data);
    } catch (err: any) {
      setErrorQuizzes('Could not load quizzes. Ensure backend server is running.');
      // Mock data for display when server is offline
      setQuizzes([
        {
          id: 1,
          title: "Introduction to NestJS",
          description: "Learn about Controllers, Modules, Services and DTOs in NestJS.",
          category: "Backend Development",
          difficulty: "Easy",
          timeLimit: 10,
          questionCount: 5,
          creator: { username: "Admin_John" }
        },
        {
          id: 2,
          title: "WebSockets & Microservices",
          description: "Deep dive into gateways, packets and NestJS microservices.",
          category: "Advanced Backend",
          difficulty: "Hard",
          timeLimit: 15,
          questionCount: 8,
          creator: { username: "Tech_Lead" }
        }
      ]);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const fetchStatsData = async () => {
    if (!currentUser) return;
    try {
      /**
       * FETCH REQUEST: getUserStats()
       * ENDPOINT: GET /users/me/stats
       * HEADERS: Authorization: Bearer JWT
       */
      const data = await getUserStats();
      setStats(data);
    } catch (err: any) {
      // Offline fallback mock details
      setStats({
        totalAttempts: 12,
        averageScore: 85,
        quizzesCreated: 2,
        recentAttempts: [
          { quizTitle: "NestJS Basics", score: 90, date: new Date().toISOString() }
        ]
      });
    }
  };

  useEffect(() => {
    fetchQuizzesData();
    fetchStatsData();
  }, [search, category, currentUser]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await deleteQuiz(id);
      fetchQuizzesData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete quiz');
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>Master NestJS Through Practice</h1>
        <p style={styles.heroSub}>Test your backend engineering skills, check scoring metrics, and code live lobbies.</p>
      </div>

      <div style={styles.layoutGrid}>
        {/* Left Side: Quiz List Explorer */}
        <div style={styles.mainContent}>
          <div style={styles.filterBar}>
            <div style={styles.searchWrapper}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.selectWrapper}>
              <Filter size={18} style={styles.filterIcon} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.selectInput}
              >
                <option value="">All Categories</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Advanced Backend">Advanced Backend</option>
                <option value="TypeScript Basics">TypeScript Basics</option>
              </select>
            </div>
            <button className="btn btn-secondary" onClick={fetchQuizzesData} style={styles.refreshBtn}>
              <RefreshCw size={16} />
            </button>
          </div>

          {errorQuizzes && (
            <div style={styles.hintBox}>
              <strong>Backend Offline Hint:</strong> Displays Mock Quizzes. Start your NestJS Server on port 3000 to fetch real database entities.
            </div>
          )}

          {loadingQuizzes ? (
            <div style={styles.loader}>Loading quizzes...</div>
          ) : (
            <div style={styles.quizGrid}>
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="glass-panel"
                  style={styles.quizCard}
                  onClick={() => navigate(`/quizzes/${quiz.id}`)}
                >
                  <div style={styles.quizHeader}>
                    <span style={styles.quizCategory}>{quiz.category}</span>
                    <span style={{
                      ...styles.difficultyBadge,
                      backgroundColor: quiz.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.15)' : quiz.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: quiz.difficulty === 'Easy' ? '#10b981' : quiz.difficulty === 'Medium' ? '#f59e0b' : '#ef4444',
                    }}>
                      {quiz.difficulty}
                    </span>
                  </div>

                  <h3 style={styles.quizTitle}>{quiz.title}</h3>
                  <p style={styles.quizDesc}>{quiz.description}</p>

                  <div style={styles.quizInfo}>
                    <div style={styles.infoItem}>
                      <Clock size={16} />
                      <span>{quiz.timeLimit} mins</span>
                    </div>
                    <div style={styles.infoItem}>
                      <BookOpen size={16} />
                      <span>{quiz.questionCount || quiz.questions?.length || 0} questions</span>
                    </div>
                  </div>

                  <div style={styles.quizFooter}>
                    <span style={styles.creatorName}>By {quiz.creator?.username || 'System'}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {currentUser && (currentUser.role === 'admin' || currentUser.username === quiz.creator?.username) && (
                        <button
                          className="btn btn-danger"
                          style={styles.deleteBtn}
                          onClick={(e) => handleDelete(e, quiz.id)}
                          title="Delete Quiz"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button className="btn btn-primary" style={styles.playBtn}>
                        Play
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: User Stats & Live Lobby Quick Action */}
        <div style={styles.sidebar}>
          {currentUser ? (
            <div className="glass-panel" style={styles.sidebarCard}>
              <div style={styles.sidebarHeader}>
                <BarChart2 size={24} color="#6366f1" />
                <h2 style={styles.sidebarTitle}>Personal Stats</h2>
              </div>

              <div style={styles.statsOverviewGrid}>
                <div style={styles.statBox}>
                  <span style={styles.statLabel}>Attempts</span>
                  <span style={styles.statValue}>{stats?.totalAttempts || 0}</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statLabel}>Avg. Score</span>
                  <span style={styles.statValue}>{stats?.averageScore || 0}%</span>
                </div>
              </div>

              <div style={styles.recentTitleContainer}>
                <Star size={16} color="#f59e0b" />
                <h4 style={styles.recentTitle}>Recent Attempts</h4>
              </div>

              {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
                <div style={styles.recentList}>
                  {stats.recentAttempts.map((attempt: any, idx: number) => (
                    <div key={idx} style={styles.recentItem}>
                      <span style={styles.recentQuizTitle}>{attempt.quizTitle}</span>
                      <span style={styles.recentQuizScore}>{attempt.score}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.noStats}>No quiz attempts registered yet.</div>
              )}
            </div>
          ) : (
            <div className="glass-panel" style={styles.loginBanner}>
              <Award size={48} color="#6366f1" style={{ marginBottom: '1rem' }} />
              <h3>Join to track progress</h3>
              <p style={{ margin: '0.5rem 0 1rem' }}>Log in to view statistics, compile scoring logs, and make quizzes.</p>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Sign In Now
              </button>
            </div>
          )}

          {/* Multiplayer Quick card */}
          <div className="glass-panel" style={styles.multiplayerCard}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <Zap size={24} color="#f59e0b" />
              <h3>Multiplayer Rooms</h3>
            </div>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Take interactive competitive quizzes with friends using real-time WebSockets gateways.
            </p>
            <button className="btn btn-secondary" onClick={() => navigate('/lobby')} style={{ width: '100%' }}>
              Lobby Gateways
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  heroSection: {
    textAlign: 'center' as const,
    padding: '2rem 1rem 1rem',
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
  },
  heroSub: {
    fontSize: '1.1rem',
    color: '#9ca3af',
    maxWidth: '600px',
    margin: '0 auto',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
    alignItems: 'start',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  filterBar: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
  },
  searchWrapper: {
    position: 'relative' as const,
    flex: 2,
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '12px',
    color: '#9ca3af',
  },
  searchInput: {
    paddingLeft: '2.5rem',
  },
  selectWrapper: {
    position: 'relative' as const,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  filterIcon: {
    position: 'absolute' as const,
    left: '12px',
    color: '#9ca3af',
  },
  selectInput: {
    paddingLeft: '2.5rem',
  },
  refreshBtn: {
    padding: '0.75rem',
  },
  hintBox: {
    padding: '1rem',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '8px',
    color: '#a5b4fc',
    fontSize: '0.9rem',
    textAlign: 'left' as const,
    lineHeight: '1.5',
  },
  loader: {
    padding: '3rem',
    textAlign: 'center' as const,
    color: '#9ca3af',
  },
  quizGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  },
  quizCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    cursor: 'pointer',
    textAlign: 'left' as const,
    gap: '0.75rem',
    padding: '1.5rem',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
    ':hover': {
      transform: 'translateY(-4px)',
      borderColor: '#6366f1',
    },
  },
  quizHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizCategory: {
    fontSize: '0.8rem',
    color: '#818cf8',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  difficultyBadge: {
    fontSize: '0.75rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontWeight: 600,
  },
  quizTitle: {
    fontSize: '1.2rem',
    color: '#fff',
    fontWeight: 700,
  },
  quizDesc: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
  },
  quizInfo: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.85rem',
    color: '#6b7280',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '0.75rem',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  quizFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
  },
  creatorName: {
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  playBtn: {
    padding: '0.4rem 1rem',
    fontSize: '0.85rem',
  },
  deleteBtn: {
    padding: '0.4rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  sidebarCard: {
    textAlign: 'left' as const,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  sidebarTitle: {
    fontSize: '1.25rem',
  },
  statsOverviewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statBox: {
    background: '#131a2e',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#fff',
    marginTop: '0.25rem',
  },
  recentTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  recentTitle: {
    fontSize: '0.95rem',
    color: '#f3f4f6',
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  recentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.85rem',
  },
  recentQuizTitle: {
    color: '#e5e7eb',
    fontWeight: 500,
  },
  recentQuizScore: {
    color: '#10b981',
    fontWeight: 600,
  },
  noStats: {
    fontSize: '0.85rem',
    color: '#6b7280',
    textAlign: 'center' as const,
    padding: '1rem',
  },
  loginBanner: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '2rem 1.5rem',
  },
  multiplayerCard: {
    textAlign: 'left' as const,
  },
};
