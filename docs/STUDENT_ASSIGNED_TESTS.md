# Student Assigned Tests - IELTS Test Assignment System

## Overview
This module enables teachers to assign IELTS tests to students who can then login and take the tests using a unique candidate ID. No email verification or OTP is required for students.

## Features

### For Teachers
- Assign IELTS tests to students
- Generate unique 10-digit candidate IDs automatically
- Set test start and end times
- Track student progress (pending, in_progress, completed, expired)
- View all assigned tests
- Update or delete assignments

### For Students
- Login with candidate ID and email (no OTP required)
- View assigned test details
- Start the test
- Access listening, reading, and writing sections
- Submit test results
- Automatic test expiration handling

## API Endpoints

### Teacher Endpoints (Requires JWT Authentication)

#### Assign Test to Student
```
POST /student-tests/centers/:centerId/assign
Headers: Authorization: Bearer <token>
Body:
{
  "student_name": "John Doe",
  "student_email": "student@example.com",
  "test_id": "uuid",
  "test_start_time": "2024-01-15T09:00:00Z", // Optional
  "test_end_time": "2024-01-15T12:00:00Z",   // Optional
  "notes": "Good luck!"                       // Optional
}

Response:
{
  "id": "uuid",
  "candidate_id": "1234567890",
  "student_name": "John Doe",
  "student_email": "student@example.com",
  "test_id": "uuid",
  "center_id": "uuid",
  "assigned_by": "uuid",
  "status": "pending",
  ...
}
```

#### Get All Assignments
```
GET /student-tests/centers/:centerId/assignments
Headers: Authorization: Bearer <token>
```

#### Get Assignment by ID
```
GET /student-tests/centers/:centerId/assignments/:id
Headers: Authorization: Bearer <token>
```

#### Update Assignment
```
PUT /student-tests/centers/:centerId/assignments/:id
Headers: Authorization: Bearer <token>
Body:
{
  "test_start_time": "2024-01-15T09:00:00Z",
  "test_end_time": "2024-01-15T12:00:00Z",
  "status": "pending",
  "notes": "Updated notes"
}
```

#### Delete Assignment
```
DELETE /student-tests/centers/:centerId/assignments/:id
Headers: Authorization: Bearer <token>
```

### Student Endpoints

#### Student Login
```
POST /auth/student-login
Body:
{
  "candidate_id": "1234567890",
  "student_email": "student@example.com"
}

Response:
{
  "message": "Student login successful",
  "access_token": "jwt_token",
  "assignment": {
    "candidate_id": "1234567890",
    "student_name": "John Doe",
    "student_email": "student@example.com",
    "test_id": "uuid",
    "center_id": "uuid",
    "status": "pending",
    "test_start_time": "2024-01-15T09:00:00Z",
    "test_end_time": "2024-01-15T12:00:00Z"
  }
}
```

#### Get My Assignment
```
GET /student/assignment
Headers: Authorization: Bearer <student_token>
```

#### Start Test
```
POST /student/start-test
Headers: Authorization: Bearer <student_token>
```

#### Get Test Content
```
GET /student/test-content
Headers: Authorization: Bearer <student_token>
```

#### Get Listening Section
```
GET /student/listening
Headers: Authorization: Bearer <student_token>
```

#### Get Reading Section
```
GET /student/reading
Headers: Authorization: Bearer <student_token>
```

#### Get Writing Section
```
GET /student/writing
Headers: Authorization: Bearer <student_token>
```

#### Submit Test
```
POST /student/submit-test
Headers: Authorization: Bearer <student_token>
Body:
{
  "test_results": {
    "listening": {...},
    "reading": {...},
    "writing": {...},
    "scores": {...}
  }
}
```

## Database Schema

### student_assigned_tests Table
```sql
- id: UUID (Primary Key)
- candidate_id: VARCHAR(10) (Unique, Auto-generated 10-digit number)
- student_name: VARCHAR(255)
- student_email: VARCHAR(255)
- test_id: UUID (Foreign Key to ielts_tests)
- center_id: UUID (Foreign Key to centers)
- assigned_by: UUID (Foreign Key to users - teacher)
- test_start_time: DATETIME (Nullable)
- test_end_time: DATETIME (Nullable)
- status: ENUM('pending', 'in_progress', 'completed', 'expired')
- completed_at: DATETIME (Nullable)
- test_results: JSON (Nullable)
- notes: TEXT (Nullable)
- is_active: BOOLEAN (Default: true)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Test Status Flow

1. **pending**: Test assigned but not started
2. **in_progress**: Student has started the test
3. **completed**: Student has submitted the test
4. **expired**: Test end time has passed without completion

## Authentication

### Teacher Authentication
- Uses standard JWT authentication with role-based access control
- Requires `ielts` module access via subscription

### Student Authentication
- Uses simplified JWT authentication
- No email verification or OTP required
- Token payload includes:
  - `type: 'student'`
  - `candidate_id`
  - `student_email`
  - `center_id`
  - `test_id`
  - `sub` (assignment ID)

## Security Features

- Unique 10-digit candidate IDs (no duplicates)
- Email + candidate ID verification for login
- Automatic test expiration handling
- JWT-based authentication for both teachers and students
- Center-specific test isolation

## Usage Example

### Teacher Workflow
1. Create an IELTS test using `/ielts/centers/:centerId/tests`
2. Assign test to student using `/student-tests/centers/:centerId/assign`
3. Share the `candidate_id` and student's email with the student
4. Monitor progress via `/student-tests/centers/:centerId/assignments`

### Student Workflow
1. Receive candidate ID and email from teacher
2. Login using `/auth/student-login`
3. View test details via `/student/assignment`
4. Start test via `/student/start-test`
5. Access test sections (`/student/listening`, `/student/reading`, `/student/writing`)
6. Submit results via `/student/submit-test`

## Error Handling

Common error responses:
- `401 Unauthorized`: Invalid credentials or expired test
- `404 Not Found`: Assignment or test not found
- `400 Bad Request`: Test already completed, expired, or validation errors

## Notes

- Candidate IDs are automatically generated as unique 10-digit numbers
- Tests can have optional start and end times for scheduling
- Expired tests are automatically marked as 'expired' when accessed
- Test results are stored as JSON for flexibility
- Teachers can add notes for students on assignments
