# 👤 Registered User Lifecycle Workflow

## Complete User Journey in OutOfOffice App

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION & AUTHENTICATION                    │
└─────────────────────────────────────────────────────────────────────────┘

    [New User]
        │
        ▼
    ┌─────────────────┐
    │  Register Form   │  ← User enters: email, password, name
    │  (LoginScreen)   │
    └────────┬─────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  AuthContext.register()             │
    │  - Hash password                    │
    │  - Generate user ID                 │
    │  - Set role: 'regular'              │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  Save to AsyncStorage                │
    │  Key: @OutOfOffice:users            │
    │  - User stored locally on device    │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  Auto Login                          │
    │  - User logged in automatically     │
    │  - Navigate to HomeScreen            │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  HOME SCREEN                         │
    │  - User authenticated                │
    │  - Can browse events                 │
    └────────┬────────────────────────────┘
             │
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         EVENT DISCOVERY & ENROLLMENT                     │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │  EXPLORE Tab    │  ← Browse available events
    │  (AvailableEventsTab)│
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  View Events                         │
    │  - API events (Eventbrite/Ticketmaster)│
    │  - Custom events                     │
    │  - Mock events (fallback)            │
    └────────┬────────────────────────────┘
             │
             │ User clicks "Enroll"
             ▼
    ┌─────────────────────────────────────┐
    │  handleEnrollEvent()                 │
    │  (HomeScreen)                        │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  EventEnrollmentService              │
    │  .enrollUserInEvent(userId, event)   │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  Save to Firebase Firestore         │
    │  Collection: eventEnrollments        │
    │  Document ID: {userId}_{eventId}    │
    │  Data: {                            │
    │    userId, eventId,                 │
    │    event (full event data),         │
    │    status: 'confirmed',             │
    │    enrolledAt: Timestamp            │
    │  }                                  │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  Update Local State                  │
    │  - Add to enrolledEvents array      │
    │  - Show success alert               │
    └────────┬────────────────────────────┘
             │
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         EVENT ATTENDANCE & STATUS                        │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │  UPCOMING Tab   │  ← View enrolled events
    │  (UpcomingEventsTab)│
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  Load Enrolled Events                │
    │  - From Firestore (persistent)       │
    │  - From local state                  │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  Check Event Date                    │
    │  - If event date < today             │
    │  - Status: 'confirmed' → 'attended' │
    └────────┬────────────────────────────┘
             │
             │ Event date passed
             ▼
    ┌─────────────────────────────────────┐
    │  Initialize Attendees                │
    │  AttendeeService                     │
    │  .initializeEventAttendees()         │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  Generate/Save Attendees            │
    │  - Create 7 mock attendees           │
    │  - Save to AsyncStorage              │
    │  - Key: @OutOfOffice:eventAttendees │
    └────────┬────────────────────────────┘
             │
             │ User taps attended event
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ATTENDEE SWIPING & CONNECTIONS                     │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────┐
    │  EventAttendeesScreen    │  ← Swipeable cards
    └────────┬─────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  Load Attendees                      │
    │  - From AttendeeService              │
    │  - Get stored attendees for event    │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  Display Swipeable Cards              │
    │  - react-native-deck-swiper          │
    │  - Show attendee profiles            │
    └────────┬────────────────────────────┘
             │
             │ User swipes
             ▼
    ┌─────────────────────────────────────┐
    │  Swipe Actions                        │
    │  ┌─────────────┬─────────────┐      │
    │  │ Swipe LEFT  │ Swipe RIGHT │      │
    │  │ (Pass)      │ (Like)      │      │
    │  └──────┬──────┴──────┬──────┘      │
    │         │             │              │
    │         ▼             ▼              │
    │  Save 'passed'   Save 'liked'        │
    │  to AsyncStorage to AsyncStorage     │
    │  + Show alert                        │
    └────────┬────────────────────────────┘
             │
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE & SYNC                         │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────┐
    │  User Data Storage                   │
    │  ┌──────────────────────────────┐  │
    │  │ AsyncStorage (Local)          │  │
    │  │ - User accounts               │  │
    │  │ - Event attendees             │  │
    │  │ - Swipe actions               │  │
    │  └──────────────────────────────┘  │
    │  ┌──────────────────────────────┐  │
    │  │ Firebase Firestore (Cloud)    │  │
    │  │ - Event enrollments           │  │
    │  │ - Survives app reinstall      │  │
    │  │ - Syncs across devices        │  │
    │  └──────────────────────────────┘  │
    └─────────────────────────────────────┘
             │
             │ User logs out / closes app
             ▼
    ┌─────────────────────────────────────┐
    │  On Next Login                       │
    │  - Load user from AsyncStorage       │
    │  - Load enrollments from Firestore  │
    │  - Restore app state                 │
    └─────────────────────────────────────┘
             │
             │
             ▼
    ┌─────────────────────────────────────┐
    │  CONTINUOUS CYCLE                    │
    │  - Enroll in more events             │
    │  - Attend events                     │
    │  - Connect with attendees            │
    │  - Build network                     │
    └─────────────────────────────────────┘
```

---

## 📊 Detailed Flow Breakdown

### 1️⃣ **REGISTRATION PHASE**

```
User Action: Register
    ↓
Input: email, password, name
    ↓
AuthContext.register()
    ├─ Hash password
    ├─ Generate unique user ID
    ├─ Set role: 'regular' (default)
    └─ Create user object
    ↓
Save to AsyncStorage
    ├─ Key: @OutOfOffice:users
    ├─ Storage: Local device
    └─ Persistence: Survives app restart
    ↓
Auto Login
    ├─ Save auth state
    └─ Navigate to HomeScreen
```

**Data Stored:**
- User account in AsyncStorage
- Auth session in AsyncStorage
- User logged in automatically

---

### 2️⃣ **EVENT ENROLLMENT PHASE**

```
User Action: Enroll in Event
    ↓
Browse Events (Explore Tab)
    ├─ API events (if configured)
    ├─ Custom events
    └─ Mock events (fallback)
    ↓
Click "Enroll" Button
    ↓
handleEnrollEvent() in HomeScreen
    ↓
EventEnrollmentService.enrollUserInEvent()
    ├─ Create enrollment document
    ├─ Generate ID: {userId}_{eventId}
    └─ Include full event data
    ↓
Save to Firebase Firestore
    ├─ Collection: eventEnrollments
    ├─ Cloud storage (persistent)
    └─ Syncs across devices
    ↓
Update Local State
    ├─ Add to enrolledEvents array
    └─ Show in Upcoming Events tab
```

**Data Stored:**
- Event enrollment in Firestore (cloud)
- Local state update (memory)
- Status: 'confirmed'

---

### 3️⃣ **EVENT ATTENDANCE PHASE**

```
Event Date Passes
    ↓
UpcomingEventsTab checks dates
    ├─ Compare event date with today
    └─ Update status if passed
    ↓
Status Change: 'confirmed' → 'attended'
    ↓
AttendeeService.initializeEventAttendees()
    ├─ Check if attendees exist
    ├─ Generate 7 mock attendees (if new)
    └─ Save to AsyncStorage
    ↓
Event Card Shows "Attended" Badge
    ├─ Blue border
    └─ "Tap to swipe & connect" message
```

**Data Stored:**
- Event status updated
- Attendees generated and saved
- Storage: AsyncStorage (local)

---

### 4️⃣ **ATTENDEE SWIPING PHASE**

```
User Taps Attended Event
    ↓
Navigate to EventAttendeesScreen
    ↓
Load Attendees
    ├─ From AttendeeService
    ├─ Get stored attendees for event
    └─ Display in swipeable cards
    ↓
User Swipes Cards
    ├─ Swipe RIGHT (Like)
    │   ├─ Save action: 'liked'
    │   ├─ Store in AsyncStorage
    │   └─ Show connection alert
    │
    └─ Swipe LEFT (Pass)
        ├─ Save action: 'passed'
        └─ Store in AsyncStorage
    ↓
Track Swipe Actions
    ├─ Update attendee record
    └─ Store swipe history
```

**Data Stored:**
- Swipe actions in AsyncStorage
- Attendee interactions tracked
- Connection requests saved

---

### 5️⃣ **PERSISTENCE & SYNC PHASE**

```
App Restart / Reinstall
    ↓
On App Launch
    ├─ Load user from AsyncStorage
    ├─ Check auth state
    └─ If logged in → HomeScreen
    ↓
Load Enrolled Events
    ├─ From Firebase Firestore (cloud)
    ├─ Query: getUserEnrolledEvents(userId)
    └─ Restore to local state
    ↓
Load Attendees
    ├─ From AsyncStorage (per event)
    └─ Restore swipe history
    ↓
User Continues Journey
    ├─ All enrollments restored
    ├─ Can enroll in more events
    └─ Can view past attendees
```

**Data Persistence:**
- ✅ User accounts: AsyncStorage (survives restart)
- ✅ Event enrollments: Firestore (survives reinstall)
- ✅ Attendees: AsyncStorage (per event)
- ✅ Swipe actions: AsyncStorage (per event)

---

## 🔄 Complete User Lifecycle States

```
┌─────────────┐
│   NEW USER  │
└──────┬──────┘
       │ Register
       ▼
┌─────────────┐
│  REGISTERED │ ← Stored in AsyncStorage
└──────┬──────┘
       │ Login
       ▼
┌─────────────┐
│  AUTHENTICATED │ ← Can browse events
└──────┬──────┘
       │ Enroll
       ▼
┌─────────────┐
│  ENROLLED   │ ← Stored in Firestore
└──────┬──────┘
       │ Event date passes
       ▼
┌─────────────┐
│  ATTENDED   │ ← Status updated
└──────┬──────┘
       │ View attendees
       ▼
┌─────────────┐
│  SWIPING    │ ← Connecting with others
└──────┬──────┘
       │ Continue
       ▼
┌─────────────┐
│  ACTIVE USER│ ← Ongoing engagement
└─────────────┘
```

---

## 📱 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER DEVICE                               │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │ AsyncStorage │      │ React State  │                     │
│  │              │      │              │                     │
│  │ • Users      │◄────►│ • enrolledEvents│                 │
│  │ • Attendees  │      │ • customEvents│                  │
│  │ • Swipes     │      │ • user        │                  │
│  └──────┬───────┘      └──────┬───────┘                  │
│         │                     │                            │
│         │                     │                            │
└─────────┼─────────────────────┼────────────────────────────┘
          │                     │
          │                     │
          ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE CLOUD                           │
│                                                              │
│  ┌──────────────────────────────────────┐                 │
│  │      Firebase Firestore               │                 │
│  │                                        │                 │
│  │  Collection: eventEnrollments          │                 │
│  │  ┌──────────────────────────────────┐ │                 │
│  │  │ Document: {userId}_{eventId}     │ │                 │
│  │  │ {                                 │ │                 │
│  │  │   userId: "5",                   │ │                 │
│  │  │   eventId: "1234567890",         │ │                 │
│  │  │   event: { full event data },    │ │                 │
│  │  │   status: "confirmed",           │ │                 │
│  │  │   enrolledAt: Timestamp          │ │                 │
│  │  │ }                                 │ │                 │
│  │  └──────────────────────────────────┘ │                 │
│  └──────────────────────────────────────┘                 │
│                                                              │
│  ✅ Survives app reinstall                                  │
│  ✅ Syncs across devices                                    │
│  ✅ Unlimited storage (free tier: 1GB)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Points

### **What Persists:**
- ✅ **User accounts** → AsyncStorage (local, survives restart)
- ✅ **Event enrollments** → Firestore (cloud, survives reinstall)
- ✅ **Event attendees** → AsyncStorage (local, per event)
- ✅ **Swipe actions** → AsyncStorage (local, per event)

### **What Doesn't Persist:**
- ❌ **Enrolled events in memory** → Lost on restart (but restored from Firestore)
- ❌ **Custom events** → Only in memory (not saved to cloud)

### **Data Sync:**
- **AsyncStorage**: Device-specific (not synced)
- **Firestore**: Cloud-synced (same account = same data on all devices)

---

## 🎯 User Journey Summary

1. **Register** → Account created, stored locally
2. **Login** → Authenticated, can use app
3. **Browse Events** → View available events
4. **Enroll** → Save to Firestore (cloud)
5. **Wait** → Event date approaches
6. **Attend** → Status changes, attendees generated
7. **Swipe** → Connect with other attendees
8. **Reinstall App** → Login again, enrollments restored from cloud ✅

---

This workflow ensures your users' event enrollments are **permanently saved** and **survive app reinstall**! 🎉

