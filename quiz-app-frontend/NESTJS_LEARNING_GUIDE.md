# NestJS Concepts Learning Guide

This guide maps each page in the frontend to the corresponding **NestJS backend concepts** you will learn and implement. Use this as a syllabus for building your NestJS API!

---

## 🔑 Authentication & Users

### 1. User Registration (`/register`)
* **Endpoint**: `POST /auth/register` (Multipart Form Data)
* **Request Payload**:
  ```typescript
  // Form-Data / Multipart
  {
    username: string; // Length: 3-20
    email: string;    // Valid Email format
    password: string; // Min length: 6
    role: string;     // "student" | "teacher"
    avatar?: File;    // Optional profile image file (JPEG, PNG, max 2MB)
  }
  ```
* **Response Payload**:
  ```json
  {
    "id": 1,
    "username": "coder123",
    "email": "coder@example.com",
    "role": "student",
    "avatarUrl": "/uploads/avatars/16281729-avatar.png",
    "createdAt": "2026-07-26T12:00:00.000Z"
  }
  ```
* **NestJS Learning Concepts**:
  * **Controllers & Routing**: `@Controller('auth')` and `@Post('register')`.
  * **ValidationPipe & DTOs**: Use `class-validator` (e.g., `@IsEmail()`, `@Length()`) to validate inputs.
  * **File Upload (Multer)**: Use `FileInterceptor` and `@UploadedFile()` decorator to handle and save avatar files.
  * **Database Entities**: Define a `User` entity/schema, hash passwords using `bcrypt`.

### 2. User Login (`/login`)
* **Endpoint**: `POST /login` (JSON)
* **Request Payload**:
  ```json
  {
    "email": "coder@example.com",
    "password": "securepassword123"
  }
  ```
* **Response Payload**:
  ```json
  // Supports either nested or flat response:
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Or "token" / "access_token"
    "user": { // Optional: You can put user fields here or flat on root
      "id": 1,
      "username": "coder123",
      "email": "coder@example.com",
      "avatar": "http://example.com/avatar.png"
    }
  }
  ```
* **NestJS Learning Concepts**:
  * **JWT Authentication**: Incorporate `@nestjs/jwt` to sign and issue JWT access tokens.
  * **Authentication Strategies**: Implement Passport-based JWT strategy or custom authentication logic.

---

## 📝 Quizzes (CRUD & Roles)

### 2.5. Category Management (CRUD)
Teachers and Admins can manage quiz categories. This maps to the following API endpoints:

#### A. Fetch Categories
* **Endpoint**: `GET /quiz/categories` (JSON)
* **Response Payload**:
  ```json
  [
    {
      "id": 1,
      "name": "Backend Development",
      "description": "NestJS controllers, providers, and modules."
    }
  ]
  ```

#### B. Create Category
* **Endpoint**: `POST /quiz/categories` (JSON)
* **Request Payload**:
  ```json
  {
    "name": "Frontend Frameworks",
    "description": "Quizzes about React, Vue, or Angular."
  }
  ```
* **Response Payload**:
  ```json
  {
    "id": 4,
    "name": "Frontend Frameworks",
    "description": "Quizzes about React, Vue, or Angular."
  }
  ```

#### C. Update Category
* **Endpoint**: `PATCH /quiz/categories/:id` (JSON)
* **Request Payload**:
  ```json
  {
    "name": "Updated Category Name",
    "description": "Updated description"
  }
  ```
* **Response Payload**:
  ```json
  {
    "id": 4,
    "name": "Updated Category Name",
    "description": "Updated description"
  }
  ```

#### D. Delete Category
* **Endpoint**: `DELETE /quiz/categories/:id`
* **Response Payload**:
  ```json
  {
    "success": true
  }
  ```

* **NestJS Learning Concepts**:
  * **Authorization Guards**: Restrict POST, PATCH, and DELETE category operations using `RolesGuard` to role `admin` or `teacher`.
  * **Relational DB Operations**: Execute database CRUD (Insert, Select, Update, Delete query builders) on the Category Entity/Schema.

### 3. Create Quiz (`/quizzes/create` / `/quizzes/edit/:id`)
* **Endpoint**: `POST /quizzes` (Multipart/JSON mix, or JSON with base64 images, we will use JSON with optional image URL for simplicity, or multipart if needed. Let's use JSON for simplicity and learning files uploading as a separate entity).
* **Request Payload**:
  ```json
  {
    "title": "Introduction to NestJS",
    "description": "Test your knowledge of NestJS basics!",
    "category": 1, // Category ID (number or string)
    "difficulty": "Easy", // "Easy" | "Medium" | "Hard"
    "timeLimit": 15, // In minutes
    "questions": [
      {
        "text": "What decorator is used to define a NestJS controller?",
        "options": [
          "@Injectable()",
          "@Controller()",
          "@Module()",
          "@Route()"
        ],
        "correctOptionIndex": 1
      }
    ]
  }
  ```
* **Response Payload**:
  ```json
  {
    "id": 10,
    "title": "Introduction to NestJS",
    "creatorId": 1,
    "createdAt": "2026-07-26T12:00:00.000Z"
  }
  ```
* **NestJS Learning Concepts**:
  * **Guards (Authorization)**: Protect endpoints using an `AuthGuard('jwt')`.
  * **Role-based Access Control (RBAC)**: Create a custom `@Roles('admin', 'teacher')` decorator and roles guard to restrict quiz creation.
  * **TypeORM/Prisma Relations**: Implement a One-to-Many relationship between `Quiz` and `Question`.

### 4. Fetch Quizzes & Search (`/`)
* **Endpoint**: `GET /quizzes?search=NestJS&category=Backend`
* **Response Payload**:
  ```json
  [
    {
      "id": 10,
      "title": "Introduction to NestJS",
      "description": "Test your knowledge of NestJS basics!",
      "category": "Backend Development",
      "difficulty": "Easy",
      "timeLimit": 15,
      "questionCount": 10,
      "creator": {
        "username": "instructor_alice",
        "avatarUrl": "/uploads/avatars/alice.png"
      }
    }
  ]
  ```
* **NestJS Learning Concepts**:
  * **Pagination & Filtering**: Handle Query params via `@Query()`.
  * **Custom Pipes**: Create a pipe to transform/default pagination query parameters.
  * **Interceptors**: Use an interceptor to sanitize sensitive user fields (like hashing passwords out of the response).

---

## 🎮 Play Quiz & Statistics

### 5. Start / View Quiz Lobby (`/quizzes/:id`)
* **Endpoint**: `GET /quizzes/:id`
* **Response Payload**:
  ```json
  {
    "id": 10,
    "title": "Introduction to NestJS",
    "description": "Test your knowledge of NestJS basics!",
    "category": "Backend Development",
    "difficulty": "Easy",
    "timeLimit": 15,
    "creator": {
      "username": "instructor_alice"
    },
    "questions": [
      // Only returns question texts and option choices (WITHOUT correctOptionIndex to prevent cheating!)
      {
        "id": 101,
        "text": "What decorator is used to define a NestJS controller?",
        "options": ["@Injectable()", "@Controller()", "@Module()", "@Route()"]
      }
    ]
  }
  ```
* **NestJS Learning Concepts**:
  * **Security / Data Masking**: Ensure the `correctOptionIndex` is not sent in the public fetch endpoint, only retrieved on check-answer backend logic.
  * **Validation Pipes**: `ParseIntPipe` to validate that `:id` is a numeric integer.

### 6. Submit Quiz Attempt (`/quizzes/:id/play` -> Submit)
* **Endpoint**: `POST /quizzes/:id/attempts`
* **Request Payload**:
  ```json
  {
    "answers": [
      { "questionId": 101, "selectedOptionIndex": 1 },
      { "questionId": 102, "selectedOptionIndex": 0 }
    ]
  }
  ```
* **Response Payload**:
  ```json
  {
    "attemptId": 55,
    "score": 1, // Number of correct answers
    "totalQuestions": 2,
    "percentage": 50.0,
    "answersReview": [
      {
        "questionId": 101,
        "text": "What decorator is used to define a NestJS controller?",
        "selectedOptionIndex": 1,
        "correctOptionIndex": 1,
        "isCorrect": true
      },
      {
        "questionId": 102,
        "text": "Which module configuration imports other modules?",
        "selectedOptionIndex": 0,
        "correctOptionIndex": 2,
        "isCorrect": false
      }
    ]
  }
  ```
* **NestJS Learning Concepts**:
  * **Business Logic / Services**: Perform grading checks securely on the server.
  * **Database Transaction**: Create attempt record, increment User's total score, update global statistics.
  * **Exception Filters**: Return specialized HTTP errors if a user submits late (exceeds timeLimit).

### 7. User Stats Dashboard (`/` sidebar/profile stats)
* **Endpoint**: `GET /users/me/stats`
* **Response Payload**:
  ```json
  {
    "totalAttempts": 15,
    "averageScore": 82.5,
    "quizzesCreated": 3,
    "recentAttempts": [
      { "quizTitle": "NestJS Basics", "score": 90, "date": "2026-07-25T10:00:00.000Z" }
    ]
  }
  ```
* **NestJS Learning Concepts**:
  * **Aggregations & Queries**: SQL Group By queries or MongoDB aggregation pipelines.

---

## ⚡ Real-Time Features (WebSockets)

### 8. Multiplayer Classroom Lobby (`/lobby` and `/lobby/:code`)
* **Gateway Events**:
  1. `joinRoom` (Client -> Server): Join a lobby room code.
  2. `roomUpdated` (Server -> Client): Broadcasts updated lists of active players in the room.
  3. `startQuiz` (Client/Host -> Server): Broadcasts trigger to start quiz.
  4. `submitAnswer` (Client -> Server): Submit answers in real-time.
  5. `scoreboardUpdate` (Server -> Client): Broadcasts live updated leaderboard during/after gameplay.
* **NestJS Learning Concepts**:
  * **WebSockets Gateway**: `@WebSocketGateway()`, `@WebSocketServer()`, and `@SubscribeMessage()`.
  * **Lobby State Management**: Store active rooms, participants, and scoring progress in-memory or in Redis.
  * **Gateway Lifecycle Hooks**: Implement `OnGatewayConnection` and `OnGatewayDisconnect` to clean up disconnected users.

---

## ⏰ Advanced Backend Tasks

### 9. Task Scheduling & Statistics Cleanup
* **Backend Cron Job**:
  * Runs every day at midnight to generate weekly top-performer statistics or clean up inactive websocket lobby sessions.
* **NestJS Learning Concepts**:
  * **Task Scheduling**: Configure `@nestjs/schedule` and write a service method with `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`.
