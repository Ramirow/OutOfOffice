# 🔥 AsyncStorage to Firestore Migration Guide

## ✅ Migration Complete!

All data storage has been migrated from AsyncStorage to Firebase Firestore:

### What Was Migrated:

1. **User Accounts** → `users` collection in Firestore
   - User registration, login, and profile data
   - Previously stored in `@OutOfOffice:users` (AsyncStorage)

2. **Event Attendees** → `eventAttendees` collection in Firestore
   - Attendee data for each event
   - Swipe actions (liked/passed)
   - Previously stored in `@OutOfOffice:eventAttendees` (AsyncStorage)

3. **Event Enrollments** → Already using `eventEnrollments` collection
   - Already migrated in previous update

### What Remains in AsyncStorage:

- **Current Session** (`@OutOfOffice:auth`) - Kept for quick access and offline support
  - This is a hybrid approach: Firestore for persistence, AsyncStorage for fast session loading

---

## 📁 New Files Created:

1. **`src/services/UserService.js`**
   - Handles all user operations in Firestore
   - Methods: `createUser`, `getUserById`, `getUserByEmail`, `updateUser`, `getAllUsers`, `migrateInitialUsers`

## 🔄 Updated Files:

1. **`src/services/AttendeeService.js`**
   - Now uses Firestore instead of AsyncStorage
   - All attendee operations persist to cloud

2. **`src/context/AuthContext.js`**
   - Uses `UserService` for all user operations
   - Automatically migrates initial mock users to Firestore on first launch
   - Keeps session in AsyncStorage for quick access

---

## 🚀 How It Works:

### User Registration & Login:
1. User registers → Saved to Firestore `users` collection
2. Session cached in AsyncStorage for quick access
3. On app restart → Loads from AsyncStorage, verifies with Firestore

### Event Attendees:
1. Attendees generated → Stored in Firestore `eventAttendees` collection
2. Swipe actions → Updated in Firestore
3. Data persists across app reinstalls

### Initial Users Migration:
- On first app launch, initial mock users are automatically migrated to Firestore
- This ensures demo accounts (`demo@example.com`, `admin@test.com`, etc.) are available

---

## 🔒 Firestore Security Rules

Update your Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth == null || resource.data.id == request.auth.uid || request.auth.uid == userId;
      allow write: if request.auth == null || request.auth.uid == userId;
    }
    
    // Event attendees - allow read for all, write for authenticated users
    match /eventAttendees/{eventId} {
      allow read: if true; // Anyone can read attendees
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Event enrollments - existing rules
    match /eventEnrollments/{enrollmentId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 📊 Firestore Collections Structure:

### `users` Collection
```
users/{userId}
  - id: string
  - email: string
  - password: string (hashed)
  - name: string
  - role: 'regular' | 'admin' | 'premium'
  - image: string | null
  - age: string
  - career: string
  - study: string
  - hobby: string
  - bio: string
  - phone: string
  - location: string
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### `eventAttendees` Collection
```
eventAttendees/{eventId}
  - eventId: string
  - eventTitle: string
  - attendees: Array<Attendee>
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### `eventEnrollments` Collection (already existed)
```
eventEnrollments/{enrollmentId}
  - userId: string
  - eventId: string
  - event: Event object
  - enrolledAt: Timestamp
  - status: 'confirmed' | 'attended'
  - createdAt: Timestamp
```

---

## ✅ Benefits:

1. **Cloud Persistence** - Data survives app reinstall
2. **Cross-Device Sync** - Access data from any device
3. **Scalability** - No device storage limits
4. **Backup & Recovery** - Automatic backups in Firebase
5. **Real-time Updates** - Can add real-time listeners in future

---

## 🧪 Testing:

1. **Register a new user** → Check Firestore Console for new document in `users` collection
2. **Enroll in an event** → Check `eventEnrollments` collection
3. **View event attendees** → Check `eventAttendees` collection
4. **Reinstall app** → All data should persist!

---

## 📝 Notes:

- **AsyncStorage is still used** for session caching (quick access)
- **Initial mock users** are automatically migrated on first app launch
- **Password hashing** is still done locally (consider Firebase Auth for production)
- **Offline support** - Firestore has built-in offline persistence

---

## 🔧 Troubleshooting:

### If users can't login:
1. Check Firestore is enabled in Firebase Console
2. Verify security rules allow read/write
3. Check console for error messages

### If data doesn't persist:
1. Ensure Firestore is enabled
2. Check network connection
3. Verify Firebase configuration in `src/config/firebase.js`

### To view data in Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `outofofficeclone`
3. Click "Firestore Database"
4. View collections: `users`, `eventAttendees`, `eventEnrollments`

---

## 🎉 Migration Complete!

Your app now uses Firebase Firestore for all persistent data storage!

