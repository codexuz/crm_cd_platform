# Student Test API Examples

## Overview
The student test system now supports both bulk submission and incremental saving. Below are examples for all the new incremental saving endpoints.

## Authentication
All student endpoints require JWT authentication with student token containing `candidateId`.

## Endpoints

### 1. Save Individual Listening Answer
**Endpoint:** `POST /student/save-listening-answer`

**Request Body:**
```json
{
  "question_id": "listening_1_1",
  "answer": "A"
}
```

**Response:**
```json
{
  "message": "Listening answer saved successfully"
}
```

### 2. Save Individual Reading Answer
**Endpoint:** `POST /student/save-reading-answer`

**Request Body:**
```json
{
  "question_id": "reading_2_3",
  "answer": 27
}
```

**Response:**
```json
{
  "message": "Reading answer saved successfully"
}
```

### 3. Save Writing Task
**Endpoint:** `POST /student/save-writing-task`

**Request Body:**
```json
{
  "task": "task1",
  "answer": "The chart illustrates the consumption of three different types of fast food in the UK over a 20-year period from 1970 to 1990. Overall, while pizza and hamburgers showed significant increases, fish and chips experienced a decline.",
  "word_count": 45,
  "time_spent": 25
}
```

**Response:**
```json
{
  "message": "task1 saved successfully"
}
```

### 4. Save Section Progress (Multiple Answers)
**Endpoint:** `POST /student/save-section-progress`

**For Listening Section:**
```json
{
  "section": "listening",
  "answers": {
    "listening_1_1": "B",
    "listening_1_2": "C",
    "listening_1_3": "A"
  },
  "time_spent": 15,
  "current_question": "listening_1_4"
}
```

**For Reading Section:**
```json
{
  "section": "reading",
  "answers": {
    "reading_2_1": 14,
    "reading_2_2": 27,
    "reading_2_3": "TRUE"
  },
  "time_spent": 30,
  "current_question": "reading_2_4"
}
```

**For Writing Section (Progress Tracking):**
```json
{
  "section": "writing",
  "time_spent": 45,
  "current_question": "task2"
}
```

**Response:**
```json
{
  "message": "listening progress saved successfully"
}
```

## Complete Test Submission (Bulk)
**Endpoint:** `POST /student/submit-test`

**Request Body:**
```json
{
  "test_results": {
    "listening": {
      "answers": {
        "listening_1_1": "A",
        "listening_1_2": "B",
        "listening_1_3": "C"
      },
      "time_spent": 40,
      "scores": {
        "section1": 8,
        "section2": 7,
        "section3": 9,
        "section4": 8,
        "total": 32
      }
    },
    "reading": {
      "answers": {
        "reading_1_1": 14,
        "reading_1_2": "TRUE",
        "reading_1_3": "NOT GIVEN"
      },
      "time_spent": 60,
      "scores": {
        "section1": 7,
        "section2": 8,
        "section3": 6,
        "total": 21
      }
    },
    "writing": {
      "task1": {
        "answer": "The graph shows the population growth in three countries over 50 years...",
        "word_count": 180,
        "time_spent": 35
      },
      "task2": {
        "answer": "In conclusion, while technology has brought many benefits...",
        "word_count": 320,
        "time_spent": 45
      },
      "time_spent": 80
    },
    "submitted_at": "2025-11-20T10:30:00.000Z",
    "total_time_spent": 180
  }
}
```

## Test Content Retrieval
**Endpoint:** `GET /student/test-content`

**Response:**
```json
{
  "test": {
    "id": "test-uuid",
    "name": "IELTS Academic Test - November 2025",
    "type": "academic",
    "duration_minutes": 180
  },
  "candidate_id": "1234567890",
  "student": {
    "id": "student-uuid",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "test_start_time": "2025-11-20T13:14:43.000Z",
  "test_end_time": "2025-11-20T15:44:43.000Z",
  "status": "in_progress"
}
```

## Section Content Retrieval

### Listening Section
**Endpoint:** `GET /student/listening`

**Response:** IELTS listening test data with audio files, questions, etc.

### Reading Section
**Endpoint:** `GET /student/reading`

**Response:** IELTS reading test data with passages and questions.

### Writing Section
**Endpoint:** `GET /student/writing`

**Response:** IELTS writing test data with tasks and instructions.

## Usage Patterns

### Auto-Save Implementation
```javascript
// Auto-save every 30 seconds
setInterval(async () => {
  try {
    await fetch('/student/save-section-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        section: currentSection,
        answers: currentAnswers,
        time_spent: timeSpent,
        current_question: currentQuestion
      })
    });
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
}, 30000);
```

### Individual Answer Saving
```javascript
// Save single answer immediately
async function saveAnswer(questionId, answer) {
  const response = await fetch('/student/save-listening-answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      question_id: questionId,
      answer: answer
    })
  });

  if (response.ok) {
    showSuccessMessage('Answer saved!');
  }
}
```

### Progress Tracking
```javascript
// Track writing progress
function updateWritingProgress(task, content, wordCount, timeSpent) {
  fetch('/student/save-writing-task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      task: task, // 'task1' or 'task2'
      answer: content,
      word_count: wordCount,
      time_spent: timeSpent
    })
  });
}
```

## Error Handling
All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid data, test expired, etc.)
- `401`: Unauthorized
- `404`: Assignment not found
- `500`: Server error

Error response format:
```json
{
  "statusCode": 400,
  "message": "Test has expired",
  "error": "Bad Request"
}
```</content>
<parameter name="filePath">c:\my-apps\crm_cd_platform\STUDENT_TEST_API_EXAMPLES.md