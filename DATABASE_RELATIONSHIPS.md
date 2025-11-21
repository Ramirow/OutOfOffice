# 🔗 Database Relationships: Many-to-Many Implementation

## 📊 SQL Database Structure (Traditional Approach)

In a SQL database, you would typically have three tables:

```sql
-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY,
    email VARCHAR(255),
    name VARCHAR(255),
    ...
);

-- Events Table
CREATE TABLE events (
    id INT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    date DATETIME,
    ...
);

-- Junction/Join Table (Many-to-Many Relationship)
CREATE TABLE event_enrollments (
    user_id INT,
    event_id INT,
    enrolled_at TIMESTAMP,
    status VARCHAR(50),
    PRIMARY KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);
```

### SQL Queries:

```sql
-- Get all events for a user (User → Many Events)
SELECT e.* 
FROM events e
JOIN event_enrollments ee ON e.id = ee.event_id
WHERE ee.user_id = '5';

-- Get all users for an event (Event → Many Users)
SELECT u.* 
FROM users u
JOIN event_enrollments ee ON u.id = ee.user_id
WHERE ee.event_id = '123';
```

---

## 🔥 Firestore Structure (Your Current Implementation)

Your application implements the same many-to-many relationship using Firestore collections:

### Collections:

```
📦 users
   └─ {userId}                    # Document ID = User ID
      ├─ id: "5"
      ├─ email: "user@example.com"
      ├─ name: "John Doe"
      └─ ...

📦 eventEnrollments               # This is the JUNCTION TABLE
   └─ {userId}_{eventId}          # Document ID = Composite Key
      ├─ userId: "5"
      ├─ eventId: "123"
      ├─ event: { ... full event data ... }
      ├─ enrolledAt: Timestamp
      ├─ status: "confirmed"
      └─ createdAt: Timestamp

📦 customEvents                   # Optional: Custom events storage
   └─ {eventId}
      ├─ id: "123"
      ├─ title: "Tech Meetup"
      └─ ...
```

---

## 🔄 How Many-to-Many Works in Your App

### 1️⃣ **One User → Many Events** ✅

**Implementation:** `EventEnrollmentService.getUserEnrolledEvents(userId)`

```javascript
// Firestore Query (equivalent to SQL JOIN)
const q = query(
  collection(db, 'eventEnrollments'),
  where('userId', '==', userId),    // Filter by user
  orderBy('enrolledAt', 'desc')
);

// Result: All events this user is enrolled in
[
  { eventId: '123', event: {...}, ... },
  { eventId: '456', event: {...}, ... },
  { eventId: '789', event: {...}, ... }
]
```

**SQL Equivalent:**
```sql
SELECT * FROM event_enrollments 
WHERE user_id = '5';
```

---

### 2️⃣ **One Event → Many Users** ✅

**Implementation:** `EventEnrollmentService.getEventEnrollments(eventId)`

```javascript
// Firestore Query
const q = query(
  collection(db, 'eventEnrollments'),
  where('eventId', '==', eventId)    // Filter by event
);

// Result: All users enrolled in this event
[
  { userId: '5', enrolledAt: '...', status: 'confirmed' },
  { userId: '7', enrolledAt: '...', status: 'confirmed' },
  { userId: '9', enrolledAt: '...', status: 'confirmed' }
]
```

**SQL Equivalent:**
```sql
SELECT * FROM event_enrollments 
WHERE event_id = '123';
```

---

### 3️⃣ **Bidirectional Relationship** ✅

**Key Point:** The `eventEnrollments` collection stores both:
- `userId` → Query for user's events
- `eventId` → Query for event's users

**Document Structure:**
```javascript
{
  // Composite ID
  id: "5_123",  // userId_eventId
  
  // Foreign Keys (like SQL)
  userId: "5",     // References users collection
  eventId: "123",  // References events collection
  
  // Additional Data (metadata)
  event: {...},           // Full event snapshot
  enrolledAt: Timestamp,  // When enrolled
  status: "confirmed"     // Enrollment status
}
```

---

## 📈 Comparison: SQL vs Firestore

| Aspect | SQL Database | Your Firestore App |
|--------|-------------|-------------------|
| **Users Table** | `users` table | `users` collection |
| **Events Table** | `events` table | Events in `eventEnrollments.event` or `customEvents` |
| **Junction Table** | `event_enrollments` table | `eventEnrollments` collection |
| **Composite Key** | `PRIMARY KEY (user_id, event_id)` | Document ID: `{userId}_{eventId}` |
| **Foreign Keys** | `FOREIGN KEY` constraints | `userId` and `eventId` fields |
| **Query User Events** | `JOIN` query | `where('userId', '==', userId)` |
| **Query Event Users** | `JOIN` query | `where('eventId', '==', eventId)` |

---

## 🎯 Real-World Example in Your App

### Scenario: User "5" enrolls in Event "123"

**Step 1: Enrollment**
```javascript
EventEnrollmentService.enrollUserInEvent('5', event123);
```

**Creates Document:**
```
eventEnrollments/
  └─ 5_123/                    # Composite key
     ├─ userId: "5"
     ├─ eventId: "123"
     ├─ event: { title: "...", ... }
     └─ enrolledAt: Timestamp
```

**Step 2: Query User's Events**
```javascript
getUserEnrolledEvents('5')
// Returns: [event123, event456, ...]
// Shows: User 5 can have MANY events ✅
```

**Step 3: Query Event's Users**
```javascript
getEventEnrollments('123')
// Returns: [user5, user7, user9, ...]
// Shows: Event 123 can have MANY users ✅
```

---

## ✅ Benefits of Your Implementation

### 1. **Denormalized Event Data**
- Stores full event data in each enrollment
- Faster reads (no JOIN needed)
- Event data preserved even if original event changes

### 2. **Flexible Querying**
- Query by `userId` → Get all events for a user
- Query by `eventId` → Get all users for an event
- Can add filters (status, date, etc.)

### 3. **No Duplicate Enrollments**
- Document ID: `{userId}_{eventId}` ensures uniqueness
- Prevents same user enrolling twice in same event

### 4. **Scalability**
- Firestore handles millions of documents efficiently
- Indexes on `userId` and `eventId` for fast queries

---

## 🔍 Current Implementation Details

### Your Collections:

1. **`users`** Collection
   - Stores user profiles
   - One document per user

2. **`eventEnrollments`** Collection (Junction Table)
   - Stores user-event relationships
   - Document ID: `${userId}_${eventId}`
   - Fields: `userId`, `eventId`, `event`, `status`, `enrolledAt`

3. **`customEvents`** Collection (Optional)
   - Stores custom-created events
   - Can also be stored in `eventEnrollments.event`

4. **`eventAttendees`** Collection
   - Stores attendees for swiping feature
   - Different from enrollments (post-event)

---

## 📝 Summary

**Your app DOES implement many-to-many relationships correctly!**

The `eventEnrollments` collection acts as the junction table:

- ✅ **User can have many events** → Query by `userId`
- ✅ **Event can have many users** → Query by `eventId`
- ✅ **No duplicate enrollments** → Composite key `{userId}_{eventId}`
- ✅ **Bidirectional queries** → Both directions supported

**This is the NoSQL/Firestore equivalent of a SQL many-to-many relationship!**

