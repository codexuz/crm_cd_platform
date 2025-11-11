# IELTS Test Module

This module provides comprehensive CRUD operations for IELTS Reading and Listening tests based on the official IELTS test structure.

## Database Structure

### Entities

1. **IeltsTest** - Main test entity that links listening and reading
2. **IeltsListening** - Listening test with 4 parts
3. **IeltsListeningPart** - Individual listening parts (PART_1 to PART_4)
4. **IeltsReading** - Reading test with 3 parts
5. **IeltsReadingPart** - Individual reading parts (PART_1 to PART_3)
6. **IeltsQuestion** - Question content with multiple question types
7. **IeltsAudio** - Audio files for listening tests

### Question Types

The system supports the following question types:

- `completion` - Fill in the blanks with @@ placeholders
- `multiple-choice` - A, B, C, D options
- `multi-select` - Choose TWO/THREE letters
- `selection` - YES/NO/NOT GIVEN or TRUE/FALSE/NOT GIVEN
- `draggable-selection` - Drag and drop matching
- `matching` - Match headings to paragraphs

## API Endpoints

### IELTS Tests

```
POST   /ielts/tests           - Create a new test
GET    /ielts/tests           - Get all tests for center
GET    /ielts/tests/:id       - Get test by ID with full details
PUT    /ielts/tests/:id       - Update test
DELETE /ielts/tests/:id       - Soft delete test
POST   /ielts/tests/complete  - Create complete test (test + listening + reading)
```

### Listening Tests

```
POST /ielts/listening     - Create listening test with parts
GET  /ielts/listening     - Get all listening tests
GET  /ielts/listening/:id - Get listening by ID with parts
```

### Reading Tests

```
POST /ielts/reading     - Create reading test with parts
GET  /ielts/reading     - Get all reading tests
GET  /ielts/reading/:id - Get reading by ID with parts
```

## Request Examples

### Create Complete Test

```json
POST /ielts/tests/complete
{
  "test": {
    "title": "IELTS Practice Test 1",
    "description": "Full practice test",
    "for_cdi": false
  },
  "listening": {
    "title": "Listening Test 1",
    "parts": [
      {
        "part": "PART_1",
        "question": {
          "content": [
            {
              "id": "1",
              "type": "completion",
              "condition": "Complete the form below. Write NO MORE THAN TWO WORDS for each answer.",
              "content": "<p>Name: John @@</p><p>Age: @@</p>"
            }
          ],
          "number_of_questions": 2
        },
        "audio": {
          "url": "https://example.com/audio1.mp3",
          "file_name": "part1.mp3",
          "duration": 300
        },
        "answers": {
          "1": "Smith",
          "2": "25"
        }
      }
    ]
  },
  "reading": {
    "title": "Reading Test 1",
    "parts": [
      {
        "part": "PART_1",
        "question": {
          "content": [
            {
              "id": "1",
              "type": "multiple-choice",
              "title": "Choose the correct letter A, B, C or D.",
              "questions": [
                {
                  "id": "1",
                  "question": "What is the main idea?",
                  "options": [
                    {"id": "A", "value": "A", "label": "Option A"},
                    {"id": "B", "value": "B", "label": "Option B"}
                  ]
                }
              ]
            }
          ],
          "number_of_questions": 1
        },
        "passage": "<h2>Passage Title</h2><p>Reading passage text...</p>",
        "answers": {
          "1": "A"
        }
      }
    ]
  }
}
```

### Create Listening Only

```json
POST /ielts/listening
{
  "title": "Listening Practice",
  "description": "Listening section only",
  "for_cdi": false,
  "parts": [
    {
      "part": "PART_1",
      "question": {
        "content": [...],
        "number_of_questions": 10
      },
      "audio": {
        "url": "https://example.com/audio.mp3",
        "file_name": "listening1.mp3",
        "duration": 300,
        "file_size": 5242880
      },
      "answers": {}
    }
  ]
}
```

### Create Reading Only

```json
POST /ielts/reading
{
  "title": "Reading Practice",
  "parts": [
    {
      "part": "PART_1",
      "question": {
        "content": [...],
        "number_of_questions": 13
      },
      "passage": "<h2>Title</h2><p>Passage text...</p>",
      "answers": {}
    }
  ]
}
```

## Features

- ✅ Multi-tenant support (center-based isolation)
- ✅ JWT authentication required for all endpoints
- ✅ Support for all IELTS question types
- ✅ Flexible question content structure using JSON columns
- ✅ Audio file management for listening tests
- ✅ HTML support for reading passages
- ✅ Answer key storage per part
- ✅ Soft delete for tests
- ✅ Creator/updater tracking
- ✅ CDI (Cambridge/Official) flag support

## Notes

- All endpoints require JWT authentication
- Tenant isolation is enforced via `center_id`
- Question content is stored as JSON for flexibility
- Audio URLs should point to storage (MinIO, S3, etc.)
- Reading passages support HTML formatting
- Answers are stored as JSON objects with question IDs as keys
