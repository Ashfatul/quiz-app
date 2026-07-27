export const API_BASE_URL = 'http://localhost:3000';

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

// Helper to parse responses and unwrap .data property if wrapped by a NestJS interceptor
const handleResponse = async (response: Response, defaultErrorMessage = 'Request failed') => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || defaultErrorMessage);
  }
  const json = await response.json();
  return json && json.data !== undefined ? json.data : json;
};

// ============================================================================
// 1. AUTHENTICATION & PROFILE
// ============================================================================

export interface RegisterDto {
  username: string; // 3-20 characters
  email: string;    // must be valid email
  password: string; // min 6 characters
  role: 'student' | 'teacher'; // user roles
  avatar?: string;  // optional profile picture URL / string path
}

/**
 * FETCH REQUEST: User Registration
 * METHOD: POST
 * ENDPOINT: /register
 * CONTENT-TYPE: application/json
 * 
 * SUBMIT_BODY:
 * {
 *   "username": "johndoe",
 *   "email": "john@example.com",
 *   "password": "securepassword123",
 *   "role": "student" | "teacher",
 *   "avatar": "http://example.com/avatar.png" (optional)
 * }
 */
export async function registerUser(data: RegisterDto) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response, 'Registration failed');
}


export interface LoginDto {
  email: string;    // must be valid email
  password: string; // min 6 characters
}

/**
 * FETCH REQUEST: User Login
 * METHOD: POST
 * ENDPOINT: /login
 * CONTENT-TYPE: application/json
 * 
 * SUBMIT_BODY:
 * {
 *   "email": "john@example.com",
 *   "password": "securepassword123"
 * }
 */
export async function loginUser(data: LoginDto) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response, 'Login failed');
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

  return handleResponse(response, 'Failed to fetch user statistics');
}

// ============================================================================
// 1.5. CATEGORIES
// ============================================================================

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
}

/**
 * FETCH REQUEST: Fetch All Categories
 * METHOD: GET
 * ENDPOINT: quiz/categories
 * CONTENT-TYPE: application/json
 * 
 * SUBMIT_BODY: None
 */
export async function getCategories(): Promise<CategoryDto[]> {
  const response = await fetch(`${API_BASE_URL}/quiz/categories`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse(response, 'Failed to fetch categories');
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

/**
 * FETCH REQUEST: Create Category
 * METHOD: POST
 * ENDPOINT: quiz/categories
 * CONTENT-TYPE: application/json
 * REQUIRES AUTH: Yes (Bearer token, role: Admin or Teacher)
 * 
 * SUBMIT_BODY:
 * {
 *   "name": "Backend Development",
 *   "description": "Quizzes about server-side engineering"
 * }
 */
export async function createCategory(data: CreateCategoryDto): Promise<CategoryDto> {
  const response = await fetch(`${API_BASE_URL}/quiz/categories`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response, 'Failed to create category');
}

/**
 * FETCH REQUEST: Update Category
 * METHOD: PATCH
 * ENDPOINT: quiz/categories/:id
 * CONTENT-TYPE: application/json
 * REQUIRES AUTH: Yes (Bearer token, role: Admin or Teacher)
 * 
 * SUBMIT_BODY:
 * {
 *   "name": "Updated Category Name",
 *   "description": "Updated description"
 * }
 */
export async function updateCategory(id: number | string, data: UpdateCategoryDto): Promise<CategoryDto> {
  const response = await fetch(`${API_BASE_URL}/quiz/categories/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response, 'Failed to update category');
}

/**
 * FETCH REQUEST: Delete Category
 * METHOD: DELETE
 * ENDPOINT: quiz/categories/:id
 * CONTENT-TYPE: application/json
 * REQUIRES AUTH: Yes (Bearer token, role: Admin or Teacher)
 * 
 * SUBMIT_BODY: None
 */
export async function deleteCategory(id: number | string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/quiz/categories/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  return handleResponse(response, 'Failed to delete category');
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
  authorName?: string;
  categoryId?: number | string; // Category ID
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit: number; // in minutes
  questions: QuizQuestionDto[];
}

/**
 * FETCH REQUEST: Create Quiz
 * METHOD: POST
 * ENDPOINT: /quiz/create
 * CONTENT-TYPE: application/json
 * REQUIRES AUTH: Yes (Bearer token, role: Admin or Teacher)
 * 
 * SUBMIT_BODY:
 * {
 *   "title": "React Hooks Trivia",
 *   "description": "Show off your hooks knowledge!",
 *   "categoryId": "cuid",
 *   "difficulty": "MEDIUM",
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
  const response = await fetch(`${API_BASE_URL}/quiz/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response, 'Failed to create quiz');
}


/**
 * FETCH REQUEST: Delete Quiz
 * METHOD: DELETE
 * ENDPOINT: /quiz/delete/:id
 * CONTENT-TYPE: application/json
 * REQUIRES AUTH: Yes (Bearer token, owner/admin)
 * 
 * SUBMIT_BODY: None (URL parameter :id)
 */
export async function deleteQuiz(id: number | string) {
  const response = await fetch(`${API_BASE_URL}/quiz/delete/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  return handleResponse(response, 'Failed to delete quiz');
}


/**
 * FETCH REQUEST: Fetch All Quizzes
 * METHOD: GET
 * ENDPOINT: /quiz
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
  const response = await fetch(`${API_BASE_URL}/quiz${query}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse(response, 'Failed to fetch quizzes');
}


/**
 * FETCH REQUEST: Fetch Quiz Details (Lobby / Play Mode)
 * METHOD: GET
 * ENDPOINT: /quiz/:id
 * CONTENT-TYPE: application/json
 * 
 * SUBMIT_BODY: None (URL parameter :id)
 * NOTE: The response should NOT leak the correctOptionIndex for security!
 */
export async function getQuizDetails(id: number | string) {
  const response = await fetch(`${API_BASE_URL}/quiz/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse(response, 'Failed to fetch quiz details');
}

// ============================================================================
// 3. QUIZ ATTEMPT & RESULTS
// ============================================================================

export interface QuizAttemptSubmissionDto {
  answers: {
    questionId: string | number;
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

  return handleResponse(response, 'Failed to submit quiz attempt');
}
