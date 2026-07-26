import React, { useState, useEffect, useRef } from 'react';
import { Users, Play, LogIn, Plus, AlertCircle, Sparkles, Check, Award, Clock } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { getWebSocketClient } from '../services/api';

interface LiveLobbyProps {
  currentUser: any;
  navigate: (path: string) => void;
}

export const LiveLobby: React.FC<LiveLobbyProps> = ({ currentUser, navigate }) => {
  const [phase, setPhase] = useState<'selection' | 'lobby' | 'game' | 'scoreboard'>('selection');
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [players, setPlayers] = useState<any[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gameplay in live room
  const [liveQuestions, setLiveQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15); // 15s per live question
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Timer for active multiplayer questions
  useEffect(() => {
    if (phase !== 'game' || timeLeft <= 0) {
      if (phase === 'game' && timeLeft === 0) {
        handleTimeExpired();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, timeLeft]);

  const handleTimeExpired = () => {
    // Auto submit default choice -1 if none chosen
    submitLiveAnswer(selectedOption !== null ? selectedOption : -1);
    
    // Jump to next question or scoreboard
    if (currentQIndex < liveQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimeLeft(15);
    } else {
      setPhase('scoreboard');
    }
  };

  const handleCreateRoom = () => {
    if (!username.trim()) {
      setError('Please input a player alias.');
      return;
    }
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(randomCode);
    setIsHost(true);
    connectSocket(randomCode, username, true);
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      setError('Please input a 4-digit room code.');
      return;
    }
    if (!username.trim()) {
      setError('Please input a player alias.');
      return;
    }
    setIsHost(false);
    connectSocket(roomCode, username, false);
  };

  const connectSocket = (code: string, user: string, host: boolean) => {
    setError(null);
    try {
      /**
       * WEBSOCKET CONNECTION
       * GATEWAY: http://localhost:3000
       * QUERY: roomCode=code&username=user
       */
      const socket = getWebSocketClient(code, user);
      socketRef.current = socket;

      socket.on('connect', () => {
        // Emit join events
        socket.emit('joinRoom', { code, username: user, isHost: host });
        setPhase('lobby');
      });

      // Synchronize player lobby roster
      socket.on('roomUpdated', (data: { players: string[] }) => {
        if (data && data.players) {
          setPlayers(data.players.map((p: string, idx: number) => ({ id: idx.toString(), username: p })));
        }
      });

      // Listen for Host to trigger quiz
      socket.on('quizStarted', (data: { questions: any[] }) => {
        setLiveQuestions(data.questions || getMockLiveQuestions());
        setPhase('game');
        setCurrentQIndex(0);
        setSelectedOption(null);
        setTimeLeft(15);
      });

      // Sync scoreboard
      socket.on('scoreboardUpdate', (data: { players: any[] }) => {
        setLeaderboard(data.players);
      });

      socket.on('connect_error', () => {
        // Safe mock fallback for testing
        setError('Real-time Gateway disconnected. Simulating local socket lobby.');
        setPhase('lobby');
        setPlayers([
          { id: '1', username: user },
          { id: '2', username: 'Mock_Player_Bob' },
          { id: '3', username: 'Mock_Player_Eve' }
        ]);
      });

    } catch (err: any) {
      setError('WebSocket connection failed.');
    }
  };

  const handleStartGame = () => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('startQuiz', { code: roomCode });
    } else {
      // Offline fallback start
      setLiveQuestions(getMockLiveQuestions());
      setPhase('game');
      setCurrentQIndex(0);
      setSelectedOption(null);
      setTimeLeft(15);
    }
  };

  const submitLiveAnswer = (idx: number) => {
    setSelectedOption(idx);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('submitAnswer', {
        code: roomCode,
        questionId: liveQuestions[currentQIndex].id,
        selectedOptionIndex: idx
      });
    } else {
      // Offline fallback scoreboard calculations
      const points = idx === liveQuestions[currentQIndex].correctOptionIndex ? 100 + timeLeft * 5 : 0;
      setLeaderboard((prev) => {
        const userExists = prev.find((p) => p.username === username);
        let list = [];
        if (userExists) {
          list = prev.map((p) => p.username === username ? { ...p, score: p.score + points } : p);
        } else {
          list = [
            ...prev,
            { username, score: points },
            { username: 'Mock_Player_Bob', score: Math.floor(Math.random() * 200) },
            { username: 'Mock_Player_Eve', score: Math.floor(Math.random() * 200) }
          ];
        }
        return list.sort((a, b) => b.score - a.score);
      });
    }
  };

  const getMockLiveQuestions = () => [
    { id: 201, text: "NestJS uses express underneath by default. Can you swap it with Fastify?", options: ["No, it is tightly coupled.", "Yes, using FastifyAdapter.", "Only in production modes.", "Yes, but with plugins only."], correctOptionIndex: 1 },
    { id: 202, text: "Which decorator is used to retrieve parsed parameters from route URLs?", options: ["@Body()", "@Query()", "@Param()", "@Headers()"], correctOptionIndex: 2 },
    { id: 203, text: "What is the correct command to generate a new module via Nest CLI?", options: ["nest generate module name", "nest create module name", "nest add module name", "nest g module name"], correctOptionIndex: 3 }
  ];

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* PHASE 1: CREATE OR JOIN LOBBY SELECTION */}
      {phase === 'selection' && (
        <div className="glass-panel" style={styles.selectionCard}>
          <div style={styles.header}>
            <Sparkles size={36} color="#6366f1" />
            <h1 style={{ marginTop: '0.5rem' }}>Multiplayer Gateway</h1>
            <p style={{ color: '#9ca3af' }}>Host or enter room codes to compete in real-time quizzes.</p>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div style={styles.formGroup}>
            <label>Player Name / Alias</label>
            <input
              type="text"
              placeholder="e.g. CodeWarrior"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={styles.splitGrid}>
            {/* Host Section */}
            <div style={styles.splitSection}>
              <h3>Host Room</h3>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '0.5rem 0 1rem' }}>
                Open a new multiplayer classroom room for participants to sync up.
              </p>
              <button className="btn btn-primary" onClick={handleCreateRoom} style={{ width: '100%' }}>
                <Plus size={16} />
                Create Room
              </button>
            </div>

            {/* Join Section */}
            <div style={{ ...styles.splitSection, borderLeft: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3>Join Room</h3>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '0.5rem 0 1.25rem' }}>
                Enter the room key shared by the host to connect.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <input
                  type="text"
                  placeholder="Code (e.g. 5812)"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-secondary" onClick={handleJoinRoom}>
                  <LogIn size={16} />
                  Join
                </button>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ width: '100%' }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: WAITING LOBBY */}
      {phase === 'lobby' && (
        <div className="glass-panel" style={styles.lobbyCard}>
          <div style={styles.lobbyHeader}>
            <div>
              <span style={styles.roomCodeBadge}>Room Code: {roomCode}</span>
              <h2>Waiting for Players...</h2>
            </div>
            <div style={styles.pulseContainer}>
              <div style={styles.pulseDot} />
              <span style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 600 }}>LIVE GATEWAY</span>
            </div>
          </div>

          {error && (
            <div style={styles.warningBox}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div style={styles.playerSection}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
              <Users size={18} color="#6366f1" />
              <h4>Connected Players ({players.length})</h4>
            </div>
            <div style={styles.playerGrid}>
              {players.map((p) => (
                <div key={p.id} style={styles.playerToken}>
                  <div style={styles.tokenDot} />
                  <span>{p.username}</span>
                  {p.username === username && <span style={styles.youBadge}>You</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.lobbyActions}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (socketRef.current) socketRef.current.disconnect();
                setPhase('selection');
              }}
            >
              Leave Room
            </button>
            {isHost ? (
              <button className="btn btn-primary animate-pulse" onClick={handleStartGame}>
                <Play size={16} />
                Start Quiz
              </button>
            ) : (
              <span style={styles.waitingNotice}>Waiting for Host to launch...</span>
            )}
          </div>
        </div>
      )}

      {/* PHASE 3: LIVE ACTIVE GAMEPLAY */}
      {phase === 'game' && liveQuestions.length > 0 && (
        <div className="glass-panel" style={styles.gameCard}>
          <div style={styles.gameHeader}>
            <span style={{ fontWeight: 600, color: '#818cf8' }}>
              Multiplayer Question {currentQIndex + 1} of {liveQuestions.length}
            </span>
            <div style={{
              ...styles.timerBadge,
              backgroundColor: timeLeft < 5 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              color: timeLeft < 5 ? '#ef4444' : '#a5b4fc',
            }}>
              <Clock size={16} />
              <span>{timeLeft}s</span>
            </div>
          </div>

          <h2 style={styles.questionText}>{liveQuestions[currentQIndex].text}</h2>

          <div style={styles.optionsList}>
            {liveQuestions[currentQIndex].options.map((opt: string, idx: number) => {
              const isSelected = selectedOption === idx;
              const hasSelectedAny = selectedOption !== null;

              return (
                <button
                  key={idx}
                  disabled={hasSelectedAny}
                  style={{
                    ...styles.optionBtn,
                    borderColor: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(19, 26, 46, 0.5)',
                    opacity: hasSelectedAny && !isSelected ? 0.6 : 1,
                    cursor: hasSelectedAny ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => submitLiveAnswer(idx)}
                >
                  <span style={styles.optionChar}>{String.fromCharCode(65 + idx)}</span>
                  <span>{opt}</span>
                  {isSelected && <Check size={16} color="#6366f1" style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div style={styles.waitPanel}>
              <div style={styles.pulseDot} />
              <span>Answer submitted. Waiting for other players...</span>
            </div>
          )}
        </div>
      )}

      {/* PHASE 4: FINAL REAL-TIME SCOREBOARD */}
      {phase === 'scoreboard' && (
        <div className="glass-panel" style={styles.scoreCard}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Award size={48} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }} />
            <h1>Live Leaderboard</h1>
            <p style={{ color: '#9ca3af' }}>Final standing of multiplayer battle</p>
          </div>

          <div style={styles.leaderboardList}>
            {leaderboard.map((player, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.leaderboardItem,
                  background: idx === 0 ? 'rgba(245, 158, 11, 0.1)' : idx === 1 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                  borderColor: idx === 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={styles.rankBadge}>{idx + 1}</div>
                <span style={{ fontWeight: 600, color: '#fff', flex: 1, textAlign: 'left' }}>
                  {player.username}
                  {player.username === username && <span style={styles.youBadgeInline}>You</span>}
                </span>
                <span style={{ fontWeight: 700, color: idx === 0 ? '#f59e0b' : '#6366f1' }}>
                  {player.score} pts
                </span>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={() => setPhase('selection')} style={{ marginTop: '1.5rem', width: '100%' }}>
            Launch New Room
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  selectionCard: {
    width: '100%',
    maxWidth: '650px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  formGroup: {
    textAlign: 'left' as const,
    marginBottom: '1.5rem',
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.5rem',
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  },
  splitSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    textAlign: 'left' as const,
  },
  lobbyCard: {
    width: '100%',
    maxWidth: '600px',
    textAlign: 'left' as const,
  },
  lobbyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1.5rem',
  },
  roomCodeBadge: {
    fontSize: '0.8rem',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    fontWeight: 700,
    marginBottom: '0.5rem',
    display: 'inline-block',
  },
  pulseContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    boxShadow: '0 0 8px #6366f1',
    animation: 'pulse 1.5s infinite',
  },
  playerSection: {
    background: 'rgba(19, 26, 46, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  playerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  playerToken: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    color: '#e5e7eb',
  },
  tokenDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
  },
  youBadge: {
    fontSize: '0.7rem',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    padding: '0.05rem 0.3rem',
    borderRadius: '4px',
    marginLeft: 'auto',
  },
  lobbyActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waitingNotice: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  gameCard: {
    width: '100%',
    maxWidth: '650px',
    textAlign: 'left' as const,
  },
  gameHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  timerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontWeight: 700,
    fontSize: '0.95rem',
  },
  questionText: {
    fontSize: '1.4rem',
    marginBottom: '1.5rem',
    color: '#fff',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    gap: '1rem',
    textAlign: 'left' as const,
    color: '#fff',
    transition: 'all 0.2s ease',
  },
  optionChar: {
    fontWeight: 700,
    color: '#6366f1',
  },
  waitPanel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1.5rem',
    color: '#9ca3af',
    fontSize: '0.9rem',
  },
  scoreCard: {
    width: '100%',
    maxWidth: '550px',
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  leaderboardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  rankBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem',
  },
  youBadgeInline: {
    fontSize: '0.7rem',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    padding: '0.05rem 0.3rem',
    borderRadius: '4px',
    marginLeft: '0.5rem',
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
  },
  warningBox: {
    padding: '0.75rem 1rem',
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: '8px',
    color: '#f59e0b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    marginBottom: '1.25rem',
  },
};
