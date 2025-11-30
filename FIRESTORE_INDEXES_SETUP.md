# Firestore Indexes Setup Guide

This guide explains how to create the required Firestore indexes for the chat system.

## Required Indexes

The chat system requires 3 composite indexes:

### 1. Chats Collection - userId1 Index
- **Collection:** `chats`
- **Fields:**
  - `userId1` (Ascending)
  - `updatedAt` (Descending)

### 2. Chats Collection - userId2 Index
- **Collection:** `chats`
- **Fields:**
  - `userId2` (Ascending)
  - `updatedAt` (Descending)

### 3. Messages Collection - chatId Index
- **Collection:** `messages`
- **Fields:**
  - `chatId` (Ascending)
  - `timestamp` (Ascending)

## Method 1: Using Firebase Console (Easiest)

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `outofofficeclone`
3. Navigate to **Firestore Database** → **Indexes** tab

### Step 2: Create Indexes Manually

#### Index 1: Chats by userId1
1. Click **"Create Index"** button
2. Fill in:
   - **Collection ID:** `chats`
   - **Fields to index:**
     - Field: `userId1`, Order: `Ascending`
     - Field: `updatedAt`, Order: `Descending`
3. Click **"Create"**

#### Index 2: Chats by userId2
1. Click **"Create Index"** button
2. Fill in:
   - **Collection ID:** `chats`
   - **Fields to index:**
     - Field: `userId2`, Order: `Ascending`
     - Field: `updatedAt`, Order: `Descending`
3. Click **"Create"**

#### Index 3: Messages by chatId
1. Click **"Create Index"** button
2. Fill in:
   - **Collection ID:** `messages`
   - **Fields to index:**
     - Field: `chatId`, Order: `Ascending`
     - Field: `timestamp`, Order: `Ascending`
3. Click **"Create"**

### Step 3: Wait for Index Creation
- Indexes typically take 1-5 minutes to build
- You'll see a status indicator (Building → Enabled)
- Once enabled, your queries will work!

## Method 2: Using Firebase CLI (Recommended for Teams)

### Prerequisites
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```

### Deploy Indexes
1. The `firestore.indexes.json` file is already created in your project root
2. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. Wait for deployment to complete (usually 1-5 minutes)

## Method 3: Using the Error Link (Quickest)

When you encounter the index error, Firebase provides a direct link:

1. **Copy the error link** from the console error message
2. **Open it in your browser** - it will look like:
   ```
   https://console.firebase.google.com/v1/r/project/outofofficeclone/firestore/indexes?create_composite=...
   ```
3. **Click "Create Index"** on the page that opens
4. **Wait for the index to build** (1-5 minutes)

## Verify Indexes Are Created

1. Go to Firebase Console → Firestore Database → Indexes
2. You should see all 3 indexes listed:
   - `chats` - userId1 (Ascending), updatedAt (Descending)
   - `chats` - userId2 (Ascending), updatedAt (Descending)
   - `messages` - chatId (Ascending), timestamp (Ascending)
3. Status should be **"Enabled"** (green checkmark)

## Troubleshooting

### Index Still Building
- Wait a few more minutes
- Check the Firebase Console for status updates
- Large collections take longer to index

### Index Creation Failed
- Check that the collection names match exactly: `chats` and `messages`
- Verify field names are correct: `userId1`, `userId2`, `updatedAt`, `chatId`, `timestamp`
- Ensure you have proper permissions in Firebase Console

### Query Still Fails After Index Creation
- Wait for index status to be "Enabled" (not "Building")
- Restart your app to clear any cached errors
- Check that you're using the exact same query structure in your code

## Notes

- **Indexes are free** - Firestore provides a generous free tier
- **Indexes are automatic** - Once created, they're used automatically by queries
- **No code changes needed** - Your existing code will work once indexes are ready
- **Indexes persist** - They remain active until you delete them

## Quick Reference

| Collection | Field 1 | Order 1 | Field 2 | Order 2 |
|------------|---------|--------|---------|---------|
| `chats` | `userId1` | Ascending | `updatedAt` | Descending |
| `chats` | `userId2` | Ascending | `updatedAt` | Descending |
| `messages` | `chatId` | Ascending | `timestamp` | Ascending |

