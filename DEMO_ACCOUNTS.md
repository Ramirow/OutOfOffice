# 🔐 Demo Accounts - Valid Login Credentials

## 📋 Available Demo Accounts

Your application has **4 demo accounts** pre-configured for testing. These accounts are automatically migrated to Firestore on first app launch.

### Valid Demo Accounts:

| Account Type | Email | Password | User ID | Role |
|-------------|-------|----------|---------|------|
| **Regular User** | `demo@example.com` | `password123` | `1` | `regular` |
| **Admin User** | `admin@test.com` | `admin123` | `2` | `admin` |
| **Premium User** | `premium@demo.com` | `premium123` | `3` | `premium` |
| **Test User** | `test@test.com` | `test123` | `4` | `regular` |

---

## 📍 Where to Find These in Code

### 1. **Definition:** `src/context/AuthContext.js`

**Lines 24-30:**
```javascript
// Initial mock users for testing with roles
const INITIAL_MOCK_USERS = [
  { id: '1', email: 'demo@example.com', password: hashPassword('password123'), name: 'Demo User', role: 'regular' },
  { id: '2', email: 'admin@test.com', password: hashPassword('admin123'), name: 'Admin User', role: 'admin' },
  { id: '3', email: 'premium@demo.com', password: hashPassword('premium123'), name: 'Premium User', role: 'premium' },
  { id: '4', email: 'test@test.com', password: hashPassword('test123'), name: 'Test User', role: 'regular' },
];
```

**Lines 91-130:** Login function that validates credentials

**Lines 147-165:** Migration function that creates these users in Firestore

---

### 2. **UI Display:** `src/screens/LoginScreen.js`

**Lines 193-228:** Demo account buttons that auto-fill credentials

```javascript
// Demo Accounts shown in LoginScreen
<TouchableOpacity onPress={() => fillDemoAccount('demo@example.com', 'password123')}>
  <Text>👤 Regular User</Text>
  <Text>demo@example.com / password123</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => fillDemoAccount('admin@test.com', 'admin123')}>
  <Text>🛡️ Admin User</Text>
  <Text>admin@test.com / admin123</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => fillDemoAccount('premium@demo.com', 'premium123')}>
  <Text>⭐ Premium User</Text>
  <Text>premium@demo.com / premium123</Text>
</TouchableOpacity>
```

---

## 🔍 How to Check Users in Firebase

### Firebase Console → Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `outofofficeclone`
3. Click **"Firestore Database"**
4. Open **`users`** collection
5. You should see 4 documents with IDs: `1`, `2`, `3`, `4`

### Expected Documents:

```
users/
  ├─ 1/  { email: "demo@example.com", name: "Demo User", role: "regular" }
  ├─ 2/  { email: "admin@test.com", name: "Admin User", role: "admin" }
  ├─ 3/  { email: "premium@demo.com", name: "Premium User", role: "premium" }
  └─ 4/  { email: "test@test.com", name: "Test User", role: "regular" }
```

---

## 🔧 Troubleshooting "Invalid email or password" Error

### Possible Causes:

1. **Users not migrated to Firestore**
   - Solution: Users are auto-migrated on first app launch
   - Manual fix: Use "Reset All Data" button in LoginScreen

2. **Email case sensitivity**
   - Solution: Email is now normalized to lowercase (fixed)
   - Always use lowercase email for login

3. **Password hashing mismatch**
   - Solution: System supports both hashed and plain text passwords
   - Auto-updates plain text to hashed on first login

4. **Users don't exist in Firestore**
   - Check Firebase Console → Firestore → `users` collection
   - If empty, users haven't been migrated yet

### Quick Fix:

1. **In LoginScreen:**
   - Tap "🔄 Reset All Data" button
   - This re-migrates all demo users to Firestore

2. **Or manually migrate:**
   - Users are automatically migrated on app start
   - If they don't exist, check console logs for migration errors

---

## 🔐 Password Storage

### How Passwords Are Stored:

1. **On Registration:** Password is hashed using `hashPassword()` function
2. **On Login:** Input password is hashed and compared with stored hash
3. **Hash Function:** Simple hash (for demo - use bcrypt in production)

**Location:** `src/context/AuthContext.js` lines 7-16

```javascript
const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
};
```

---

## ✅ Valid Login Credentials Summary

### Quick Reference:

```
Regular User:
  Email: demo@example.com
  Password: password123

Admin User:
  Email: admin@test.com
  Password: admin123

Premium User:
  Email: premium@demo.com
  Password: premium123

Test User:
  Email: test@test.com
  Password: test123
```

---

## 🔄 Reset Demo Accounts

If demo accounts are not working:

1. **Open LoginScreen**
2. **Tap on "Show Debug"** (if hidden, tap the title multiple times)
3. **Tap "🔄 Reset All Data"** button
4. **This will:**
   - Clear local session
   - Re-migrate all demo users to Firestore
   - Reset passwords to correct hashes

---

## 📝 Notes

- ✅ All demo accounts are **automatically created** on first app launch
- ✅ Passwords are **hashed** before storage
- ✅ Email is **case-insensitive** (normalized to lowercase)
- ✅ Demo accounts are stored in **Firestore** (`users` collection)
- ⚠️ **For production**, use proper password hashing (bcrypt) and Firebase Auth

