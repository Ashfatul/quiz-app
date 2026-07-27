import React, { useEffect, useState } from 'react';
import { Play, Clock, HelpCircle, CheckCircle2, XCircle, Award, RefreshCw, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { getQuizDetails, submitQuizAttempt } from '../services/api';

interface PlayQuizProps {
  quizId: string;
  navigate: (path: string) => void;
}

export const PlayQuiz: React.FC<PlayQuizProps> = ({ quizId, navigate }) => {
  const [phase, setPhase] = useState<'lobby' | 'playing' | 'results'>('lobby');
  const [quiz, setQuiz] = useState<any>(null);
  
  // Gameplay states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  
  // Results states
  const [results, setResults] = useState<any>(null);
  
  // General states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      /**
       * FETCH REQUEST: getQuizDetails(quizId)
       * ENDPOINT: GET /quizzes/:id
       * RESPONSE: Quiz Details (without correct answer indexes for security)
       */
      const data = await getQuizDetails(quizId);
      setQuiz(data);
    } catch (err: any) {
      setError('Could not retrieve quiz details. Using offline mode preview.');
      // Mock details
      setQuiz({
        id: quizId,
        title: "Introduction to NestJS (Offline Preview)",
        description: "Test your skills on Controllers, Modules, Services, Dependency Injection, and Guards.",
        timeLimit: 5,
        category: "Backend Development",
        difficulty: "Medium",
        questions: [
          { id: 101, text: "What decorator is used to declare a NestJS service class?", options: ["@Injectable()", "@Controller()", "@Service()", "@Module()"] },
          { id: 102, text: "Which file is the entry point of a NestJS application?", options: ["app.module.ts", "main.ts", "app.controller.ts", "index.ts"] },
          { id: 103, text: "What technique does NestJS use to control route access authorization?", options: ["Pipes", "Interceptors", "Guards", "Middlewares"] }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  // Countdown timer logic
  useEffect(() => {
    if (phase !== 'playing' || timeLeft <= 0) {
      if (phase === 'playing' && timeLeft === 0) {
        handleSubmitQuiz();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const handleStartQuiz = () => {
    setPhase('playing');
    setTimeLeft((quiz?.timeLimit || 10) * 60);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex,
    });
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // Map answers to the schema expected by the API
      const formattedAnswers = quiz.questions.map((q: any) => ({
        questionId: q.id,
        selectedOptionIndex: answers[q.id] !== undefined ? answers[q.id] : -1,
      }));

      /**
       * FETCH REQUEST: submitQuizAttempt(quizId, data)
       * ENDPOINT: POST /quizzes/:id/attempts
       * HEADERS: Authorization: Bearer JWT
       * 
       * SUBMIT_BODY:
       * {
       *   "answers": [
       *     { "questionId": 101, "selectedOptionIndex": 0 },
       *     { "questionId": 102, "selectedOptionIndex": 1 },
       *     { "questionId": 103, "selectedOptionIndex": 2 }
       *   ]
       * }
       */
      const resultData = await submitQuizAttempt(quizId, { answers: formattedAnswers });
      setResults(resultData);
      setPhase('results');
    } catch (err: any) {
      // Offline mock evaluation fallback
      const mockResultReview = quiz.questions.map((q: any, idx: number) => {
        const selected = answers[q.id] !== undefined ? answers[q.id] : -1;
        // Mock correct options: 0 (Injectable), 1 (main.ts), 2 (Guards)
        const mockCorrect = idx === 0 ? 0 : idx === 1 ? 1 : 2;
        return {
          questionId: q.id,
          text: q.text,
          selectedOptionIndex: selected,
          correctOptionIndex: mockCorrect,
          isCorrect: selected === mockCorrect,
        };
      });

      const correctCount = mockResultReview.filter((r: any) => r.isCorrect).length;
      
      setResults({
        attemptId: 999,
        score: correctCount,
        totalQuestions: quiz.questions.length,
        percentage: Number(((correctCount / quiz.questions.length) * 100).toFixed(1)),
        answersReview: mockResultReview
      });
      setPhase('results');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div style={styles.centerWrapper}>Loading quiz details...</div>;
  }

  // ==========================================
  // PHASE 1: LOBBY
  // ==========================================
  if (phase === 'lobby') {
    return (
      <div style={styles.container} className="animate-fade-in">
        <div className="glass-panel" style={styles.lobbyCard}>
          <span style={styles.categoryBadge}>
            {typeof quiz.category === 'object' && quiz.category ? quiz.category.name : quiz.category}
          </span>
          <h1 style={styles.title}>{quiz.title}</h1>
          <p style={styles.desc}>{quiz.description}</p>

          <div style={styles.lobbyMetaGrid}>
            <div style={styles.metaItem}>
              <Clock size={20} color="#6366f1" />
              <div>
                <span style={styles.metaLabel}>Time Limit</span>
                <span style={styles.metaValue}>{quiz.timeLimit} Minutes</span>
              </div>
            </div>
            <div style={styles.metaItem}>
              <HelpCircle size={20} color="#6366f1" />
              <div>
                <span style={styles.metaLabel}>Questions</span>
                <span style={styles.metaValue}>{quiz.questions?.length || 0} items</span>
              </div>
            </div>
          </div>

          {error && (
            <div style={styles.warningBox}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div style={styles.lobbyActions}>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Back to Dashboard
            </button>
            <button className="btn btn-primary" onClick={handleStartQuiz} style={styles.startBtn}>
              <Play size={18} />
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 2: PLAYING GAMEPLAY
  // ==========================================
  if (phase === 'playing') {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const totalQuestions = quiz.questions.length;
    
    return (
      <div style={styles.gameplayLayout} className="animate-fade-in">
        {/* Left Side: Active question details */}
        <div className="glass-panel" style={styles.questionPanel}>
          <div style={styles.gameHeader}>
            <span style={styles.questionNavIndex}>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <div style={{
              ...styles.timerBadge,
              backgroundColor: timeLeft < 30 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              color: timeLeft < 30 ? '#ef4444' : '#a5b4fc',
              borderColor: timeLeft < 30 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)',
            }}>
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressTrack}>
            <div style={{
              ...styles.progressBar,
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`
            }} />
          </div>

          <h2 style={styles.questionText}>{currentQuestion.text}</h2>

          <div style={styles.optionsList}>
            {currentQuestion.options.map((option: string, idx: number) => {
              const isSelected = answers[currentQuestion.id] === idx;
              return (
                <div
                  key={idx}
                  style={{
                    ...styles.optionCard,
                    borderColor: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(19, 26, 46, 0.5)',
                  }}
                  onClick={() => handleSelectOption(currentQuestion.id, idx)}
                >
                  <div style={{
                    ...styles.optionCircle,
                    backgroundColor: isSelected ? '#6366f1' : 'transparent',
                    borderColor: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.2)',
                  }}>
                    {isSelected && <div style={styles.optionCircleInner} />}
                  </div>
                  <span style={styles.optionLabel}>{String.fromCharCode(65 + idx)}.</span>
                  <span style={styles.optionText}>{option}</span>
                </div>
              );
            })}
          </div>

          <div style={styles.navigationRow}>
            <button
              className={`btn btn-secondary ${currentQuestionIndex === 0 ? 'btn-disabled' : ''}`}
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            >
              <ArrowLeft size={16} />
              Previous
            </button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className={`btn btn-success ${submitting ? 'btn-disabled' : ''}`}
                disabled={submitting}
                onClick={handleSubmitQuiz}
              >
                {submitting ? 'Submitting...' : 'Finish & Submit'}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Quick navigation map & submit summary */}
        <div className="glass-panel" style={styles.sidebarPanel}>
          <h3>Quiz Navigator</h3>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.25rem' }}>
            Jump to any question. Shaded boxes represent answered questions.
          </p>

          <div style={styles.navigatorGrid}>
            {quiz.questions.map((q: any, idx: number) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = currentQuestionIndex === idx;
              return (
                <button
                  key={q.id}
                  style={{
                    ...styles.navBtn,
                    backgroundColor: isCurrent ? '#6366f1' : isAnswered ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    borderColor: isCurrent ? '#6366f1' : isAnswered ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                    color: isCurrent ? '#fff' : isAnswered ? '#a5b4fc' : '#9ca3af',
                  }}
                  onClick={() => setCurrentQuestionIndex(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div style={styles.summaryFooter}>
            <div style={styles.answeredCount}>
              <span>Answered:</span>
              <strong>{Object.keys(answers).length} / {totalQuestions}</strong>
            </div>
            <button
              className={`btn btn-success ${submitting ? 'btn-disabled' : ''}`}
              disabled={submitting}
              onClick={handleSubmitQuiz}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              Submit Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 3: RESULTS & SCORES
  // ==========================================
  return (
    <div style={styles.container} className="animate-fade-in">
      <div className="glass-panel" style={styles.resultsCard}>
        <div style={styles.iconContainer}>
          <Award size={48} color="#fff" />
        </div>
        <h1 style={styles.resultsTitle}>Quiz Completed!</h1>
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Your score details are available below.</p>

        <div style={styles.scoresRow}>
          <div style={styles.scoreBox}>
            <span style={styles.scoreLabel}>Correct Answers</span>
            <span style={styles.scoreValue}>{results?.score} / {results?.totalQuestions}</span>
          </div>
          <div style={styles.scoreBox}>
            <span style={styles.scoreLabel}>Grade Percentage</span>
            <span style={{
              ...styles.scoreValue,
              color: results?.percentage >= 70 ? '#10b981' : results?.percentage >= 40 ? '#f59e0b' : '#ef4444'
            }}>
              {results?.percentage}%
            </span>
          </div>
        </div>

        <h3 style={styles.reviewHeader}>Question Review</h3>
        <div style={styles.reviewList}>
          {results?.answersReview?.map((rev: any, idx: number) => (
            <div
              key={idx}
              style={{
                ...styles.reviewItem,
                borderColor: rev.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                backgroundColor: rev.isCorrect ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.04)',
              }}
            >
              <div style={styles.reviewQuestionHeader}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {rev.isCorrect ? (
                    <CheckCircle2 size={18} color="#10b981" />
                  ) : (
                    <XCircle size={18} color="#ef4444" />
                  )}
                  <span style={styles.reviewQuestionTitle}>Question {idx + 1}</span>
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: rev.isCorrect ? '#10b981' : '#ef4444'
                }}>
                  {rev.isCorrect ? 'CORRECT' : 'INCORRECT'}
                </span>
              </div>
              <p style={styles.reviewQuestionText}>{rev.text}</p>

              {/* Answers visual mappings */}
              <div style={styles.reviewChoices}>
                {quiz.questions[idx]?.options.map((opt: string, oIdx: number) => {
                  const isSelected = rev.selectedOptionIndex === oIdx;
                  const isCorrect = rev.correctOptionIndex === oIdx;
                  
                  let choiceStyle = {};
                  
                  if (isCorrect) {
                    choiceStyle = { borderColor: '#10b981', color: '#10b981', background: 'rgba(16, 185, 129, 0.08)' };
                  } else if (isSelected && !rev.isCorrect) {
                    choiceStyle = { borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)' };
                  }

                  return (
                    <div key={oIdx} style={{ ...styles.choiceItem, ...choiceStyle }}>
                      <span style={{ fontWeight: 600 }}>{String.fromCharCode(65 + oIdx)}.</span>
                      <span>{opt}</span>
                      {isCorrect && <span style={styles.answerTextLabel}>(Correct Answer)</span>}
                      {isSelected && !isCorrect && <span style={styles.answerTextLabel}>(Your Choice)</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.resultsActions}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Dashboard
          </button>
          <button className="btn btn-primary" onClick={handleStartQuiz}>
            <RefreshCw size={16} />
            Retry Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  centerWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
    fontSize: '1.2rem',
    color: '#9ca3af',
  },
  container: {
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  lobbyCard: {
    width: '100%',
    maxWidth: '650px',
    textAlign: 'center' as const,
  },
  categoryBadge: {
    fontSize: '0.8rem',
    color: '#818cf8',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    border: '1px solid rgba(129, 140, 248, 0.3)',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    background: 'rgba(129, 140, 248, 0.08)',
  },
  title: {
    fontSize: '2rem',
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  desc: {
    fontSize: '1rem',
    color: '#9ca3af',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
  lobbyMetaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '1.5rem 0',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    textAlign: 'left' as const,
  },
  metaLabel: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
  },
  metaValue: {
    display: 'block',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#fff',
  },
  warningBox: {
    padding: '1rem',
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: '8px',
    color: '#f59e0b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    textAlign: 'left' as const,
    marginBottom: '1.5rem',
  },
  lobbyActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startBtn: {
    padding: '0.8rem 2rem',
  },
  gameplayLayout: {
    display: 'grid',
    gridTemplateColumns: '3fr 1fr',
    gap: '2rem',
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    flex: 1,
    alignItems: 'start',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
  questionPanel: {
    textAlign: 'left' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  gameHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionNavIndex: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#818cf8',
  },
  timerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid transparent',
    fontWeight: 700,
    fontSize: '0.95rem',
  },
  progressTrack: {
    width: '100%',
    height: '6px',
    background: '#131a2e',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
    transition: 'width 0.3s ease',
  },
  questionText: {
    fontSize: '1.4rem',
    color: '#fff',
    fontWeight: 600,
    lineHeight: '1.4',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  optionCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    gap: '1rem',
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.05)',
    },
  },
  optionCircle: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCircleInner: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#fff',
  },
  optionLabel: {
    fontWeight: 700,
    color: '#818cf8',
    fontSize: '1rem',
  },
  optionText: {
    color: '#e5e7eb',
    fontSize: '1rem',
  },
  navigationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
  },
  sidebarPanel: {
    textAlign: 'left' as const,
  },
  navigatorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
    margin: '1rem 0 2rem',
  },
  navBtn: {
    height: '42px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'all 0.15s ease',
  },
  summaryFooter: {
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '1rem',
  },
  answeredCount: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#9ca3af',
  },
  resultsCard: {
    width: '100%',
    maxWidth: '750px',
    textAlign: 'center' as const,
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
  },
  resultsTitle: {
    fontSize: '2.2rem',
    fontWeight: 800,
  },
  scoresRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  scoreBox: {
    background: '#131a2e',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    fontWeight: 500,
  },
  scoreValue: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#fff',
    marginTop: '0.5rem',
  },
  reviewHeader: {
    fontSize: '1.25rem',
    textAlign: 'left' as const,
    marginBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '0.5rem',
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    textAlign: 'left' as const,
    marginBottom: '2.5rem',
  },
  reviewItem: {
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  reviewQuestionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  reviewQuestionTitle: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    fontWeight: 600,
  },
  reviewQuestionText: {
    fontSize: '1.1rem',
    color: '#fff',
    fontWeight: 500,
    marginBottom: '1rem',
  },
  reviewChoices: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  },
  choiceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '0.9rem',
    color: '#9ca3af',
    position: 'relative' as const,
  },
  answerTextLabel: {
    fontSize: '0.7rem',
    marginLeft: 'auto',
    fontWeight: 600,
  },
  resultsActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '1.5rem',
  },
};
