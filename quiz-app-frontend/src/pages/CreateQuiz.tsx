import { useState, useEffect } from 'react';
import { Plus, Trash, HelpCircle, Save, Settings, FileText, Check } from 'lucide-react';
import { createQuiz, getCategories } from '../services/api';
import type { QuizQuestionDto, CategoryDto } from '../services/api';

interface CreateQuizProps {
  navigate: (path: string) => void;
}

export const CreateQuiz: React.FC<CreateQuizProps> = ({ navigate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [timeLimit, setTimeLimit] = useState(10); // minutes

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (Array.isArray(data.data)) {
          setCategories(data.data);

          
          if (data.data.length > 0) {
            setCategory(String(data[0].id));
          }
        } else {
          throw new Error('Fetched categories data is not an array');
        }
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const [questions, setQuestions] = useState<QuizQuestionDto[]>([
    { text: '', options: ['', '', '', ''], correctOptionIndex: 0 }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    const newQuestions = questions.filter((_, idx) => idx !== index);
    setQuestions(newQuestions);
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, val: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = val;
    setQuestions(newQuestions);
  };

  const handleCorrectIndexChange = (qIndex: number, val: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctOptionIndex = val;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Basic Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} cannot have empty text.`);
        setLoading(false);
        return;
      }
      for (let o = 0; o < q.options.length; o++) {
        if (!q.options[o].trim()) {
          setError(`Question ${i + 1}, Option ${o + 1} cannot be empty.`);
          setLoading(false);
          return;
        }
      }
    }

    try {
      /**
       * FETCH REQUEST: createQuiz(data)
       * ENDPOINT: POST /quizzes
       * CONTENT-TYPE: application/json
       * HEADERS: Authorization: Bearer JWT
       * 
       * SUBMIT_BODY:
       * {
       *   "title": title,
       *   "description": description,
       *   "category": 1, // Category ID (number or string)
       *   "difficulty": difficulty,
       *   "timeLimit": timeLimit,
       *   "questions": [
       *     {
       *       "text": "Question content...",
       *       "options": ["A", "B", "C", "D"],
       *       "correctOptionIndex": number
       *     }
       *   ]
       * }
       */
      await createQuiz({
        title,
        description,
        categoryId: category,
        category: category,
        difficulty: difficulty.toUpperCase() as any,
        timeLimit: Number(timeLimit),
        questions
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <form onSubmit={handleSubmit} className="grid-layout-1-2">
        {/* Left Side: General settings */}
        <div className="glass-panel" style={styles.configCard}>
          <div style={styles.header}>
            <Settings size={20} color="#6366f1" />
            <h2 style={styles.cardTitle}>Quiz Details</h2>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={styles.successAlert}>
              <span>Quiz created successfully!</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Quiz Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. NestJS Controllers 101"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="desc">Description</label>
            <textarea
              id="desc"
              placeholder="Provide a brief summary of what this quiz evaluates."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {Array.isArray(categories) && categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="timeLimit">Time Limit (mins)</label>
              <input
                id="timeLimit"
                type="number"
                min={1}
                max={120}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
            disabled={loading}
            style={styles.saveBtn}
          >
            <Save size={18} />
            {loading ? 'Creating...' : 'Create & Publish'}
          </button>
        </div>

        {/* Right Side: Questions details */}
        <div style={styles.questionsColumn}>
          <div style={styles.questionsHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#6366f1" />
              <h2>Questions ({questions.length})</h2>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addQuestion}
              style={styles.addQBtn}
            >
              <Plus size={16} />
              Add Question
            </button>
          </div>

          <div style={styles.questionsList}>
            {questions.map((question, qIdx) => (
              <div key={qIdx} className="glass-panel" style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <div style={styles.questionIndexBadge}>Question {qIdx + 1}</div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeQuestion(qIdx)}
                    style={styles.deleteQBtn}
                    title="Remove Question"
                  >
                    <Trash size={14} />
                  </button>
                </div>

                <div className="form-group">
                  <label>Question Text</label>
                  <input
                    type="text"
                    placeholder="Enter question wording..."
                    value={question.text}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    required
                  />
                </div>

                <div className="grid-options-col">
                  {question.options.map((option, oIdx) => (
                    <div key={oIdx} style={styles.optionRow}>
                      <div style={styles.radioWrapper}>
                        <input
                          type="radio"
                          id={`correct-${qIdx}-${oIdx}`}
                          name={`correct-${qIdx}`}
                          checked={question.correctOptionIndex === oIdx}
                          onChange={() => handleCorrectIndexChange(qIdx, oIdx)}
                          style={styles.radioInput}
                        />
                        <label
                          htmlFor={`correct-${qIdx}-${oIdx}`}
                          style={{
                            ...styles.radioLabel,
                            borderColor: question.correctOptionIndex === oIdx ? '#10b981' : 'transparent',
                            backgroundColor: question.correctOptionIndex === oIdx ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                          }}
                          title="Mark as correct option"
                        >
                          {question.correctOptionIndex === oIdx ? <Check size={12} color="#10b981" /> : <HelpCircle size={12} />}
                          <span>{String.fromCharCode(65 + oIdx)}</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder={`Option ${oIdx + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                        required
                        style={{
                          flex: 1,
                          borderColor: question.correctOptionIndex === oIdx ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    flex: 1,
  },
  configCard: {
    textAlign: 'left' as const,
    position: 'sticky' as const,
    top: '90px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
  },
  row: {
    display: 'flex',
    gap: '1rem',
  },
  saveBtn: {
    width: '100%',
    padding: '0.85rem',
    marginTop: '1rem',
  },
  questionsColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    textAlign: 'left' as const,
  },
  questionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addQBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  questionCard: {
    padding: '1.5rem',
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  questionIndexBadge: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#6366f1',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontWeight: 600,
    fontSize: '0.85rem',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  deleteQBtn: {
    padding: '0.4rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  radioWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  radioInput: {
    display: 'none',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    margin: 0,
    fontWeight: 600,
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  successAlert: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
};
