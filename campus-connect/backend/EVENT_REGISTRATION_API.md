# Event Registration API - Duplicate Prevention & Live Tracking

## Overview
Enhanced event registration system that prevents duplicate registrations and provides live tracking of registration statistics.

## Key Features
- **Duplicate Prevention**: Users can only register once per event
- **Team Member Validation**: Prevents team members from being registered multiple times
- **Live Statistics**: Real-time tracking of registration counts
- **Capacity Management**: Automatic capacity checking and full event detection

## New Endpoints

### 1. Get Live Registration Statistics
**GET** `/api/events/:eventId/stats`

Get real-time registration statistics for an event.

**Response:**
```json
{
  "eventId": "event_id",
  "eventTitle": "Hackathon 2024",
  "totalRegistered": 45,
  "capacity": 100,
  "spotsRemaining": 55,
  "teamCount": 15,
  "registrationRate": 45.0,
  "isFull": false,
  "isTeamEvent": true,
  "teamSize": 4
}
```

### 2. Check User Registration Status
**GET** `/api/events/:eventId/check-registration`

Check if the current user is registered for an event.

**Response:**
```json
{
  "isRegistered": true,
  "registration": {
    "teamName": "Code Warriors",
    "leader": "user_id",
    "members": ["member1_id", "member2_id"],
    "registeredAt": "2024-01-15T10:30:00Z"
  },
  "isLeader": true
}
```

### 3. Enhanced Event Registration
**POST** `/api/events/:eventId/register`

Register for an event with duplicate prevention.

**Enhanced Response:**
```json
{
  "message": "Successfully registered for event",
  "registrationCount": 46,
  "capacity": 100,
  "spotsRemaining": 54
}
```

**Error Responses:**
```json
// Duplicate registration
{
  "message": "You are already registered for this event"
}

// Team member already registered
{
  "message": "Team member John Doe is already registered for this event"
}

// Event full
{
  "message": "Event is full"
}
```

### 4. Enhanced Events List
**GET** `/api/events/`

Get all events with registration statistics.

**Response:**
```json
[
  {
    "_id": "event_id",
    "title": "Hackathon 2024",
    "description": "Annual coding competition",
    "date": "2024-02-15T09:00:00Z",
    "capacity": 100,
    "isTeamEvent": true,
    "teamSize": 4,
    "registrationStats": {
      "totalRegistered": 45,
      "spotsRemaining": 55,
      "teamCount": 15,
      "isFull": false,
      "registrationRate": 45.0
    }
  }
]
```

## Registration Validation Logic

### Duplicate Prevention
1. **User Check**: Verifies if user is already registered as leader or member
2. **Team Member Check**: Validates each team member isn't already registered
3. **Cross-Registration Prevention**: Prevents users from being in multiple teams

### Capacity Management
1. **Real-time Counting**: Calculates total registered participants (leaders + members)
2. **Capacity Enforcement**: Blocks registration when event reaches capacity
3. **Team Size Validation**: Ensures teams don't exceed maximum size

## Frontend Integration Example

```javascript
// Check registration status before showing registration form
const checkRegistration = async (eventId) => {
  const response = await fetch(`/api/events/${eventId}/check-registration`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.isRegistered;
};

// Get live statistics for display
const getEventStats = async (eventId) => {
  const response = await fetch(`/api/events/${eventId}/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Register with error handling
const registerForEvent = async (eventId, registrationData) => {
  try {
    const response = await fetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(registrationData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return response.json();
  } catch (error) {
    // Handle duplicate registration, full event, etc.
    console.error('Registration failed:', error.message);
    throw error;
  }
};

// Live statistics polling
const pollEventStats = (eventId, callback) => {
  const interval = setInterval(async () => {
    try {
      const stats = await getEventStats(eventId);
      callback(stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, 5000); // Poll every 5 seconds
  
  return () => clearInterval(interval);
};
```

## Real-time Updates
For live tracking, implement polling or WebSocket connections to get real-time registration updates and display them to users viewing the event page.