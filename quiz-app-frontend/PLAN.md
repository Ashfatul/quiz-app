# NestJS Learning Quiz App - Frontend Plan

This plan outlines the screens, features, and API integration strategy for the Quiz App frontend. The frontend is designed as a learning tool to help you build and validate your NestJS backend step-by-step.

## 📋 General Architecture

1. **Routing & Navigation**:
   - Simple client-side routing using `react-router-dom`.
   - Responsive and premium navbar with user profile summary, logout, and links to all pages.

2. **Styling & Theme**:
   - Modern glassmorphism dark-theme styling using CSS variables (configured in `index.css`).
   - Smooth transition animations and hover feedback for a premium interactive feel.

3. **API Integration & Validation**:
   - A single config file (`src/config/api.ts`) defining the `API_BASE_URL` (default: `http://localhost:3000/api`) and a WebSocket url (default: `ws://localhost:3000`).
   - Form state management with inputs and file uploads fully functional, converting to request payloads.
   - At the top of every page/component doing fetch requests, a documented payload interface (`SUBMIT_BODY`, `QUERY_PARAMS`, `RESPONSE`) is defined in comments, making it easy to build matching NestJS DTOs and entities.

---

## 🎨 Pages & Features to Build

### 1. Authentication (Register & Login)
- **Register Screen**: Form with username, email, password, and avatar file upload.
- **Login Screen**: Simple email & password form. On success, stores JWT token in `localStorage`.

### 2. Dashboard
- **Quiz Explorer**: Grid of active quizzes, searchable by title/category.
- **Stats Dashboard**: Displays total quizzes taken, average score, and global rankings.
- **Global Leaderboard**: Shows top users by total score (polled or real-time updated).

### 3. Quiz Maker (Creator/Teacher Mode)
- **Quiz Configuration**: Title, description, difficulty, time limit (in minutes).
- **Question Builder**: Dynamic list of questions where the creator can:
  - Input question text.
  - Add up to 4 multiple-choice options.
  - Select the correct option.
  - Upload an optional image for each question.

### 4. Play Quiz
- **Lobby**: Overview of the quiz, showing time limit, number of questions, and high scores.
- **Gameplay**: Countdown timer, single question view with option selection, and active progress bar.
- **Submission**: Sends responses to backend for verification.

### 5. Quiz Results
- **Score Summary**: Percentage score, time spent, and correct/incorrect answer counts.
- **Detailed Review**: Highlights which options were chosen, which were correct, and explanations if provided.

### 6. Real-time Classroom Lobby (Multiplayer Gateway)
- **Host Room**: Create a multiplayer room with a unique code.
- **Join Room**: Enter the room code to wait in the active lobby.
- **Live Leaderboard**: Real-time WebSocket scoring as users answer questions concurrently.

---

## 🛠️ Step-by-Step Implementation Flow

1. **Step 1: Write Learning Guides & Configs**
   - Create `NESTJS_LEARNING_GUIDE.md` containing the syllabus mapping.
   - Create API configuration helper file (`src/config/api.ts`).

2. **Step 2: Setup Core Theme & Styling**
   - Refactor `src/index.css` and `src/App.css` to adopt a stunning modern dark-blue glassmorphism theme.

3. **Step 3: Define Routing & Layout**
   - Configure React Router to cover `/`, `/login`, `/register`, `/quizzes/create`, `/quizzes/:id`, `/quizzes/:id/play`, `/quizzes/:id/result`, `/lobby`, and `/lobby/:code`.

4. **Step 4: Implement Auth Pages & Logic**
   - Add forms for Register/Login, upload handling, saving token to state, and auto-attaching JWT headers to fetches.

5. **Step 5: Implement Quiz Management & Explorer**
   - Dashboard quiz lists, details, and creation portal.

6. **Step 6: Implement Play & Review Features**
   - Gameplay timers, pagination, submission, and result calculations.

7. **Step 7: Implement Real-time Lobbies (WebSocket)**
   - WebSocket client service for rooms using standard Socket.IO client.
