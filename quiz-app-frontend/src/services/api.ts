import { io, Socket } from 'socket.io-client';

export const API_BASE_URL = 'http://localhost:3000/api';
export const WS_BASE_URL = 'http://localhost:3000';

// Helper to get JWT token from localStorage
export const getAuthToken = () => localStorage.getItem('quiz_token');

// Helper to set JWT token
export const setAuthToken = (token: string) => localStorage.setItem('quiz_token', token);

// Helper to clear auth
export const clearAuth = () => {
  localStorage.removeItem('quiz_token');
  localStorage.removeItem('quiz_user');
};

// Helper for standard authenticated headers
const getHeaders = (isMultipart = false) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ============================================================================
// 1. AUTHENTICATION & PROFILE
// ============================================================================

export interface RegisterDto {
  username: string; // 3-20 characters
  email: string;    // must be valid email
  password: string; // min 6 characters
  role: 'student' | 'teacher'; // user roles
  avatar?: File;    // optional profile picture file
}

/**
 * FETCH REQUEST: User Registration
 * METHOD: POST
 * ENDPOINT: /auth/register
 * CONTENT-TYPE: multipart/form-data
 * 
 * SUBMIT_BODY: (Form Data)
 * {
 *   "username": "johndoe",
 *   "email": "john@example.com",
 *   "password": "securepassword123",
 *   "role": "student" | "teacher",
 *   "avatar": File (Binary stream, optional)
 * }
 */
export async function registerUser(data: RegisterDto) {
  const formData = new FormData();
  formData.append('username', data.username);
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('role', data.role);
  if (data.avatar) {
    formData.append('avatar', data.avatar);
  }

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(true),
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
}


export interface LoginDto {
  email: string;    // must be valid email
  password: string; // min 6 characters
}

/**
 * FETCH REQUEST: User Login
 * METHOD: POST
 * ENDPOINT: /auth/login
 * CONTENT-TYPE: application/json
 * 
 * SUBMIT_BODY:
 * {
 *   "email": "john@example.com",
 *   "password": "securepassword123"
 * }
 */
export async function loginUser(data: LoginDto) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
}


/**
 * FETCH REQUEST: Get User Statistics
 * METHOD: GET
 * ENDPOINT: /users/me/stats
 * CONTENT-TYPE: application/json
 * REQUIRES AUTH: Yes (Bearer token)
 * 
 * SUBMIT_BODY: None (JWT in Header)
 */
export async function getUserStats() {
  const response = await fetch(`${API_BASE_URL}/users/me/stats`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user statistics');
  }

  return response.json();
}

// ============================================================================
// 2. QUIZ CRUD
// ============================================================================

export interface QuizQuestionDto {
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface CreateQuizDto {
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number; // in minutes
  questions: QuizQuestionDto[];
}

/**
 * FETCH REQUEST: Create Quiz
 * METHOD: POST
 * ENDPOINT: /quizzes
 * CONTENT-TYPE: application/json
 * REQUIRES AUTH: Yes (Bearer token, role: Admin or Teacher)
 * 
 * SUBMIT_BODY:
 * {
 *   "title": "React Hooks Trivia",
 *   "description": "Show off your hooks knowledge!",
 *   "category": "Web Development",
 *   "difficulty": "Medium",
 *   "timeLimit": 10,
 *   "questions": [
 *     {
 *       "text": "Which hook is used to cache computation results?",
 *       "options": ["useEffect", "useMemo", "useCallback", "useRef"],
 *       "correctOptionIndex": 1
 *     }
 *   ]
 * }
 */
export async function createQuiz(data: CreateQuizDto) {
  const response = await fetch(`${API_BASE_URL}/quizzes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create quiz');
  }

  return response.json();
}


/**
 * FETCH REQUEST: Delete Quiz
 * METHOD: DELETE
 * ENDPOINT: /quizzes/:id
 * CONTENT-TYPE: application/json
 * REQUIRES AUTH: Yes (Bearer token, owner/admin)
 * 
 * SUBMIT_BODY: None (URL parameter :id)
 */
export async function deleteQuiz(id: number | string) {
  const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete quiz');
  }

  return response.json();
}


/**
 * FETCH REQUEST: Fetch All Quizzes
 * METHOD: GET
 * ENDPOINT: /quizzes
 * CONTENT-TYPE: application/json
 * QUERY_PARAMS: ?search=react&category=dev
 * 
 * SUBMIT_BODY: None (URL Query Params)
 */
export async function getQuizzes(search?: string, category?: string) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/quizzes${query}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch quizzes');
  }

  return response.json();
}


/**
 * FETCH REQUEST: Fetch Quiz Details (Lobby / Play Mode)
 * METHOD: GET
 * ENDPOINT: /quizzes/:id
 * CONTENT-TYPE: application/json
 * 
 * SUBMIT_BODY: None (URL parameter :id)
 * NOTE: The response should NOT leak the correctOptionIndex for security!
 */
export async function getQuizDetails(id: number | string) {
  const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch quiz details');
  }

  return response.json();
}

// ============================================================================
// 3. QUIZ ATTEMPT & RESULTS
// ============================================================================

export interface QuizAttemptSubmissionDto {
  answers: {
    questionId: number;
    selectedOptionIndex: number;
  }[];
}

/**
 * FETCH REQUEST: Submit Quiz Attempt
 * METHOD: POST
 * ENDPOINT: /quizzes/:id/attempts
 * CONTENT-TYPE: application/json
 * REQUIRES AUTH: Yes (Bearer token)
 * 
 * SUBMIT_BODY:
 * {
 *   "answers": [
 *     { "questionId": 12, "selectedOptionIndex": 3 },
 *     { "questionId": 13, "selectedOptionIndex": 1 }
 *   ]
 * }
 */
export async function submitQuizAttempt(quizId: number | string, data: QuizAttemptSubmissionDto) {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/attempts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit quiz attempt');
  }

  return response.json();
}

// ============================================================================
// 4. REAL-TIME MULTIPLAYER (WEBSOCKETS)
// ============================================================================

/**
 * WEBSOCKET CONNECTION AND EVENTS
 * PORT/GATEWAY: WS_BASE_URL (http://localhost:3000)
 * 
 * GATEWAY EVENTS:
 * 1. emit('joinRoom', { code: '1234', username: 'johndoe' })
 *    - To join an active live classroom lobby
 * 
 * 2. on('roomUpdated', (data: { roomCode: string, players: Array<{id: string, username: string}> }))
 *    - Fired by server to sync player lists in the lobby
 * 
 * 3. emit('startQuiz', { code: '1234' })
 *    - Only Host can emit to start the test
 * 
 * 4. on('quizStarted', (data: { questionsCount: number }))
 *    - Multi-broadcasted signal to redirect all players to take test
 * 
 * 5. emit('submitAnswer', { code: '1234', questionId: number, selectedOptionIndex: number })
 *    - Sent during multiplayer quiz to tally current leaderboard rankings
 * 
 * 6. on('scoreboardUpdate', (data: { players: Array<{username: string, score: number}> }))
 *    - Sent to all clients to update the active leaderboard panel
 */
export function getWebSocketClient(roomCode: string, username: string): Socket {
  const socket = io(WS_BASE_URL, {
    auth: {
      token: getAuthToken(),
    },
    query: {
      roomCode,
      username,
    },
    transports: ['websocket'],
  });

  return socket;
}
