# 🔥 Firestore Collections (Tables) - Complete List

## 📊 Overview

Your Firebase Firestore database will contain **4 main collections** (tables). These collections are automatically created when data is first written to them.

---

## 📦 Collections List

### 1. **`users`** Collection
**Purpose:** Store user profiles and account information

**Document ID:** User ID (e.g., `"1"`, `"2"`, `"5"`)

**Document Structure:**
```javascript
{
  id: "5",
  email: "user@example.com",
  password: "hashed_password",  // Hashed for security
  name: "John Doe",
  role: "regular" | "premium" | "admin",
  image: "https://..." | null,
  age: "30",
  career: "Software Engineer",
  study: "Computer Science",
  hobby: "Photography, Hiking",
  bio: "Passionate developer...",
  phone: "+1234567890",
  location: "New York, NY",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Created When:**
- User registers a new account
- Initial mock users are migrated (first app launch)

**Service:** `UserService.js`

**Example Documents:**
```
users/
  ├─ 1/          # Demo user
  ├─ 2/          # Admin user
  ├─ 3/          # Premium user
  └─ 5/          # New registered user
```

---

### 2. **`eventEnrollments`** Collection ⭐
**Purpose:** Junction table for many-to-many relationship between users and events

**Document ID:** `{userId}_{eventId}` (e.g., `"5_123"`, `"7_456"`)

**Document Structure:**
```javascript
{
  // Composite Key (in document ID)
  id: "5_123",  // userId_eventId
  
  // Foreign Keys
  userId: "5",
  eventId: "123",
  
  // Full Event Data (denormalized)
  event: {
    id: "123",
    title: "Tech Meetup",
    description: "Join us for...",
    date: "Dec 15, 2024",
    time: "7:00 PM",
    location: "Conference Center",
    category: "Technology",
    price: "$25",
    image: "https://...",
    attendees: 50,
    maxAttendees: 100,
    organizer: "Tech Community",
    // ... full event details
  },
  
  // Enrollment Metadata
  enrolledAt: Timestamp,    // When user enrolled
  status: "confirmed" | "attended",
  createdAt: Timestamp
}
```

**Created When:**
- User enrolls in an event (clicks "Enroll" button)

**Service:** `EventEnrollmentService.js`

**Key Features:**
- ✅ **Many-to-Many Relationship**: Links users ↔ events
- ✅ **Composite Key**: Document ID ensures uniqueness
- ✅ **Denormalized Data**: Stores full event data for faster reads

**Example Documents:**
```
eventEnrollments/
  ├─ 5_123/        # User 5 enrolled in Event 123
  ├─ 5_456/        # User 5 enrolled in Event 456
  ├─ 7_123/        # User 7 enrolled in Event 123
  └─ 9_789/        # User 9 enrolled in Event 789
```

---

### 3. **`customEvents`** Collection
**Purpose:** Store custom events created by Premium/Admin users

**Document ID:** Event ID (e.g., `"1763665307858"`, timestamp-based)

**Document Structure:**
```javascript
{
  id: "1763665307858",
  title: "Weekend Hackathon",
  description: "Join us for a coding marathon...",
  location: "Tech Hub",
  date: "Dec 20, 2024",
  time: "9:00 AM",
  category: "Technology",
  price: "Free",
  image: "https://...",
  attendees: 0,
  isCustom: true,
  addedBy: "5",              // User ID who created it
  addedAt: Timestamp,        // When created
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Created When:**
- Premium or Admin user creates a custom event
- User clicks "Add Event" button (if they have permission)

**Service:** `CustomEventService.js`

**Example Documents:**
```
customEvents/
  ├─ 1763665307858/    # Custom event created by User 5
  ├─ 1763665307900/    # Another custom event
  └─ 1763665307950/    # Yet another custom event
```

---

### 4. **`eventAttendees`** Collection
**Purpose:** Store attendees and swipe data for events (post-event)

**Document ID:** Event ID (e.g., `"123"`, `"enrolled_456"`)

**Document Structure:**
```javascript
{
  eventId: "123",
  eventTitle: "Tech Meetup",
  
  // Attendees Array (converted from enrolled users)
  attendees: [
    {
      id: "123_5",           // eventId_userId
      userId: "5",           // Actual user ID
      name: "John Doe",
      job: "Software Engineer",
      company: "Tech Corp",
      age: 30,
      bio: "Passionate developer...",
      image: "https://...",
      interests: ["Coding", "Photography"],
      mutualConnections: 3,
      eventId: "123",
      swipeAction: "liked" | "passed" | null,  // User's swipe
      swipedAt: "2024-12-15T..." | null
    },
    // ... more attendees
  ],
  
  // User Swipes Tracking
  userSwipes: {
    "5": {                   // userId
      "123_7": {             // attendeeId
        action: "liked",
        swipedAt: Timestamp
      },
      "123_9": {
        action: "passed",
        swipedAt: Timestamp
      }
    },
    "7": {                   // Another user's swipes
      // ...
    }
  },
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Created When:**
- Event date passes and status becomes "attended"
- System automatically generates attendees from enrolled users

**Service:** `AttendeeService.js`

**Key Features:**
- ✅ **Real Users**: Converts enrolled users to attendees
- ✅ **Swipe Tracking**: Stores user swipe actions (like/pass)
- ✅ **Match Detection**: Tracks which users completed swiping

**Example Documents:**
```
eventAttendees/
  ├─ 123/           # Attendees for Event 123
  ├─ enrolled_456/  # Attendees for enrolled Event 456
  └─ default_1/     # Attendees for default Event 1
```

---

## 📈 Complete Database Structure

### Visual Overview:

```
🔥 Firebase Firestore Database
│
├── 📦 users
│   ├── 1/          { id, email, name, role, ... }
│   ├── 2/          { id, email, name, role, ... }
│   └── 5/          { id, email, name, role, ... }
│
├── 📦 eventEnrollments          ⭐ Junction Table
│   ├── 5_123/      { userId, eventId, event, ... }
│   ├── 5_456/      { userId, eventId, event, ... }
│   └── 7_123/      { userId, eventId, event, ... }
│
├── 📦 customEvents
│   ├── 1763665307858/  { title, description, addedBy, ... }
│   └── 1763665307900/  { title, description, addedBy, ... }
│
└── 📦 eventAttendees
    ├── 123/        { attendees: [...], userSwipes: {...}, ... }
    └── enrolled_456/  { attendees: [...], userSwipes: {...}, ... }
```

---

## 🔗 Relationships Between Collections

### Many-to-Many: Users ↔ Events

```
User (users collection)
  ↓
Enrolls in
  ↓
Event (stored in eventEnrollments.event)
  ↑
Enrolled by
  ↑
Multiple Users (via eventEnrollments)
```

**How to Query:**

1. **Get all events for a user:**
   ```javascript
   // Query eventEnrollments where userId == "5"
   EventEnrollmentService.getUserEnrolledEvents("5")
   ```

2. **Get all users for an event:**
   ```javascript
   // Query eventEnrollments where eventId == "123"
   EventEnrollmentService.getEventEnrollments("123")
   ```

---

## 📋 When Collections Are Created

| Collection | Created When | Automatic? |
|-----------|-------------|------------|
| `users` | User registration OR first app launch (migration) | ✅ Auto |
| `eventEnrollments` | User enrolls in an event | ✅ Auto |
| `customEvents` | Premium/Admin user creates custom event | ✅ Auto |
| `eventAttendees` | Event date passes (status → "attended") | ✅ Auto |

**Note:** All collections are created automatically when the first document is written. No manual setup required!

---

## 🔒 Security Rules

Your `firestore.rules` file defines access for each collection:

```javascript
// Development Rules (Permissive)
match /users/{userId} {
  allow read, write: if true;  // Anyone can access
}

match /eventEnrollments/{enrollmentId} {
  allow read, write: if true;  // Anyone can access
}

match /customEvents/{eventId} {
  allow read, write: if true;  // Anyone can access
}

match /eventAttendees/{eventId} {
  allow read, write: if true;  // Anyone can access
}
```

**⚠️ Warning:** These rules are permissive for development. For production, you should restrict access based on authentication.

---

## 📊 Expected Data Volumes

### Typical Usage:

**For 1,000 Users:**
- `users`: ~1,000 documents
- `eventEnrollments`: ~10,000 documents (10 events per user avg)
- `customEvents`: ~100 documents (10% users create events)
- `eventAttendees`: ~500 documents (50% events become attended)

**Storage Estimate:** ~50-100 MB (well within free tier)

---

## ✅ What You'll See in Firebase Console

When you open **Firebase Console → Firestore Database**, you'll see:

```
Collections (4)
├─ users                    (N documents)
├─ eventEnrollments         (N documents)
├─ customEvents             (N documents)
└─ eventAttendees           (N documents)
```

Each collection will appear as soon as the first document is written to it.

---

## 🎯 Summary

Your Firestore database has **4 collections**:

1. ✅ **`users`** - User profiles
2. ✅ **`eventEnrollments`** - User-event relationships (junction table)
3. ✅ **`customEvents`** - Custom-created events
4. ✅ **`eventAttendees`** - Attendees for swiping (post-event)

All collections are created automatically when needed. No manual database setup required! 🚀

