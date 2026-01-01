# Push Notification Setup Guide

This guide explains how push notifications work in the app for incoming messages.

## Overview

The app now sends push notifications to users when they receive new messages, similar to WhatsApp and other messaging apps.

## Features

- ✅ **Real-time notifications** when new messages arrive
- ✅ **Smart notification blocking** - no notifications when viewing the active chat
- ✅ **Works in background and foreground**
- ✅ **Shows sender name and message preview**
- ✅ **Automatic permission requests**

## How It Works

### 1. Notification Service

The `NotificationService` (`src/services/NotificationService.js`) handles:
- Requesting notification permissions from the user
- Setting up Firestore listeners to detect new messages
- Showing notifications when new messages arrive
- Tracking the currently viewed chat to avoid duplicate notifications

### 2. Real-time Message Detection

The service listens to the `messages` collection in Firestore and:
- Filters messages for the current user's chats
- Only notifies for unread messages not sent by the user
- Shows notifications with sender name and message preview

### 3. Notification Behavior

- **When app is closed**: Notifications appear in the system notification tray
- **When app is in background**: Notifications appear normally
- **When app is in foreground**: Notifications appear as alerts
- **When viewing the chat**: No notification is shown (to avoid duplicates)

## Setup Instructions

### 1. Install Dependencies

The `expo-notifications` package is required. Install it:

```bash
npm install expo-notifications
```

### 2. Rebuild the App

Since we added native notification support, you need to rebuild the app:

```bash
# For Android
eas build --platform android --profile preview

# For iOS
eas build --platform ios --profile preview
```

**Note**: Notifications require a native build and won't work in Expo Go.

### 3. Configure Permissions

The app automatically requests notification permissions when:
- User logs in
- App starts and user is authenticated

Users will see a permission dialog on first use.

### 4. Android Configuration

Android notification channels are automatically configured in `app.json`:
- Channel name: "Messages"
- High importance (shows on lock screen, makes sound)
- Vibration enabled
- Default sound

### 5. iOS Configuration

iOS notifications are configured via:
- `app.json` - Notification plugin configuration
- Automatic permission requests
- Sound enabled by default

## Usage

### For Users

1. **First time**: When you receive a message, the app will ask for notification permissions
2. **Grant permissions**: Allow notifications to receive alerts for new messages
3. **Receive notifications**: When someone sends you a message, you'll get a notification showing:
   - Sender's name
   - Message preview (first 100 characters)
   - Sound and vibration (if enabled)

### For Developers

#### Requesting Permissions

```javascript
import NotificationService from './src/services/NotificationService';

const hasPermissions = await NotificationService.requestPermissions();
```

#### Setting Up Listeners

The listener is automatically set up in `App.js` when the user logs in:

```javascript
// In App.js (already implemented)
useEffect(() => {
  if (isAuthenticated && user?.id) {
    NotificationService.requestPermissions();
    NotificationService.setupMessageListener(user.id);
  }
}, [isAuthenticated, user?.id]);
```

#### Tracking Current Chat

To avoid notifications when viewing a chat:

```javascript
// Set current chat (in ChatScreen)
NotificationService.setCurrentChatId(chatId);

// Clear when leaving chat
NotificationService.clearCurrentChatId();
```

## Firestore Index Requirements

The notification service queries messages by timestamp. Make sure you have the following Firestore index:

**Collection**: `messages`
**Fields**:
- `timestamp` (Descending)

Create this index in Firebase Console:
1. Go to Firestore Database → Indexes
2. Click "Create Index"
3. Collection: `messages`
4. Fields: `timestamp` (Descending)
5. Click "Create"

## Troubleshooting

### Notifications Not Appearing

1. **Check permissions**: Make sure notifications are enabled in device settings
2. **Check build**: Notifications only work in native builds, not Expo Go
3. **Check logs**: Look for errors in the console about notification setup
4. **Check Firestore**: Verify messages are being created correctly

### Notifications Appearing When Viewing Chat

- This shouldn't happen due to `currentChatId` tracking
- If it does, check that `NotificationService.setCurrentChatId()` is called when opening a chat

### Too Many Notifications

- Notifications are only sent for unread messages
- Old messages (older than 5 minutes) are ignored
- Messages are processed once (deduplication by message ID)

### Performance Issues

- The service listens to the 50 most recent messages
- Processing is throttled to avoid overwhelming the device
- Message IDs are tracked to prevent duplicate notifications

## Future Enhancements

Potential improvements:
- [ ] Notification actions (Reply, Mark as Read)
- [ ] Grouped notifications by chat
- [ ] Custom notification sounds per chat
- [ ] Notification badges with unread count
- [ ] Rich notifications with images
- [ ] Notification preferences per chat

## Testing

To test notifications:

1. **Build the app** (required for notifications)
2. **Login as User A** on Device 1
3. **Login as User B** on Device 2
4. **Send a message** from User B to User A
5. **Verify notification** appears on Device 1

## Notes

- Notifications work in both Android and iOS
- Requires a native build (EAS Build or local build)
- Doesn't work in Expo Go
- Firestore queries require proper indexes
- Notifications are local (shown by the device) - not push notifications from a server
- For true push notifications (when app is closed), you'd need Firebase Cloud Messaging (FCM) setup

