# Media Library API Documentation

## Overview
The Media Library module provides comprehensive file management capabilities for the CRM + IELTS platform. It supports uploading, managing, and serving various file types including images, videos, audio files, and documents.

## Features
- ✅ Single and multiple file uploads
- ✅ File type categorization (IMAGE, VIDEO, AUDIO, DOCUMENT, OTHER)
- ✅ Metadata tracking (size, MIME type, dimensions, duration)
- ✅ Search and filtering capabilities
- ✅ Soft delete and hard delete options
- ✅ Storage statistics
- ✅ Role-based access control
- ✅ Center-based organization

## Media Types
```typescript
enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other'
}
```

## Endpoints

### 1. Upload Single File
**POST** `/media/upload`

**Roles:** admin, owner, teacher

**Request:**
- Form-data with `file` field
- Optional fields:
  - `alt_text`: Alternative text for accessibility
  - `description`: File description
  - `center_id`: Associated center ID

**Response:**
```json
{
  "id": "uuid",
  "filename": "file-1234567890-123456789.jpg",
  "original_filename": "my-image.jpg",
  "url": "http://localhost:3000/uploads/file-1234567890-123456789.jpg",
  "file_path": "./uploads/file-1234567890-123456789.jpg",
  "mime_type": "image/jpeg",
  "file_size": 102400,
  "media_type": "image",
  "alt_text": "Profile picture",
  "description": "User profile photo",
  "center_id": "center-uuid",
  "uploaded_by": "user-uuid",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 2. Upload Multiple Files
**POST** `/media/upload/multiple`

**Roles:** admin, owner, teacher

**Request:**
- Form-data with `files` field (up to 10 files)
- Optional field:
  - `center_id`: Associated center ID

**Response:**
```json
[
  {
    "id": "uuid-1",
    "filename": "file-1234567890-123456789.jpg",
    "original_filename": "image1.jpg",
    ...
  },
  {
    "id": "uuid-2",
    "filename": "file-1234567890-987654321.jpg",
    "original_filename": "image2.jpg",
    ...
  }
]
```

### 3. Get All Media (with filtering)
**GET** `/media`

**Roles:** admin, owner, teacher, student

**Query Parameters:**
- `media_type`: Filter by media type (image, video, audio, document, other)
- `center_id`: Filter by center
- `search`: Search in filename, description, alt_text
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "filename": "file-1234567890-123456789.jpg",
      ...
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### 4. Get Media by ID
**GET** `/media/:id`

**Roles:** admin, owner, teacher, student

**Response:**
```json
{
  "id": "uuid",
  "filename": "file-1234567890-123456789.jpg",
  "original_filename": "my-file.jpg",
  "url": "http://localhost:3000/uploads/file-1234567890-123456789.jpg",
  "media_type": "image",
  "uploader": {
    "id": "user-uuid",
    "full_name": "John Doe",
    "email": "john@example.com"
  },
  "center": {
    "id": "center-uuid",
    "name": "Main Center"
  },
  ...
}
```

### 5. Get Media by Type
**GET** `/media/type/:type`

**Roles:** admin, owner, teacher, student

**Parameters:**
- `:type`: Media type (image, video, audio, document, other)

**Query Parameters:**
- `center_id`: Optional center filter

**Response:**
```json
[
  {
    "id": "uuid",
    "filename": "audio-1234567890-123456789.mp3",
    "media_type": "audio",
    ...
  }
]
```

### 6. Get Storage Statistics
**GET** `/media/stats`

**Roles:** admin, owner

**Query Parameters:**
- `center_id`: Optional center filter

**Response:**
```json
{
  "totalFiles": 250,
  "totalSize": 524288000,
  "byType": {
    "image": {
      "count": 150,
      "size": 314572800
    },
    "video": {
      "count": 50,
      "size": 157286400
    },
    "audio": {
      "count": 30,
      "size": 41943040
    },
    "document": {
      "count": 15,
      "size": 10485760
    },
    "other": {
      "count": 5,
      "size": 0
    }
  }
}
```

### 7. Update Media Metadata
**PATCH** `/media/:id`

**Roles:** admin, owner, teacher

**Request Body:**
```json
{
  "alt_text": "Updated alt text",
  "description": "Updated description",
  "width": 1920,
  "height": 1080,
  "duration": 120.5
}
```

**Response:**
```json
{
  "id": "uuid",
  "alt_text": "Updated alt text",
  "description": "Updated description",
  ...
}
```

### 8. Soft Delete Media
**DELETE** `/media/:id`

**Roles:** admin, owner

Marks the media as inactive (soft delete). Physical file remains on disk.

**Response:**
```json
{
  "message": "Media deleted successfully"
}
```

### 9. Hard Delete Media
**DELETE** `/media/:id/hard`

**Roles:** admin only

Permanently deletes the media record and removes the physical file from disk.

**Response:**
```json
{
  "message": "Media permanently deleted"
}
```

## File Upload Specifications

### Supported File Types
All file types are supported. Files are automatically categorized based on MIME type:
- **Images:** image/*
- **Videos:** video/*
- **Audio:** audio/*
- **Documents:** application/pdf, application/msword, text/*, etc.
- **Other:** All other types

### File Size Limits
- Maximum file size: 100 MB per file
- Multiple upload: Up to 10 files at once

### Storage Location
Files are stored in the `./uploads` directory and served at `/uploads/` URL path.

### File Naming
Files are automatically renamed using the pattern:
```
{fieldname}-{timestamp}-{random}.{extension}
```
Example: `file-1705315200000-123456789.jpg`

## Use Cases

### 1. IELTS Test Audio Files
Upload listening test audio files:
```bash
POST /media/upload
Content-Type: multipart/form-data

file: listening-test-1.mp3
description: "IELTS Listening Test 1 - Section 1"
center_id: "center-uuid"
```

### 2. Writing Task Images
Upload images for writing tasks:
```bash
POST /media/upload
Content-Type: multipart/form-data

file: writing-task-graph.png
description: "Bar chart showing population changes"
alt_text: "Population trends graph 2010-2020"
```

### 3. Student Documents
Upload student certificates or documents:
```bash
POST /media/upload/multiple
Content-Type: multipart/form-data

files: [certificate.pdf, transcript.pdf, id-card.jpg]
center_id: "center-uuid"
```

### 4. Get All Audio Files for Center
```bash
GET /media/type/audio?center_id=center-uuid
```

### 5. Search Media Files
```bash
GET /media?search=listening&media_type=audio&page=1&limit=10
```

## Security

### Authentication
All endpoints require JWT authentication via Bearer token in Authorization header.

### Role-Based Access
- **Upload:** admin, owner, teacher
- **View:** admin, owner, teacher, student
- **Update:** admin, owner, teacher
- **Soft Delete:** admin, owner
- **Hard Delete:** admin only

### File Validation
- File size limits enforced
- MIME type detection
- Automatic categorization

## Error Handling

### Common Errors
- `400 Bad Request`: No file provided or invalid data
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient role permissions
- `404 Not Found`: Media file not found
- `413 Payload Too Large`: File exceeds size limit

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "No file uploaded",
  "error": "Bad Request"
}
```

## Database Schema

### Media Entity
```sql
CREATE TABLE media (
  id VARCHAR(36) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  media_type ENUM('image', 'video', 'audio', 'document', 'other') NOT NULL,
  alt_text TEXT,
  description TEXT,
  width INT,
  height INT,
  duration DECIMAL(10,2),
  center_id VARCHAR(36),
  uploaded_by VARCHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (center_id) REFERENCES centers(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

## Integration Examples

### React/Next.js Upload Component
```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', 'My file');
  formData.append('center_id', centerId);

  const response = await fetch('http://localhost:3000/media/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};
```

### Display Media Gallery
```typescript
const getMediaFiles = async () => {
  const response = await fetch(
    'http://localhost:3000/media?media_type=image&page=1&limit=12',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```
