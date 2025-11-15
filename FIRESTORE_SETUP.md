# 🔥 Firebase Firestore Setup Guide

## ✅ What You Get

- **FREE Cloud Database** (Firebase Firestore)
- **Persistent Event Enrollments** (survives app reinstall)
- **Unlimited Scalability** (no device storage limits)
- **Real-time Sync** (data syncs across devices)

## 📊 Firebase Free Tier (Spark Plan)

### Storage & Operations
- ✅ **1 GB storage** (enough for ~100,000 enrollments)
- ✅ **50,000 reads/day** (document reads)
- ✅ **20,000 writes/day** (saving data)
- ✅ **20,000 deletes/day**
- ✅ **Free forever** (no credit card required for Spark plan)

### What This Means for Your App:
- **~1,000 users** can enroll in **~20 events/day** each
- **~50,000 event enrollments** stored (1 GB)
- **Perfect for development and small-medium apps**

---

## 🚀 Setup Steps

### Step 1: Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **outofofficeclone**
3. Click **"Firestore Database"** in the left menu
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for development)
6. Select a **location** (choose closest to your users)
7. Click **"Enable"**

### Step 2: Set Up Security Rules (Important!)

After creating the database, go to **"Rules"** tab and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own enrollments
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

Click **"Publish"** to save rules.

### Step 3: Test the Integration

1. **Start your app**: `npx expo start`
2. **Login** with your account
3. **Enroll in an event** from the Explore tab
4. **Check Firebase Console** → Firestore Database
5. You should see a new document in `eventEnrollments` collection!

---

## 📱 How It Works Now

### Before (AsyncStorage):
- ❌ Enrollments lost on app reinstall
- ❌ Limited to device storage (~6-10 MB)
- ❌ No sync across devices

### After (Firestore):
- ✅ Enrollments saved to cloud
- ✅ Survives app reinstall
- ✅ Syncs across all user's devices
- ✅ Unlimited storage (within free tier)
- ✅ Real-time updates

---

## 🔍 Verify It's Working

### Check in Firebase Console:
1. Go to **Firestore Database**
2. You should see collection: `eventEnrollments`
3. Each document ID: `{userId}_{eventId}`
4. Document contains: `userId`, `eventId`, `event`, `status`, `enrolledAt`

### Test Persistence:
1. Enroll in an event
2. **Uninstall the app**
3. **Reinstall the app**
4. **Login again**
5. Your enrolled events should still be there! ✅

---

## 🛠️ Troubleshooting

### Error: "Missing or insufficient permissions"
- **Solution**: Check Firestore security rules (Step 2)
- Make sure rules allow authenticated users to write

### Error: "Firestore is not enabled"
- **Solution**: Enable Firestore in Firebase Console (Step 1)

### Enrollments not showing after reinstall
- **Solution**: Make sure you're logged in with the same account
- Check Firebase Console to verify data exists

### App crashes on enrollment
- **Solution**: Check console logs for errors
- Verify Firebase config is correct in `src/config/firebase.js`

---

## 📈 Next Steps (Optional)

### Upgrade to Blaze Plan (Pay-as-you-go)
If you exceed free tier:
- **$0.18 per 100K reads**
- **$0.18 per 100K writes**
- **$0.18 per 100K deletes**
- **$0.18 per GB storage**

### Add More Features:
- Real-time event updates
- User profiles in Firestore
- Event attendees stored in Firestore
- Push notifications

---

## ✅ You're All Set!

Your app now uses **Firebase Firestore** for persistent event enrollments!

**Benefits:**
- ✅ Free cloud database
- ✅ Survives app reinstall
- ✅ Syncs across devices
- ✅ Scalable to thousands of users

**Questions?** Check Firebase documentation: https://firebase.google.com/docs/firestore

