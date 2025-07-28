# Mentor Profile API Documentation

## Overview
This API handles mentor profile setup for alumni and faculty members, including resume upload, skills/domain selection, and mentor listing.

## Endpoints

### 1. Setup Mentor Profile
**POST** `/api/mentorship/setup-profile`

Setup mentor profile with resume upload and expertise areas.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (Form Data):**
- `resume`: File (PDF, DOC, DOCX - max 10MB)
- `areasOfExpertise`: JSON string or comma-separated string (e.g., "Web Development,Machine Learning,Data Science")
- `skills`: JSON string or comma-separated string (e.g., "JavaScript,Python,React")
- `experiences`: JSON string with work experience array
- `projects`: JSON string with project details array
- `bio`: String - Professional bio/description
- `linkedin`: String - LinkedIn profile URL
- `github`: String - GitHub profile URL

**Response:**
```json
{
  "message": "Mentor profile setup completed successfully",
  "resumeUploaded": true,
  "profileComplete": true
}
```

**Experience Data Format:**
```json
[
  {
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "startDate": "2020-01-01",
    "endDate": "2023-01-01",
    "description": "Led development team and architected scalable solutions"
  }
]
```

**Projects Data Format:**
```json
[
  {
    "title": "E-commerce Platform",
    "description": "Built full-stack e-commerce solution",
    "technologies": ["React", "Node.js", "MongoDB"],
    "url": "https://github.com/user/project",
    "startDate": "2022-01-01",
    "endDate": "2022-06-01"
  }
]
```

### 2. Get All Mentors
**GET** `/api/mentorship/mentors`

Get list of all available mentors.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "/uploads/images/avatar.jpg",
    "bio": "Experienced software engineer...",
    "resume": "/uploads/resumes/resume.pdf",
    "areasOfExpertise": ["Web Development", "Machine Learning"],
    "skills": ["JavaScript", "Python", "React"],
    "rating": 4.5,
    "totalRatings": 10,
    "role": "alumni",
    "department": "Computer Science",
    "yearOfGraduation": 2020
  }
]
```

### 3. Get Mentor Profile
**GET** `/api/mentorship/mentor/:id`

Get detailed mentor profile by ID.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "/uploads/images/avatar.jpg",
  "bio": "Experienced software engineer...",
  "resume": "/uploads/resumes/resume.pdf",
  "areasOfExpertise": ["Web Development", "Machine Learning"],
  "skills": ["JavaScript", "Python", "React"],
  "rating": 4.5,
  "totalRatings": 10,
  "role": "alumni",
  "experiences": [
    {
      "title": "Senior Developer",
      "company": "Tech Corp",
      "startDate": "2020-01-01",
      "endDate": "2023-01-01",
      "description": "Led development team..."
    }
  ],
  "projects": [
    {
      "title": "AI Chatbot",
      "description": "Developed intelligent chatbot using NLP",
      "technologies": ["Python", "TensorFlow", "Flask"],
      "url": "https://github.com/user/chatbot",
      "startDate": "2022-03-01",
      "endDate": "2022-08-01"
    }
  ]
}
```

## Login Flow Changes

When alumni or faculty login, the response now includes `needsMentorSetup` flag:

```json
{
  "token": "jwt_token",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "alumni",
    "needsMentorSetup": true
  }
}
```

If `needsMentorSetup` is true, redirect user to mentor profile setup page.

## Frontend Integration Example

```javascript
// Check if mentor setup is needed after login
if (user.needsMentorSetup && (user.role === 'alumni' || user.role === 'faculty')) {
  // Redirect to mentor setup page
  navigate('/mentor-setup');
}

// Setup mentor profile
const setupMentorProfile = async (formData) => {
  const response = await fetch('/api/mentorship/setup-profile', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData // FormData with resume file and other fields
  });
  return response.json();
};

// Get mentors list
const getMentors = async () => {
  const response = await fetch('/api/mentorship/mentors', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```